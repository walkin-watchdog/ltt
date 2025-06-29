import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { Prisma } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { EmailService } from '../services/emailService';
import crypto from 'crypto';
import { signAccess, signRefresh } from '../utils/jwt';
import { verifyRefresh, RefreshPayload } from '../utils/jwt';

const router = express.Router();

const DUMMY_HASH = '$2b$12$CjwKCAjwjtOTBhAvEiwASG4b0JYkY9W7xI1kqlXr9F2j2PBpRPFfa';

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
});
// Login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jti     = crypto.randomUUID();
    const access  = signAccess({ id: user.id, role: user.role, jti });
    const refresh = signRefresh({ id:user.id, role:user.role }, jti);

    res.cookie('rt', refresh, {
      httpOnly : true,
      sameSite : 'strict',
      secure   : process.env.NODE_ENV === 'production',
      maxAge   : 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
        access,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies.rt;
  if (!token) return res.sendStatus(401);

  let payload: RefreshPayload;
  try { payload = verifyRefresh(token); }
  catch { return res.sendStatus(401); }

  const black = await prisma.refreshTokenBlacklist.findUnique({
    where: { jti: payload.jti },
  });
  if (black) return res.sendStatus(401);

  const newJti     = crypto.randomUUID();
  const access     = signAccess(payload);
  const newRefresh = signRefresh({ id:payload.id, role:payload.role }, newJti);

  res.cookie('rt', newRefresh, {
    httpOnly : true,
    sameSite : 'strict',
    secure   : process.env.NODE_ENV === 'production',
    maxAge   : 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ access });
});

router.post('/logout', async (req, res) => {
  const token = req.cookies.rt;
  if (token) {
    const { jti, exp } = verifyRefresh(token);
    try {
      await prisma.refreshTokenBlacklist.create({
        data: { jti, exp: new Date(exp * 1000) },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        Array.isArray(err.meta?.target) &&
        err.meta.target.includes('jti')
      ) {
        // no-op
      } else {
        throw err;
      }
    }
  }
  res.clearCookie('rt');
  res.sendStatus(204);
});

// Forgot Password
router.post('/forgot-password', forgotLimiter, async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      await bcrypt.compare(email, DUMMY_HASH);
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Generate reset token
    const resetTokenPlain  = crypto.randomBytes(32).toString('hex');
    const resetToken       = crypto.createHash('sha256').update(resetTokenPlain).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (you might want to add these fields to User model)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send reset email
    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${resetTokenPlain}`;
    await EmailService.sendEmail({
      to: email,
      subject: 'Password Reset Request - Luxé TimeTravel Admin',
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl,
        companyName: process.env.COMPANY_NAME
      }
    });

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
});

// Reset Password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});
// Register (Admin only)
router.post('/register', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const { email, password, name, role } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'VIEWER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
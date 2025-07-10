import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { Prisma } from '@prisma/client';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { EmailService } from '../services/emailService';
import crypto from 'crypto';
import { signAccess, signRefresh, verifyRefresh, RefreshPayload } from '../utils/jwt';

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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword:     z.string().min(6)
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

  await prisma.refreshTokenBlacklist.create({
    data: { jti: payload.jti, exp: new Date(payload.exp * 1000) }
  });

  const newJti     = crypto.randomUUID();
  const access     = signAccess({ id: payload.id, role: payload.role });
  const newRefresh = signRefresh({ id:payload.id, role:payload.role }, newJti);

  res.cookie('rt', newRefresh, {
    httpOnly : true,
    sameSite : 'strict',
    secure   : process.env.NODE_ENV === 'production',
    maxAge   : 60 * 60 * 24 * 30 * 1000,
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
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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

router.get('/validate-reset-token', async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') return res.sendStatus(400);
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: { resetToken: hashed, resetTokenExpiry: { gt: new Date() } }
  });
  return user ? res.sendStatus(200) : res.sendStatus(404);
});

router.post(
  '/change-password',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          password: true
        }
      });

      if (!user) {
        return res.sendStatus(404);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: req.user!.id },
        data:  { password: hashed }
      });

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/register-first', async (req: AuthRequest, res, next) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(403).json({ error: 'Initial registration is closed.' });
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

// Get all users (Admin only)
router.get('/users', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const { role } = req.query;
    
    const where: any = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Check if admin exists (public endpoint)
router.get('/check-admin', async (req, res, next) => {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    
    res.json({ exists: adminCount > 0 });
  } catch (error) {
    next(error);
  }
});
// Get user by ID (Admin only)
router.get('/users/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user (Admin only)
router.put('/users/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const { name, role, password } = req.body;

    // Check if trying to modify own role
    if (req.params.id === req.user?.id && role && role !== req.user.role) {
      return res.status(403).json({ error: 'You cannot change your own role' });
    }

    // Create update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    
    // Handle password update
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete user (Admin only)
router.delete('/users/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    // Check if trying to delete yourself
    if (req.params.id === req.user?.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
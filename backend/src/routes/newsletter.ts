import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional()
});

// Subscribe to newsletter (public)
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email, name } = subscribeSchema.parse(req.body);
    
    const subscriber = await prisma.newsletter.upsert({
      where: { email },
      update: { name, isActive: true },
      create: { email, name }
    });

    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    next(error);
  }
});

// Unsubscribe from newsletter (public)
router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    
    await prisma.newsletter.updateMany({
      where: { email },
      data: { isActive: false }
    });

    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    next(error);
  }
});

// Get all subscribers (Admin only)
router.get('/subscribers', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(subscribers);
  } catch (error) {
    next(error);
  }
});

// Export subscribers (Admin only)
router.get('/subscribers/export', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const csvData = subscribers.map(sub => ({
      Email: sub.email,
      Name: sub.name || '',
      'Subscribed At': sub.createdAt.toISOString()
    }));

    res.json(csvData);
  } catch (error) {
    next(error);
  }
});

export default router;
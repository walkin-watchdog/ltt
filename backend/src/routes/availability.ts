import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const availabilitySchema = z.object({
  productId: z.string(),
  date: z.string().transform(str => new Date(str)),
  status: z.enum(['AVAILABLE', 'SOLD_OUT', 'NOT_OPERATING']),
  available: z.number().min(0).optional()
});

// Get availability for a product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {
      productId: req.params.productId
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else {
      // Default to future dates only
      where.date = {
        gte: new Date()
      };
    }

    const availability = await prisma.availability.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    // Calculate availability summary
    const summary = {
      total: availability.length,
      available: availability.filter(a => a.status === 'AVAILABLE').length,
      soldOut: availability.filter(a => a.status === 'SOLD_OUT').length,
      notOperating: availability.filter(a => a.status === 'NOT_OPERATING').length,
      nextAvailable: availability.find(a => a.status === 'AVAILABLE')?.date || null
    };

    res.json({
      availability,
      summary
    });
  } catch (error) {
    next(error);
  }
});

// Get all availability (Admin/Editor only)
router.get('/', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { productId, date, status } = req.query;
    
    const where: any = {};
    if (productId) where.productId = productId;
    if (date) where.date = new Date(date as string);
    if (status) where.status = status;

    const availability = await prisma.availability.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productCode: true
          }
        }
      },
      orderBy: [{ date: 'asc' }, { product: { title: 'asc' } }]
    });

    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Create or update availability (Admin/Editor only)
router.post('/', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data = availabilitySchema.parse(req.body);

    const availability = await prisma.availability.upsert({
      where: {
        productId_date: {
          productId: data.productId,
          date: data.date
        }
      },
      update: {
        status: data.status,
        available: data.available || 0
      },
      create: {
        productId: data.productId,
        date: data.date,
        status: data.status,
        available: data.available || 0
      }
    });

    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Bulk update availability (Admin/Editor only)
router.post('/bulk', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }

    const results = [];
    
    for (const update of updates) {
      const data = availabilitySchema.parse(update);
      
      const availability = await prisma.availability.upsert({
        where: {
          productId_date: {
            productId: data.productId,
            date: data.date
          }
        },
        update: {
          status: data.status,
          available: data.available || 0
        },
        create: {
          productId: data.productId,
          date: data.date,
          status: data.status,
          available: data.available || 0
        }
      });
      
      results.push(availability);
    }

    res.json({ message: 'Bulk update completed', count: results.length, results });
  } catch (error) {
    next(error);
  }
});

// Block specific dates (Admin/Editor only)
router.post('/block', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { productId, dates, status = 'NOT_OPERATING' } = req.body;
    
    if (!productId || !Array.isArray(dates)) {
      return res.status(400).json({ error: 'Product ID and dates array are required' });
    }

    const updates = dates.map(date => ({
      productId,
      date: new Date(date),
      status,
      available: 0
    }));

    const results = [];
    
    for (const update of updates) {
      const availability = await prisma.availability.upsert({
        where: {
          productId_date: {
            productId: update.productId,
            date: update.date
          }
        },
        update: {
          status: update.status,
          available: update.available
        },
        create: update
      });
      
      results.push(availability);
    }

    res.json({ message: 'Dates blocked successfully', count: results.length });
  } catch (error) {
    next(error);
  }
});

// Update availability (Admin/Editor only)
router.put('/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const updateData = z.object({
      status: z.enum(['AVAILABLE', 'SOLD_OUT', 'NOT_OPERATING']).optional(),
      available: z.number().min(0).optional(),
      date: z.string().transform(str => new Date(str)).optional()
    }).parse(req.body);

    const availability = await prisma.availability.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Delete availability (Admin/Editor only)
router.delete('/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    await prisma.availability.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
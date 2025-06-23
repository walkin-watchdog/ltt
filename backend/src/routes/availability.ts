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
    }

    const availability = await prisma.availability.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    res.json(availability);
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
    const { updates } = z.object({
      updates: z.array(availabilitySchema)
    }).parse(req.body);

    const results = [];
    
    for (const update of updates) {
      const availability = await prisma.availability.upsert({
        where: {
          productId_date: {
            productId: update.productId,
            date: new Date(update.date)
          }
        },
        update: {
          status: update.status,
          available: update.available || 0
        },
        create: {
          productId: update.productId,
          date: new Date(update.date),
          status: update.status,
          available: update.available || 0
        }
      });
      results.push(availability);
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
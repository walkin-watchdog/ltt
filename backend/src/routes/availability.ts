import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const availabilitySchema = z.object({
  productId: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  status: z.enum(['AVAILABLE', 'SOLD_OUT', 'NOT_OPERATING']),
  available: z.number().min(0).optional(),
  endDate: z.string().transform(str => new Date(str)).optional()
});

// Get availability for a product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {
      productId: req.params.productId
    };

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else {
      // Default to future dates only
      where.startDate = {
        gte: new Date()
      };
    }

    const availability = await prisma.availability.findMany({
      where,
      orderBy: { startDate: 'asc' }
    });

    // Calculate availability summary
    const summary = {
      total: availability.length,
      available: availability.filter(a => a.status === 'AVAILABLE').length,
      soldOut: availability.filter(a => a.status === 'SOLD_OUT').length,
      notOperating: availability.filter(a => a.status === 'NOT_OPERATING').length,
      nextAvailable: availability.find(a => a.status === 'AVAILABLE')?.startDate || null
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
    const { productId, startdate, status, enddate } = req.query;
    
    const where: any = {};
    if (productId) where.productId = productId;
    if (status) where.status = status;

    // Handle date range filtering
    if (startdate || enddate) {
      where.startDate = {};
      if (startdate) where.startDate.gte = new Date(startdate as string);
      if (enddate) where.startDate.lte = new Date(enddate as string);
    }

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
      orderBy: { startDate: 'asc' }
    });

    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Bulk update availability (Admin/Editor only)
// Get blocked dates for a product
router.get('/blocked/:productId', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate, isActive } = req.query;
    
    const where: any = {
      productId
    };

    // Filter by active status if provided
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const blockedDates = await prisma.blockedDate.findMany({
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
      orderBy: { date: 'asc' }
    });

    res.json({
      productId,
      blockedDates,
      count: blockedDates.length
    });
  } catch (error) {
    next(error);
  }
});

// Unblock a specific date (Admin/Editor only)
router.put('/unblock/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const blockedDate = await prisma.blockedDate.update({
      where: { id: req.params.id },
      data: {
        isActive: true // Mark as unblocked
      }
    });

    res.json({ message: 'Date unblocked successfully', blockedDate });
  } catch (error) {
    next(error);
  }
});

// Get all blocked dates (Admin/Editor only)
router.get('/blocked', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { productId, startDate, endDate, isActive } = req.query;
    
    const where: any = {};

    if (productId) where.productId = productId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // Filter by date range if provided
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const blockedDates = await prisma.blockedDate.findMany({
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
      orderBy: [
        { productId: 'asc' },
        { date: 'asc' }
      ]
    });

    res.json({
      blockedDates,
      count: blockedDates.length
    });
  } catch (error) {
    next(error);
  }
});

// Block specific dates (Admin/Editor only)
router.post('/block', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { productId, dates, reason } = req.body;
    
    if (!productId || !Array.isArray(dates)) {
      return res.status(400).json({ error: 'Product ID and dates array are required' });
    }

    const results = [];
    
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      
      // Find existing blocked date record
      const existingBlockedDate = await prisma.blockedDate.findFirst({
        where: {
          productId,
          date
        }
      });

      let blockedDate;
      if (existingBlockedDate) {
        // Update existing record
        blockedDate = await prisma.blockedDate.update({
          where: { id: existingBlockedDate.id },
          data: {
            reason,
            isActive: false // Mark as blocked
          }
        });
      } else {
        // Create new record
        blockedDate = await prisma.blockedDate.create({
          data: {
            productId,
            date,
            reason,
            isActive: false // Mark as blocked
          }
        });
      }
      
      results.push(blockedDate);
    }

    res.json({ message: 'Dates blocked successfully', count: results.length, blockedDates: results });
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
      startDate: z.string().transform(str => new Date(str)).optional(),
      endDate: z.string().nullable().transform(str => str ? new Date(str) : null).optional()
    }).parse(req.body);
    console.log('Update Data:', updateData);
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
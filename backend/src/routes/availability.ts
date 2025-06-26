import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();


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

    let where: any;
    if (startDate && endDate) {
      const from = new Date(startDate as string);
      const to   = new Date(endDate   as string);

      where = {
       AND: [
         { productId: req.params.productId },
         { startDate: { lte: to } },
         {
           OR: [
             { endDate: null },
             { endDate:   { gte: from } }
           ]
         }
       ]
     };
    } else {
      const today = new Date();
      where = {
       AND: [
         { productId: req.params.productId },
         {
           OR: [
             { startDate: { lte: today }, endDate: null },
             { endDate:   { gte: today } }
           ]
         }
       ]
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

router.get('/package/:packageId/slots', async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { date } = z.object({ date: z.string() }).parse(req.query);
    const dayStart = new Date(date);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23,59,59,999);

    const slots = await prisma.packageSlot.findMany({
      where: {
        packageId,
        date: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({ date, slots });
  } catch (error) {
    next(error);
  }
});

router.get('/product/:productId/package-availability', async (req, res, next) => {
  try {
    const { date } = z.object({ date: z.string() }).parse(req.query);
    const day      = new Date(date as string);

    const pkgs = await prisma.package.findMany({
      where: { productId: req.params.productId, isActive: true },
      orderBy: { price: 'asc' }
    });

    const bookings = await prisma.booking.groupBy({
      by:       ['packageId', 'status'],
      where:    {
        productId: req.params.productId,
        bookingDate: {
          gte: new Date(day.setHours(0,0,0,0)),
          lt:  new Date(day.setHours(23,59,59,999))
        }
      },
      _sum:     { adults: true, children: true }
    });

    const stats = pkgs.map(pkg => {
      const confirmed = bookings
        .filter(b => b.packageId === pkg.id && b.status === 'CONFIRMED')
        .reduce((sum,b)=>sum + (b._sum.adults ?? 0) + (b._sum.children ?? 0), 0);
      const cancelled = bookings
        .filter(b => b.packageId === pkg.id && b.status === 'CANCELLED')
        .reduce((sum,b)=>sum + (b._sum.adults ?? 0) + (b._sum.children ?? 0), 0);

      return {
        ...pkg,
        childPrice: pkg.childPrice,
        seatsLeft: Math.max(pkg.maxPeople - confirmed + cancelled, 0)
      };
    });

    res.json({ date, packages: stats });
  } catch (error) { next(error); }
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
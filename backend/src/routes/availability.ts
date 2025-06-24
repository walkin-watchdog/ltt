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
// router.post('/bulk-update', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
//   try {
//     const { productId, startDate, endDate, status, available } = z.object({
//       productId: z.string(),
//       startDate: z.string().transform(str => new Date(str)),
//       endDate: z.string().transform(str => new Date(str)),
//       status: z.enum(['AVAILABLE', 'SOLD_OUT', 'NOT_OPERATING']),
//       available: z.number().min(0).optional()
//     }).parse(req.body);

//     const dates = [];
//     let currentDate = new Date(startDate);
//     const endDateObj = new Date(endDate);

//     while (currentDate <= endDateObj) {
//       dates.push(new Date(currentDate));
//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     const results = [];
//     for (const date of dates) {
//       const result = await prisma.availability.upsert({
//         where: {
//           productId_date: {
//             productId,
//             date
//           }
//         },
//         update: {
//           status,
//           available: available || 0
//         },
//         create: {
//           productId,
//           date,
//           status,
//           available: available || 0
//         }
//       });
//       results.push(result);
//     }

//     res.json({ 
//       message: `Updated availability for ${results.length} dates`,
//       results 
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // Get availability statistics (Admin/Editor/Viewer)
// router.get('/stats', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
//   try {
//     const { productId, year, month } = req.query;
    
//     const where: any = {};
//     if (productId) where.productId = productId;
    
//     if (year) {
//       const startOfYear = new Date(parseInt(year as string), 0, 1);
//       const endOfYear = new Date(parseInt(year as string), 11, 31);
//       where.date = { gte: startOfYear, lte: endOfYear };
      
//       if (month) {
//         const startOfMonth = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
//         const endOfMonth = new Date(parseInt(year as string), parseInt(month as string), 0);
//         where.date = { gte: startOfMonth, lte: endOfMonth };
//       }
//     }

//     const stats = await prisma.availability.groupBy({
//       by: ['status'],
//       where,
//       _count: { status: true },
//       _sum: { available: true }
//     });

//     const totalStats = await prisma.availability.aggregate({
//       where,
//       _count: { id: true },
//       _sum: { available: true, booked: true }
//     });

//     res.json({
//       byStatus: stats,
//       totals: {
//         totalDays: totalStats._count.id,
//         totalCapacity: totalStats._sum.available || 0,
//         totalBooked: totalStats._sum.booked || 0,
//         utilizationRate: totalStats._sum.available ? 
//           ((totalStats._sum.booked || 0) / totalStats._sum.available * 100).toFixed(2) : 0
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// });

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
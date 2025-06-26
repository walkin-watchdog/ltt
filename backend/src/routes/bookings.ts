import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();


const bookingSchema = z.object({
  slotId: z.string(),
  productId: z.string(),
  packageId: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  adults: z.number().min(1),
  children: z.number().min(0),
  bookingDate: z.string().transform(str => new Date(str)),
  notes: z.string().optional()
});

// Get all bookings (Admin/Editor only)
router.get('/', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { status, productId, limit, offset } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (productId) where.productId = productId;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productCode: true
          }
        },
        package: {
          select: {
            id: true,
            name: true
          }
        },
        payments: true
      },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// Create booking
router.post('/', async (req, res, next) => {
  try {
    const data = bookingSchema.parse(req.body);

    const slot = await prisma.packageSlot.findUnique({ where: { id: data.slotId } });
    if (!slot) {
      return res.status(404).json({ error: 'Selected time-slot not found' });
    }
    const seats = data.adults + data.children;
    if (slot.available - slot.booked < seats) {
      return res.status(400).json({ error: 'Not enough seats in selected slot' });
    }
    
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { packages: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let baseAdultPrice  = product.discountPrice || product.price;
    let baseChildPrice  = baseAdultPrice * 0.5;
    
    if (data.packageId) {
      const selectedPackage = product.packages.find(p => p.id === data.packageId);
      if (selectedPackage) {
        baseAdultPrice = selectedPackage.price;
        baseChildPrice = selectedPackage.childPrice ?? (selectedPackage.price * 0.5);
      }
    }

    // Calculate total for adults and children (assuming children are 50% price)
    const totalAmount = (baseAdultPrice * data.adults) + (baseChildPrice * data.children);

    const bookingCode = `LT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const booking = await prisma.booking.create({
      data: {
        slotId: data.slotId,
        ...data,
        bookingCode,
        totalAmount
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productCode: true
          }
        },
        package: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    await prisma.packageSlot.update({
      where: { id: data.slotId },
      data: { booked: { increment: seats } }
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// Update booking status (Admin/Editor only)
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    }).parse(req.body);

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productCode: true
          }
        },
        package: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

export default router;
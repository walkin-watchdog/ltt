import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const bookingSchema = z.object({
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
    
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { packages: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let totalAmount = product.discountPrice || product.price;
    
    if (data.packageId) {
      const selectedPackage = product.packages.find(p => p.id === data.packageId);
      if (selectedPackage) {
        totalAmount = selectedPackage.price;
      }
    }

    // Calculate total for adults and children (assuming children are 50% price)
    totalAmount = (totalAmount * data.adults) + (totalAmount * 0.5 * data.children);

    const bookingCode = `LT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const booking = await prisma.booking.create({
      data: {
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
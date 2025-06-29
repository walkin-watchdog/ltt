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

    // Verify the slot exists
    const packageSlot = await prisma.packageSlot.findUnique({ 
      where: { id: data.slotId },
      include: {
        adultTiers: true,
        childTiers: true,
        package: true
      } 
    });
    
    if (!packageSlot) {
      return res.status(404).json({ error: 'Selected time-slot not found' });
    }
    
    // Count existing bookings for this slot
    const existingBookings = await prisma.booking.findMany({
      where: {
        slotId: data.slotId,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: {
        adults: true,
        children: true
      }
    });
    
    // Calculate total booked seats
    const seats = data.adults + data.children;
    const bookedSeats = existingBookings.reduce((total, booking) => 
      total + booking.adults + booking.children, 0);
    
    // Check if there's enough capacity
    if (packageSlot.package.maxPeople - bookedSeats < seats) {
      return res.status(400).json({ error: 'Not enough seats in selected slot' });
    }
    
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { packages: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get pricing based on package and tiers
    let totalAmount = 0;

    if (data.packageId) {
      const pkg = product.packages.find(p => p.id === data.packageId);
      
      if (!pkg) {
        return res.status(400).json({ error: 'Selected package not found' });
      }

      // Calculate adult price from tiers if available
      let adultPrice = pkg.basePrice;
      let childPrice = pkg.basePrice * 0.5; // Default child price is 50% of adult price
      
      // Apply package-level discount if available
      if (pkg.discountType === 'percentage' && pkg.discountValue) {
        adultPrice = adultPrice * (1 - (pkg.discountValue / 100));
        childPrice = childPrice * (1 - (pkg.discountValue / 100));
      } else if (pkg.discountType === 'fixed' && pkg.discountValue) {
        adultPrice = Math.max(0, adultPrice - pkg.discountValue);
        childPrice = Math.max(0, childPrice - pkg.discountValue);
      }

      // Use tier pricing if available
      if (packageSlot.adultTiers && packageSlot.adultTiers.length > 0) {
        // Find applicable adult tier
        const adultTier = packageSlot.adultTiers.find(tier => 
          data.adults >= tier.min && data.adults <= tier.max
        );
        
        if (adultTier) {
          adultPrice = adultTier.price;
        }
      }
      
      if (data.children > 0 && packageSlot.childTiers && packageSlot.childTiers.length > 0) {
        // Find applicable child tier
        const childTier = packageSlot.childTiers.find(tier => 
          data.children >= tier.min && data.children <= tier.max
        );
        
        if (childTier) {
          childPrice = childTier.price;
        }
      }
      
      totalAmount = (adultPrice * data.adults) + (childPrice * data.children);
    }

    // Generate booking code
    const bookingCode = `LT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create the booking
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
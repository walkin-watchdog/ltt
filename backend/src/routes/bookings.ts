import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';
import { sendBookingVoucher } from './payments';
import { ExcelService } from '../services/excelService';
import { EmailService } from '../services/emailService';

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
  selectedTimeSlot: z.string().min(1),
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

// Export bookings to Excel
router.get('/export', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { ids, fromDate, toDate, status } = req.query;
    
    const where: any = {};
    
    // Filter by IDs if provided
    if (ids) {
      const bookingIds = (ids as string).split(',');
      where.id = { in: bookingIds };
    }
    
    // Filter by date range
    if (fromDate || toDate) {
      where.bookingDate = {};
      if (fromDate) where.bookingDate.gte = new Date(fromDate as string);
      if (toDate) where.bookingDate.lte = new Date(toDate as string);
    }
    
    // Filter by status
    if (status) {
      where.status = status;
    }
    
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        product: {
          select: {
            title: true,
            productCode: true,
            type: true,
            location: true
          }
        },
        package: {
          select: {
            name: true
          }
        },
        slot: {
          select: {
            Time: true
          }
        },
        payments: {
          select: {
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'No bookings found matching the criteria' });
    }
    
    // Generate Excel file
    const buffer = await ExcelService.generateBookingsExcel(bookings);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bookings_export_${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    // Send the Excel buffer
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

// Export single booking to Excel
router.get('/:id/export', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            title: true,
            productCode: true,
            type: true,
            location: true
          }
        },
        package: {
          select: {
            name: true
          }
        },
        slot: {
          select: {
            Time: true
          }
        },
        payments: {
          select: {
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Generate Excel file for a single booking
    const buffer = await ExcelService.generateBookingsExcel([booking]);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="booking_${booking.bookingCode}.xlsx"`);
    
    // Send the Excel buffer
    res.send(buffer);
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

    await prisma.abandonedCart.deleteMany({
      where: { email: data.customerEmail }
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// Admin booking creation endpoint
router.post('/admin', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const adminBookingSchema = z.object({
      productId: z.string(),
      packageId: z.string().optional(),
      slotId: z.string().optional(),
      customerName: z.string().min(1),
      customerEmail: z.string().email(),
      customerPhone: z.string().min(1),
      adults: z.number().min(1),
      children: z.number().min(0),
      bookingDate: z.string().transform(str => new Date(str)),
      selectedTimeSlot: z.string().min(1),
      notes: z.string().optional(),
      status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).default('CONFIRMED'),
      paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).default('PAID')
    });

    const data = adminBookingSchema.parse(req.body);
    
    // Generate booking code
    const bookingCode = `LT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Calculate total amount based on package/slot
    let totalAmount = 0;
    
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { packages: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let selectedPackage;
    if (data.packageId) {
      selectedPackage = product.packages.find(p => p.id === data.packageId);
    }
    
    if (selectedPackage) {
      let adultPrice = selectedPackage.basePrice;
      let childPrice = selectedPackage.basePrice * 0.5; // Default child price is 50% of adult price
      
      // Apply package-level discount if available
      if (selectedPackage.discountType === 'percentage' && selectedPackage.discountValue) {
        adultPrice = adultPrice * (1 - (selectedPackage.discountValue / 100));
        childPrice = childPrice * (1 - (selectedPackage.discountValue / 100));
      } else if (selectedPackage.discountType === 'fixed' && selectedPackage.discountValue) {
        adultPrice = Math.max(0, adultPrice - selectedPackage.discountValue);
        childPrice = Math.max(0, childPrice - selectedPackage.discountValue);
      }
      
      // Check for slot-specific pricing if a slot is selected
      if (data.slotId) {
        const slot = await prisma.packageSlot.findUnique({
          where: { id: data.slotId },
          include: {
            adultTiers: true,
            childTiers: true
          }
        });
        
        if (slot) {
          // Use tier pricing for adults if available
          if (slot.adultTiers.length > 0) {
            const applicableTier = slot.adultTiers.find(tier => 
              data.adults >= tier.min && data.adults <= tier.max
            );
            
            if (applicableTier) {
              adultPrice = applicableTier.price;
            }
          }
          
          // Use tier pricing for children if available
          if (data.children > 0 && slot.childTiers.length > 0) {
            const applicableTier = slot.childTiers.find(tier => 
              data.children >= tier.min && data.children <= tier.max
            );
            
            if (applicableTier) {
              childPrice = applicableTier.price;
            }
          }
        }
      }
      
      // Calculate total amount
      totalAmount = (adultPrice * data.adults) + (childPrice * data.children);
    }
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        productId: data.productId,
        packageId: data.packageId,
        slotId: data.slotId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        adults: data.adults,
        children: data.children,
        totalAmount,
        bookingDate: data.bookingDate,
        selectedTimeSlot: data.selectedTimeSlot,
        notes: data.notes,
        status: data.status,
        paymentStatus: data.paymentStatus
      },
      include: {
        product: true,
        package: true,
        slot: true
      }
    });

    await prisma.abandonedCart.deleteMany({
      where: { email: data.customerEmail }
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// Send voucher for a booking
router.post('/:id/send-voucher', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        product: true,
        package: true,
        slot: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Send voucher using the shared function
    const success = await sendBookingVoucher(booking);
    
    if (success) {
      res.json({ message: 'Voucher sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send voucher' });
    }
  } catch (error) {
    next(error);
  }
});

// GET /bookings/:id
router.get('/:id', authenticate, authorize(['ADMIN','EDITOR','VIEWER']), async (req,res,next)=>{
  try{
    const booking = await prisma.booking.findUnique({
      where:{ id:req.params.id },
      include:{ product:true, package:true, slot:true, payments:true }
    });
    if (!booking) return res.status(404).json({error:'Not found'});
    res.json(booking);
  }catch(e){ next(e); }
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


// Reserve Now Pay Later
router.post('/pay-later', async (req, res, next) => {
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

    await prisma.abandonedCart.deleteMany({
      where: { email: data.customerEmail }
    });
    await EmailService.sendBookingConfirmation(booking, product);
    res.json({ success: true, booking })
  } catch (error) {
    next(error);
  }
});

// Send voucher for a booking
router.post('/:id/payment-reminder', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        product: true,
        package: true,
        slot: true
      }
    });

    const product = await prisma.product.findUnique({
      where: { id: booking?.productId },
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Send reminder using the shared function
    const success = await EmailService.sendPaymentPendingNotice(booking, product);
    
    if (success) {
      res.json({ message: 'Reminder sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send remider' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
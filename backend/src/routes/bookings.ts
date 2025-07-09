import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';
import { ExcelService } from '../services/excelService';
import { EmailService } from '../services/emailService';

const router = express.Router();

const bookingSchema = z.object({
  slotId: z.string(),
  productId: z.string().optional(),
  packageId: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  adults: z.number().min(1),
  children: z.number().min(0),
  bookingDate: z.string().transform(str => new Date(str)),
  selectedTimeSlot: z.string().min(1),
  notes: z.string().optional(),
  partialPaymentAmount: z.number().min(0).optional(),
  couponCode: z.string().optional(),
  discountAmount: z.number().min(0).optional()
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
        createdBy: {
          select: { id: true, name: true, email: true }
        },
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
    if (data.discountAmount) {
      totalAmount = Math.max(0, totalAmount - data.discountAmount);
    }

    if (data.packageId) {
      const pkg = product.packages.find(p => p.id === data.packageId);
      
      if (!pkg) {
        return res.status(400).json({ error: 'Selected package not found' });
      }

      // Calculate adult price from tiers if available
      let adultPrice = pkg.basePrice;
      let childPrice = pkg.basePrice
      
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
      let adultTotal = adultPrice * data.adults;
      let childTotal = childPrice * data.children;
      let gross = adultTotal + childTotal;
      const discount = data.discountAmount ?? 0;
      const net = Math.max(0, gross - discount);
      totalAmount = Math.round(net * 100) / 100;
    }

    // Generate booking code
    const bookingCode = `LT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        totalAmount,
        slot:    { connect: { id: data.slotId } },
        package: data.packageId ? { connect: { id: data.packageId } } : undefined,
        product: data.productId ? { connect: { id: data.productId } } : undefined,
        customerName:  data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        adults:        data.adults,
        children:      data.children,
        bookingDate:   data.bookingDate,
        selectedTimeSlot: data.selectedTimeSlot,
        notes:         data.notes,
        couponCode:     data.couponCode,
        discountAmount: data.discountAmount,
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

    if (data.couponCode && data.discountAmount) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() }
      });
      if (coupon) {
        await prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            discountAmount: data.discountAmount
          }
        });
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

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
      productId: z.string().optional(),
      customDetails: z.object({
        packageName:      z.string().min(1),
        location:         z.string().min(1),
        duration:         z.string().min(1),
        durationUnit:     z.enum(['hours','days']),
        code:             z.string().optional(),
        pricePerPerson:   z.number().min(0),
        discountType:     z.enum(['percentage','fixed']),
        discountValue:    z.number().min(0),
        selectedTimeSlot: z.string().min(1),
      }).optional(),
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
      paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'FAILED', 'REFUNDED']).default('PAID'),
      partialPaymentAmount: z.number().min(0).optional(),
      additionalDiscount: z.number().min(0).optional(),
    });

    const data = adminBookingSchema.parse(req.body);

    if (data.customDetails) {
      const cd = data.customDetails;
      const headCount = data.adults + (data.children||0);
      const baseTotal = cd.pricePerPerson * headCount;
      const totalAmount = cd.discountType === 'percentage'
        ? baseTotal * (1 - cd.discountValue/100)
        : Math.max(0, baseTotal - cd.discountValue);
      const bookingCode = `LT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const booking = await prisma.booking.create({
        data: {
          bookingCode:       bookingCode,
          isManual:          true,
          createdById:       req.user.id,
          productId:         null,
          packageId:         null,
          slotId:            null,
          customerName:      data.customerName,
          customerEmail:     data.customerEmail,
          customerPhone:     data.customerPhone,
          adults:            data.adults,
          children:          data.children,
          totalAmount,
          partialPaymentAmount: data.partialPaymentAmount ?? 0,
          status:            data.status,
          paymentStatus:     data.paymentStatus,
          bookingDate:       data.bookingDate,
          selectedTimeSlot:  cd.selectedTimeSlot,
          notes:             `Location: ${cd.location}, Duration: ${cd.duration}`,
          customDetails:     cd
        }
      });
      await EmailService.sendBookingConfirmation(
        booking,
        { title: data.customDetails.packageName }
      );
      return res.status(201).json(booking);
    }
    
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
      let childPrice = selectedPackage.basePrice
      
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

    if (data.additionalDiscount) {
      totalAmount = Math.max(0, totalAmount - data.additionalDiscount);
    }
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        isManual: true,
        createdById: req.user.id,
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
        paymentStatus: data.paymentStatus,
        partialPaymentAmount: data.partialPaymentAmount ?? 0,
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
    await EmailService.sendBookingConfirmation(booking, product);
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

    let productForVoucher = booking.product as any;
    if (!productForVoucher || !productForVoucher.title) {
      const cd = (booking as any).customDetails;
      productForVoucher = {
        title: cd.packageName,
        location: cd.location,
        duration: `${cd.duration} ${cd.durationUnit}`
      };
    }
    
    // Send voucher using the shared function
    let successInfo: any = false;
    try {
      successInfo = await EmailService.sendBookingVoucher({
        ...booking,
        product: productForVoucher
      });
    } catch (err) {
      console.error('sendBookingVoucher error:', err);
    }
    if (!successInfo) {
      console.info('sendBookingVoucher failed');
    }
    
    if (successInfo) {
      return res.json({ message: 'Voucher sent successfully' });
    }
    res.status(500).json({ error: 'Failed to send voucher' });
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
    if (data.discountAmount) totalAmount = Math.max(0, totalAmount - data.discountAmount);


    if (data.packageId) {
      const pkg = product.packages.find(p => p.id === data.packageId);
      
      if (!pkg) {
        return res.status(400).json({ error: 'Selected package not found' });
      }

      // Calculate adult price from tiers if available
      let adultPrice = pkg.basePrice;
      let childPrice = pkg.basePrice
      
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
      
      let adultTotal = adultPrice * data.adults;
      let childTotal = childPrice * data.children;
      let gross = adultTotal + childTotal;
      const discount = data.discountAmount ?? 0;
      const net = Math.max(0, gross - discount);
      totalAmount = Math.round(net * 100) / 100;
    }

    // Generate booking code
    const bookingCode = `LT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        totalAmount,
        slot:    { connect: { id: data.slotId } },
        package: data.packageId ? { connect: { id: data.packageId } } : undefined,
        product: data.productId ? { connect: { id: data.productId } } : undefined,
        customerName:  data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        adults:        data.adults,
        children:      data.children,
        bookingDate:   data.bookingDate,
        selectedTimeSlot: data.selectedTimeSlot,
        notes:         data.notes,
        couponCode:     data.couponCode,
        discountAmount: data.discountAmount,
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

    if (data.couponCode && data.discountAmount) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() }
      });
      if (coupon) {
        await prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            discountAmount: data.discountAmount
          }
        });
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

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
      where: { id: booking?.productId ?? undefined },
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
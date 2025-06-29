import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

const availabilitySchema = z.object({
  productId: z.string(),
  packageId: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional().nullable(),
  status: z.enum(['AVAILABLE', 'SOLD_OUT', 'NOT_OPERATING']),
  available: z.number().min(0).optional(),
  booked: z.number().min(0).optional()
});

// Get availability for a product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { startDate, endDate, packageId } = req.query;

    let where: any = {
      productId: req.params.productId
    };

    // Filter by package if specified
    if (packageId) {
      where.packageId = packageId;
    }

    // Handle date filtering
    if (startDate && endDate) {
      const from = new Date(startDate as string);
      const to = new Date(endDate as string);

      where.AND = [
        { startDate: { lte: to } },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: from } }
          ]
        }
      ];
    } else {
      const today = new Date();
      where.AND = [
        {
          OR: [
            { startDate: { lte: today }, endDate: null },
            { startDate: { lte: today }, endDate: { gte: today } }
          ]
        }
      ];
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
        },
        package: {
          select: {
            id: true,
            name: true,
            maxPeople: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    // Calculate availability summary
    const summary = {
      total: availability.length,
      available: availability.filter(a => a.status === 'AVAILABLE').length,
      soldOut: availability.filter(a => a.status === 'SOLD_OUT').length,
      notOperating: availability.filter(a => a.status === 'NOT_OPERATING').length,
      nextAvailable: availability.find(a => a.status === 'AVAILABLE')?.startDate || null,
      totalSeatsAvailable: availability
        .filter(a => a.status === 'AVAILABLE')
        .reduce((sum, a) => sum + (a.available || 0), 0),
      totalSeatsBooked: availability
        .reduce((sum, a) => sum + (a.booked || 0), 0)
    };

    res.json({
      availability,
      summary
    });
  } catch (error) {
    next(error);
  }
});

// Get package slots for a specific date
router.get('/package/:packageId/slots', async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { date } = z.object({ date: z.string() }).parse(req.query);
    
    const targetDate = new Date(date);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const slots = await prisma.packageSlot.findMany({
      where: {
        packageId,
        // Note: The schema shows Time field but not date field in PackageSlot
        // You might need to add a date field to PackageSlot or handle this differently
      },
      include: {
        adultTiers: {
          where: { isActive: true },
          orderBy: { min: 'asc' }
        },
        childTiers: {
          where: { isActive: true },
          orderBy: { min: 'asc' }
        },
        bookings: {
          where: {
            bookingDate: {
              gte: dayStart,
              lte: dayEnd
            },
            status: { in: ['CONFIRMED', 'PENDING'] }
          },
          select: {
            adults: true,
            children: true,
            status: true
          }
        }
      },
      orderBy: { Time: 'asc' }
    });

    // Calculate availability for each slot
    const slotsWithAvailability = slots.map(slot => {
      const totalBooked = slot.bookings.reduce((sum, booking) => 
        sum + booking.adults + booking.children, 0
      );
      
      return {
        ...slot,
        totalBooked,
        availableSeats: Math.max(slot.available - totalBooked, 0),
        bookings: undefined // Remove bookings from response for privacy
      };
    });

    res.json({ 
      date, 
      packageId,
      slots: slotsWithAvailability 
    });
  } catch (error) {
    next(error);
  }
});

// Get package availability for a product on a specific date
router.get('/product/:productId/package-availability', async (req, res, next) => {
  try {
    const { date } = z.object({ date: z.string() }).parse(req.query);
    const targetDate = new Date(date);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Get active packages for the product
    const packages = await prisma.package.findMany({
      where: { 
        productId: req.params.productId, 
        isActive: true,
        startDate: { lte: targetDate },
        OR: [
          { endDate: null },
          { endDate: { gte: targetDate } }
        ]
      },
      include: {
        slots: {
          include: {
            adultTiers: { where: { isActive: true } },
            childTiers: { where: { isActive: true } }
          }
        },
        availabilities: {
          where: {
            startDate: { lte: dayEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: dayStart } }
            ]
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    // Get bookings for the date
    const bookings = await prisma.booking.groupBy({
      by: ['packageId', 'status'],
      where: {
        productId: req.params.productId,
        bookingDate: {
          gte: dayStart,
          lte: dayEnd
        },
        status: { in: ['CONFIRMED', 'PENDING'] }
      },
      _sum: { 
        adults: true, 
        children: true 
      }
    });

    // Calculate availability stats for each package
    const packageStats = packages.map(pkg => {
      const confirmedBookings = bookings
        .filter(b => b.packageId === pkg.id && b.status === 'CONFIRMED')
        .reduce((sum, b) => sum + (b._sum.adults || 0) + (b._sum.children || 0), 0);
      
      const pendingBookings = bookings
        .filter(b => b.packageId === pkg.id && b.status === 'PENDING')
        .reduce((sum, b) => sum + (b._sum.adults || 0) + (b._sum.children || 0), 0);

      // Get availability record for this package and date
      const availability = pkg.availabilities.find(avail => 
        avail.startDate <= targetDate && 
        (!avail.endDate || avail.endDate >= targetDate)
      );

      const maxCapacity = availability?.available || pkg.maxPeople;
      const totalBooked = confirmedBookings + pendingBookings;
      const seatsLeft = Math.max(maxCapacity - totalBooked, 0);

      return {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        currency: pkg.currency,
        inclusions: pkg.inclusions,
        maxPeople: pkg.maxPeople,
        startDate: pkg.startDate,
        endDate: pkg.endDate,
        slots: pkg.slots,
        availabilityStatus: availability?.status || 'AVAILABLE',
        maxCapacity,
        confirmedBookings,
        pendingBookings,
        totalBooked,
        seatsLeft,
        isAvailable: seatsLeft > 0 && (availability?.status === 'AVAILABLE' || !availability)
      };
    });

    res.json({ 
      date, 
      productId: req.params.productId,
      packages: packageStats 
    });
  } catch (error) { 
    next(error); 
  }
});

// Get all availability (Admin/Editor only)
router.get('/', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { productId, packageId, startdate, enddate, status } = req.query;
    
    const where: any = {};
    
    if (productId) where.productId = productId;
    if (packageId) where.packageId = packageId;
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
        },
        package: {
          select: {
            id: true,
            name: true,
            maxPeople: true
          }
        }
      },
      orderBy: [
        { productId: 'asc' },
        { packageId: 'asc' },
        { startDate: 'asc' }
      ]
    });

    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Create availability (Admin/Editor only)
router.post('/', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data = availabilitySchema.parse(req.body);

    // Validate that package belongs to product if packageId is provided
    if (data.packageId) {
      const packageExists = await prisma.package.findFirst({
        where: {
          id: data.packageId,
          productId: data.productId
        }
      });

      if (!packageExists) {
        return res.status(400).json({ 
          error: 'Package does not belong to the specified product' 
        });
      }
    }

    const availability = await prisma.availability.create({
      data: {
        productId: data.productId,
        packageId: data.packageId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        available: data.available || 0,
        booked: data.booked || 0
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
            name: true,
            maxPeople: true
          }
        }
      }
    });

    res.status(201).json(availability);
  } catch (error) {
    next(error);
  }
});

// Bulk create availability (Admin/Editor only)
router.post('/bulk', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { productId, packageId, dateRanges, status = 'AVAILABLE', available } = req.body;

    if (!productId || !Array.isArray(dateRanges)) {
      return res.status(400).json({ 
        error: 'Product ID and dateRanges array are required' 
      });
    }

    // Validate package if provided
    if (packageId) {
      const packageExists = await prisma.package.findFirst({
        where: {
          id: packageId,
          productId: productId
        }
      });

      if (!packageExists) {
        return res.status(400).json({ 
          error: 'Package does not belong to the specified product' 
        });
      }
    }

    const results = [];
    
    for (const range of dateRanges) {
      const availability = await prisma.availability.create({
        data: {
          productId,
          packageId: packageId || null,
          startDate: new Date(range.startDate),
          endDate: range.endDate ? new Date(range.endDate) : null,
          status,
          available: available || 0,
          booked: 0
        }
      });
      
      results.push(availability);
    }

    res.json({ 
      message: 'Availability records created successfully', 
      count: results.length, 
      availability: results 
    });
  } catch (error) {
    next(error);
  }
});

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

    res.json({ 
      message: 'Dates blocked successfully', 
      count: results.length, 
      blockedDates: results 
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

// Update availability (Admin/Editor only)
router.put('/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const updateData = z.object({
      status: z.enum(['AVAILABLE', 'SOLD_OUT', 'NOT_OPERATING']).optional(),
      available: z.number().min(0).optional(),
      booked: z.number().min(0).optional(),
      startDate: z.string().transform(str => new Date(str)).optional(),
      endDate: z.string().nullable().transform(str => str ? new Date(str) : null).optional(),
      packageId: z.string().optional().nullable()
    }).parse(req.body);

    // Validate package if being updated
    if (updateData.packageId) {
      const availability = await prisma.availability.findUnique({
        where: { id: req.params.id },
        select: { productId: true }
      });

      if (availability) {
        const packageExists = await prisma.package.findFirst({
          where: {
            id: updateData.packageId,
            productId: availability.productId
          }
        });

        if (!packageExists) {
          return res.status(400).json({ 
            error: 'Package does not belong to the product' 
          });
        }
      }
    }

    const availability = await prisma.availability.update({
      where: { id: req.params.id },
      data: updateData,
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
            name: true,
            maxPeople: true
          }
        }
      }
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
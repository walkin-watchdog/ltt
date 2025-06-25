import express from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const productSchema = z.object({
  title: z.string().min(1),
  productCode: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['TOUR', 'EXPERIENCE']),
  category: z.string().min(1),
  location: z.string().min(1),
  duration: z.string().min(1),
  capacity: z.number().min(1),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  highlights: z.array(z.string()),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  itinerary: z.any().optional(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  difficulty: z.string().optional().nullable(),
  healthRestrictions: z.string().optional().nullable(),
  accessibility: z.string().optional().nullable(),
  guides: z.array(z.string()),
  languages: z.array(z.string()),
  meetingPoint: z.string().optional().nullable(),
  pickupLocations: z.array(z.string()),
  cancellationPolicy: z.string().min(1),
  isActive: z.boolean().default(true),
  availabilityStartDate: z.string().transform(str => new Date(str)),
  availabilityEndDate: z.string().transform(str => new Date(str)).optional(),
  blockedDates: z.array(z.object({date: z.string(), reason: z.string().optional()})).optional(),
});

// Get all products (public)
router.get('/', async (req, res, next) => {
  try {
    const { type, category, location, limit, offset } = req.query;

    const where: any = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (location) where.location = location;

    const products = await prisma.product.findMany({
      where,
      include: {
        packages: {
          where: { isActive: true }
        },
        reviews: {
          where: { isApproved: true },
          select: {
            id: true,
            name: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        },
        availabilities: {
          where: {
            startDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
        }
      },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
      orderBy: { createdAt: 'desc' }
    });


    // Add availability status to each product
    const productsWithAvailability = products.map(product => {
      const availabilities = product.availabilities;
      let availabilityStatus = 'AVAILABLE';
      let nextAvailableDate = null;
      let availableDates: Date[] = [];

      if (availabilities.length > 0) {
        // Check if any dates are available
        const availableDays = availabilities.filter(a => a.status === 'AVAILABLE');
        const soldOutDays = availabilities.filter(a => a.status === 'SOLD_OUT');
        const notOperating = availabilities.filter(a => a.status === 'NOT_OPERATING');
        console.log('availabilitiesssss', availabilities);

        if (availableDays.length === 0 && soldOutDays.length > 0) {
          availabilityStatus = 'SOLD_OUT';
        } else if (availableDays.length === 0 && notOperating.length > 0) {
          availabilityStatus = 'NOT_OPERATING';
        }

        // Get next available date
        if (availableDays.length > 0) {
          nextAvailableDate = availableDays[0].startDate;
          availableDates = availableDays.map(a => a.startDate);
        }
      }

      return {
        ...product,
        availabilityStatus,
        nextAvailableDate,
        availableDates
      };
    });

    res.json(productsWithAvailability);
  } catch (error) {
    next(error);
  }
});

// Get single product (public)
router.get('/:id', async (req, res, next) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        packages: {
          where: { isActive: true }
        },
        reviews: {
          where: { isApproved: true },
          select: {
            id: true,
            name: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        },
        availabilities: {
          where: {
            startDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          orderBy: { startDate: 'asc' }
        },
        blockedDates: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add availability status
    const availabilities = product.availabilities;
    let availabilityStatus = 'AVAILABLE';
    let nextAvailableDate = null;
    let availableDates: Date[] = [];
    console.log('availabilities', availabilities);
    if (availabilities.length > 0) {
      const availableDays = availabilities.filter(a => a.status === 'AVAILABLE');
      const soldOutDays = availabilities.filter(a => a.status === 'SOLD_OUT');
      const notOperating = availabilities.filter(a => a.status === 'NOT_OPERATING');
      console.log('availabilities', availabilities);

      if (availableDays.length === 0 && soldOutDays.length > 0) {
        availabilityStatus = 'SOLD_OUT';
      } else if (availableDays.length === 0 && notOperating.length > 0) {
        availabilityStatus = 'NOT_OPERATING';
      }

      if (availableDays.length > 0) {
        nextAvailableDate = availableDays[0].startDate;
        availableDates = availableDays.map(a => a.startDate);
      }
    }

    const productWithAvailability = {
      ...product,
      availabilityStatus,
      nextAvailableDate,
      availableDates
    };

    res.json(productWithAvailability);
  } catch (error) {
    next(error);
  }
});

// Create product (Admin/Editor only)
router.post('/', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data  = productSchema.parse(req.body);
    const { blockedDates = [], ...rest } = data;

    const slug = rest.title.toLowerCase().replace(/\s+/g, '-')
                     .replace(/[^a-z0-9-]/g, '');

    const product = await prisma.product.create({
      data: {
        ...rest,
        slug,
        ...(blockedDates.length && {
          blockedDates: {
            create: blockedDates.map(b => ({
              date:     new Date(b.date),
              reason:   b.reason,
              isActive: false
            }))
          }
        })
      },
      include: {
        packages: true,
        blockedDates: true
      }
    });

    // Auto-create availability records for the date range
    if (data.availabilityStartDate) {
      const startDate = new Date(data.availabilityStartDate);
      const endDate = data.availabilityEndDate || null; // Fixed semicolon
    
      // Create a single availability record for the date range
      await prisma.availability.create({
        data: {
          productId: product.id,
          startDate: startDate,
          endDate: endDate, // null means "forever"
          status: 'AVAILABLE',
          booked: 0
        }
      });
    }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// Update product (Admin/Editor only)
router.put('/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const { blockedDates, ...rest } = data;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(rest.title && { slug: rest.title.toLowerCase()
                                        .replace(/\s+/g, '-')
                                        .replace(/[^a-z0-9-]/g, '') }),
        ...(blockedDates && {
          blockedDates: {
            deleteMany: {},
            create: blockedDates.map(b => ({
              date:     new Date(b.date),
              reason:   b.reason,
              isActive: false
            }))
          }
        })
      },
      include: { packages: true, blockedDates: true }
    });

    // Update availability if date range changed
    if (data.availabilityStartDate !== undefined || data.availabilityEndDate !== undefined) {
      await prisma.availability.deleteMany({
        where: { productId: product.id }
      });
      const start = data.availabilityStartDate ?? product.availabilityStartDate!;
      const end   = data.availabilityEndDate   ?? null;
      await prisma.availability.create({
        data: {
          productId:   product.id,
          startDate:   start,
          endDate:     end,
          status:      'AVAILABLE',
          booked:      0
        }
      });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Clone product (Admin/Editor only)
router.post('/:id/clone', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const originalProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { packages: true }
    });

    if (!originalProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { packages, ...productData } = originalProduct;

    // Generate unique ID with LTC prefix
    let newId: string;
    let counter = 1;
    do {
      newId = `LTC${counter.toString().padStart(3, '0')}`;
      const existingProduct = await prisma.product.findUnique({
        where: { id: newId }
      });
      if (!existingProduct) break;
      counter++;
    } while (true);

    const currentTime = new Date();

    const clonedProduct = await prisma.product.create({
      data: {
        ...productData,
        id: newId,
        title: `${productData.title} (Copy)`,
        productCode: `${productData.productCode}-COPY`,
        slug: `${productData.slug}-copy`,
        itinerary: productData.itinerary === null ? Prisma.JsonNull : productData.itinerary,
        createdAt: currentTime,
        updatedAt: currentTime
      }
    });

    // Clone packages
    for (const pkg of packages) {
      await prisma.package.create({
        data: {
          ...pkg,
          id: undefined,
          productId: clonedProduct.id
        }
      });
    }

    const result = await prisma.product.findUnique({
      where: { id: clonedProduct.id },
      include: { packages: true }
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
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
  availabilityEndDate: z.string().transform(str => new Date(str)).optional()
});

// Get all products (public)
router.get('/', async (req, res, next) => {
  try {
    const { type, category, location, limit, offset } = req.query;
    
    const where: any = { };
    
    if (type) where.type = type;
    if (category) where.category = category;
    if (location) where.location = location;

    const products = await prisma.product.findMany({
      include: {
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
            date: {
              gte: new Date()
            }
          },
          orderBy: { date: 'asc' },
          take: 10
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

        if (availableDays.length === 0 && soldOutDays.length > 0) {
          availabilityStatus = 'SOLD_OUT';
        } else if (availableDays.length === 0 && notOperating.length > 0) {
          availabilityStatus = 'NOT_OPERATING';
        }

        // Get next available date
        if (availableDays.length > 0) {
          nextAvailableDate = availableDays[0].date;
          availableDates = availableDays.map(a => a.date);
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
            date: {
              gte: new Date()
            }
          },
          orderBy: { date: 'asc' }
        }
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

    if (availabilities.length > 0) {
      const availableDays = availabilities.filter(a => a.status === 'AVAILABLE');
      const soldOutDays = availabilities.filter(a => a.status === 'SOLD_OUT');
      const notOperating = availabilities.filter(a => a.status === 'NOT_OPERATING');

      if (availableDays.length === 0 && soldOutDays.length > 0) {
        availabilityStatus = 'SOLD_OUT';
      } else if (availableDays.length === 0 && notOperating.length > 0) {
        availabilityStatus = 'NOT_OPERATING';
      }

      if (availableDays.length > 0) {
        nextAvailableDate = availableDays[0].date;
        availableDates = availableDays.map(a => a.date);
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
    const data = productSchema.parse(req.body);
    
    const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const product = await prisma.product.create({
      data: {
        ...data,
        slug
      },
      include: {
        packages: true
      }
    });

    // Auto-create availability records for the date range
    if (data.availabilityStartDate) {
      const startDate = new Date(data.availabilityStartDate);
      const endDate = data.availabilityEndDate || new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
      
      const availabilityRecords = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        availabilityRecords.push({
          productId: product.id,
          date: new Date(currentDate),
          status: 'AVAILABLE',
          available: data.capacity
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (availabilityRecords.length > 0) {
        await prisma.availability.createMany({
          data: availabilityRecords
        });
      }
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
    
    const updateData: any = { ...data };
    if (data.title) {
      updateData.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        packages: true
      }
    });

    // Update availability if date range changed
    if (data.availabilityStartDate || data.availabilityEndDate) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: req.params.id }
      });

      if (existingProduct) {
        const startDate = data.availabilityStartDate || existingProduct.availabilityStartDate;
        const endDate = data.availabilityEndDate || existingProduct.availabilityEndDate || 
                       new Date(startDate!.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (startDate) {
          // Remove existing availability records beyond the new range
          await prisma.availability.deleteMany({
            where: {
              productId: req.params.id,
              OR: [
                { date: { lt: startDate } },
                { date: { gt: endDate } }
              ]
            }
          });

          // Add missing availability records within the range
          const existingDates = await prisma.availability.findMany({
            where: { productId: req.params.id },
            select: { date: true }
          });
          
          const existingDateStrings = existingDates.map(d => d.date.toISOString().split('T')[0]);
          const newRecords = [];
          const currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            if (!existingDateStrings.includes(dateString)) {
              newRecords.push({
                productId: req.params.id,
                date: new Date(currentDate),
                status: 'AVAILABLE',
                available: product.capacity
              });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          if (newRecords.length > 0) {
            await prisma.availability.createMany({ data: newRecords });
          }
        }
      }
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
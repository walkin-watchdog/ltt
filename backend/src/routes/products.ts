import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

const ensureNumeric = (value: any): number => {
  if (typeof value === 'string') {
    return Number(value);
  }
  return value;
};

// Add validation schema for the new guide structure
const guideSchema = z.object({
  language: z.string().min(1),
  inPerson: z.boolean(),
  audio: z.boolean(),
  written: z.boolean()
});
const itineraryActivitySchema = z.object({
  location: z.string().min(1),
  isStop: z.boolean().optional(),
  stopDuration: z.number().nullable().optional(),
  inclusions: z.array(z.string()).optional().default([]),
  exclusions: z.array(z.string()).optional().default([]),
  order: z.number().optional(),
});

const itinerarySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  activities: z.array(itineraryActivitySchema).default([]),
  images: z.array(z.string()).default([]),
});

const productSchema = z.object({
  title: z.string().min(1),
  productCode: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['TOUR', 'EXPERIENCE']),
  category: z.string().nullable().optional(),
  location: z.string().min(1),
  duration: z.string().min(1),
  capacity: z.number().min(1),
  highlights: z.array(z.string()),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  itinerary: z.array(itinerarySchema).optional(),
  packages: z.array(z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    basePrice: z.union([z.number().min(0), z.string().transform(val => Number(val))]),
    discountType: z.enum(['none', 'percentage', 'fixed']).optional().default('none'),
    discountValue: z.union([z.number().min(0), z.string().transform(val => Number(val))]).optional().default(0),
    currency: z.string().optional(),
    inclusions: z.array(z.string()),
    maxPeople: z.union([z.number().min(1), z.string().transform(val => Number(val))]),
    isActive: z.boolean().optional(),
    startDate: z.string().min(1),
    endDate: z.string().optional().nullable(),
    slotConfigs: z.array(z.object({
      times: z.array(z.string()),
      days: z.array(z.string()),
      adultTiers: z.array(z.object({
        min: z.union([z.number(), z.string().transform(val => Number(val))]),
        max: z.union([z.number(), z.string().transform(val => Number(val))]),
        price: z.union([z.number(), z.string().transform(val => Number(val))]),
        discountType: z.enum(['none', 'percentage', 'fixed']).optional().default('none'),
        discountValue: z.union([z.number().min(0), z.string().transform(val => Number(val))]).optional().default(0),
        currency: z.string()
      })),
      childTiers: z.array(z.object({
        min: z.union([z.number(), z.string().transform(val => Number(val))]),
        max: z.union([z.number(), z.string().transform(val => Number(val))]),
        price: z.union([z.number(), z.string().transform(val => Number(val))]),
        discountType: z.enum(['none', 'percentage', 'fixed']).optional().default('none'),
        discountValue: z.union([z.number().min(0), z.string().transform(val => Number(val))]).optional().default(0),
        currency: z.string()
      }))
    })).optional()
  })).optional(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  difficulty: z.string().optional().nullable(),
  healthRestrictions: z.array(z.string()).optional(),
  guides: z.array(guideSchema).optional(),
  meetingPoint: z.string().optional().nullable(),
  pickupLocations: z.array(z.string()),
  cancellationPolicy: z.string().min(1),
  isActive: z.boolean().default(true),
  availabilityStartDate: z.string().transform(str => new Date(str)),
  availabilityEndDate: z.string().transform(str => new Date(str)).optional(),
  blockedDates: z.array(z.object({date: z.string(), reason: z.string().optional()})).optional(),
  destinationId: z.string().nullable(),
  experienceCategoryId: z.string().nullable(),
  accessibilityFeatures: z.array(z.string().min(1)).optional().default([]),
  wheelchairAccessible: z.string().min(1).default('no').optional(),
  strollerAccessible:  z.string().min(1).default('no').optional(),
  serviceAnimalsAllowed:  z.string().min(1).default('no').optional(),
  publicTransportAccess: z.string().min(1).default('no').optional(),
  infantSeatsRequired:  z.string().min(1).default('no').optional(),
  infantSeatsAvailable:  z.string().min(1).default('no').optional(),
});


// Get all products (public)
router.get('/', async (req, res, next) => {
  try {
    const { type, category, location, limit, offset, minPrice, maxPrice } = req.query;

    const where: any = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (location) where.location = location;
    
    // If price filtering is needed, we need to join with packages
    const priceFilter = minPrice || maxPrice;

    const products = await prisma.product.findMany({
      where,
      include: {
        packages: {
          where: { isActive: true },
          include: {
            slots: {
              include: {
                adultTiers: true,
                childTiers: true
              }
            }
          }
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
        },
        itineraries: {
          orderBy: { day: 'asc' },
          include: {
            activities: true,
          }
        },
      },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
      orderBy: { createdAt: 'desc' }
    });

    // Add availability status to each product
    let productsWithAvailability = products.map(product => {
      const availabilities = product.availabilities;
      let availabilityStatus = 'AVAILABLE'; 
      let nextAvailableDate = null;
      let availableDates: Date[] = [];
      
      // Find the cheapest package price
      let lowestPrice: number | null = null;
      let lowestDiscountedPrice: number | null = null;
      
      if (product.packages && product.packages.length > 0) {
        for (const pkg of product.packages) {
          // Use basePrice as the main price reference
          const basePrice = pkg.basePrice;
          
          // Calculate discounted price if applicable
          let discountedPrice = basePrice;
          if (pkg.discountType === 'percentage' && pkg.discountValue) {
            discountedPrice = basePrice - (basePrice * pkg.discountValue / 100);
          } else if (pkg.discountType === 'fixed' && pkg.discountValue) {
            discountedPrice = basePrice - pkg.discountValue;
          }
          
          // Track lowest prices
          if (lowestPrice === null || basePrice < lowestPrice) {
            lowestPrice = basePrice;
          }
          
          if (pkg.discountType !== 'none' && (lowestDiscountedPrice === null || discountedPrice < lowestDiscountedPrice)) {
            lowestDiscountedPrice = discountedPrice;
          }
        }
      }

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
          nextAvailableDate = availableDays[0].startDate;
          availableDates = availableDays.map(a => a.startDate);
        }
      }

      return {
        ...product,
        availabilityStatus,
        nextAvailableDate,
        availableDates,
        lowestPackagePrice: lowestPrice,
        lowestDiscountedPackagePrice: lowestDiscountedPrice !== lowestPrice ? lowestDiscountedPrice : null
      };
    });
    
    // Apply price filtering if needed
    if (priceFilter) {
      productsWithAvailability = productsWithAvailability.filter(product => {
        const price = product.lowestDiscountedPackagePrice || product.lowestPackagePrice;
        if (!price) return true;
        
        if (minPrice && price < parseFloat(minPrice as string)) return false;
        if (maxPrice && price > parseFloat(maxPrice as string)) return false;
        return true;
      });
    }

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
          where: { isActive: true },
          include: {
            slots: {
              include: {
                adultTiers: true,
                childTiers: true
              }
            }
          }
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
        blockedDates: true,
        itineraries: {
          orderBy: { day: 'asc' },
          include: {
            activities: true,
          }
        },
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add availability status
    const availabilities = product.availabilities || [];
    let availabilityStatus = 'AVAILABLE';
    let nextAvailableDate = null; 
    let availableDates: Date[] = [];
    
    // Calculate package prices and discounts
    if (product.packages && product.packages.length > 0) {
      for (const pkg of product.packages) {
        // Use basePrice as the main price reference
        const basePrice = pkg.basePrice;
        
        // Calculate discounted price if applicable
        let effectivePrice = basePrice;
        if (pkg.discountType === 'percentage' && pkg.discountValue) {
          effectivePrice = basePrice - (basePrice * pkg.discountValue / 100);
        } else if (pkg.discountType === 'fixed' && pkg.discountValue) {
          effectivePrice = basePrice - pkg.discountValue;
        }
        
        // Add these calculated fields to each package
        pkg.effectivePrice = effectivePrice;
        pkg.discountPercentage = pkg.discountType === 'percentage' ? pkg.discountValue : 
          pkg.discountType === 'fixed' && basePrice > 0 ? (pkg.discountValue / basePrice) * 100 : 0;
      }
    }

    if (availabilities.length > 0) {
      const availableDays = availabilities.filter(a => a.status === 'AVAILABLE');
      const soldOutDays = availabilities.filter(a => a.status === 'SOLD_OUT' || a.booked >= (product.capacity || 0));
      const notOperating = availabilities.filter(a => a.status === 'NOT_OPERATING');

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
    const data = productSchema.parse(req.body);
    console.log('Creating product with data:', data);
    const { blockedDates = [], itinerary = [], packages = [], accessibilityFeatures = [], ...rest } = data;

    // Transform guides data if needed
    if (data.guides) {0
      data.guides = data.guides.map(guide => ({
        language: guide.language,
        inPerson: guide.inPerson || false,
        audio: guide.audio || false,
        written: guide.written || false
      }));
    }

    const slug = rest.title.toLowerCase().replace(/\s+/g, '-')
                     .replace(/[^a-z0-9-]/g, '');

    // Use transaction to ensure data consistency
    const product = await prisma.$transaction(async (tx) => {
      // Create the product first
      const productData = {
        ...rest,
        slug,
        accessibilityFeatures: accessibilityFeatures.filter((feature: string) => feature.trim() !== ''),
        wheelchairAccessible: rest.wheelchairAccessible ?? 'no',
        strollerAccessible: rest.strollerAccessible ?? 'no',
        serviceAnimalsAllowed: rest.serviceAnimalsAllowed ?? 'no',
        publicTransportAccess: rest.publicTransportAccess ?? 'no',
        infantSeatsRequired: rest.infantSeatsRequired ?? 'no',
        infantSeatsAvailable: rest.infantSeatsAvailable ?? 'no',
        guides: data.guides || [],
        ...(blockedDates.length && {
          blockedDates: {
            create: blockedDates.map(b => ({
              date: new Date(b.date),
              reason: b.reason,
              isActive: false
            }))
          }
        }),
        ...(itinerary.length && {
          itineraries: {
            create: itinerary.map(day => ({
              day: day.day,
              title: day.title,
              description: day.description,
              images: day.images,
              activities: {
                create: (day.activities || []).map(act => ({
                  location: act.location,
                  isStop: act.isStop ?? false,
                  stopDuration: act.stopDuration,
                  inclusions: act.inclusions ?? [],
                  exclusions: act.exclusions ?? [],
                  order: act.order ?? 0,
                }))
              }
            }))
          }
        })
      };
      
      // Only set experienceCategoryId for EXPERIENCE type
      if (rest.type === 'EXPERIENCE' && rest.experienceCategoryId) {
        productData.experienceCategoryId = rest.experienceCategoryId;
      } else {
        productData.experienceCategoryId = null;
      }
      
      const createdProduct = await tx.product.create({
        data: productData
      });

      if (createdProduct.destinationId) {
        await tx.destination.update({
          where: { id: createdProduct.destinationId },
          data: {
            products: {
              connect: { id: createdProduct.id }
            }
          }
        });
      }
      if (createdProduct.experienceCategoryId) {
        await tx.experienceCategory.update({
          where: { id: createdProduct.experienceCategoryId },
          data: {
            products: {
              connect: { id: createdProduct.id }
            }
          }
        });
      }

      // Create packages separately if they exist
      if (packages.length > 0) {
        for (const pkg of packages) {
          const createdPackage = await tx.package.create({
            data: {
              productId: createdProduct.id,
              name: pkg.name,
              description: pkg.description,
              basePrice: pkg.basePrice,
              discountType: pkg.discountType,
              discountValue: pkg.discountValue,
              currency: pkg.currency || 'INR',
              inclusions: pkg.inclusions,
              maxPeople: pkg.maxPeople,
              isActive: pkg.isActive ?? true,
              startDate: new Date(pkg.startDate),
              endDate: pkg.endDate ? new Date(pkg.endDate) : null
            }
          });

          // Create slots for this package
          if (pkg.slotConfigs && pkg.slotConfigs.length > 0) {
            for (const slotConfig of pkg.slotConfigs) {
              const createdSlot = await tx.packageSlot.create({
                data: {
                  packageId: createdPackage.id,
                  Time: slotConfig.times,
                  days: slotConfig.days,
                }
              });

              // Create adult tiers for this slot
              if (slotConfig.adultTiers && slotConfig.adultTiers.length > 0) {
                await tx.slotAdultTier.createMany({
                  data: slotConfig.adultTiers.map(tier => ({
                    slotId: createdSlot.id,
                    min: tier.min,
                    max: tier.max,
                    price: tier.price,
                    currency: tier.currency
                  }))
                });
              }

              // Create child tiers for this slot
              if (slotConfig.childTiers && slotConfig.childTiers.length > 0) {
                await tx.slotChildTier.createMany({
                  data: slotConfig.childTiers.map(tier => ({
                    slotId: createdSlot.id,
                    min: tier.min,
                    max: tier.max,
                    price: tier.price,
                    currency: tier.currency
                  }))
                });
              }
            }
          }
        }
      }

      // Return the product with all related data
      return await tx.product.findUniqueOrThrow({
        where: { id: createdProduct.id },
        include: {
          packages: {
            include: {
              slots: {
                include: {
                  adultTiers: true,
                  childTiers: true
                }
              }
            }
          },
          blockedDates: true,
          itineraries: {
            orderBy: { day: 'asc' },
            include: {
              activities: true, // ✅ Fetch activities as a relation
            }
          },
        }
      });
    });

    // Auto-create availability records for the date range
    if (data.availabilityStartDate) {
      const startDate = new Date(data.availabilityStartDate);
      const endDate = data.availabilityEndDate || null;
    
      if (product.packages && product.packages.length) {
        await Promise.all(
          product.packages.map(pkg =>
            prisma.availability.create({
              data: {
                productId: product.id,
                packageId: pkg.id,
                startDate,
                endDate,
                status: 'AVAILABLE',
                booked: 0,
              },
            })
          )
        );
      } else {
        await prisma.availability.create({
          data: {
            productId: product.id,
            startDate,
            endDate,
            status: 'AVAILABLE',
            booked: 0,
          },
        });
      }
    }

    

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
});

// Update product (Admin/Editor only)
router.put('/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    // Parse the request body with the schema that handles string-to-number conversion
    let data = productSchema.partial().parse(req.body);
    
    const { blockedDates, itinerary, packages, ...rest } = data;

    // Transform guides data if needed
    if (data.guides) {
      data.guides = data.guides.map(guide => ({
        language: guide.language,
        inPerson: guide.inPerson || false,
        audio: guide.audio || false,
        written: guide.written || false
      }));
    }

    const product = await prisma.$transaction(async (tx) => {
      if (rest.type === 'EXPERIENCE' && rest.experienceCategoryId) {
        rest.experienceCategoryId = rest.experienceCategoryId;
      } else {
        rest.experienceCategoryId = null;
      }
      // Update the main product data
      let updatedProduct = await tx.product.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          guides: data.guides || [],
          ...(rest.title && { 
            slug: rest.title.toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '') 
          }),
        }
      });

      // Handle blocked dates update
      if (blockedDates && Array.isArray(blockedDates)) {
        await tx.blockedDate.deleteMany({ where: { productId: req.params.id } });
        if (blockedDates.length > 0) {
          await tx.blockedDate.createMany({
            data: blockedDates.map(b => ({
              productId: req.params.id,
              date: new Date(b.date),
              reason: b.reason,
              isActive: false
            }))
          });
        }
      }

      // Handle itinerary update
      if (itinerary) {
        await tx.itineraryActivity.deleteMany({
          where: { itinerary: { productId: req.params.id } }
        });
        await tx.itinerary.deleteMany({ where: { productId: req.params.id } });
        if (itinerary.length > 0) {
          for (const day of itinerary) {
            await tx.itinerary.create({
              data: {
                productId: req.params.id,
                day: day.day,
                title: day.title,
                description: day.description,
                images: day.images,
                activities: {
                  create: (day.activities || []).map(act => ({
                    location: act.location,
                    isStop: act.isStop ?? false,
                    stopDuration: act.stopDuration,
                    inclusions: act.inclusions ?? [],
                    exclusions: act.exclusions ?? [],
                    order: act.order ?? 0,
                  }))
                }
              }
            });
          }
        }
      }

      // Handle packages update (most complex part)
      if (packages && Array.isArray(packages)) {
        // Delete existing packages and their related data (cascade should handle slots and tiers)
        await tx.package.deleteMany({ where: { productId: req.params.id } });
        
        // Create new packages
        for (const pkg of packages) {
          const createdPackage = await tx.package.create({
            data: {
              productId: req.params.id,
              name: pkg.name,
              description: pkg.description,
              basePrice: pkg.basePrice,
              discountValue: pkg.discountValue,
              discountType: pkg.discountType,
              currency: pkg.currency ?? 'INR',
              inclusions: pkg.inclusions,
              maxPeople: pkg.maxPeople,
              isActive: pkg.isActive ?? true,
              startDate: new Date(pkg.startDate),
              endDate: pkg.endDate ? new Date(pkg.endDate) : null
            }
          });

          // Create slots for this package
          if (pkg.slotConfigs && pkg.slotConfigs.length > 0) {
            for (const slotConfig of pkg.slotConfigs) {
              const createdSlot = await tx.packageSlot.create({
                data: {
                  packageId: createdPackage.id,
                  Time: slotConfig.times,
                  days: slotConfig.days,
                }
              });

              // Create adult tiers for this slot
              if (slotConfig.adultTiers && slotConfig.adultTiers.length > 0) {
                await tx.slotAdultTier.createMany({
                  data: slotConfig.adultTiers.map(tier => ({
                    slotId: createdSlot.id,
                    min: tier.min,
                    max: tier.max,
                    price: tier.price,
                    currency: tier.currency
                  }))
                });
              }

              // Create child tiers for this slot
              if (slotConfig.childTiers && slotConfig.childTiers.length > 0) {
                await tx.slotChildTier.createMany({
                  data: slotConfig.childTiers.map(tier => ({
                    slotId: createdSlot.id,
                    min: tier.min,
                    max: tier.max,
                    price: tier.price,
                    currency: tier.currency
                  }))
                });
              }
            }
          }
        }
      }

      // Return updated product with all relations
      return await tx.product.findUniqueOrThrow({
        where: { id: req.params.id },
        include: {
          packages: {
            include: {
              slots: {
                include: {
                  adultTiers: true,
                  childTiers: true
                }
              }
            }
          },
          blockedDates: true,
          itineraries: {
            orderBy: { day: 'asc' },
            include: {
              activities: true, // ✅ Fetch activities as a relation
            }
          },
        }
      });
    });

    // Update availability if date range changed
    if (data.availabilityStartDate !== undefined || data.availabilityEndDate !== undefined) {
      await prisma.availability.deleteMany({ where: { productId: product.id } });

      const start = data.availabilityStartDate ?? product.availabilityStartDate!;
      const end = data.availabilityEndDate ?? null;

      if (product.packages && product.packages.length) {
        await Promise.all(
          product.packages.map(pkg =>
            prisma.availability.create({
              data: {
                productId: product.id,
                packageId: pkg.id,
                startDate: start,
                endDate: end,
                status: 'AVAILABLE',
                booked: 0,
              },
            })
          )
        );
      } else {
        await prisma.availability.create({
          data: {
            productId: product.id,
            startDate: start,
            endDate: end,
            status: 'AVAILABLE',
            booked: 0,
          },
        });
      }
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
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
      include: { 
        packages: {
          include: {
            slots: {
              include: {
                adultTiers: true,
                childTiers: true
              }
            }
          }
        }, 
        itineraries: {
          include: {
            activities: true, // ✅ Fetch activities as a relation
          }
        },
      }
    });

    if (!originalProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { packages, itineraries, ...productData } = originalProduct;

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

    const result = await prisma.$transaction(async (tx) => {
      // Create cloned product
      const clonedProduct = await tx.product.create({
        data: {
          ...productData,
          id: newId,
          title: `${productData.title} (Copy)`,
          productCode: `${productData.productCode}-COPY`,
          slug: `${productData.slug}-copy`,
          createdAt: currentTime,
          updatedAt: currentTime,
          guides: productData.guides || []
        }
      });

      // Clone packages with their slots and tiers
      for (const pkg of packages) {
        const { slots, ...packageData } = pkg;
        
        const clonedPackage = await tx.package.create({
          data: {
            ...packageData,
            id: undefined,
            productId: clonedProduct.id
          }
        });

        // Clone slots and their tiers
        for (const slot of slots) {
          const { adultTiers, childTiers, ...slotData } = slot;
          
          const clonedSlot = await tx.packageSlot.create({
            data: {
              ...slotData,
              id: undefined,
              packageId: clonedPackage.id
            }
          });

          // Clone adult tiers
          if (adultTiers.length > 0) {
            await tx.slotAdultTier.createMany({
              data: adultTiers.map(tier => ({
                ...tier,
                id: undefined,
                slotId: clonedSlot.id
              }))
            });
          }

          // Clone child tiers
          if (childTiers.length > 0) {
            await tx.slotChildTier.createMany({
              data: childTiers.map(tier => ({
                ...tier,
                id: undefined,
                slotId: clonedSlot.id
              }))
            });
          }
        }
      }

      for (const day of itineraries) {
        const createdItinerary = await tx.itinerary.create({
          data: {
            productId: clonedProduct.id,
            day: day.day,
            title: day.title,
            description: day.description,
            images: day.images,
          }
        });
      
        // Clone activities for this itinerary day
        const activities = await prisma.itineraryActivity.findMany({
          where: { itineraryId: day.id }
        });
        if (activities.length > 0) {
          await tx.itineraryActivity.createMany({
            data: activities.map(act => ({
              itineraryId: createdItinerary.id,
              location: act.location,
              isStop: act.isStop,
              stopDuration: act.stopDuration,
              inclusions: act.inclusions,
              exclusions: act.exclusions,
              order: act.order,
            }))
          });
        }
      }

      // Return the complete cloned product
      return await tx.product.findUniqueOrThrow({
        where: { id: clonedProduct.id },
        include: { 
          packages: {
            include: {
              slots: {
                include: {
                  adultTiers: true,
                  childTiers: true
                }
              }
            }
          }, 
          itineraries: {
            include: {
              activities: true, // ✅ Fetch activities as a relation
            }
          },
        }
      });
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error cloning product:', error);
    next(error);
  }
});

export default router;
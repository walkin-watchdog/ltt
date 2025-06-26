import express from 'express';
import { prisma } from '../utils/prisma'
import { z } from 'zod';

const router = express.Router();


const searchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['TOUR', 'EXPERIENCE']).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.string().transform(val => parseFloat(val)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).optional(),
  duration: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'title_asc', 'title_desc', 'created_desc']).optional(),
  page: z.string().transform(val => parseInt(val)).optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
});

// Advanced search endpoint
router.get('/', async (req, res, next) => {
  try {
    const {
      q,
      type,
      category,
      location,
      minPrice,
      maxPrice,
      duration,
      tags,
      sortBy = 'created_desc',
      page = 1,
      limit = 12
    } = searchSchema.parse(req.query);

    const where: any = {
      isActive: true,
    };

    // Text search
    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          location: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          category: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            hasSome: [q],
          },
        },
      ];
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Category filter
    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    // Location filter
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    // Duration filter
    if (duration) {
      where.duration = {
        contains: duration,
        mode: 'insensitive',
      };
    }

    // Tags filter
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      where.tags = {
        hasSome: tagList,
      };
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          packages: {
            where: { isActive: true },
          },
          reviews: {
            where: { isApproved: true },
            select: {
              id: true,
              rating: true,
            },
          },
          _count: {
            select: {
              bookings: {
                where: { status: 'CONFIRMED' },
              },
            },
          },
        },
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Add average rating to each product
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      totalBookings: product._count.bookings,
    }));

    res.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        q,
        type,
        category,
        location,
        minPrice,
        maxPrice,
        duration,
        tags,
        sortBy,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res, next) => {
  try {
    const { q } = z.object({
      q: z.string().min(2),
    }).parse(req.query);

    const [destinations, categories, products] = await Promise.all([
      // Get unique locations
      prisma.product.findMany({
        where: {
          isActive: true,
          location: {
            contains: q,
            mode: 'insensitive',
          },
        },
        select: { location: true },
        distinct: ['location'],
        take: 5,
      }),
      // Get unique categories
      prisma.product.findMany({
        where: {
          isActive: true,
          category: {
            contains: q,
            mode: 'insensitive',
          },
        },
        select: { category: true },
        distinct: ['category'],
        take: 5,
      }),
      // Get product titles
      prisma.product.findMany({
        where: {
          isActive: true,
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        select: { id: true, title: true, type: true },
        take: 5,
      }),
    ]);

    const suggestions = {
      destinations: destinations.map(d => ({
        type: 'destination',
        value: d.location,
        label: d.location,
      })),
      categories: categories.map(c => ({
        type: 'category',
        value: c.category,
        label: c.category,
      })),
      products: products.map(p => ({
        type: 'product',
        value: p.id,
        label: p.title,
        productType: p.type,
      })),
    };

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

// Get popular searches
router.get('/popular', async (req, res, next) => {
  try {
    const [popularDestinations, popularCategories] = await Promise.all([
      prisma.product.groupBy({
        by: ['location'],
        where: { isActive: true },
        _count: { location: true },
        orderBy: { _count: { location: 'desc' } },
        take: 10,
      }),
      prisma.product.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      destinations: popularDestinations.map(d => ({
        name: d.location,
        count: d._count.location,
      })),
      categories: popularCategories.map(c => ({
        name: c.category,
        count: c._count.category,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
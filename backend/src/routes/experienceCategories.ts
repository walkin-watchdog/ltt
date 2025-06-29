import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

const experienceCategorySchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  bannerImage: z.string().min(1),
  highlights: z.array(z.string())
});

// Get all experience categories (public)
router.get('/', async (req, res, next) => {
  try {
    const experienceCategories = await prisma.experienceCategory.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(experienceCategories);
  } catch (error) {
    next(error);
  }
});

// Get single experience category by slug (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.experienceCategory.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            images: true,
            type: true,
            location: true,
            duration: true,
            description: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Experience category not found' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Create experience category (Admin/Editor only)
router.post('/', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data = experienceCategorySchema.parse(req.body);
    
    const slug = data.name.toLowerCase().replace(/\s+/g, '-')
                     .replace(/[^a-z0-9-]/g, '');
    
    const category = await prisma.experienceCategory.create({
      data: {
        ...data,
        slug
      }
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// Update experience category (Admin/Editor only)
router.put('/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data = experienceCategorySchema.parse(req.body);
    
    const slug = data.name.toLowerCase().replace(/\s+/g, '-')
                     .replace(/[^a-z0-9-]/g, '');
    
    const category = await prisma.experienceCategory.update({
      where: { id: req.params.id },
      data: {
        ...data,
        slug
      }
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Delete experience category (Admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    // Check if the category has any products
    const category = await prisma.experienceCategory.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Experience category not found' });
    }

    if (category._count.products > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete a category with associated products. Remove the products first.' 
      });
    }

    await prisma.experienceCategory.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

const destinationSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  bannerImage: z.string().min(1),
  highlights: z.array(z.string())
});

// Get all destinations (public)
router.get('/', async (req, res, next) => {
  try {
    const destinations = await prisma.destination.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(destinations);
  } catch (error) {
    next(error);
  }
});

// Get single destination by slug (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const destination = await prisma.destination.findUnique({
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

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    next(error);
  }
});

// Create destination (Admin/Editor only)
router.post('/', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data = destinationSchema.parse(req.body);
    
    const slug = data.name.toLowerCase().replace(/\s+/g, '-')
                     .replace(/[^a-z0-9-]/g, '');
    
    const destination = await prisma.destination.create({
      data: {
        ...data,
        slug
      }
    });

    res.status(201).json(destination);
  } catch (error) {
    next(error);
  }
});

// Update destination (Admin/Editor only)
router.put('/:id', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const data = destinationSchema.parse(req.body);
    
    const slug = data.name.toLowerCase().replace(/\s+/g, '-')
                     .replace(/[^a-z0-9-]/g, '');
    
    const destination = await prisma.destination.update({
      where: { id: req.params.id },
      data: {
        ...data,
        slug
      }
    });

    res.json(destination);
  } catch (error) {
    next(error);
  }
});

// Delete destination (Admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    // Check if the destination has any products
    const destination = await prisma.destination.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    if (destination._count.products > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete a destination with associated products. Remove the products first.' 
      });
    }

    await prisma.destination.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
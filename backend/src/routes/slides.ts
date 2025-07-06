import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

const slideSchema = z.object({
  imageUrl: z.string().min(1),
});

// Get all slides
router.get('/', async (req, res, next) => {
  try {
    const slides = await prisma.slides.findMany();
    res.json({
      images: slides.map(s => ({ url: s.imageUrl }))
    });
  } catch (error) {
    next(error);
  }
});

// Add a slide (Admin and Editor)
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'EDITOR']),
  async (req, res, next) => {
    try {
      const { imageUrl } = slideSchema.parse(req.body);
      const slide = await prisma.slides.create({
        data: { imageUrl },
      });
      res.status(201).json(slide);
    } catch (error) {
      next(error);
    }
  }
);

// Remove a slide (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  async (req, res, next) => {
    try {
      await prisma.slides.delete({
        where: { id: req.params.id },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
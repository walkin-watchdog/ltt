import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

const partnerSchema = z.object({
  imageUrl: z.string().min(1),
});

// Get all partners
router.get('/', async (req, res, next) => {
  try {
    const partners = await prisma.partners.findMany();
    res.json({
      images: partners.map(p => ({ url: p.imageUrl }))
    });
  } catch (error) {
    next(error);
  }
});

// Add a partner logo (Admin and Editor)
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'EDITOR']),
  async (req, res, next) => {
    try {
      const { imageUrl } = partnerSchema.parse(req.body);
      const partner = await prisma.partners.create({
        data: { imageUrl },
      });
      res.status(201).json(partner);
    } catch (error) {
      next(error);
    }
  }
);

// Remove a partner logo (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  async (req, res, next) => {
    try {
      await prisma.partners.delete({
        where: { id: req.params.id },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
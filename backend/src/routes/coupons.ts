import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();


const couponSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().min(0),
  minAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  validFrom: z.string().transform(str => new Date(str)),
  validUntil: z.string().transform(str => new Date(str))
});

// Validate coupon (public)
router.post('/validate', async (req, res, next) => {
  try {
    const { code, amount } = z.object({
      code: z.string(),
      amount: z.number().min(0)
    }).parse(req.body);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit exceeded' });
    }

    if (coupon.minAmount && amount < coupon.minAmount) {
      return res.status(400).json({ 
        error: `Minimum amount of ₹${coupon.minAmount} required` 
      });
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (amount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      discount,
      finalAmount: Math.max(0, amount - discount),
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all coupons (Admin only)
router.get('/', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(coupons);
  } catch (error) {
    next(error);
  }
});

// Create coupon (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    const data = couponSchema.parse(req.body);
    
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase()
      }
    });

    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
});

// Update coupon (Admin only)
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    const data = couponSchema.partial().parse(req.body);
    
    const updateData: any = { ...data };
    if (data.code) {
      updateData.code = data.code.toUpperCase();
    }

    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(coupon);
  } catch (error) {
    next(error);
  }
});

// Delete coupon (Admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
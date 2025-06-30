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
  products: z.array(z.string()).optional(),
  validFrom: z.string().transform(str => new Date(str)),
  validUntil: z.string().transform(str => new Date(str))
});

// Get coupon usage details (Admin only)
router.get('/:id/usage', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    const usageHistory = await prisma.couponUsage.findMany({
      where: { couponId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(usageHistory);
  } catch (error) {
    next(error);
  }
});

// Validate coupon (public)
router.post('/validate', async (req, res, next) => {
  try {
    const { code, amount, productId } = z.object({
      code: z.string(),
      amount: z.number().min(0),
      productId: z.string().optional()
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

    // Check product restrictions
    if (coupon.products && coupon.products.length > 0) {
      // If coupon is restricted to certain products
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required for this coupon' });
      } else if (!coupon.products.includes(productId)) {
        return res.status(400).json({ error: 'Coupon is not valid for this product' });
      }
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

// Apply coupon to booking
router.post('/apply', async (req, res, next) => {
  try {
    const { code, bookingId, bookingCode, customerId, customerName, customerEmail, discountAmount } = z.object({
      code: z.string(),
      bookingId: z.string().optional(),
      bookingCode: z.string().optional(),
      customerId: z.string().optional(),
      customerName: z.string(),
      customerEmail: z.string().email(),
      discountAmount: z.number().min(0)
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

    // Record coupon usage
    const couponUsage = await prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        bookingId,
        bookingCode,
        customerId,
        customerName,
        customerEmail,
        discountAmount
      }
    });

    // Increment used count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      message: 'Coupon applied successfully',
      couponUsage
    });
  } catch (error) {
    next(error);
  }
});

// Get product-level discounts for special offers page
router.get('/product-discounts', async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
        OR: [
          { discountType: { not: 'none' } },
          { discountValue: { gt: 0 } }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productCode: true,
            type: true,
            location: true,
            images: true,
            capacity: true,
            duration: true,
            description: true,
            isActive: true
          }
        }
      }
    });
    
    // Group by product and find the highest discount for each
    const productMap = new Map();
    
    packages.forEach(pkg => {
      if (!pkg.product.isActive) return;
      
      if (!productMap.has(pkg.product.id)) {
        productMap.set(pkg.product.id, {
          ...pkg.product,
          discountedPackage: pkg,
          discountValue: pkg.discountType === 'percentage' ? pkg.discountValue : (pkg.discountValue / pkg.basePrice) * 100
        });
      } else {
        const currentProduct = productMap.get(pkg.product.id);
        const newDiscount = pkg.discountType === 'percentage' ? pkg.discountValue : (pkg.discountValue / pkg.basePrice) * 100;
        
        if (newDiscount && newDiscount > currentProduct.discountValue) {
          productMap.set(pkg.product.id, {
            ...currentProduct,
            discountedPackage: pkg,
            discountValue: newDiscount
          });
        }
      }
    });
    
    res.json(Array.from(productMap.values()));
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
    
    // Format the code to uppercase
    const codeUpperCase = data.code.toUpperCase();
    
    // Check if the code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: codeUpperCase }
    });
    
    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    
    // Create the coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: codeUpperCase,
        description: data.description,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        products: data.products || [],
        validFrom: data.validFrom,
        validUntil: data.validUntil
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
   
    // If code is being updated, check for uniqueness
    if (data.code) {
      const codeUpperCase = data.code.toUpperCase();
      const existingCoupon = await prisma.coupon.findFirst({
        where: { 
          code: codeUpperCase,
          id: { not: req.params.id }
        }
      });
      
      if (existingCoupon) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }
      
      data.code = codeUpperCase;
    }
    
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data
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
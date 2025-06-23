import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { RazorpayService } from '../services/razorpayService';
import { EmailService } from '../services/emailService';
import { PDFService } from '../services/pdfService';
import { authenticate, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

const createOrderSchema = z.object({
  bookingId: z.string(),
  amount: z.number().min(1),
  currency: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  bookingId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// Create Razorpay order
router.post('/create-order', async (req, res, next) => {
  try {
    const { bookingId, amount, currency } = createOrderSchema.parse(req.body);
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { product: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    const order = await RazorpayService.createOrder({
      amount,
      currency,
      receipt: `booking_${booking.bookingCode}`,
      notes: {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        productTitle: booking.product.title,
      },
    });

    // Save order ID to payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: order.id,
        amount,
        currency: currency || 'INR',
        status: 'PENDING',
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment
router.post('/verify', async (req, res, next) => {
  try {
    const paymentData = verifyPaymentSchema.parse(req.body);
    
    const isValidSignature = RazorpayService.verifyPaymentSignature(paymentData);
    
    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: paymentData.bookingId },
      include: { product: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update payment record
    const payment = await prisma.payment.updateMany({
      where: {
        bookingId: booking.id,
        razorpayOrderId: paymentData.razorpay_order_id,
      },
      data: {
        razorpayPaymentId: paymentData.razorpay_payment_id,
        status: 'PAID',
        paymentMethod: 'Razorpay',
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
    });

    // Send confirmation emails
    await EmailService.sendPaymentConfirmation(booking, {
      amount: booking.totalAmount,
      paymentMethod: 'Razorpay',
      razorpayPaymentId: paymentData.razorpay_payment_id,
    }, booking.product);

    // Generate and send voucher
    const voucherPDF = await PDFService.generateBookingVoucher({
      booking,
      product: booking.product,
      customer: {
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
      },
    });

    await EmailService.sendEmail({
      to: booking.customerEmail,
      subject: `Booking Voucher - ${booking.bookingCode}`,
      template: 'voucher',
      context: {
        customerName: booking.customerName,
        bookingCode: booking.bookingCode,
        productTitle: booking.product.title,
      },
      attachments: [
        {
          filename: `voucher-${booking.bookingCode}.pdf`,
          content: voucherPDF,
          contentType: 'application/pdf',
        },
      ],
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Get payment details
router.get('/:paymentId', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.paymentId },
      include: {
        booking: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                productCode: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
});

// Process refund
router.post('/:paymentId/refund', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    const { amount } = z.object({
      amount: z.number().min(1).optional(),
    }).parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.paymentId },
      include: { booking: true },
    });

    if (!payment || !payment.razorpayPaymentId) {
      return res.status(404).json({ error: 'Payment not found or not processed' });
    }

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }

    const refund = await RazorpayService.refundPayment(
      payment.razorpayPaymentId,
      amount
    );

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CANCELLED' },
    });

    logger.info('Refund processed successfully', {
      paymentId: payment.id,
      refundId: refund.id,
      amount: refund.amount,
    });

    res.json({ success: true, refund });
  } catch (error) {
    next(error);
  }
});

export default router;
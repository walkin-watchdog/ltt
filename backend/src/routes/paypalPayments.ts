import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { PayPalService } from '../services/paypalService';
import { rateLimitPayment } from '../middleware/rateLimit';
import { EmailService } from '../services/emailService';
import { authenticate, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';
import { sendBookingVoucher } from './payments';

const router = express.Router();


const createOrderSchema = z.object({
  bookingId: z.string(),
  amount: z.number().min(1),
  currency: z.string().optional(),
});

const captureOrderSchema = z.object({
  bookingId: z.string(),
  orderId: z.string(),
});

// Create PayPal order
router.post('/create-order', authenticate, rateLimitPayment, async (req, res, next) => {
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

    const order = await PayPalService.createOrder({
      amount,
      currency: currency || 'USD',
      description: `Luxé TimeTravel - ${booking.product?.title}`,
      reference: booking.bookingCode,
    });

    // Save order ID to payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        paypalOrderId: order.id,
        amount,
        currency: currency || 'USD',
        status: 'PENDING',
        paymentMethod: 'PayPal',
      },
    });

    res.json({
      orderId: order.id,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
    });
  } catch (error) {
    next(error);
  }
});

// Capture PayPal payment
router.post('/capture', authenticate, rateLimitPayment, async (req, res, next) => {
  try {
    const { bookingId, orderId } = captureOrderSchema.parse(req.body);
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { product: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const captureResult = await PayPalService.captureOrder({ orderId });
    
    // Check if capture was successful
    if (captureResult.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment capture failed' });
    }

    const captureId = captureResult.purchase_units[0].payments.captures[0].id;

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        bookingId: booking.id,
        paypalOrderId: orderId, // PayPal order ID stored here
      },
      data: {
        paypalCaptureId: captureId, // PayPal capture ID stored here
        status: 'PAID',
        paymentMethod: 'PayPal',
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
      include: {
        product: true,
        package: true,
        slot: true
      }
    });

    // Send confirmation emails
    await EmailService.sendPaymentConfirmation(booking, {
      amount: booking.totalAmount,
      paymentMethod: 'PayPal',
      paypalCaptureId: captureId,
    }, booking.product);

    // Generate and send voucher
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { product: true, package: true, slot: true }
    });
    if (updatedBooking) await sendBookingVoucher(updatedBooking);

    res.json({ 
      success: true, 
      message: 'Payment captured successfully',
      captureId 
    });
  } catch (error) {
    next(error);
  }
});

// Get PayPal order details
router.get('/order/:orderId', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const orderDetails = await PayPalService.getOrderDetails(orderId);
    res.json(orderDetails);
  } catch (error) {
    next(error);
  }
});

// Process PayPal refund
router.post('/:paymentId/refund', authenticate, authorize(['ADMIN']), async (req, res, next) => {
  try {
    const { amount, reason } = z.object({
      amount: z.number().min(1).optional(),
      reason: z.string().optional()
    }).parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.paymentId },
      include: { 
        booking: {
          include: {
            product: true
          }
        }
      },
    });

    if (!payment || !payment.paypalCaptureId || payment.paymentMethod !== 'PayPal') {
      return res.status(404).json({ error: 'PayPal payment not found' });
    }

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }

    // Calculate refund amount based on cancellation policy if not specified
    let refundAmount = amount || payment.amount;
    
    if (!amount && payment.booking?.product) {
      const product = payment.booking.product;
      const bookingDate = new Date(payment.booking.bookingDate);
      const now = new Date();
      const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Apply cancellation policy logic
      if (product.cancellationPolicyType && product.cancellationTerms) {
        // Find applicable cancellation term
        const applicableTerm = product.cancellationTerms.find((term: any) => {
          // This is simplified - you'd want more sophisticated time parsing
          if (term.timeframe.includes('24+ hours') && hoursUntilBooking >= 24) return true;
          if (term.timeframe.includes('7+ days') && hoursUntilBooking >= 168) return true;
          if (term.timeframe.includes('4+ days') && hoursUntilBooking >= 96) return true;
          if (term.timeframe.includes('3-6 days') && hoursUntilBooking >= 72 && hoursUntilBooking < 144) return true;
          return false;
        });
        
        if (applicableTerm) {
          refundAmount = payment.amount * (applicableTerm.refundPercent / 100);
        }
      } else {
        // Fallback to simple policy
        if (product.freeCancellationHours && hoursUntilBooking >= product.freeCancellationHours) {
          refundAmount = payment.amount; // Full refund
        } else if (product.noRefundAfterHours && hoursUntilBooking < product.noRefundAfterHours) {
          refundAmount = 0; // No refund
        } else if (product.partialRefundPercent) {
          refundAmount = payment.amount * (product.partialRefundPercent / 100);
        }
      }
    }

    const refund = await PayPalService.refundPayment(
      payment.paypalCaptureId,
      refundAmount
    );

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { 
        status: refundAmount >= payment.amount ? 'CANCELLED' : 'PARTIALLY_REFUNDED'
      },
    });

    logger.info('PayPal refund processed successfully', {
      paymentId: payment.id,
      refundId: refund.id,
      amount: refund.amount,
      reason: reason || 'Manual refund',
      calculatedAmount: refundAmount,
      policyType: payment.booking?.product?.cancellationPolicyType
    });

    res.json({ success: true, refund, calculatedAmount: refundAmount });
  } catch (error) {
    next(error);
  }
});

export default router;
import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma'
import { RazorpayService } from '../services/razorpayService';
import { rateLimitPayment } from '../middleware/rateLimit';
import { EmailService } from '../services/emailService';
import { PDFService } from '../services/pdfService';
import { authenticate, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();


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
router.post('/create-order', rateLimitPayment, async (req, res, next) => {
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
        productTitle: booking.product?.title,
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
router.post('/verify', rateLimitPayment, async (req, res, next) => {
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
    await prisma.payment.updateMany({
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

    const paymentRecord = await prisma.payment.findFirst({
      where: {
        bookingId: booking.id,
        razorpayOrderId: paymentData.razorpay_order_id,
      },
      select: { amount: true },
    });

    const isPartialPayment = booking.product?.paymentType !== 'FULL';

    // Update booking status
    const bookingPaymentStatus =
      booking.product?.paymentType === 'FULL' ? 'PAID' : 'PARTIAL';

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: isPartialPayment ? 'PARTIAL' : 'PAID',
        partialPaymentAmount: isPartialPayment ? paymentRecord?.amount ?? 0 : undefined,
      },
      include: {
        product: true,
        package: true,
        slot: true
      }
    });

    // Send confirmation emails
    await EmailService.sendPaymentConfirmation(updatedBooking, {
      amount: updatedBooking.totalAmount,
      paymentMethod: 'Razorpay',
      razorpayPaymentId: paymentData.razorpay_payment_id,
    }, updatedBooking.product);

    // Generate and send voucher
    await sendBookingVoucher(updatedBooking);

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

    if (!payment || !payment.razorpayPaymentId) {
      return res.status(404).json({ error: 'Payment not found or not processed' });
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

      // Define type for cancellation term
      type CancellationTerm = {
        timeframe: string;
        refundPercent: number;
        [key: string]: any;
      };

      // Apply cancellation policy logic
      if (product.cancellationPolicyType && Array.isArray(product.cancellationTerms)) {
        // Find applicable cancellation term
        const applicableTerm = (product.cancellationTerms as CancellationTerm[]).find((term) => {
          // This is simplified - you'd want more sophisticated time parsing
          if (typeof term.timeframe === 'string' && term.timeframe.includes('24+ hours') && hoursUntilBooking >= 24) return true;
          if (typeof term.timeframe === 'string' && term.timeframe.includes('7+ days') && hoursUntilBooking >= 168) return true;
          if (typeof term.timeframe === 'string' && term.timeframe.includes('4+ days') && hoursUntilBooking >= 96) return true;
          if (typeof term.timeframe === 'string' && term.timeframe.includes('3-6 days') && hoursUntilBooking >= 72 && hoursUntilBooking < 144) return true;
          return false;
        });

        if (applicableTerm && typeof applicableTerm.refundPercent === 'number') {
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

    const refund = await RazorpayService.refundPayment(
      payment.razorpayPaymentId,
      refundAmount
    );

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'REFUNDED'
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { 
        status: 'CANCELLED'
      },
    });

    logger.info('Refund processed successfully', {
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

// Helper function to send booking voucher
export const sendBookingVoucher = async (booking: any) => {
  try {
    // Generate PDF voucher
    const voucherPDF = await PDFService.generateBookingVoucher({
      booking,
      product: booking.product,
      customer: {
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
      },
      packageDetails: booking.package,
      timeSlot: booking.selectedTimeSlot
    });

    // Send email with voucher attachment
    await EmailService.sendEmail({
      to: booking.customerEmail,
      subject: `Booking Voucher - ${booking.bookingCode}`,
      template: 'voucher',
      context: {
        customerName: booking.customerName,
        bookingCode: booking.bookingCode,
        productTitle: booking.product.title,
        bookingDate: new Date(booking.bookingDate).toLocaleDateString('en-IN', {
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        }),
        adults: booking.adults,
        children: booking.children,
        packageName: booking.package?.name || 'Standard Package',
        amountPaid: (booking.paymentStatus === 'PAID'
                     ? booking.totalAmount
                     : booking.paymentStatus === 'PARTIAL'
                       ? booking.partialPaymentAmount
                       : null),
        timeSlot: booking.selectedTimeSlot || 'As per confirmation'
      },
      attachments: [
        {
          filename: `voucher-${booking.bookingCode}.pdf`,
          content: voucherPDF,
          contentType: 'application/pdf',
        },
      ],
    });

    logger.info(`Voucher sent successfully for booking ${booking.id}`);
    return true;
  } catch (error) {
    logger.error(`Error sending booking voucher for booking ${booking.id}:`, error);
    return false;
  }
};

export default router;
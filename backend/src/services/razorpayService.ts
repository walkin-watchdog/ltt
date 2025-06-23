import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: any;
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class RazorpayService {
  static async createOrder(data: CreateOrderData) {
    try {
      const options = {
        amount: Math.round(data.amount * 100), // Razorpay expects amount in smallest currency unit
        currency: data.currency || 'INR',
        receipt: data.receipt || `receipt_${Date.now()}`,
        notes: data.notes || {},
      };

      const order = await razorpay.orders.create(options);
      logger.info('Razorpay order created:', { orderId: order.id, amount: order.amount });
      
      return order;
    } catch (error) {
      logger.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  static verifyPaymentSignature(data: VerifyPaymentData): boolean {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
      
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === razorpay_signature;
    } catch (error) {
      logger.error('Error verifying payment signature:', error);
      return false;
    }
  }

  static async getPaymentDetails(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      logger.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  static async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundData: any = { payment_id: paymentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await razorpay.payments.refund(paymentId, refundData);
      logger.info('Refund processed:', { refundId: refund.id, paymentId });
      
      return refund;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }
}
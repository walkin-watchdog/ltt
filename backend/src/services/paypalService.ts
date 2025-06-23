import { logger } from '../utils/logger';

interface PayPalOrderData {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
}

interface PayPalCaptureData {
  orderId: string;
}

export class PayPalService {
  private static baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  private static clientId = process.env.PAYPAL_CLIENT_ID;
  private static clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  private static async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error('Failed to get PayPal access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Error getting PayPal access token:', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  static async createOrder(orderData: PayPalOrderData) {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderData.reference || `order_${Date.now()}`,
            description: orderData.description || 'Luxé TimeTravel Booking',
            amount: {
              currency_code: orderData.currency || 'USD',
              value: orderData.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Luxé TimeTravel',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/booking/success`,
          cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
        },
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal API error: ${error.message}`);
      }

      const order = await response.json();
      logger.info('PayPal order created:', { orderId: order.id, amount: orderData.amount });
      
      return order;
    } catch (error) {
      logger.error('Error creating PayPal order:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  static async captureOrder(captureData: PayPalCaptureData) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${captureData.orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal capture error: ${error.message}`);
      }

      const captureResult = await response.json();
      logger.info('PayPal order captured:', { orderId: captureData.orderId });
      
      return captureResult;
    } catch (error) {
      logger.error('Error capturing PayPal order:', error);
      throw new Error('Failed to capture PayPal payment');
    }
  }

  static async refundPayment(captureId: string, amount?: number) {
    try {
      const accessToken = await this.getAccessToken();

      const payload: any = {
        note_to_payer: 'Refund from Luxé TimeTravel',
      };

      if (amount) {
        payload.amount = {
          value: amount.toFixed(2),
          currency_code: 'USD',
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal refund error: ${error.message}`);
      }

      const refund = await response.json();
      logger.info('PayPal refund processed:', { refundId: refund.id, captureId });
      
      return refund;
    } catch (error) {
      logger.error('Error processing PayPal refund:', error);
      throw new Error('Failed to process PayPal refund');
    }
  }

  static async getOrderDetails(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal API error: ${error.message}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error fetching PayPal order details:', error);
      throw new Error('Failed to fetch PayPal order details');
    }
  }
}
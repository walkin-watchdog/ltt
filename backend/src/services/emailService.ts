import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailData {
  to: string | string[];
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  text?: string;
  attachments?: any[];
}

export class EmailService {
  static async sendEmail(data: EmailData) {
    try {
      let html = data.html;
      
      if (data.template) {
        const templatePath = path.join(__dirname, '../templates', `${data.template}.hbs`);
        if (fs.existsSync(templatePath)) {
          const templateSource = fs.readFileSync(templatePath, 'utf8');
          const template = handlebars.compile(templateSource);
          html = template(data.context || {});
        }
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        html,
        text: data.text,
        attachments: data.attachments,
      };

      const result = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', { messageId: result.messageId, to: data.to });
      
      return result;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendBookingConfirmation(booking: any, product: any) {
    const emailData: EmailData = {
      to: booking.customerEmail,
      subject: `Booking Confirmation - ${product.title}`,
      template: 'booking-confirmation',
      context: {
        customerName: booking.customerName,
        bookingCode: booking.bookingCode,
        productTitle: product.title,
        bookingDate: new Date(booking.bookingDate).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        adults: booking.adults,
        children: booking.children,
        totalAmount: booking.totalAmount,
        companyName: process.env.COMPANY_NAME,
        companyEmail: process.env.COMPANY_EMAIL,
        companyPhone: process.env.COMPANY_PHONE,
      },
    };

    return this.sendEmail(emailData);
  }

  static async sendPaymentConfirmation(booking: any, payment: any, product: any) {
    const emailData: EmailData = {
      to: booking.customerEmail,
      subject: `Payment Received - ${booking.bookingCode}`,
      template: 'payment-confirmation',
      context: {
        customerName: booking.customerName,
        bookingCode: booking.bookingCode,
        productTitle: product.title,
        paymentAmount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.razorpayPaymentId,
        companyName: process.env.COMPANY_NAME,
        companyEmail: process.env.COMPANY_EMAIL,
      },
    };

    return this.sendEmail(emailData);
  }

  static async sendAbandonedCartReminder(cart: any, product: any) {
    const emailData: EmailData = {
      to: cart.email,
      subject: `Complete Your Booking - ${product.title}`,
      template: 'abandoned-cart',
      context: {
        customerName: cart.customerData.customerName,
        productTitle: product.title,
        productImage: product.images[0],
        bookingUrl: `${process.env.FRONTEND_URL}/book/${product.id}`,
        companyName: process.env.COMPANY_NAME,
      },
    };

    return this.sendEmail(emailData);
  }

  static async sendNewsletter(subscribers: string[], subject: string, content: string) {
    const emailData: EmailData = {
      to: subscribers,
      subject,
      template: 'newsletter',
      context: {
        content,
        companyName: process.env.COMPANY_NAME,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
      },
    };

    return this.sendEmail(emailData);
  }

  static async sendTripRequestNotification(request: any) {
    const emailData: EmailData = {
      to: process.env.COMPANY_EMAIL!,
      subject: `New Trip Request - ${request.destination}`,
      template: 'trip-request-notification',
      context: {
        request,
        companyName: process.env.COMPANY_NAME,
      },
    };

    return this.sendEmail(emailData);
  }
}
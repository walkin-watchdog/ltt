import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface VoucherData {
  booking: any;
  product: any;
  customer: any;
  packageDetails?: any;
  slotDetails?: any;
}

export class PDFService {
  static async generateBookingVoucher(data: VoucherData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc.fontSize(24)
           .fillColor('#104c57')
           .text('Luxé TimeTravel', 50, 50)
           .fontSize(16)
           .fillColor('#ff914d')
           .text('Booking Voucher', 50, 80);

        // Company Info
        doc.fontSize(10)
           .fillColor('#666666')
           .text(`${process.env.COMPANY_ADDRESS}`, 50, 110)
           .text(`Email: ${process.env.COMPANY_EMAIL}`, 50, 125)
           .text(`Phone: ${process.env.COMPANY_PHONE}`, 50, 140);

        // Booking Details Box
        doc.rect(50, 170, 500, 200)
           .stroke('#104c57');

        doc.fontSize(14)
           .fillColor('#104c57')
           .text('Booking Details', 70, 190);

        let yPos = 215;
        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Booking Code: ${data.booking.bookingCode}`, 70, yPos)
           .text(`Tour/Experience: ${data.product.title}`, 70, yPos + 20)
           .text(`Customer Name: ${data.booking.customerName}`, 70, yPos + 40)
           .text(`Email: ${data.booking.customerEmail}`, 70, yPos + 60)
           .text(`Phone: ${data.booking.customerPhone}`, 70, yPos + 80)
           .text(`Booking Date: ${new Date(data.booking.bookingDate).toLocaleDateString('en-IN')}`, 70, yPos + 100)
           .text(`Adults: ${data.booking.adults} | Children: ${data.booking.children}`, 70, yPos + 120);

        yPos += 140;

        if (data.packageDetails) {
          doc.text(`Package: ${data.packageDetails.name}`, 70, yPos);
          yPos += 20;
        }

        if (data.slotDetails && data.slotDetails.Time && data.slotDetails.Time.length > 0) {
          doc.text(`Time: ${data.slotDetails.Time[0]}`, 70, yPos);
          yPos += 20;
        }

        doc.text(`Total Amount: ₹${data.booking.totalAmount.toLocaleString()}`, 70, yPos);

        // Product Details
        doc.fontSize(14)
           .fillColor('#104c57')
           .text('Tour/Experience Details', 50, 400);

        doc.fontSize(11)
           .fillColor('#333333')
           .text(`Location: ${data.product.location}`, 70, 425)
           .text(`Duration: ${data.product.duration}`, 70, 445)
           .text(`Category: ${data.product.category}`, 70, 465);

        // Meeting Point
        if (data.product.meetingPoint) {
          doc.text(`Meeting Point: ${data.product.meetingPoint}`, 70, 485);
        }

        // Important Notes
        doc.fontSize(12)
           .fillColor('#ff914d')
           .text('Important Notes:', 50, 520);

        doc.fontSize(10)
           .fillColor('#333333')
           .text('• Please arrive 15 minutes before the scheduled time', 70, 545)
           .text('• Carry a valid photo ID for verification', 70, 560)
           .text('• Contact us for any changes or cancellations', 70, 575)
           .text('• Check weather conditions before departure', 70, 590);

        // Cancellation Policy
        if (data.product.cancellationPolicy) {
          doc.fontSize(12)
             .fillColor('#ff914d')
             .text('Cancellation Policy:', 50, 620);

          // Add policy type indicator
          if (data.product.cancellationPolicyType && data.product.cancellationPolicyType !== 'custom') {
            const policyTypeLabels = {
              standard: 'Standard Policy',
              moderate: 'Moderate Policy', 
              strict: 'Strict Policy',
              no_refund: 'No Refund Policy'
            };
            
            doc.fontSize(10)
               .fillColor('#666666')
               .text(`Policy Type: ${policyTypeLabels[data.product.cancellationPolicyType]}`, 70, 640);
          }

          // Add structured policy details if available
          if (data.product.cancellationTerms && data.product.cancellationTerms.length > 0) {
            let policyYPos = 660;
            data.product.cancellationTerms.forEach((term: any) => {
              doc.fontSize(10)
                 .fillColor('#333333')
                 .text(`• ${term.timeframe}: ${term.refundPercent}% refund`, 70, policyYPos)
                 .text(`  ${term.description}`, 90, policyYPos + 12);
              policyYPos += 28;
            });
          } else {
            // Fallback to standard policy text
            doc.fontSize(10)
               .fillColor('#333333')
               .text(data.product.cancellationPolicy, 70, 645, {
                 width: 450,
                 align: 'left'
               });
          }
        }

        // Additional Requirements
        const hasRequirements = data.product.requirePhone || data.product.requireId || 
                              data.product.requireAge || data.product.requireMedical ||
                              data.product.requireDietary || data.product.requireEmergencyContact ||
                              data.product.requirePassportDetails ||
                              (data.product.customRequirementFields && data.product.customRequirementFields.length > 0) ||
                              data.product.additionalRequirements;

        if (hasRequirements) {
          doc.fontSize(12)
             .fillColor('#ff914d')
             .text('Required Information from Travelers:', 50, 720);

          let reqYPos = 740;
          const requirements = [];
          
          if (data.product.requirePhone) requirements.push('Valid phone number');
          if (data.product.requireId) requirements.push('Government-issued photo ID');
          if (data.product.requireAge) requirements.push('Age verification for all travelers');
          if (data.product.requireMedical) requirements.push('Medical information and restrictions');
          if (data.product.requireDietary) requirements.push('Dietary restrictions and preferences');
          if (data.product.requireEmergencyContact) requirements.push('Emergency contact information');
          if (data.product.requirePassportDetails) requirements.push('Passport details for international travelers');

          requirements.forEach(req => {
            doc.fontSize(10)
               .fillColor('#333333')
               .text(`• ${req}`, 70, reqYPos);
            reqYPos += 15;
          });

          if (data.product.customRequirementFields && data.product.customRequirementFields.length > 0) {
            data.product.customRequirementFields.forEach((field: any) => {
              doc.text(`• ${field.label}${field.required ? ' (Required)' : ' (Optional)'}`, 70, reqYPos);
              reqYPos += 15;
            });
          }

          if (data.product.additionalRequirements) {
            doc.text(`• ${data.product.additionalRequirements}`, 70, reqYPos);
          }
        }

        // Footer
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Thank you for choosing Luxé TimeTravel!', 50, 750)
           .text('For support: info@luxetimetravel.com | +91 98765 43210', 50, 765);

        doc.end();
      } catch (error) {
        logger.error('Error generating PDF voucher:', error);
        reject(new Error('Failed to generate booking voucher'));
      }
    });
  }

  static async generateBookingReport(bookings: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc.fontSize(20)
           .fillColor('#104c57')
           .text('Booking Report', 50, 50);

        doc.fontSize(12)
           .fillColor('#666666')
           .text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 50, 80);

        let yPosition = 120;

        bookings.forEach((booking, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(12)
             .fillColor('#104c57')
             .text(`${index + 1}. ${booking.bookingCode}`, 50, yPosition)
             .fontSize(10)
             .fillColor('#333333')
             .text(`Customer: ${booking.customerName}`, 70, yPosition + 20)
             .text(`Product: ${booking.product?.title || 'N/A'}`, 70, yPosition + 35)
             .text(`Amount: ₹${booking.totalAmount.toLocaleString()}`, 70, yPosition + 50)
             .text(`Status: ${booking.status}`, 70, yPosition + 65);

          yPosition += 100;
        });

        doc.end();
      } catch (error) {
        logger.error('Error generating booking report:', error);
        reject(new Error('Failed to generate booking report'));
      }
    });
  }
}
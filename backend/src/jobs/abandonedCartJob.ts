import { PrismaClient } from '@prisma/client';
import { EmailService } from '../services/emailService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AbandonedCartJob {
  static async processAbandonedCarts() {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - 2); // 2 hours ago

      const abandonedCarts = await prisma.abandonedCart.findMany({
        where: {
          createdAt: {
            lte: cutoffTime,
          },
          remindersSent: {
            lt: 3, // Maximum 3 reminders
          },
        },
      });

      logger.info(`Found ${abandonedCarts.length} abandoned carts to process`);

      for (const cart of abandonedCarts) {
        try {
          const product = await prisma.product.findUnique({
            where: { id: cart.productId },
          });

          if (product) {
            await EmailService.sendAbandonedCartReminder(cart, product);
            
            await prisma.abandonedCart.update({
              where: { id: cart.id },
              data: {
                remindersSent: cart.remindersSent + 1,
                updatedAt: new Date(),
              },
            });

            logger.info(`Sent abandoned cart reminder for cart ${cart.id}`);
          }
        } catch (error) {
          logger.error(`Error processing abandoned cart ${cart.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error processing abandoned carts:', error);
    }
  }

  static async cleanupOldCarts() {
    try {
      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - 30); // 30 days old

      const result = await prisma.abandonedCart.deleteMany({
        where: {
          createdAt: {
            lte: cutoffTime,
          },
        },
      });

      logger.info(`Cleaned up ${result.count} old abandoned carts`);
    } catch (error) {
      logger.error('Error cleaning up old abandoned carts:', error);
    }
  }
}
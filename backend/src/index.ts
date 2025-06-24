import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { AbandonedCartJob } from './jobs/abandonedCartJob';
import { CronJob } from 'cron';

// Routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import bookingRoutes from './routes/bookings';
import availabilityRoutes from './routes/availability';
import couponRoutes from './routes/coupons';
import tripRequestRoutes from './routes/tripRequests';
import newsletterRoutes from './routes/newsletter';
import analyticsRoutes from './routes/analytics';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/uploads';
import searchRoutes from './routes/search';
import abandonedCartRoutes from './routes/abandonedCart';
import { createAdmin } from './create-admin';
import reviewsRoutes from './routes/reviews';
import paypalPaymentRoutes from './routes/paypalPayments';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(cors({
  // origin: [
  //   process.env.FRONTEND_URL || 'http://localhost:5173',
  //   process.env.ADMIN_URL || 'http://localhost:5174'
  // ],
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/trip-requests', tripRequestRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/abandoned-carts', abandonedCartRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/payments/paypal', paypalPaymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Setup cron jobs
const abandonedCartJob = new CronJob(
  '0 */2 * * *', // Every 2 hours
  AbandonedCartJob.processAbandonedCarts,
  null,
  true,
  'Asia/Kolkata'
);

const cleanupJob = new CronJob(
  '0 0 * * 0', // Every Sunday at midnight
  AbandonedCartJob.cleanupOldCarts,
  null,
  true,
  'Asia/Kolkata'
);

// Error handling
app.use(errorHandler);
// createAdmin();
// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Cron jobs started for abandoned cart processing');
});

export default app;
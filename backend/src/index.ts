import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { prisma } from './utils/prisma'
import { globalLimiter } from './middleware/rateLimit'
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { SitemapService } from './services/sitemapService';

// Routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import bookingRoutes from './routes/bookings';
import aboutRoutes from './routes/about';
import faqRoutes from './routes/faqs';
import jobRoutes from './routes/jobs';
import availabilityRoutes from './routes/availability';
import couponRoutes from './routes/coupons';
import tripRequestRoutes from './routes/tripRequests';
import newsletterRoutes from './routes/newsletter';
import analyticsRoutes from './routes/analytics';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/uploads';
import searchRoutes from './routes/search';
import abandonedCartRoutes from './routes/abandonedCart';
import destinationRoutes from './routes/destinations';
import experienceCategoryRoutes from './routes/experienceCategories';
import reviewsRoutes from './routes/reviews';
import paypalPaymentRoutes from './routes/paypalPayments';
import currencyRoutes from './routes/currency';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

// // Middleware
app.set('trust proxy', 1);

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

app.use(cookieParser());
// app.use(globalLimiter);

// app.use(limiter);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        scriptSrc  : ["'self'"],
        styleSrc   : ["'self'", "https:"],
        frameSrc   : ["'self'","https://www.paypal.com","https://*.paypal.com"],
        connectSrc : ["'self'", "https://api-m.sandbox.paypal.com"]
      },
    },
  })
);

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
app.use('/api/about', aboutRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/jobs', jobRoutes);
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
app.use('/api/destinations', destinationRoutes);
app.use('/api/experience-categories', experienceCategoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/payments/paypal', paypalPaymentRoutes);
app.use('/api/currency', currencyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Sitemap endpoint
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const sitemap = await SitemapService.getSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received – draining connections');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
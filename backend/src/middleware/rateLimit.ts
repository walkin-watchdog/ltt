import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders : false,
});

export const rateLimitPayment = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many payment attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders : false,
});

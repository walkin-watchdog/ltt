import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { z, ZodError } from 'zod';
import { logger } from '../utils/logger';

const router = express.Router();
dotenv.config();


// --- RATE LIMITER ---
const limiter = rateLimit({
  windowMs: 60_000,           // 1 minute
  max: 60,                    // limit each IP to 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
router.use('/convert', limiter);
router.use('/currencies', limiter);

// --- CACHE SETUP ---
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
type CacheEntry = { rates: Record<string, number>; fetchedAt: number };
const rateCache = new Map<string, CacheEntry>();

// --- ZOD SCHEMAS ---
const currencyCodeSchema = z
  .string()
  .regex(/^[A-Za-z]{3}$/, 'Currency must be 3 letters')  // enforce 3-letter code :contentReference[oaicite:7]{index=7}
  .transform((val) => val.toUpperCase());                  // normalize to uppercase :contentReference[oaicite:8]{index=8}

const conversionSchema = z.object({
  from: currencyCodeSchema,
  to:   currencyCodeSchema,
  amount: z.coerce.number().positive(),                   // coerce strings → numbers, enforce >0 :contentReference[oaicite:9]{index=9}
});

// --- FETCH & CACHE LOGIC ---
export async function fetchExchangeRates(base: string): Promise<Record<string, number>> {
  const now = Date.now();
  const cached = rateCache.get(base);
  const API_KEY = process.env.EXCHANGE_RATE_API_KEY || '15c8a7c3a580035713e3cc62';
  if (cached && now - cached.fetchedAt < CACHE_DURATION) {
    return cached.rates;
  }
  
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API responded ${res.status}`);
  }
  const data = await res.json();
  if (data.result !== 'success') {
    throw new Error(`API error: ${data['error-type']}`);
  }

  const rates: Record<string, number> = data.conversion_rates;
  rateCache.set(base, { rates, fetchedAt: now });
  return rates;
}

// --- ROUTES ---
router.get('/currencies', async (req, res) => {
  try {
    const rates = await fetchExchangeRates('USD');
    const all = Object.keys(rates);
    const popular = ['USD','EUR','GBP','INR','AUD','CAD','JPY','SGD','AED','CNY'];
    const sorted = [
      ...popular.filter(c => all.includes(c)).sort()
    ];
    res.json({ currencies: sorted });
  } catch (err) {
    logger.error('Currencies error:', err);
    res.status(502).json({ error: 'Failed to load currencies' });
  }
});

router.get('/convert', async (req, res) => {
  try {
    const { from, to, amount } = conversionSchema.parse({
      from:   req.query.from,
      to:     req.query.to,
      amount: req.query.amount
    });

    const rates = await fetchExchangeRates(from);
    const rate = rates[to];
    if (rate === undefined) {
      return res.status(400).json({ error: `Unsupported currency: ${to}` });
    }

    const converted = parseFloat((amount * rate).toFixed(2));
    res.json({ from, to, amount, rate, convertedAmount: converted });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    logger.error('Convert error:', err);
    res.status(502).json({ error: 'Conversion failed' });
  }
});

export default router;
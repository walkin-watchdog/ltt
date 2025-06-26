import dotenv from 'dotenv';
dotenv.config();

import { CronJob } from 'cron';
import { prisma } from './utils/prisma';
import { logger } from './utils/logger';
import { AbandonedCartJob } from './jobs/abandonedCartJob';

// Schedule jobs
const abandonedCartJob = new CronJob(
  '0 */2 * * *',
  AbandonedCartJob.processAbandonedCarts,
  null,
  true,
  'Asia/Kolkata'
);

const cleanupJob = new CronJob(
  '0 0 * * 0',
  AbandonedCartJob.cleanupOldCarts,
  null,
  true,
  'Asia/Kolkata'
);

logger.info('Worker online – cron jobs initialised');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM → stopping cron jobs');
  abandonedCartJob.stop();
  cleanupJob.stop();
  await prisma.$disconnect();
  process.exit(0);
});
import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const tripRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  adults: z.number().min(1),
  children: z.number().min(0),
  budget: z.string().min(1),
  interests: z.array(z.string()),
  accommodation: z.string().min(1),
  transport: z.string().min(1),
  specialRequests: z.string().optional()
});

// Create trip request (public)
router.post('/', async (req, res, next) => {
  try {
    const data = tripRequestSchema.parse(req.body);
    
    const tripRequest = await prisma.tripRequest.create({
      data
    });

    res.status(201).json(tripRequest);
  } catch (error) {
    next(error);
  }
});

// Get all trip requests (Admin/Editor only)
router.get('/', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    
    const where: any = {};
    if (status) where.status = status;

    const requests = await prisma.tripRequest.findMany({
      where,
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

// Update trip request status (Admin/Editor only)
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'])
    }).parse(req.body);

    const request = await prisma.tripRequest.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(request);
  } catch (error) {
    next(error);
  }
});

// Export trip requests (Admin/Editor only)
router.get('/export', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const requests = await prisma.tripRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Transform for CSV export
    const csvData = requests.map(request => ({
      ID: request.id,
      Name: request.name,
      Email: request.email,
      Phone: request.phone,
      Destination: request.destination,
      'Start Date': request.startDate.toISOString().split('T')[0],
      'End Date': request.endDate.toISOString().split('T')[0],
      Adults: request.adults,
      Children: request.children,
      Budget: request.budget,
      Interests: request.interests.join(', '),
      Accommodation: request.accommodation,
      Transport: request.transport,
      'Special Requests': request.specialRequests || '',
      Status: request.status,
      'Created At': request.createdAt.toISOString()
    }));

    res.json(csvData);
  } catch (error) {
    next(error);
  }
});

export default router;
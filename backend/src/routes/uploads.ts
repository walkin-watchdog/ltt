import express from 'express';
import { 
  uploadProductImages, 
  uploadGalleryImages, 
  uploadDestinationImages,
  uploadExperienceImages,
  uploadItineraryImages,
  uploadTeamImages,
  uploadPartnersImages,
  UploadService 
} from '../services/uploadService';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = express.Router();

// Upload product images
router.post('/products', authenticate, authorize(['ADMIN', 'EDITOR']), uploadProductImages.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      uploadResults.push({
        publicId: (file as any).filename,
        url: (file as any).path,
        originalName: file.originalname,
      });
    }

    res.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    next(error);
  }
});

// Upload gallery images
router.post('/gallery', authenticate, authorize(['ADMIN', 'EDITOR']), uploadGalleryImages.array('images', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      uploadResults.push({
        publicId: (file as any).filename,
        url: (file as any).path,
        originalName: file.originalname,
      });
    }

    res.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    next(error);
  }
});

// Upload destination images
router.post('/destinations', authenticate, authorize(['ADMIN', 'EDITOR']), uploadDestinationImages.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      uploadResults.push({
        publicId: (file as any).filename,
        url: (file as any).path,
        originalName: file.originalname,
      });
    }

    res.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    next(error);
  }
});

// Upload experiences images
router.post('/experiences', authenticate, authorize(['ADMIN', 'EDITOR']), uploadExperienceImages.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      uploadResults.push({
        publicId: (file as any).filename,
        url: (file as any).path,
        originalName: file.originalname,
      });
    }

    res.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/itinerary', authenticate, authorize(['ADMIN', 'EDITOR']), uploadItineraryImages.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      uploadResults.push({
        publicId: (file as any).filename,
        url: (file as any).path,
        originalName: file.originalname,
      });
    }

    res.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/team', authenticate, authorize(['ADMIN', 'EDITOR']), uploadTeamImages.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      uploadResults.push({
        publicId: (file as any).filename,
        url: (file as any).path,
        originalName: file.originalname,
      });
    }

    res.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/partners', authenticate, authorize(['ADMIN', 'EDITOR']), uploadPartnersImages.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

      for (const file of files) {
        const saved = await prisma.partners.create({
          data: { imageUrl: (file as any).path },
        });

        uploadResults.push({
          id: saved.id,
          publicId: (file as any).filename,
          url: saved.imageUrl,
          originalName: file.originalname,
        });
      }

    res.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    next(error);
  }
});

// Delete image
router.delete('/:publicId', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const result = await UploadService.deleteImage(publicId);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/partners',
  authenticate,
  authorize(['ADMIN', 'EDITOR', 'VIEWER']),
  async (req, res, next) => {
    try {
      const partners = await prisma.partners.findMany();

      res.json({
        images: partners.map((p) => ({
          id: p.id,
          url: p.imageUrl,
          bytes: 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all images
router.get('/:folder?', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const folder = req.params.folder || '';
    const limit = parseInt(req.query.limit as string) || 25;
    const nextCursor = req.query.next_cursor as string;
    const prefix = req.query.prefix as string;

    const result = await UploadService.getImages(folder, {
      limit,
      nextCursor,
      prefix
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Search images
router.get('/search', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const limit = parseInt(req.query.limit as string) || 25;
    const nextCursor = req.query.next_cursor as string;

    const result = await UploadService.searchImages(query, {
      limit,
      nextCursor
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
import express from 'express';
import { uploadProductImages, uploadGalleryImages, UploadService } from '../services/uploadService';
import { authenticate, authorize } from '../middleware/auth';

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

export default router;
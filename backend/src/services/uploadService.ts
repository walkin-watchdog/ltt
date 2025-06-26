import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import sharp from 'sharp';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import { logger } from '../utils/logger';
import type { Express } from 'express';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const validateMagicBytes = async (file: Express.Multer.File): Promise<boolean> => {
  return ALLOWED_MIME.includes(file.mimetype);
};

// Cloudinary storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    ],
    eager_async: true,
  } as any,
});

// Cloudinary storage for gallery images
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1920, height: 1080, crop: 'fill', quality: 'auto' },
    ],
    eager_async: true,
  } as any,
});

export const uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: async (_req, file, cb) => {
    try {
      const ok = await validateMagicBytes(file);
      if (!ok) {
        return cb(new Error('Unsupported image type'));
      }
      cb(null, true);
    } catch (err) {
      cb(err as Error);
    }
  },
});

export const uploadGalleryImages = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: async (_req, file, cb) => {
    try {
      const ok = await validateMagicBytes(file);
      if (!ok) {
        return cb(new Error('Unsupported image type'));
      }
      cb(null, true);
    } catch (err) {
      cb(err as Error);
    }
  },
});

export class UploadService {
  static async uploadSingleImage(file: Express.Multer.File, folder: string = 'general') {
    try {
      const buffer = fs.readFileSync(file.path);
      const detected = await fileTypeFromBuffer(buffer);
      if (!detected || !['image/jpeg', 'image/png', 'image/webp'].includes(detected.mime)) {
        throw new Error('Invalid or unsupported image type');
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: `luxe-travel/${folder}`,
        eager: [
          { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
        ],
        eager_async: true,
      });

      logger.info('Image uploaded successfully:', { publicId: result.public_id, url: result.secure_url });
      return {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      logger.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  static async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'general') {
    try {
      const uploadPromises = files.map(file => this.uploadSingleImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      logger.info('Multiple images uploaded successfully:', { count: results.length });
      return results;
    } catch (error) {
      logger.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  static async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info('Image deleted successfully:', { publicId, result });
      return result;
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  static async optimizeImage(buffer: Buffer, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}) {
    try {
      let sharpInstance = sharp(buffer);

      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize(options.width, options.height, {
          fit: 'cover',
          position: 'center',
        });
      }

      if (options.format) {
        sharpInstance = sharpInstance.toFormat(options.format, {
          quality: options.quality || 85,
        });
      }

      const optimizedBuffer = await sharpInstance.toBuffer();
      logger.info('Image optimized successfully');
      
      return optimizedBuffer;
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw new Error('Failed to optimize image');
    }
  }
}
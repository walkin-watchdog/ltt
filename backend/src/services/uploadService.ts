import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import sharp from 'sharp';
import { logger } from '../utils/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    ],
  } as any,
});

// Cloudinary storage for gallery images
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1920, height: 1080, crop: 'fill', quality: 'auto' },
    ],
  } as any,
});

export const uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadGalleryImages = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export class UploadService {
  static async uploadSingleImage(file: Express.Multer.File, folder: string = 'general') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `luxe-travel/${folder}`,
        transformation: [
          { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
        ],
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
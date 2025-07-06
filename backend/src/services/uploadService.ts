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

// Cloudinary storage for itinerary images
const itinerariesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/itineraries',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    ],
    eager_async: true,
  } as any,
});

// Cloudinary storage for destinations images
const destinationsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/destinations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    ],
    eager_async: true,
  } as any,
});

// Cloudinary storage for experiences images
const experiencesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/experiences',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    ],
    eager_async: true,
  } as any,
});

const teamStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/team',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    ],
    eager_async: true,
  } as any,
});

// Cloudinary storage for Partners images
const partnersStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/partners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
    ],
    eager_async: true,
  } as any,
});

// Cloudinary storage for Slide images
const slidesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxe-travel/slides',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    eager: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
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

export const uploadDestinationImages = multer({
  storage: destinationsStorage,
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

export const uploadExperienceImages = multer({
  storage: experiencesStorage,
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

export const uploadItineraryImages = multer({
  storage: itinerariesStorage,
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

export const uploadTeamImages = multer({
  storage: teamStorage,
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

export const uploadPartnersImages = multer({
  storage: partnersStorage,
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

export const uploadSlidesImages = multer({
  storage: slidesStorage,
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

  // Get images from Cloudinary
  static async getImages(folder: string = '', options: {
    limit?: number;
    nextCursor?: string;
    prefix?: string;
  } = {}): Promise<any> {
    try {
      const { limit = 25, nextCursor, prefix } = options;
      
      const params: any = {
        type: 'upload',
        max_results: limit,
      };
      
      if (folder) {
        params.prefix = `luxe-travel/${folder}`;
      } else if (prefix) {
        params.prefix = prefix;
      } else {
        params.prefix = 'luxe-travel';
      }
      
      if (nextCursor) {
        params.next_cursor = nextCursor;
      }
      
      const result = await cloudinary.api.resources(params);
      
      return {
        images: result.resources.map((resource: any) => ({
          id: resource.public_id,
          url: resource.secure_url,
          width: resource.width,
          height: resource.height,
          format: resource.format,
          created: resource.created_at,
          bytes: resource.bytes,
          folder: resource.folder
        })),
        hasMore: result.next_cursor ? true : false,
        nextCursor: result.next_cursor
      };
    } catch (error) {
      logger.error('Error fetching images from Cloudinary:', error);
      throw new Error('Failed to fetch images');
    }
  }

  // Search images from Cloudinary
  static async searchImages(query: string, options: {
    limit?: number;
    nextCursor?: string;
  } = {}): Promise<any> {
    try {
      const { limit = 25, nextCursor } = options;
      
      const params: any = {
        expression: `folder:luxe-travel* AND ${query}`,
        max_results: limit
      };
      
      if (nextCursor) {
        params.next_cursor = nextCursor;
      }
      
      const result = await cloudinary.search.expression(params.expression).max_results(params.max_results).execute();
      
      return {
        images: result.resources.map((resource: any) => ({
          id: resource.public_id,
          url: resource.secure_url,
          width: resource.width,
          height: resource.height,
          format: resource.format,
          created: resource.created_at,
          bytes: resource.bytes,
          folder: resource.folder
        })),
        hasMore: result.next_cursor ? true : false,
        nextCursor: result.next_cursor
      };
    } catch (error) {
      logger.error('Error searching images from Cloudinary:', error);
      throw new Error('Failed to search images');
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
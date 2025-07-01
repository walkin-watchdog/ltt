import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class SitemapService {
  private static SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

  static async generateSitemap(): Promise<string> {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // Fetch all published products
      const products = await prisma.product.findMany({
        where: { 
          isActive: true,
          isDraft: false
        },
        select: { 
          slug: true,
          updatedAt: true
        }
      });
      
      // Fetch all destinations
      const destinations = await prisma.destination.findMany({
        select: {
          slug: true,
          updatedAt: true
        }
      });
      
      // Fetch all experience categories
      const experienceCategories = await prisma.experienceCategory.findMany({
        select: {
          slug: true,
          updatedAt: true
        }
      });
      
      // Start building the sitemap XML
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      // Add static pages
      const staticPages = [
        { url: '/', priority: 1.0, changefreq: 'weekly' },
        { url: '/destinations', priority: 0.9, changefreq: 'weekly' },
        { url: '/experiences', priority: 0.9, changefreq: 'weekly' },
        { url: '/blog', priority: 0.8, changefreq: 'daily' },
        { url: '/offers', priority: 0.9, changefreq: 'weekly' },
        { url: '/about', priority: 0.7, changefreq: 'monthly' },
        { url: '/contact', priority: 0.7, changefreq: 'monthly' },
        { url: '/faq', priority: 0.6, changefreq: 'monthly' },
        { url: '/sustainable-travel', priority: 0.6, changefreq: 'monthly' },
        { url: '/policies', priority: 0.5, changefreq: 'monthly' },
        { url: '/plan-your-trip', priority: 0.8, changefreq: 'weekly' },
        { url: '/careers', priority: 0.6, changefreq: 'weekly' },
      ];
      
      for (const page of staticPages) {
        sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      }
      
      // Add dynamic product pages
      for (const product of products) {
        sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
      
      // Add destination pages
      for (const destination of destinations) {
        sitemap += `
  <url>
    <loc>${baseUrl}/destinations/${destination.slug}</loc>
    <lastmod>${destination.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
      
      // Add experience category pages
      for (const category of experienceCategories) {
        sitemap += `
  <url>
    <loc>${baseUrl}/experiences/${category.slug}</loc>
    <lastmod>${category.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
      
      // Close the sitemap XML
      sitemap += `
</urlset>`;
      
      // Ensure the public directory exists
      const dir = path.dirname(this.SITEMAP_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the sitemap to a file
      fs.writeFileSync(this.SITEMAP_PATH, sitemap);
      
      logger.info('Sitemap generated successfully');
      
      return sitemap;
    } catch (error) {
      logger.error('Error generating sitemap:', error);
      throw new Error('Failed to generate sitemap');
    }
  }
  
  static async getSitemap(): Promise<string> {
    try {
      if (!fs.existsSync(this.SITEMAP_PATH)) {
        return await this.generateSitemap();
      }
      
      return fs.readFileSync(this.SITEMAP_PATH, 'utf8');
    } catch (error) {
      logger.error('Error reading sitemap:', error);
      throw new Error('Failed to read sitemap');
    }
  }
}
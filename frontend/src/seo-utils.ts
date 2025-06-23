// Generates canonical URL for current page
export const getCanonicalUrl = (path: string): string => {
  const isProd = import.meta.env.VITE_PROD === 'true';
  const baseUrl = isProd
    ? 'https://luxetimetravel.com'
    : window.location.origin;
  
  // Ensure path starts with a slash and normalize
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};

// Generate JSON-LD schema for different content types
export const generateProductSchema = (product: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images[0],
    sku: product.productCode,
    offers: {
      '@type': 'Offer',
      price: product.discountPrice || product.price,
      priceCurrency: 'INR',
      availability: product.isActive 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${window.location.origin}/product/${product.id}`
    }
  };
};

export const generateTourSchema = (tour: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    image: tour.images,
    offers: {
      '@type': 'Offer',
      price: tour.discountPrice || tour.price,
      priceCurrency: 'INR'
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'Luxé TimeTravel'
    },
    duration: tour.duration,
    location: {
      '@type': 'Place',
      name: tour.location
    }
  };
};

// Generate sitemap entries
export const generateSitemapEntry = (url: string, lastMod?: string, changeFreq: string = 'weekly', priority: number = 0.8) => {
  const isProd = import.meta.env.VITE_PROD === 'true';
  const baseUrl = isProd
    ? 'https://luxetimetravel.com' 
    : window.location.origin;
  
  const fullUrl = `${baseUrl}${url}`;
  const lastModDate = lastMod || new Date().toISOString().split('T')[0];
  
  return `
  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
};
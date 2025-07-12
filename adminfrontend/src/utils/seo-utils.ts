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
  // Find lowest package price if available
  const cheapestPackage = product.packages && product.packages.length > 0 ? 
    product.packages.reduce((cheapest: any, pkg: any) => {
      const currentPrice = pkg.basePrice;
      const effectivePrice = pkg.discountType === 'percentage' ? 
        currentPrice * (1 - pkg.discountValue / 100) :
        pkg.discountType === 'fixed' ? 
        currentPrice - pkg.discountValue :
        currentPrice;
        
      return (!cheapest || effectivePrice < cheapest.effectivePrice) ?
        { package: pkg, effectivePrice } : cheapest;
    }, null) : null;
    
  const price = cheapestPackage ? 
    cheapestPackage.effectivePrice : 
    product.lowestDiscountedPackagePrice || product.lowestPackagePrice || 0;
    
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images[0],
    sku: product.productCode,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: cheapestPackage?.package?.currency || 'INR',
      availability: product.isActive 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${window.location.origin}/product/${product.id}`
    }
  };
};

export const generateTourSchema = (tour: any) => {
  // Find lowest package price if available
  const cheapestPackage = tour.packages && tour.packages.length > 0 ? 
    tour.packages.reduce((cheapest: any, pkg: any) => {
      const currentPrice = pkg.basePrice;
      const effectivePrice = pkg.discountType === 'percentage' ? 
        currentPrice * (1 - pkg.discountValue / 100) :
        pkg.discountType === 'fixed' ? 
        currentPrice - pkg.discountValue :
        currentPrice;
        
      return (!cheapest || effectivePrice < cheapest.effectivePrice) ?
        { package: pkg, effectivePrice } : cheapest;
    }, null) : null;
    
  const price = cheapestPackage ? 
    cheapestPackage.effectivePrice : 
    tour.lowestDiscountedPackagePrice || tour.lowestPackagePrice || 0;
    
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    image: tour.images,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: cheapestPackage?.package?.currency || 'INR'
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
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  published?: string;
  modified?: string;
  structuredData?: any;
}

export const SEOHead = ({
  title = 'Luxé TimeTravel - Discover the Extraordinary',
  description = 'Embark on curated luxury journeys that transcend ordinary travel. Experience the finest destinations with our bespoke travel experiences.',
  keywords = 'luxury travel, tours, experiences, travel packages, destination tours, luxury tourism, premium travel',
  image = '/images/og-image.jpg',
  url = window.location.href,
  type = 'website',
  author = 'Luxé TimeTravel',
  published,
  modified,
  structuredData,
}: SEOHeadProps) => {
  const fullTitle = title.includes('Luxé TimeTravel') ? title : `${title} | Luxé TimeTravel`;
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Luxé TimeTravel" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      
      {/* Article specific meta tags */}
      {published && <meta property="article:published_time" content={published} />}
      {modified && <meta property="article:modified_time" content={modified} />}
      {author && <meta property="article:author" content={author} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Default Structured Data for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": "Luxé TimeTravel",
          "description": "Discover the Extraordinary with our curated luxury travel experiences",
          "url": "https://luxetimetravel.com",
          "logo": `${window.location.origin}/images/logo.png`,
          "sameAs": [
            "https://facebook.com/luxetimetravel",
            "https://instagram.com/luxetimetravel",
            "https://twitter.com/luxetimetravel"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-98765-43210",
            "contactType": "customer service",
            "email": "info@luxetimetravel.com"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Travel Street",
            "addressLocality": "New Delhi",
            "addressCountry": "IN"
          }
        })}
      </script>
    </Helmet>
  );
};
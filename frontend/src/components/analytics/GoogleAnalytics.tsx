import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = window.gtag || function() {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!GA_TRACKING_ID || !window.gtag) return;

    // Track page views
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location]);

  return null;
};

// Enhanced tracking functions
export const trackEvent = (eventName: string, parameters?: any) => {
  if (!GA_TRACKING_ID || !window.gtag) return;
  
  window.gtag('event', eventName, {
    event_category: 'engagement',
    event_label: parameters?.label,
    value: parameters?.value,
    ...parameters
  });
};

export const trackBookingStart = (productId: string, productTitle: string) => {
  trackEvent('begin_checkout', {
    event_category: 'ecommerce',
    item_id: productId,
    item_name: productTitle,
    content_type: 'product'
  });
};

export const trackBookingComplete = (bookingData: {
  bookingId: string;
  productId: string;
  productTitle: string;
  amount: number;
  currency: string;
}) => {
  trackEvent('purchase', {
    event_category: 'ecommerce',
    transaction_id: bookingData.bookingId,
    value: bookingData.amount,
    currency: bookingData.currency,
    items: [{
      item_id: bookingData.productId,
      item_name: bookingData.productTitle,
      category: 'tour',
      quantity: 1,
      price: bookingData.amount
    }]
  });
};

export const trackSearchEvent = (searchTerm: string, results: number) => {
  trackEvent('search', {
    event_category: 'engagement',
    search_term: searchTerm,
    results_count: results
  });
};

export const trackProductView = (productId: string, productTitle: string, category: string) => {
  trackEvent('view_item', {
    event_category: 'ecommerce',
    item_id: productId,
    item_name: productTitle,
    item_category: category,
    content_type: 'product'
  });
};
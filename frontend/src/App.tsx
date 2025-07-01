import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { type RootState } from './store/store';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppWidget } from './components/common/WhatsAppWidget';
import { AbandonedCartNotification } from './components/common/AbandonedCartNotification';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GoogleAnalytics } from './components/analytics/GoogleAnalytics';

// Pages
import { Home } from './pages/Home';
import { Destinations } from './pages/Destinations';
import { DestinationCity } from './pages/DestinationCity';
import { Experiences } from './pages/Experiences';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { BlogCategory } from './pages/BlogCategory';
import { BlogTag } from './pages/BlogTag';
import { ExperienceCategory } from './pages/ExperienceCategory';
import { ProductDetail } from './pages/ProductDetail';
import { SpecialOffers } from './pages/SpecialOffers';
import { PlanYourTrip } from './pages/PlanYourTrip';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { SustainableTravel } from './pages/SustainableTravel';
import { Policies } from './pages/Policies';
import { Partnership } from './pages/Partnership';
import { Careers } from './pages/Careers';
import { FAQ } from './pages/FAQ';
import { BookingFlow } from './pages/BookingFlow';
import { NotFound } from './pages/NotFound';
import { debounce } from './lib/utils';

function App() {
  const [abandonedCart, setAbandonedCart] = useState<any>(null);
  const email = useSelector((state: RootState) => state.auth.email);
  const debouncedCheckRef = useRef<() => void>(() => {});

  const checkAbandonedCarts = useCallback(async () => {
    const keys = email
      ? Object.keys(localStorage).filter(
          (k) => k.startsWith('abandoned_cart_') && k.includes(email)
        )
      : Object.keys(localStorage).filter((k) => k.startsWith('abandoned_cart_'));

    const lookups = await Promise.all(
      keys.map(async (key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          const cartData = JSON.parse(raw);
          const resp = await fetch(
            `${import.meta.env.VITE_API_URL}/abandoned-carts/status` +
              `?email=${encodeURIComponent(cartData.customerEmail || email || '')}` +
              `&productId=${cartData.productId}`
          );
          const server = resp.ok ? await resp.json() : null;
          return server?.status === 'open' ? { key, cartData } : null;
        } catch {
          return null;
        }
      })
    );

    const open = lookups.find(Boolean);
    if (!open) return;

    setAbandonedCart({
      productId: open.cartData.productId,
      productTitle: open.cartData.productTitle || '',
      date: open.cartData.selectedDate || new Date().toISOString(),
    });
  }, [email]);

  useEffect(() => {
    debouncedCheckRef.current = debounce(checkAbandonedCarts, 2000);
    debouncedCheckRef.current()
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('abandoned_cart_') && email && e.key.includes(email)) {
        debouncedCheckRef.current();
      }
    };

    const handleCartUpdate = (_e: Event) => {
      debouncedCheckRef.current();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('abandonedCartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('abandonedCartUpdated', handleCartUpdate);
    };
  }, [email, checkAbandonedCarts]);

  return (
    <ErrorBoundary>
    <HelmetProvider>
      <Router>
          <GoogleAnalytics />
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
              <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:city" element={<DestinationCity />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/experiences/:category" element={<ExperienceCategory />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/blog/category/:slug" element={<BlogCategory />} />
              <Route path="/blog/tag/:slug" element={<BlogTag />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/offers" element={<SpecialOffers />} />
              <Route path="/plan-your-trip" element={<PlanYourTrip />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/sustainable-travel" element={<SustainableTravel />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/partnership" element={<Partnership />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/book/:productId" element={<BookingFlow />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              </ErrorBoundary>
          </main>
          <Footer />
          <WhatsAppWidget />
          {abandonedCart && (
            <AbandonedCartNotification 
              cart={abandonedCart} 
              onDismiss={() => setAbandonedCart(null)} 
            />
          )}
        </div>
      </Router>
    </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
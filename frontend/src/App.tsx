import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/store';
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
import { AdminLogin } from './pages/AdminLogin';

function App() {
  const [abandonedCart, setAbandonedCart] = useState<any>(null);

  useEffect(() => {
    // Check localStorage for abandoned carts
    const checkAbandonedCarts = () => {
      const email = localStorage.getItem('user_email');
      if (!email) return;
      
      // Look through localStorage for abandoned cart keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('abandoned_cart_') && key.includes(email)) {
          try {
            const cartData = JSON.parse(localStorage.getItem(key) || '');
            if (cartData) {
              // Get product ID from the key - format is abandoned_cart_PRODUCTID_EMAIL
              const productId = key.split('_')[2];
              setAbandonedCart({
                productId,
                productTitle: cartData.productTitle || 'your booking',
                date: cartData.selectedDate || new Date().toISOString()
              });
              break;
            }
          } catch (e) {
            console.error('Error parsing abandoned cart data:', e);
          }
        }
      }
    };
    
    checkAbandonedCarts();
    
    // Check again if user logs in
    const handleStorageChange = () => {
      if (localStorage.getItem('user_email')) {
        checkAbandonedCarts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ErrorBoundary>
    <HelmetProvider>
      <Provider store={store}>
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
                <Route path="/admin-login" element={<AdminLogin />} />
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
      </Provider>
    </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
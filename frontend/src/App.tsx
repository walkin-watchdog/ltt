import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store/store';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppWidget } from './components/common/WhatsAppWidget';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GoogleAnalytics } from './components/analytics/GoogleAnalytics';

// Pages
import { Home } from './pages/Home';
import { Destinations } from './pages/Destinations';
import { DestinationCity } from './pages/DestinationCity';
import { Experiences } from './pages/Experiences';
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
          </div>
        </Router>
      </Provider>
    </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
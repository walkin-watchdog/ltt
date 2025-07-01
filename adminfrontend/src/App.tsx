import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { ProductForm } from './pages/ProductForm';
import { ProductPreview } from './pages/ProductPreview';
import { AbandonedCarts } from './pages/AbandonedCarts';
import { ManualBooking } from './pages/ManualBooking';
import { Availability } from './pages/Availability';
import { UserManagement } from './pages/UserManagement';
import { Coupons } from './pages/Coupons';
import { Bookings } from './pages/Bookings';
import { NewsletterAdmin } from './pages/NewsletterAdmin';
import { DestinationsAdmin } from './pages/DestinationsAdmin';
import { ExperienceCategoriesAdmin } from './pages/ExperienceCategoriesAdmin';
import { Requests } from './pages/Requests';
import { ToasterProvider } from './components/ui/toaster';
import { Gallery } from './pages/Gallery';
import { ContentIndex } from './pages/content/ContentIndex';
import { NotFound } from './pages/NotFound';
import { GetStarted } from './pages/GetStarted';

function AdminCheckRoute({ children }: { children: JSX.Element }) {
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/check-admin`
        );
        const { exists } = await res.json();
        if (exists) navigate('/404', { replace: true });
        else setAllowed(true);
      } catch {
        setAllowed(true);
      }
    })();
  }, [navigate]);
  return allowed ? children : null;
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToasterProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route
                  path="/get-started"
                  element={
                    <AdminCheckRoute>
                      <GetStarted />
                    </AdminCheckRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/products/new" element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
                    <Layout>
                      <ProductForm />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/products/:id/edit" element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
                    <Layout>
                      <ProductForm />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/products/:id/preview" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProductPreview />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/availability" element={
                  <ProtectedRoute>
                    <Layout>
                      <Availability />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/coupons" element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
                    <Layout>
                      <Coupons />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/bookings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Bookings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/bookings/new" element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
                    <Layout>
                      <ManualBooking />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/requests" element={
                  <ProtectedRoute>
                    <Layout>
                      <Requests />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/user-management" element={
                  <ProtectedRoute requiredRoles={['ADMIN']}>
                    <Layout>
                      <UserManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/newsletter" element={
                  <ProtectedRoute>
                    <Layout>
                      <NewsletterAdmin />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/destinations-admin" element={
                  <ProtectedRoute>
                    <Layout>
                      <DestinationsAdmin />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/experience-categories" element={
                  <ProtectedRoute>
                    <Layout>
                      <ExperienceCategoriesAdmin />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/content" element={
                  <ProtectedRoute>
                    <Layout>
                      <ContentIndex />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/gallery" element={
                  <ProtectedRoute>
                    <Layout>
                      <Gallery />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/abandoned-carts" element={
                  <ProtectedRoute>
                    <Layout>
                      <AbandonedCarts />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </ToasterProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
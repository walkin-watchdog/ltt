import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { Availability } from './pages/Availability';
import { Bookings } from './pages/Bookings';
import { NewsletterAdmin } from './pages/NewsletterAdmin';
import { DestinationsAdmin } from './pages/DestinationsAdmin';
import { ExperienceCategoriesAdmin } from './pages/ExperienceCategoriesAdmin';
import { Requests } from './pages/Requests';
import { ToasterProvider } from './components/ui/toaster';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToasterProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
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
                <Route path="/bookings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Bookings />
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
                <Route path="/abandoned-carts" element={
                  <ProtectedRoute>
                    <Layout>
                      <AbandonedCarts />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </ToasterProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
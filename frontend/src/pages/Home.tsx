import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Clock, Users, MapPin } from 'lucide-react';
import { fetchProducts } from '../store/slices/productsSlice';
import type { AppDispatch, RootState } from '@/store/store';

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: '6' }));
  }, [dispatch]);

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-[#ff914d]" style={{ fontSize: '38.8px' }}>Luxé</span>
              <span className="ml-4" style={{ fontSize: '90px' }}>Time</span>
              <span className="ml-4" style={{ fontSize: '90px' }}>Travel</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Discover the Extraordinary
            </p>
            <p className="text-lg mb-12 max-w-2xl mx-auto">
              Embark on curated luxury journeys that transcend ordinary travel. 
              Experience the finest destinations with our bespoke travel experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/destinations"
                className="bg-[#ff914d] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#e8823d] transition-colors"
              >
                Explore Destinations
              </Link>
              <Link
                to="/plan-your-trip"
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#104c57] transition-colors"
              >
                Plan Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#104c57] mb-4">
              Featured Experiences
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of extraordinary tours and experiences
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d] mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={product.images[0] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {product.discountPrice && (
                      <div className="absolute top-4 left-4 bg-[#ff914d] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Special Offer
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#104c57] text-sm font-medium uppercase">
                        {product.type}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{product.location}</span>
                      <Clock className="h-4 w-4 mr-1 ml-4" />
                      <span className="text-sm">{product.duration}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {product.discountPrice ? (
                          <>
                            <span className="text-2xl font-bold text-[#ff914d]">
                              ₹{product.discountPrice.toLocaleString()}
                            </span>
                            <span className="text-lg text-gray-500 line-through ml-2">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-[#104c57]">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/product/${product.id}`}
                        className="bg-[#104c57] text-white px-4 py-2 rounded-lg hover:bg-[#0d3d47] transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="bg-[#ff914d] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#e8823d] transition-colors"
            >
              View All Experiences
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#104c57] mb-4">
              Why Choose Luxé TimeTravel
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Curated Experiences</h3>
              <p className="text-gray-600">
                Handpicked destinations and activities for the discerning traveler
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Expert Guides</h3>
              <p className="text-gray-600">
                Professional, knowledgeable guides who bring stories to life
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Seamless Planning</h3>
              <p className="text-gray-600">
                From booking to experience, we handle every detail with precision
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Luxé TimeTravel
          </h2>
          <p className="text-xl mb-8">
            Get exclusive offers, travel tips, and destination insights delivered to your inbox
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
              required
            />
            <button
              type="submit"
              className="bg-[#ff914d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
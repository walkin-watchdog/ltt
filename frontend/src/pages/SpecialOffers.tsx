import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Star, Percent, Tag } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProducts } from '../store/slices/productsSlice';
import { SEOHead } from '../components/seo/SEOHead';

export const SpecialOffers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Filter products that have discount prices
  const discountedProducts = products.filter(product => product.discountPrice);

  const calculateDiscount = (originalPrice: number, discountPrice: number) => {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const offerCategories = [
    {
      title: 'Early Bird Offers',
      description: 'Book 30 days in advance and save up to 25%',
      icon: '🐦',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Group Discounts',
      description: 'Special rates for groups of 10 or more people',
      icon: '👥',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Seasonal Promotions',
      description: 'Limited-time offers on popular destinations',
      icon: '🌟',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Last Minute Deals',
      description: 'Amazing savings on tours departing within 7 days',
      icon: '⚡',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Special Offers & Deals - Luxé TimeTravel"
        description="Discover amazing deals and special offers on luxury tours and experiences. Save up to 40% on selected destinations and packages."
        keywords="special offers, travel deals, discounted tours, luxury travel offers, best travel deals india"
      />

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Special Offers & Deals
            </h1>
            <p className="text-xl text-gray-200 mb-6">
              Discover exceptional savings on luxury travel experiences
            </p>
            <div className="bg-white bg-opacity-20 inline-block px-6 py-3 rounded-lg">
              <p className="text-lg font-semibold">
                🎉 Save up to 40% on selected tours & experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Types of Offers
            </h2>
            <p className="text-lg text-gray-600">
              Multiple ways to save on your dream journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerCategories.map((category, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    Available Now
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Deals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Current Deals & Offers
            </h2>
            <p className="text-lg text-gray-600">
              Limited-time offers on our most popular experiences
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d] mx-auto"></div>
            </div>
          ) : discountedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Special Offers Available
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for amazing deals on our luxury travel experiences.
              </p>
              <Link
                to="/destinations"
                className="bg-[#ff914d] text-white px-6 py-3 rounded-lg hover:bg-[#e8823d] transition-colors"
              >
                Explore All Tours
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {discountedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-[#ff914d]">
                  <div className="relative h-48">
                    <img
                      src={product.images[0] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#ff914d] text-white px-3 py-2 rounded-lg font-bold">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-1" />
                        {calculateDiscount(product.price, product.discountPrice!)}% OFF
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      LIMITED TIME
                    </div>
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
                    
                    {/* Pricing with prominent savings */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Was: ₹{product.price.toLocaleString()}</div>
                        <div className="text-3xl font-bold text-[#ff914d] mb-1">
                          ₹{product.discountPrice!.toLocaleString()}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          You Save: ₹{(product.price - product.discountPrice!).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/product/${product.id}`}
                      className="w-full bg-[#ff914d] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors text-center block"
                    >
                      Book This Offer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup for Offers */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-xl mb-8">
            Subscribe to our newsletter and be the first to know about exclusive offers and flash sales
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
          <p className="text-sm text-gray-300 mt-4">
            Join 10,000+ travelers getting exclusive deals every week
          </p>
        </div>
      </section>

      {/* Terms and Conditions */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Terms & Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Booking Terms</h4>
                <ul className="space-y-1 text-left">
                  <li>• Offers valid for new bookings only</li>
                  <li>• Subject to availability</li>
                  <li>• Cannot be combined with other offers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Validity</h4>
                <ul className="space-y-1 text-left">
                  <li>• Limited time offers</li>
                  <li>• Prices may change without notice</li>
                  <li>• Blackout dates may apply</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cancellation</h4>
                <ul className="space-y-1 text-left">
                  <li>• Standard cancellation policy applies</li>
                  <li>• Refunds as per terms</li>
                  <li>• Some offers non-refundable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
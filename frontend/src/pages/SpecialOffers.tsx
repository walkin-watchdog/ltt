import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Star, Percent, Tag, Calendar, AlertCircle, Search } from 'lucide-react';
import type { RootState, AppDispatch } from '../store/store';
import { NewsletterSubscription } from '../components/common/NewsletterSubscription';
import { SEOHead } from '../components/seo/SEOHead';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { getCurrencyForProduct } from '../lib/utils';

export const SpecialOffers = () => {
  const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  const filteredProducts = discountedProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || product.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const fetchDiscountedProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coupons/product-discounts`);
      
      if (response.ok) {
        const data = await response.json();
        setDiscountedProducts(data);
      }
    } catch (error) {
      console.error('Error fetching discounted products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscount = (originalPrice?: number, discountedPrice?: number) => {
    if (!originalPrice || !discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  const getAvailabilityBadge = (product: any) => {
    const status = product.availabilityStatus;
    const nextDate = product.nextAvailableDate;
    
    if (status === 'SOLD_OUT') {
      return (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          SOLD OUT
        </div>
      );
    }
    
    if (status === 'NOT_OPERATING') {
      return (
        <div className="absolute top-4 left-4 bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold">
          NOT OPERATING
        </div>
      );
    }
    
    if (nextDate) {
      const date = new Date(nextDate);
      const isUpcoming = date > new Date();
      if (isUpcoming) {
        return (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Next: {date.toLocaleDateString()}
          </div>
        );
      }
    }
    
    return (
      <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
        AVAILABLE
      </div>
    );
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
              <p className="text-lg font-semibold text-black">
                🎉 Save up to 40% on selected tours & experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Categories */}
      {/* <section className="py-16 bg-white">
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
      </section> */}

      {/* Search and Filters */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for destinations, experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  !typeFilter ? 'bg-[#104c57] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter('TOUR')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  typeFilter === 'TOUR' ? 'bg-[#104c57] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tours
              </button>
              <button
                onClick={() => setTypeFilter('EXPERIENCE')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  typeFilter === 'EXPERIENCE' ? 'bg-[#104c57] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Experiences
              </button>
            </div>
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
          ) : filteredProducts.length === 0 ? (
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
            <>
              <p className="text-center text-gray-600 mb-8">{filteredProducts.length} offers available</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const pkg = product.discountedPackage;
                const basePrice = pkg.basePrice;
                const discountedPrice = pkg.discountType === 'percentage' 
                  ? basePrice * (1 - pkg.discountValue / 100)
                  : basePrice - pkg.discountValue;
                
                return (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-[#104c57]">
                  <div className="relative h-48">
                    <img
                      src={product.images[0] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Availability Status Badge */}
                    {getAvailabilityBadge(product)}
                    
                    <div className="absolute top-4 right-4 bg-[#ff914d] text-white px-3 py-2 rounded-lg font-bold">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-1" />
                        {pkg.discountType === 'percentage' ? pkg.discountValue : Math.round((pkg.discountValue / basePrice) * 100)}% OFF
                      </div>
                    </div>
                    <div className="absolute top-12 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      LIMITED TIME
                    </div>
                  </div>
                  <div className="flex ml-2">
                    {product.reserveNowPayLater !== false && (
                      <span className="border-1 border-[#104c57] px-2 py-1 text-sm font-medium text-[#104c57] mt-2 mb-2">
                          Reserve Now & Pay Later Eligible
                      </span>
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
                    
                    {/* Availability Info */}
                    <div className="mb-4">
                      {product.availabilityStatus === 'AVAILABLE' ? (
                        <p className="text-green-600 text-sm font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Available for booking
                        </p>
                      ) : product.availabilityStatus === 'SOLD_OUT' ? (
                        <p className="text-red-600 text-sm font-medium flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Currently sold out
                        </p>
                      ) : product.nextAvailableDate ? (
                        <p className="text-blue-600 text-sm font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Next available: {new Date(product.nextAvailableDate).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>

                    {/* Pricing with prominent savings */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-4">
                      <div className="text-center leading-tight">
                        <PriceDisplay
                          amount={discountedPrice}
                          originalAmount={basePrice}
                          currency={getCurrencyForProduct(product)}
                          className="text-2xl font-bold text-[#ff914d] inline-block"
                        />
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          You Save:&nbsp;
                          <PriceDisplay
                            amount={basePrice - discountedPrice}
                            currency={getCurrencyForProduct(product)}
                            className="inline-block"
                          />
                        </div>
                      </div>
                    </div>

                    <Link
                     to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-center block ${
                        product.availabilityStatus === 'SOLD_OUT' || product.availabilityStatus === 'NOT_OPERATING'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-[#ff914d] text-white hover:bg-[#e8823d]'
                      }`}
                    >
                      {product.availabilityStatus === 'SOLD_OUT' ? 'Sold Out' : 
                       product.availabilityStatus === 'NOT_OPERATING' ? 'Not Available' : 
                       'Book This Offer'}
                    </Link>
                  </div>
                </div>
               );
              })}
            </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Signup for Offers */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Never Miss a Special Offer
          </h2>
          <p className="text-xl mb-8">
            Subscribe to our newsletter and be the first to know about exclusive deals and flash sales
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterSubscription darkMode={true} />
          </div>
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
                  <li>• Discount is applied at checkout</li>
                  <li>• Subject to availability</li>
                  <li>• Cannot be combined with coupon codes</li>
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
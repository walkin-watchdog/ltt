import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2
} from 'lucide-react';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProduct } from '../store/slices/productsSlice';
import { SEOHead } from '../components/seo/SEOHead';
import { ReviewsWidget } from '../components/reviews/ReviewsWidget';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProduct, isLoading } = useSelector((state: RootState) => state.products);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProduct?.packages && currentProduct.packages.length > 0) {
      setSelectedPackage(currentProduct.packages[0]);
    }
  }, [currentProduct]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/destinations" className="text-[#ff914d] hover:underline">
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === currentProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentProduct.images.length - 1 : prev - 1
    );
  };

  const averageRating = currentProduct.reviews?.length > 0
    ? currentProduct.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / currentProduct.reviews.length
    : 4.8;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": currentProduct.title,
    "description": currentProduct.description,
    "image": currentProduct.images,
    "offers": {
      "@type": "Offer",
      "price": currentProduct.discountPrice || currentProduct.price,
      "priceCurrency": "INR"
    },
    "provider": {
      "@type": "TravelAgency",
      "name": "Luxé TimeTravel"
    },
    "duration": currentProduct.duration,
    "location": {
      "@type": "Place",
      "name": currentProduct.location
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${currentProduct.title} - Luxury ${currentProduct.type.toLowerCase()}`}
        description={currentProduct.description}
        keywords={`${currentProduct.tags.join(', ')}, luxury travel, ${currentProduct.location}`}
        image={currentProduct.images[0]}
        structuredData={structuredData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={currentProduct.images[currentImageIndex] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
                  alt={currentProduct.title}
                  className="w-full h-full object-cover"
                />
                {currentProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-800" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {currentProduct.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Thumbnail Grid */}
              {currentProduct.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {currentProduct.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-[#ff914d]' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-[#104c57] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentProduct.type}
                </span>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#ff914d] transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentProduct.title}</h1>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{averageRating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">({currentProduct.reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{currentProduct.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{currentProduct.duration}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Up to {currentProduct.capacity} people</span>
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {currentProduct.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentProduct.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Highlights */}
            {currentProduct.highlights.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {currentProduct.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {currentProduct.inclusions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Included</h2>
                  <ul className="space-y-2">
                    {currentProduct.inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentProduct.exclusions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Not Included</h2>
                  <ul className="space-y-2">
                    {currentProduct.exclusions.map((exclusion, index) => (
                      <li key={index} className="flex items-start">
                        <X className="h-4 w-4 text-red-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{exclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary (for Tours) */}
            {currentProduct.type === 'TOUR' && currentProduct.itinerary && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {Object.entries(currentProduct.itinerary).map(([day, description]) => (
                    <div key={day} className="border-l-4 border-[#ff914d] pl-4">
                      <h3 className="font-semibold text-gray-900 capitalize">{day}</h3>
                      <p className="text-gray-700 mt-1">{description as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {currentProduct.reviews && currentProduct.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {currentProduct.reviews.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{review.name}</h3>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Reviews Widget */}
            <ReviewsWidget 
              businessId={currentProduct.id}
              className="mb-8"
            />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Price per person</span>
                  {currentProduct.discountPrice && (
                    <span className="bg-[#ff914d] text-white px-2 py-1 rounded text-xs font-semibold">
                      Save ₹{(currentProduct.price - currentProduct.discountPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-[#ff914d]">
                    ₹{(currentProduct.discountPrice || currentProduct.price).toLocaleString()}
                  </span>
                  {currentProduct.discountPrice && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      ₹{currentProduct.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Package Selection */}
              {currentProduct.packages && currentProduct.packages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Choose Package</h3>
                  <div className="space-y-2">
                    {currentProduct.packages.map((pkg: any) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedPackage?.id === pkg.id
                            ? 'border-[#ff914d] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{pkg.name}</p>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                          </div>
                          <span className="font-bold text-[#ff914d]">
                            ₹{pkg.price.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Calendar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Select Date</h3>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Available dates will be shown during booking
                </p>
              </div>

              {/* Booking Button */}
              <Link
                to={`/book/${currentProduct.id}${selectedPackage ? `?package=${selectedPackage.id}` : ''}`}
                className="w-full bg-[#ff914d] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors text-center block"
              >
                Book Now
              </Link>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Free cancellation up to 24 hours before
                </p>
              </div>

              {/* Contact */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Call us at:</p>
                  <a href="tel:+919876543210" className="text-[#ff914d] font-medium">
                    +91 98765 43210
                  </a>
                  <p className="text-gray-600">Email us at:</p>
                  <a href="mailto:info@luxetimetravel.com" className="text-[#ff914d] font-medium">
                    info@luxetimetravel.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
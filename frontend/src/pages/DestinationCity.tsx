import { useEffect } from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Star } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProducts } from '../store/slices/productsSlice';
import { SEOHead } from '../components/seo/SEOHead';

export const DestinationCity = () => {
  const { city } = useParams<{ city: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [destinationData, setDestinationData] = useState<any | null>(null);
  const [destinationLoading, setDestinationLoading] = useState(true);
  const { products, isLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (city) {
      // Fetch destination data
      const fetchDestination = async () => {
        setDestinationLoading(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/destinations/${city}`);
          
          if (response.ok) {
            const data = await response.json();
            setDestinationData(data);
            
            // Also fetch products for this destination
            dispatch(fetchProducts({ 
              type: 'TOUR',
              location: data.name
            }));
          } else {
            console.error('Error fetching destination:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching destination:', error);
        } finally {
          setDestinationLoading(false);
        }
      };
      
      fetchDestination();
    }
  }, [dispatch, city]);

  return (
    <div className="min-h-[calc(100vh-20vh)] bg-gray-50">
      <SEOHead
        title={`${destinationData?.name || city} - Luxé TimeTravel`}
        description={`${destinationData?.tagline || `Explore ${city}`}. Book authentic ${city} experiences in India with expert guides and small groups.`}
        keywords={`${city} experiences india, ${city} tours, luxury ${city}, cultural ${city}`}
        image={destinationData?.bannerImage}
      />
      
      {destinationLoading ? (
        <div className="min-h-[calc(100vh-20vh)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
        </div>
      ) : !destinationData ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
            <Link to="/destinations" className="text-[#ff914d] hover:underline">
              Back to Destinations
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative h-80 mb-80">
            <img
              src={destinationData.bannerImage}
              alt={destinationData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0"></div>
            <div className="relative z-10 flex bg-black items-center justify-center h-full">
              <div className="text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                  {destinationData.name}
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
                  {destinationData.tagline}
                </p>
              </div>
            </div>
          </section>

          {/* Category Highlights */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#104c57] mb-4">
                  Explore the City
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinationData.highlights.map((highlight: string, index: number) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="bg-[#ff914d] w-8 h-8 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tours Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#104c57] mb-4">
                  Tours in {destinationData.name}
                </h2>
                <p className="text-lg text-gray-600">
                  Discover the best experiences this destination has to offer
                </p>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d] mx-auto"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No tours available
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We're working on adding tours for {destinationData.name}. Check back soon!
                  </p>
                  <Link
                    to="/destinations"
                    className="bg-[#ff914d] text-white px-6 py-3 rounded-lg hover:bg-[#e8823d] transition-colors"
                  >
                    Explore Other Destinations
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative h-48">
                        <img
                          src={product.images[0] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        {product.lowestDiscountedPackagePrice !== undefined && (
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
                            {product.lowestDiscountedPackagePrice !== null ? (
                              <>
                                <span className="text-2xl font-bold text-[#ff914d]">
                                  ₹{product.lowestDiscountedPackagePrice?.toLocaleString()}
                                </span>
                                <span className="text-lg text-gray-500 line-through ml-2">
                                  ₹{product.lowestPackagePrice?.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-[#104c57]">
                                ₹{product.lowestPackagePrice ? product.lowestPackagePrice.toLocaleString() : 'Contact us'}
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
            </div>
          </section>
        </>
      )}
    </div>
  );
};
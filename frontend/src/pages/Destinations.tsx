import { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Star, Users } from 'lucide-react';
import { fetchProducts } from '../store/slices/productsSlice';
import { PriceDisplay } from '../components/common/PriceDisplay';
import type { AppDispatch, RootState } from '../store/store';

export const Destinations = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.products);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchProducts({ type: 'TOUR' }));
  }, [dispatch]);

  // Fetch destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      setDestinationsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/destinations`);
        
        if (response.ok) {
          const data = await response.json();
          setDestinations(data);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setDestinationsLoading(false);
      }
    };
    
    fetchDestinations();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Luxury Destinations
            </h1>
            <p className="text-xl text-gray-200">
              Discover extraordinary places with our curated tours
            </p>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#104c57] mb-4">
              All Packgaes
            </h2>
            <p className="text-lg text-gray-600">
              Immerse in the heritage and vast culture of India
            </p>
          </div>
          {/* All Tours */}
          <div className="mb-15">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d] mx-auto"></div>
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
                             <PriceDisplay 
                               amount={product.lowestDiscountedPackagePrice || 0}
                               originalAmount={product.lowestPackagePrice}
                               currency="INR"
                             />
                            </>
                          ) : (
                           <PriceDisplay 
                             amount={product.lowestPackagePrice || 0}
                             currency="INR"
                           />
                          )}
                        </div>
                        <Link
                         to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}
                          className="text-[#ff914d] font-medium hover:underline"
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#104c57] mb-4">
              Top Destinations
            </h2>
            <p className="text-lg text-gray-600">
              Immerse in the heritage and vast culture of India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {destinationsLoading ? (
              // Skeleton loading for destinations
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : destinations.length === 0 ? (
              <div className="col-span-3 text-center">
                <p className="text-gray-600">No destinations available at the moment.</p>
              </div>
            ) : (
              destinations.map((destination) => (
              <Link
                key={destination.slug}
                to={`/destinations/${destination.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 group-hover:bg-opacity-20 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{destination.name}</h3>
                      <p className="text-sm opacity-90">{destination.tours} {products.filter(p => p.location.toLowerCase().includes(destination.name.toLowerCase())).length} Tours Available</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">{destination.description}</p>
                    <div className="mt-4 flex items-center text-[#ff914d]">
                      <span className="font-medium">Explore Tours</span>
                      <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )))}
          </div>
        </div>
      </section>
      {/* Why Choose Our Packages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#104c57] mb-4">
              Why Choose Our Packages
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Local Experts</h3>
              <p className="text-gray-600">
                Learn from master craftsmen and local experts who share their passion and knowledge
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Authentic Experiences</h3>
              <p className="text-gray-600">
                Genuine cultural immersion that goes beyond typical tourist activities
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Unique Locations</h3>
              <p className="text-gray-600">
                Access to exclusive venues and hidden gems not found in guidebooks
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#104c57] mb-2">Small Groups</h3>
              <p className="text-gray-600">
                Intimate group sizes ensure personalized attention and meaningful interactions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
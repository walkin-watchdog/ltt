import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchProducts } from '../store/slices/productsSlice';
import type { AppDispatch, RootState } from '@/store/store';

export const Destinations = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ type: 'TOUR' }));
  }, [dispatch]);

  console.log('Products:', products);

  const destinations = [
    {
      name: 'Delhi',
      slug: 'delhi',
      image: 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg',
      description: 'Explore the rich heritage and vibrant culture of India\'s capital city',
      tours: products.filter(p => p.location.toLowerCase().includes('delhi')).length
    },
    {
      name: 'Jaipur',
      slug: 'jaipur',
      image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg',
      description: 'Discover the Pink City\'s majestic palaces and colorful markets',
      tours: products.filter(p => p.location.toLowerCase().includes('jaipur')).length
    },
    {
      name: 'Agra',
      slug: 'agra',
      image: 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg',
      description: 'Marvel at the Taj Mahal and Mughal architectural wonders',
      tours: products.filter(p => p.location.toLowerCase().includes('agra')).length
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {destinations.map((destination) => (
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
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{destination.name}</h3>
                      <p className="text-sm opacity-90">{destination.tours} Tours Available</p>
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
            ))}
          </div>

          {/* All Tours */}
          <div>
            <h2 className="text-3xl font-bold text-[#104c57] mb-8 text-center">
              All Tour Destinations
            </h2>
            
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
          </div>
        </div>
      </section>
    </div>
  );
};
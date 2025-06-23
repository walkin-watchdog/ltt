import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Star } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProducts } from '../store/slices/productsSlice';

export const DestinationCity = () => {
  const { city } = useParams<{ city: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.products);

  // Replace the useEffect with this enhanced version
useEffect(() => {
  if (city) {
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    
    dispatch(fetchProducts({ 
      type: 'TOUR',
      location: formattedCity
    }));
  }
}, [dispatch, city]);

// Add this after the existing console.log

  const cityInfo = {
    delhi: {
      name: 'Delhi',
      description: 'India\'s vibrant capital blends ancient heritage with modern dynamism',
      image: 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg'
    },
    jaipur: {
      name: 'Jaipur',
      description: 'The Pink City showcases Rajasthan\'s royal grandeur and architectural marvels',
      image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg'
    },
    agra: {
      name: 'Agra',
      description: 'Home to the iconic Taj Mahal and Mughal architectural masterpieces',
      image: 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg'
    }
  };

  const currentCity = city ? cityInfo[city as keyof typeof cityInfo] : null;

  if (!currentCity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">City Not Found</h1>
          <Link to="/destinations" className="text-[#ff914d] hover:underline">
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {/* <section className="relative h-96">
        <img
          src={currentCity.image}
          alt={currentCity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {currentCity.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
              {currentCity.description}
            </p>
          </div>
        </div>
      </section> */}

      {/* Tours Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#104c57] mb-4">
              Tours in {currentCity.name}
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
                We're working on adding tours for {currentCity.name}. Check back soon!
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
      </section>
    </div>
  );
};
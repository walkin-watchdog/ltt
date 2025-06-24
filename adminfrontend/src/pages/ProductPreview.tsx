import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Star, Camera, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  discountPrice?: number;
  location: string;
  duration: string;
  capacity: number;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary?: any[];
  tags: string[];
  difficulty?: string;
  guides: string[];
  languages: string[];
  packages?: any[];
  cancellationPolicy: string;
  type: string;
  category: string;
}

export const ProductPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
        <button
          onClick={() => navigate('/products')}
          className="text-[#ff914d] hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'itinerary', name: 'Itinerary' },
    { id: 'inclusions', name: 'What\'s Included' },
    { id: 'policies', name: 'Policies' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/products')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Preview</h1>
              <p className="text-gray-600">Viewing as customers would see it</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="px-4 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors"
          >
            Edit Product
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Main Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-200">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-[#ff914d]' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details Tabs */}
            <div className="mt-8 bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-[#ff914d] text-[#ff914d]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About this {product.type.toLowerCase()}</h3>
                      <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                    
                    {product.highlights.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
                        <ul className="space-y-2">
                          {product.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="h-5 w-5 text-[#ff914d] mt-0.5 mr-3 flex-shrink-0" />
                              <span className="text-gray-600">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h3>
                    {product.itinerary && product.itinerary.length > 0 ? (
                      <div className="space-y-4">
                        {product.itinerary.map((item: any, index: number) => (
                          <div key={index} className="border-l-4 border-[#ff914d] pl-4">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-gray-600 mt-1">{item.description}</p>
                            {item.time && (
                              <p className="text-sm text-gray-500 mt-1">
                                <Clock className="inline h-4 w-4 mr-1" />
                                {item.time}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No itinerary details available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'inclusions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-green-600">
                        What's Included
                      </h3>
                      <ul className="space-y-2">
                        {product.inclusions.map((inclusion, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-600">{inclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {product.exclusions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-red-600">
                          What's Not Included
                        </h3>
                        <ul className="space-y-2">
                          {product.exclusions.map((exclusion, index) => (
                            <li key={index} className="flex items-start">
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                              <span className="text-gray-600">{exclusion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">{product.cancellationPolicy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="space-y-4">
                {/* Pricing */}
                <div>
                  <div className="flex items-baseline space-x-2">
                    {product.discountPrice ? (
                      <>
                        <span className="text-3xl font-bold text-[#ff914d]">
                          ₹{product.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-[#ff914d]">
                        ₹{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">per person</p>
                </div>

                {/* Quick Info */}
                <div className="space-y-3 py-4 border-y border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-[#ff914d]" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-[#ff914d]" />
                    <span>{product.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-[#ff914d]" />
                    <span>Up to {product.capacity} people</span>
                  </div>
                  {product.difficulty && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Difficulty:</span>
                      <span>{product.difficulty}</span>
                    </div>
                  )}
                </div>

                {/* Languages */}
                {product.languages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Available Languages</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Packages */}
                {product.packages && product.packages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Package Options</h4>
                    <div className="space-y-2">
                      {product.packages.map((pkg: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{pkg.name}</h5>
                            <span className="text-[#ff914d] font-semibold">
                              {pkg.currency === 'INR' ? '₹' : pkg.currency}{pkg.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                          <p className="text-xs text-gray-500">Max {pkg.maxPeople} people</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mock Booking Button */}
                <div className="pt-4">
                  <button className="w-full bg-[#ff914d] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#e8823d] transition-colors">
                    Book Now (Preview Mode)
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    This is preview mode - booking is disabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Users, Star, 
  CheckCircle, XCircle, Calendar, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useAuth } from '../contexts/AuthContext';
import { AdminAvailabilityBar } from '@/components/common/AdminAvailabilityBar';
import { AdminAvailabilityModal } from '@/components/common/AdminAvailabilityModal';
import type { Product, PackageOption } from '@/types.ts';
import { formatDate, parse } from 'date-fns';

// Helper function to calculate the effective price after discount
const calculateEffectivePrice = (basePrice: number, discountType?: string, discountValue?: number) => {
  if (!discountType || discountType === 'none' || !discountValue) {
    return basePrice;
  }

  if (discountType === 'percentage') {
    return basePrice * (1 - (discountValue / 100));
  } else if (discountType === 'fixed') {
    return Math.max(0, basePrice - discountValue);
  }

  return basePrice;
};

export const ProductPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] =
    useState<'overview' | 'itinerary' | 'inclusions' | 'policies'>('overview');
  const todayStr = new Date().toLocaleDateString('en-US');
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [isDateOk, setIsDateOk] = useState<boolean | null>(null);
  const [availablePkgs, setAvailablePkgs] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [cheapestPackage, setCheapestPackage] = useState<PackageOption | null>(null);
  const [showAvail, setShowAvail] = useState(false);
  const isMobile = useMediaQuery('(max-width:1023px)');

  // Refs for scroll navigation
  const overviewRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const inclusionsRef = useRef<HTMLDivElement>(null);
  const policiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
        const res = await fetch(`${base}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        setProduct(await res.json());
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  // Find the cheapest package when product data loads
  useEffect(() => {
    if (!product || !product.packages || product.packages.length === 0) {
      return;
    }

    let cheapest = product.packages[0];
    let lowestPrice = calculateEffectivePrice(
      cheapest.basePrice,
      cheapest.discountType,
      cheapest.discountValue
    );

    for (const pkg of product.packages) {
      const effectivePrice = calculateEffectivePrice(
        pkg.basePrice,
        pkg.discountType,
        pkg.discountValue
      );

      if (effectivePrice < lowestPrice) {
        cheapest = pkg;
        lowestPrice = effectivePrice;
      }
    }

    setCheapestPackage(cheapest);
  }, [product]);

  // Add cleanup effect for Google Maps
  useEffect(() => {
    return () => {
      // Cleanup any Google Maps instances when component unmounts
      if (window.google && window.google.maps) {
        const autocompleteInstances = document.querySelectorAll('input[data-autocomplete]');
        autocompleteInstances.forEach(input => {
          if ((input as any).__autocomplete) {
            google.maps.event.clearInstanceListeners((input as any).__autocomplete);
          }
        });
      }
    };
  }, []);

  const getAvailabilityStatus = () => {
    if (!product) {
      return {
        status: 'unavailable',
        message: 'Currently Unavailable',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        border: 'border-gray-200',
        icon: AlertCircle,
      };
    }

    const { availabilityStatus: status, nextAvailableDate } = product;

    const map = {
      SOLD_OUT: {
        status: 'sold_out',
        message: 'Currently Sold Out',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        border: 'border-red-200',
        icon: AlertCircle,
      },
      NOT_OPERATING: {
        status: 'not_operating',
        message: 'Not Currently Operating',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        border: 'border-gray-200',
        icon: AlertCircle,
      },
    } as const;

    if (status in map) return map[status as keyof typeof map];

    if (nextAvailableDate) {
      const d = new Date(nextAvailableDate);
      if (d > new Date())
        return {
          status: 'upcoming',
          message: `Next Available: ${d.toLocaleDateString()}`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Calendar,
        };
    }

    return {
      status: 'available',
      message: 'Available for Booking',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
    };
  };

  const handleBarChange = ({ date, adults, children }: {
    date: string; adults: number; children: number;
  }) => {
    setSelectedDateStr(date);
    setAdultsCount(adults);
    setChildrenCount(children);
    setIsDateOk(null);
    setAvailablePkgs([]);
    setSelectedPackage(null);
  };

  const handlePackageSelect = (pkgId: string | PackageOption) => {
    const pkg =
      typeof pkgId === 'string'
        ? product?.packages?.find(p => p.id === pkgId)
        : (pkgId as PackageOption);

    if (!pkg) return;
    setSelectedPackage(pkg);

    if (isMobile) {
      setIsDateOk(true);
      setShowAvail(false);
    }
  };

  const checkAvailabilityDesktop = () => {
    if (isMobile || !product) return;

    // Format the date string properly
    try {
      const date = parse(selectedDateStr, 'MM/dd/yyyy', new Date());
      const isoDate = formatDate(date, 'yyyy-MM-dd');

      setCheckingAvail(true);

      (async () => {
        try {
          const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          const url = `${base}/availability/product/${product.id}?startDate=${isoDate}&endDate=${isoDate}`;
          console.log('Fetching availability from:', url);

          const res = await fetch(url);

          if (!res.ok) {
            console.error('Error fetching availability:', res.status, await res.text());
            setIsDateOk(false);
            setAvailablePkgs([]);
            setCheckingAvail(false);
            return;
          }

          const json = await res.json();
          console.log('Availability response:', json);

          const slot = json.availability?.find(
            (a: any) =>
              new Date(a.startDate) <= new Date(isoDate) &&
              (!a.endDate || new Date(a.endDate) >= new Date(isoDate))
          );

          if (!slot) {
            console.log('No slot found for the selected date');
            setIsDateOk(false);
            setAvailablePkgs([]);
            setCheckingAvail(false);
            return;
          }

          if (slot.status !== 'AVAILABLE') {
            console.log('Slot status is not AVAILABLE:', slot.status);
            setIsDateOk(false);
            setAvailablePkgs([]);
          } else {
            // If product is available, show all packages that have time slots for this day of week
            setIsDateOk(true);
            const pkgsWithTimeSlots = product.packages ?? [];
            setAvailablePkgs(pkgsWithTimeSlots);
            console.log('Available packages:', pkgsWithTimeSlots.length);
          }
        } catch (error) {
          console.error('Error in availability check:', error);
          setIsDateOk(false);
          setAvailablePkgs([]);
          console.log('Error, no packages available');
        }
        setCheckingAvail(false);
      })();
    } catch (error) {
      console.error('Error parsing date:', error);
      setIsDateOk(false);
      setAvailablePkgs([]);
      setCheckingAvail(false);
    }
  };

  // Handle tab click with smooth scrolling
  const handleTabClick = (tab: 'overview' | 'itinerary' | 'inclusions' | 'policies') => {
    setActiveTab(tab);

    const refs = {
      overview: overviewRef,
      itinerary: itineraryRef,
      inclusions: inclusionsRef,
      policies: policiesRef,
    };

    const targetRef = refs[tab];
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product!.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product!.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Product not found</h3>
        <button
          onClick={() => navigate('/products')}
          className="text-[#ff914d] hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const { bgColor, border, color, icon: StatusIcon, message } = getAvailabilityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Product Preview</h1>
            <p className="text-gray-600">Viewing as customers would see it</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/products/${id}/edit`)}
          className="px-4 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d]"
        >
          Edit Product
        </button>
      </header>

      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery - Updated to match ProductDetail */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8">
          <img
            src={product.images[currentImageIndex] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.images.length > 1 && (
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
            {product.images.map((_, index) => (
              <button
                key={index}
                aria-label={`Select image ${index + 1}`}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
              />
            ))}
          </div>
        </div>
        {/* Status banner */}
      <div className={`${bgColor} ${border} border-t-0 border-b px-6 py-3 flex items-center`}>
        <StatusIcon className={`h-5 w-5 mr-2 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{message}</span>
      </div>

        {/* Thumbnail Grid */}
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-8">
            {product.images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-20 rounded-lg overflow-hidden border-2 ${index === currentImageIndex ? 'border-[#ff914d]' : 'border-transparent'
                  }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          {/* Navigation tabs */}
          <div className="bg-white rounded-lg shadow-sm top-6 z-10">
            <nav className="border-b flex space-x-8 px-6">
              {(['overview', 'itinerary', 'inclusions', 'policies'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabClick(t)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === t
                      ? 'border-[#ff914d] text-[#ff914d]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {{
                    overview: 'Overview',
                    itinerary: 'Itinerary',
                    inclusions: "What's Included",
                    policies: 'Policies',
                  }[t]}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview */}
          <div ref={overviewRef} className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
            <div className="space-y-6">
              {/* about */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  About this {product.type.toLowerCase()}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* highlights */}
              {product.highlights?.length ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Highlights</h3>
                  <ul className="space-y-2">
                    {product.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start">
                        <Star className="h-5 w-5 text-[#ff914d] mr-3" />
                        <span className="text-gray-600">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Health Restrictions */}
              {product.healthRestrictions && Array.isArray(product.healthRestrictions) && product.healthRestrictions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Restrictions</h3>
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                    {product.healthRestrictions.map((restriction: string, idx: number) => (
                      <li key={idx}>{restriction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Guides & Languages */}
          {product.guides && Array.isArray(product.guides) && product.guides.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Guides</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {product.guides.map((guide: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div className="font-medium text-gray-900">{guide.language}</div>
                      <div className="flex items-center space-x-4">
                        {guide.inPerson && (
                          <div className="flex items-center text-blue-600">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="text-sm">In-person</span>
                          </div>
                        )}
                        {guide.audio && (
                          <div className="flex items-center text-green-600">
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114a4 4 0 100 1.772V6.114l8-1.6v4.9a4 4 0 100 1.772V3z" />
                            </svg>
                            <span className="text-sm">Audio</span>
                          </div>
                        )}
                        {guide.written && (
                          <div className="flex items-center text-purple-600">
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Written</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wheelchair Accessibility */}
                {product.wheelchairAccessible && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Wheelchair Accessible:</span>
                    <span className={`text-sm font-medium ${product.wheelchairAccessible === 'yes' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {product.wheelchairAccessible === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}

                {/* Stroller Accessibility */}
                {product.strollerAccessible && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Stroller Friendly:</span>
                    <span className={`text-sm font-medium ${product.strollerAccessible === 'yes' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {product.strollerAccessible === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}

                {/* Service Animals */}
                {product.serviceAnimalsAllowed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Service Animals:</span>
                    <span className={`text-sm font-medium ${product.serviceAnimalsAllowed === 'yes' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {product.serviceAnimalsAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                )}

                {/* Public Transport Access */}
                {product.publicTransportAccess && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Public Transport:</span>
                    <span className={`text-sm font-medium ${product.publicTransportAccess === 'yes' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {product.publicTransportAccess === 'yes' ? 'Accessible' : 'Limited Access'}
                    </span>
                  </div>
                )}

                {/* Infant Seating */}
                {product.infantSeatsRequired && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Infant Seating:</span>
                    <span className="text-sm font-medium text-gray-600">
                      {product.infantSeatsRequired === 'yes' ? 'Must sit on laps' : 'Separate seating available'}
                    </span>
                  </div>
                )}

                {/* Infant Seats Available */}
                {product.infantSeatsAvailable && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Infant Seats:</span>
                    <span className={`text-sm font-medium ${product.infantSeatsAvailable === 'yes' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {product.infantSeatsAvailable === 'yes' ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                )}
              </div>

              {/* Additional Accessibility Features */}
              {product.accessibilityFeatures &&
                Array.isArray(product.accessibilityFeatures) &&
                product.accessibilityFeatures.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Additional Features:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {product.accessibilityFeatures.map((feature: string, idx: number) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Physical Difficulty Level */}
              {product.difficulty && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Physical Difficulty:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${product.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        product.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          product.difficulty === 'Challenging' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {product.difficulty}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

      {/* Pickup & Meeting Information */}
{(
  (Array.isArray(product.pickupLocationDetails) && product.pickupLocationDetails.length > 0) ||
  (Array.isArray(product.pickupLocations) && product.pickupLocations.length > 0) ||
  product.pickupOption ||
  product.allowTravelersPickupPoint ||
  product.meetingPoint ||
  (Array.isArray(product.meetingPoints) && product.meetingPoints.length > 0)
) && (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pickup & Meeting Information</h3>
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">

      {/* Pickup Option */}
      {product.pickupOption && (
        <div>
          <span className="font-medium text-gray-800">Pickup Option: </span>
          <span className="text-gray-700">{product.pickupOption}</span>
        </div>
      )}

      {/* Allow Travelers to Choose Pickup Point */}
      {typeof product.allowTravelersPickupPoint === 'boolean' && (
        <div>
          <span className="font-medium text-gray-800">Allow Travelers to Choose Pickup Point: </span>
          <span className={`font-medium ${product.allowTravelersPickupPoint ? 'text-green-600' : 'text-red-600'}`}>
            {product.allowTravelersPickupPoint ? 'Yes' : 'No'}
          </span>
        </div>
      )}

      {/* Pickup Start Time */}
      {product.pickupStartTime && (
        <div>
          <span className="font-medium text-gray-800">Pickup Start Time: </span>
          <span className="text-gray-700">{product.pickupStartTime}</span>
        </div>
      )}

      {/* Pickup Locations (Detailed) */}
      {Array.isArray(product.pickupLocationDetails) && product.pickupLocationDetails.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-2">Pickup Locations:</h4>
          <ul className="space-y-2">
            {product.pickupLocationDetails.map((loc: any, idx: number) => (
              <li key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                <div className="font-medium text-sm text-gray-800">{loc.address}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pickup Locations (String) fallback */}
      {(!product.pickupLocationDetails || product.pickupLocationDetails.length === 0) &&
        Array.isArray(product.pickupLocations) && product.pickupLocations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-2">Pickup Locations:</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {product.pickupLocations.map((location: string, idx: number) => (
              <li key={idx}>{location}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Meeting Point (old string) */}
      {product.meetingPoint && typeof product.meetingPoint === 'string' && !Array.isArray(product.meetingPoints) && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-800 mb-1">Meeting Point:</h4>
          <p className="text-sm text-gray-700">{product.meetingPoint}</p>
        </div>
      )}

      {/* Meeting Points (array) */}
      {Array.isArray(product.meetingPoints) && product.meetingPoints.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Meeting Points:</h4>
          <div className="space-y-2">
            {product.meetingPoints.map((point: any, idx: number) => (
              <div key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                <div className="font-medium text-sm text-gray-800">{point.address}</div>
                {point.description && (
                  <div className="text-sm text-gray-600 mt-1">{point.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tour End at Meeting Point */}
      {product.doesTourEndAtMeetingPoint !== undefined && (
        <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${product.doesTourEndAtMeetingPoint ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="text-sm font-medium text-gray-800">
              {product.doesTourEndAtMeetingPoint ? 'Tour ends back at meeting point(s)' : 'Tour does not end at meeting point(s)'}
            </span>
          </div>
        </div>
      )}

{Array.isArray(product.endPoints) && product.endPoints.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">End Point Locations</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {product.endPoints.map((loc: any, idx: number) => (
                <li key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                  <div className="font-medium text-sm text-gray-800">{loc.address}</div>
                  {loc.description && loc.description.trim() !== '' && (
                    <div className="text-xs text-gray-700 mt-1">{loc.description}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  </div>
)}

          {/* Itinerary */}
          <div ref={itineraryRef} className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
            <h3 className="text-lg font-semibold mb-4">Itinerary</h3>
            {product.itineraries?.length ? (
              product.itineraries.map(item => (
                <div
                  key={item.day}
                  className="border-l-4 border-[#ff914d] pl-4 mb-4"
                >
                  <h4 className="font-medium">{`Day ${item.day}: ${item.title}`}</h4>
                  <p className="text-gray-600">{item.description}</p>
                  {item.activities?.length ? (
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mt-2">
                      {item.activities.map((act, i) => (
                        <li key={i}>
                          <div>
                            <span className="font-medium">{act.location}</span>
                            {act.isStop && (
                              <span className="ml-2 text-blue-600">
                                (Stop{act.stopDuration ? ` - ${act.stopDuration} min` : ''})
                              </span>
                            )}
                          </div>
                          {act.inclusions && act.inclusions.length > 0 && (
                            <div className="ml-4 text-green-700 text-xs">
                              Includes: {act.inclusions.join(', ')}
                            </div>
                          )}
                          {act.exclusions && act.exclusions.length > 0 && (
                            <div className="ml-4 text-red-700 text-xs">
                              Excludes: {act.exclusions.join(', ')}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No itinerary available for this product.</p>
            )}
          </div>

          {/* Inclusions / Exclusions */}
          <div ref={inclusionsRef} className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* inclusions */}
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {product.inclusions?.map((inc, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-600">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* exclusions */}
              {product.exclusions?.length ? (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    What's Not Included
                  </h3>
                  <ul className="space-y-2">
                    {product.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-500 mr-3" />
                        <span className="text-gray-600">{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {/* Policies */}
          <div ref={policiesRef} className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
            <h3 className="text-lg font-semibold mb-4">
              Cancellation Policy
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                {product.cancellationPolicy ||
                  'No specific policy provided.'}
              </p>
            </div>
          </div>
        </section>

        {/* booking info card */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6 space-y-6">
            {/* Price */}
            <div>
              <div className="flex items-baseline space-x-2">
                {cheapestPackage ? (
                  <>
                    <span className="text-3xl font-bold text-[#ff914d]">
                      {cheapestPackage.currency === 'INR' ? '₹' :
                        cheapestPackage.currency === 'USD' ? '$' :
                          cheapestPackage.currency === 'EUR' ? '€' : '£'}
                      {calculateEffectivePrice(
                        cheapestPackage.basePrice,
                        cheapestPackage.discountType,
                        cheapestPackage.discountValue
                      ).toLocaleString()}
                    </span>
                    {cheapestPackage && cheapestPackage.discountType !== 'none' && cheapestPackage.discountValue && cheapestPackage.discountValue > 0 && (
                      <span className="text-lg text-gray-500 line-through">
                        {cheapestPackage.currency === 'INR' ? '₹' :
                          cheapestPackage.currency === 'USD' ? '$' :
                            cheapestPackage.currency === 'EUR' ? '€' : '£'}
                        {cheapestPackage.basePrice.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-[#ff914d]">Price unavailable</span>
                )}
              </div>
              <p className="text-sm text-gray-500">per person</p>
            </div>

            {/* Availability bar */}
            <AdminAvailabilityBar
              selectedDate={selectedDateStr}
              adults={adultsCount}
              children={childrenCount}
              onChange={handleBarChange}
              onCheck={() => {
                if (isMobile) {
                  setShowAvail(true);
                  return;
                }
                checkAvailabilityDesktop();
              }}
            />

            {/* dynamic feedback */}
            {!isMobile && (
              <>
                {checkingAvail && (
                  <p className="text-center text-gray-500">Checking availability…</p>
                )}
                {isDateOk === false && !checkingAvail && (
                  <p className="text-center text-red-600">
                    Not enough spots for {adultsCount + childrenCount}{' '}
                    participant{adultsCount + childrenCount > 1 && 's'}.
                  </p>
                )}
                {isDateOk && availablePkgs.length > 0 && (
                  <div className="space-y-2">
                    {availablePkgs.map(pkg => (
                      <button
                        key={pkg.id}
                        onClick={() => handlePackageSelect(pkg.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg ${selectedPackage?.id === pkg.id
                            ? 'border-[#ff914d] bg-orange-50'
                            : 'border-gray-200 hover:border-[#ff914d]'
                          }`}
                      >
                        <span>
                          <p className="font-medium">{pkg.name}</p>
                          {pkg.description && (
                            <p className="text-sm text-gray-600">
                              {pkg.description}
                            </p>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Quick facts */}
            <div className="space-y-3 py-4 border-y">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-[#ff914d] mr-2" />
                {product.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 text-[#ff914d] mr-2" />
                {product.duration}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 text-[#ff914d] mr-2" />
                Up&nbsp;to&nbsp;{product.capacity}&nbsp;people
              </div>
              {product.difficulty && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Difficulty:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {product.difficulty}
                  </span>
                </div>
              )}
            </div>


            {/* Languages */}
            {product.languages?.length ? (
              <div>
                <h4 className="text-sm font-medium mb-2">Languages</h4>
                <div className="flex flex-wrap gap-1">
                  {product.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Tags */}
            {product.tags?.length ? (
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Static package list */}
            {product.packages?.length ? (
              <div>
                <h4 className="text-sm font-medium mb-3">Package Options</h4>
                <div className="space-y-2">
                  {product.packages.map(pkg => (
                    <div key={pkg.id} className="border rounded-lg p-3">
                      <div className="flex justify-between">
                        <h5 className="font-medium">{pkg.name}</h5>
                        <div className="text-[#ff914d] font-semibold">
                          {pkg.currency === 'INR' ? '₹' :
                            pkg.currency === 'USD' ? '$' :
                              pkg.currency === 'EUR' ? '€' : '£'}
                          {pkg.basePrice.toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                      {pkg.maxPeople && (
                        <p className="text-xs text-gray-500 mt-1">
                          Max {pkg.maxPeople} people
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Updated CTA button */}
            <button
              disabled
              className="w-full bg-[#ff914d]/60 text-white py-3 rounded-lg cursor-not-allowed mt-4"
            >
              Preview Mode - Booking Disabled
            </button>
            <p className="text-xs text-gray-500 text-center">
              This is a preview of how the product appears to customers
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile availability modal */}
      {showAvail && (
        <AdminAvailabilityModal
          open={showAvail}
          productId={product.id}
          packages={product.packages ?? []}
          selectedPackageFromProp={selectedPackage ?? undefined}
          onClose={() => setShowAvail(false)}
          initialDate={selectedDateStr}
          initialAdults={adultsCount}
          initialChildren={childrenCount}
          onPackageSelect={handlePackageSelect}
        />
      )}
    </div>
  );
};
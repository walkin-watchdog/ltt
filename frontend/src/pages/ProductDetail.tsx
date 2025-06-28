import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Share2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { AvailabilityModal } from '@/components/common/AvailabilityModal';
import { AvailabilityBar }   from '@/components/common/AvailabilityBar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { toast } from 'react-hot-toast';   
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProduct } from '../store/slices/productsSlice';
import { SEOHead } from '../components/seo/SEOHead';
import { ReviewsWidget } from '../components/reviews/ReviewsWidget';
import { formatDate, parse } from 'date-fns';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProduct, isLoading } = useSelector((state: RootState) => state.products);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showAvail, setShowAvail] = useState(false);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [isDateOk, setIsDateOk] = useState<boolean | null>(null);
  const [availablePkgs, setAvailablePkgs] = useState<any[]>([]);
  const isMobile = useMediaQuery('(max-width:1023px)');
  const todayStr = new Date().toLocaleDateString('en-US');
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [adultsCount,  setAdultsCount]  = useState(2);
  const [childrenCount,setChildrenCount]= useState(0);
  const { email } = useSelector((state: RootState) => state.auth);
  const [abandonedCart, setAbandonedCart] = useState<any>(null);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  const handleBarChange = ({
    date,
    adults,
    children,
  }: { date: string; adults: number; children: number }) => {
    setSelectedDateStr(date);
    setAdultsCount(adults);
    setChildrenCount(children);
    setSelectedPackage(null);
    setIsDateOk(null);
    setAvailablePkgs([]);
  };

  const handlePackageSelect = (slotId: string) => {
    const pkg = currentProduct?.packages?.find((p: any) => p.id === slotId);
    if (!pkg) return;

    setSelectedPackage(pkg);
    setSelectedSlotId(slotId);

    if (isMobile) {
      setIsDateOk(true);
      setShowAvail(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && email) {
      checkForAbandonedCart();
    }
  }, [id, email]);
  
  const checkForAbandonedCart = async () => {
    try {
      const savedCart = localStorage.getItem(`abandoned_cart_${id}_${email}`);
      
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        setAbandonedCart(cartData);
        setShowRecoveryPrompt(true);
      }
    } catch (error) {
      console.error('Error checking for abandoned cart:', error);
    }
  };
  
  const handleRecoverCart = () => {
    if (abandonedCart) {
      navigate(`/book/${id}?recover=true`);
    }
    setShowRecoveryPrompt(false);
  };
  
  const dismissRecoveryPrompt = () => {
    setShowRecoveryPrompt(false);
  };

  const getAvailabilityStatus = () => {
    if (!currentProduct) {
      return {
        status: 'unavailable',
        message: 'Currently Unavailable',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: AlertCircle
      };
    }

    const { availabilityStatus: status, nextAvailableDate } = currentProduct;

    const statusMap = {
      SOLD_OUT: {
        status: 'sold_out',
        message: 'Currently Sold Out',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertCircle
      },
      NOT_OPERATING: {
        status: 'not_operating',
        message: 'Not Currently Operating',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: AlertCircle
      }
    } as const;

    if (status in statusMap) return statusMap[status as keyof typeof statusMap];

    if (nextAvailableDate) {
      const date = new Date(nextAvailableDate);
      if (date > new Date()) {
        return {
          status: 'upcoming',
          message: `Next Available: ${date.toLocaleDateString()}`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Calendar
        };
      }
    }

    return {
      status: 'available',
      message: 'Available for Booking',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle
    };
  };
  
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

  const averageRating = currentProduct.reviews && currentProduct.reviews.length > 0
    ? currentProduct.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / currentProduct.reviews.length
    : 4.8;

  const itineraryList = (currentProduct.itineraries ?? []).map((day) => ({
    "@type": "ListItem",
    position: day.day,
    item: {
      "@type": "TouristAttraction",
      name: day.title,
      description: day.description,
      image: day.images?.[0]
    }
  }));

  const durationParts = currentProduct.duration.match(/(\d+)\s*(hour|hours|day|days|week|weeks|night|nights)/i);
  const durationValue = durationParts ? Number(durationParts[1]) : 1;
  const unitMap: Record<string, 'HOUR' | 'DAY' | 'WEEK' | 'NIGHT'> = {
    hour:  'HOUR',  hours:  'HOUR',
    day:   'DAY',   days:   'DAY',
    week:  'WEEK',  weeks:  'WEEK',
    night: 'NIGHT', nights: 'NIGHT'
  };

  const unitText =
    durationParts ? unitMap[(durationParts[2] as string).toLowerCase()] ?? 'DAY' : 'DAY';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    url: window.location.href,
    name: currentProduct.title,
    description: currentProduct.description,
    image: currentProduct.images,

    duration: {
      "@type": "QuantitativeValue",
      value: durationValue,
      unitText
    },

    offers: {
      "@type": "Offer",
      price: currentProduct.discountPrice || currentProduct.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock"
    },

    "provider": {
      "@type": "TravelAgency",
      "name": "Luxé TimeTravel"
    },
    "location": {
      "@type": "Place",
      "name": currentProduct.location
    },

    aggregateRating: currentProduct.reviews?.length
      ? {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
          reviewCount: currentProduct.reviews.length
        }
      : undefined,

    itinerary: itineraryList.length && {
      "@type": "ItemList",
      itemListOrder: "ItemListOrderAscending",
      numberOfItems: itineraryList.length,
      itemListElement: itineraryList
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
        {/* Abandoned Cart Recovery Prompt */}
        {showRecoveryPrompt && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-blue-700 font-medium">You have an unfinished booking for this product</p>
                <div className="mt-2 flex items-center">
                  <button 
                    onClick={handleRecoverCart}
                    className="mr-4 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
                  >
                    Continue Booking
                  </button>
                  <button 
                    onClick={dismissRecoveryPrompt}
                    className="text-blue-700 hover:text-blue-900 text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Image Gallery */}
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
                aria-label={`Select image ${index + 1}`}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ml-5 mr-5 lg:ml-10 lg:mr-10">
        <div className="lg:col-span-2">
          {/* Main Content */}
          <div className="relative mb-8">  
            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-[#104c57] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentProduct.type}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => toast.success('Link copied!'));
                    }}
                    className="p-2 text-gray-400 hover:text-[#ff914d] transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentProduct.title}</h1>
              
              {/* Availability Status */}
              {(() => {
                const availability = getAvailabilityStatus();
                const IconComponent = availability.icon;
                
                return (
                  <div className={`${availability.bgColor} ${availability.borderColor} border rounded-lg p-4 mb-6`}>
                    <div className="flex items-center">
                      <IconComponent className={`h-5 w-5 ${availability.color} mr-3`} />
                      <div>
                        <p className={`font-medium ${availability.color}`}>
                          {availability.message}
                        </p>
                        {availability.status === 'sold_out' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Join our waitlist to be notified when spots become available
                          </p>
                        )}
                        {availability.status === 'not_operating' && (
                          <p className="text-sm text-gray-600 mt-1">
                            This experience is temporarily suspended. Check back later for updates.
                          </p>
                        )}
                        {availability.status === 'upcoming' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Booking will open soon for the next available dates
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              
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
            {currentProduct.type === 'TOUR' &&
            currentProduct.itineraries &&
            currentProduct.itineraries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Itinerary</h2>

                <div className="space-y-8">
                  {currentProduct.itineraries.map((day: any) => (
                    <section
                      key={day.day}
                      className="border-l-4 border-[#ff914d] pl-4 space-y-4"
                    >
                      {/* Day header */}
                      <header>
                        <h3 className="font-semibold text-gray-900">
                          Day&nbsp;{day.day}: {day.title}
                        </h3>
                        <p className="text-gray-700 mt-1">{day.description}</p>
                      </header>

                      {/* Activities */}
                      {day.activities && day.activities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-800 mb-1">
                            Activities
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {day.activities.map((act: string, idx: number) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Images */}
                      {day.images && day.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {day.images.map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Day ${day.day} ${idx + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </section>
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
              googlePlaceId={import.meta.env.VITE_GOOGLE_REVIEWS_PLACE_ID}
              tripadvisorBusinessId={import.meta.env.VITE_TRIPADS_API_KEY}
              className="mb-8"
            />
          </div> 
        </div>
        {/* Booking Sidebar */}
        <div className="order-first mt-8 lg:order-none lg:mt-0 lg:col-span-1 relative">
          <div className="bg-white rounded-lg shadow-lg p-6">
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

            {/* check-availability */}
              <AvailabilityBar
              selectedDate={selectedDateStr}
              adults={adultsCount}
              children={childrenCount}
              onChange={handleBarChange}
              onCheck={() => {
                if (isMobile) { setShowAvail(true); return; }

                const iso = formatDate(parse(selectedDateStr, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd');
                (async () => {
                  setCheckingAvail(true);
                  try {
                    const base = import.meta.env.VITE_API_URL || '';
                    const res  = await fetch(
                       `${base}/availability/product/${currentProduct.id}?startDate=${iso}&endDate=${iso}`,
                    );
                    const json = await res.json();
                    const slot = json.availability?.find(
                      (a: any) =>
                        new Date(a.startDate) <= new Date(iso) &&
                        (!a.endDate || new Date(a.endDate) >= new Date(iso)),
                    );
                    if (!slot || slot.status !== 'AVAILABLE') {
                      setIsDateOk(false); setAvailablePkgs([]);
                    } else {
                      const free = slot.available - slot.booked;
                      const ok   = free >= adultsCount + childrenCount;
                      setIsDateOk(ok);
                      setAvailablePkgs(ok ? (currentProduct.packages ?? []) : []);
                    }
                  } catch { setIsDateOk(false); setAvailablePkgs([]); }
                  finally { setCheckingAvail(false); }
                })();
              }}
            />

            {/* Booking Button */}
            {!isMobile && checkingAvail && (
              <p className="text-center text-gray-500 my-4">Checking availability…</p>
            )}

            {!isMobile && isDateOk === false && !checkingAvail && (
              <p className="text-center text-red-600 my-4">
                Not enough spots for {adultsCount + childrenCount} participant
                {adultsCount + childrenCount > 1 && 's'}.
              </p>
            )}

            {!isMobile && isDateOk && availablePkgs.length > 0 && (
              <div className="space-y-2 mb-4">
                {availablePkgs.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg ${
                      selectedPackage?.id === pkg.id
                        ? 'border-[#ff914d] bg-orange-50'
                        : 'border-gray-200 hover:border-[#ff914d]'
                    }`}
                  >
                    <span className="text-left">
                      <p className="font-medium text-gray-900">{pkg.name}</p>
                      {pkg.description && (
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                      )}
                    </span>
                    <div className="flex flex-col text-right">
                      <span className="font-bold text-[#ff914d]">
                        ₹{pkg.price.toLocaleString()} / ₹{((pkg as any).childPrice ?? Math.round(pkg.price*0.5)).toLocaleString()}
                      </span>
                      {pkg.seatsLeft !== undefined && (
                        <span className="text-xs text-gray-600">
                          {pkg.seatsLeft} left
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedPackage && isDateOk && selectedSlotId && (
              <Link
                to={
                  `/book/${currentProduct.id}` +
                  `?package=${selectedPackage.id}` +
                  `&slot=${selectedSlotId}` +
                  `&date=${encodeURIComponent(selectedDateStr)}` +
                  `&adults=${adultsCount}` +
                  `&children=${childrenCount}`
                }
                className="w-full py-3 px-4 rounded-lg font-semibold transition-colors text-center block bg-[#ff914d] text-white hover:bg-[#e8823d] mb-4"
              >
                Reserve Now
              </Link>
            )}

            {/* share dropdown */}
            <div className="relative mt-4">
              <button
                onClick={() => {
                  navigator.clipboard
                    .writeText(window.location.href)
                    .then(() => toast.success('Link copied!'));
                }}
                className="w-full py-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </button>
            </div>

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
      {showAvail && isMobile && (
        <AvailabilityModal
          open={showAvail}
          productId={currentProduct.id}
          packages={currentProduct.packages ?? []}
          selectedPackage={selectedPackage}
          initialDate={selectedDateStr}
          initialAdults={adultsCount}
          initialChildren={childrenCount}
          onPackageSelect={handlePackageSelect}
          onClose={() => setShowAvail(false)}
        />
      )}
    </div>
  );
};
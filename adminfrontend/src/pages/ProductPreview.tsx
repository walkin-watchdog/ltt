import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAuth } from '../contexts/AuthContext';
import { AdminAvailabilityModal } from '../components/common/AdminAvailabilityModal';
import type { Product, PackageOption } from '../types/index.ts';
import { formatDate, parse } from 'date-fns';
import { isSlotBookable } from '../lib/utils';
import { ProductImageGallery } from '../components/productdetailcomp/ProductImageGallery';
import { Navbar } from '../components/productdetailcomp/Navbar';
import { ProductOverview } from '../components/productdetailcomp/ProductOverview';
import { DetailsDropdown } from '../components/productdetailcomp/DetailsDropdown';
import { InclusionsExclusions } from '../components/productdetailcomp/InclusionsExclusions';
import { PickupMeetingInfo } from '../components/productdetailcomp/PickupMeetingInfo';
import { AccessibilityInfo } from '../components/productdetailcomp/AccessibilityInfo';
import { GuidesAndLanguages } from '../components/productdetailcomp/GuidesAndLanguages';
import { HighlightsAndTags } from '../components/productdetailcomp/highlightsandtags';
import { AdditionalRequirements } from '../components/productdetailcomp/Additionalrequirements';
import { ProductPolicies } from '../components/productdetailcomp/ProductPolicies';
import { Itinerary } from '../components/productdetailcomp/Itinerary';
import { BookingSidebar } from '../components/productdetailcomp/BookingSidebar';
import { calculateEffectivePrice } from '@/components/productdetailcomp/globalfunc.tsx';
import { ReviewsWidget } from '@/components/productdetailcomp/ReviewWidget.tsx';

// Helper function to calculate the effective price after disco

export const ProductPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const todayStr = new Date().toLocaleDateString('en-US');
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [isDateOk, setIsDateOk] = useState<boolean | null>(null);
  const [availablePackages, setAvailablePackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [cheapestPackage, setCheapestPackage] = useState<PackageOption | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotsForPackage, setSlotsForPackage] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [departureDropdownOpen, setDepartureDropdownOpen] = useState(false);
  const [showAvail, setShowAvail] = useState(false);
  const isMobile = useMediaQuery('(max-width:1023px)');

  // Refs for scroll navigation
  const overviewRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

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

  // Fetch available slots when a package is selected
  useEffect(() => {
    if (!selectedPackage || !selectedDateStr) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const iso = formatDate(parse(selectedDateStr, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd');
        const dayOfWeek = parse(selectedDateStr, 'MM/dd/yyyy', new Date()).toLocaleDateString('en-US', { weekday: 'long' });
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const res = await fetch(`${base}/availability/package/${selectedPackage.id}/slots?date=${iso}`);

        if (res.ok) {
          const data = await res.json();
          if (data.slots && Array.isArray(data.slots)) {
            // Filter slots based on day of week
            const filteredSlots = data.slots.filter((slot: { days: string | string[]; }) =>
              Array.isArray(slot.days) && slot.days.includes(dayOfWeek)
            );

            // Filter slots based on cutoff time
            const availableSlots = filteredSlots.filter((slot: any) => {
              if (!slot.Time || !Array.isArray(slot.Time) || slot.Time.length === 0) {
                return false;
              }

              // Check if any time in the slot is still bookable
              return slot.Time.some((time: string) => {
                const cutoffTime = slot.cutoffTime || 24;
                const { isBookable } = isSlotBookable(iso, time, cutoffTime);
                return isBookable;
              });
            });

            setSlotsForPackage(availableSlots);
            // Reset selected time slot when slots change
            setSelectedSlot(null);
            setSelectedSlotId(null);
            setSelectedTimeSlot(null);
          } else {
            setSlotsForPackage([]);
          }
        } else {
          console.error('Failed to fetch slots:', await res.text());
          setSlotsForPackage([]);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setSlotsForPackage([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedPackage, selectedDateStr]);

  const handleBarChange = ({ date, adults, children }: {
    date: string; adults: number; children: number;
  }) => {
    setSelectedDateStr(date);
    setAdultsCount(adults);
    setChildrenCount(children);
    setSelectedPackage(null);
    setSelectedSlotId(null);
    setSelectedSlot(null);
    setIsDateOk(null);
    setAvailablePackages([]);
  };

  const handlePackageSelect = (pkgId: string) => {
    const pkg = product?.packages?.find((p: any) => p.id === pkgId);
    if (!pkg) return;

    setSelectedPackage(pkg);
    setSelectedSlotId(null);
    setSelectedSlot(null);
    setSelectedTimeSlot(null);
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

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
    : 4.8;

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
        {/* Image Gallery */}
        <ProductImageGallery
          setCurrentImageIndex={setCurrentImageIndex}
          currentImageIndex={currentImageIndex}
          product={product}
        />

        {/* Thumbnail Grid */}
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-4">
            {product.images.slice(0, 10).map((image, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ml-5 mr-5 lg:ml-10 lg:mr-10">
        <div className="lg:col-span-2">
          {/* Tabbed Navigation Bar */}
          <Navbar
            overviewRef={overviewRef}
            itineraryRef={itineraryRef}
            detailsRef={detailsRef}
            reviewsRef={reviewsRef}
          />

          {/* Main Content */}
          <div className="relative mb-8">
            {/* Overview Section */}
            <ProductOverview overviewRef={overviewRef} averageRating={averageRating} product={product} />

            {/* Details Section */}
            <div ref={detailsRef} className="bg-white rounded-lg shadow-sm p-6 mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Details</h2>

              {/* Details Dropdowns */}
              <div className="space-y-4">
                {/* What's included */}
                <DetailsDropdown title="What's included" defaultOpen={true}>
                  <InclusionsExclusions product={product} />
                </DetailsDropdown>

                {/* Departure and return */}
                <div data-dropdown="departure-return">
                  <DetailsDropdown
                    title="Departure and return"
                    isOpen={departureDropdownOpen}
                    onToggle={setDepartureDropdownOpen}
                  >
                    <PickupMeetingInfo product={product} />
                  </DetailsDropdown>
                </div>

                {/* Accessibility */}
                <DetailsDropdown title="Accessibility">
                  <AccessibilityInfo product={product} />
                </DetailsDropdown>

                {/* Guides and Languages */}
                {product.guides && Array.isArray(product.guides) && product.guides.length > 0 && (
                  <DetailsDropdown title="Guides and Languages">
                    <GuidesAndLanguages product={product} />
                  </DetailsDropdown>
                )}

                {/* Highlights and Tags */}
                {(product.highlights?.length || product.tags?.length) > 0 && (
                  <DetailsDropdown title="Highlights and Tags">
                    <div className="p-4">
                      <HighlightsAndTags product={product} />
                    </div>
                  </DetailsDropdown>
                )}

                {/* Additional Information */}
                {(product.requirePhone || product.requireId || product.requireAge ||
                  product.requireMedical || product.requireDietary ||
                  product.requireEmergencyContact || product.requirePassportDetails ||
                  (Array.isArray(product.customRequirementFields) && product.customRequirementFields.length > 0) ||
                  product.additionalRequirements) && (
                    <DetailsDropdown title="Additional information">
                      <div>
                        <AdditionalRequirements product={product} />
                      </div>
                    </DetailsDropdown>
                  )}

                {/* Cancellation policy */}
                {product.cancellationPolicy && (
                  <DetailsDropdown title="Cancellation policy">
                    <ProductPolicies product={product} />
                  </DetailsDropdown>
                )}

                {/* Help */}
                <DetailsDropdown title="Help">
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Customer Support</h3>
                      </div>
                      <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed mb-4">Need assistance? Our customer support team is here to help you 24/7.</p>

                        <div className="grid gap-4">
                          <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-green-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 block">Phone Support</span>
                              <span className="text-blue-600 font-medium">+91 78210 01995</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-green-100">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 block">Email Support</span>
                              <span className="text-purple-600 font-medium">admin@luxetimetravel.com</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-green-100">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 block">Availability</span>
                              <span className="text-green-600 font-medium">24/7 for your convenience</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DetailsDropdown>
              </div>
            </div>

            {/* Itinerary Section */}
            <Itinerary
              itineraryRef={itineraryRef}
              detailsRef={detailsRef}
              onNavigateToDeparture={() => setDepartureDropdownOpen(true)}
              product={product}
            />

            {/* Reviews Section */}
            <div ref={reviewsRef} className="bg-white rounded-lg shadow-sm p-6 mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
              <ReviewsWidget
                googlePlaceId={import.meta.env.VITE_GOOGLE_REVIEWS_PLACE_ID}
                tripadvisorBusinessId={import.meta.env.VITE_TRIPADS_API_KEY}
                className=""
              />
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <BookingSidebar
          cheapestPackage={cheapestPackage}
          currentProduct={product}
          selectedDateStr={selectedDateStr}
          adultsCount={adultsCount}
          childrenCount={childrenCount}
          isMobile={isMobile}
          setCheckingAvail={setCheckingAvail}
          setIsDateOk={setIsDateOk}
          setAvailablePackages={setAvailablePackages}
          setSelectedSlotId={setSelectedSlotId}
          setSelectedTimeSlot={setSelectedTimeSlot}
          calculateEffectivePrice={calculateEffectivePrice}
          handleBarChange={handleBarChange}
          selectedPackage={selectedPackage}
          checkingAvail={checkingAvail}
          isDateOk={isDateOk}
          availablePackages={availablePackages}
          slotsLoading={slotsLoading}
          slotsForPackage={slotsForPackage}
          selectedSlot={selectedSlot}
          selectedSlotId={selectedSlotId}
          selectedTimeSlot={selectedTimeSlot}
          handlePackageSelect={handlePackageSelect}
          setSelectedSlot={setSelectedSlot}
          isSlotBookable={isSlotBookable}
        />
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
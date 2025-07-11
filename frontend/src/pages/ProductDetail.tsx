import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { trackProductView } from '../components/analytics/GoogleAnalytics';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { RootState, AppDispatch } from '../store/store';
import { fetchProduct, fetchProductBySlug } from '../store/slices/productsSlice';
import { SEOHead } from '../components/seo/SEOHead';
import { ReviewsWidget } from '../components/reviews/ReviewsWidget';
import { formatDate, parse } from 'date-fns';
import { isSlotBookable } from '../lib/utils';
import { BookingSidebar } from '../components/productdetailcomp/BookingSidebar';
import { Itinerary } from '../components/productdetailcomp/Itinerary';
import { ProductPolicies } from '../components/productdetailcomp/ProductPolicies';
import { InclusionsExclusions } from '../components/productdetailcomp/InclusionsExclusions';
import { PickupMeetingInfo } from '../components/productdetailcomp/PickupMeetingInfo';
import { AccessibilityInfo } from '../components/productdetailcomp/AccessibilityInfo';
import { GuidesAndLanguages } from '../components/productdetailcomp/GuidesAndLanguages';
import { ProductOverview } from '../components/productdetailcomp/ProductOverview';
import { AbandonedCartPrompt } from '../components/productdetailcomp/AbandonedCartPrompt';
import { ProductImageGallery } from '../components/productdetailcomp/ProductImageGallery';
import { Navbar } from '../components/productdetailcomp/Navbar';
import { DetailsDropdown } from '../components/productdetailcomp/DetailsDropdown';
import { calculateEffectivePrice } from '../components/productdetailcomp/globalfunc';
import { AdditionalRequirements } from '@/components/productdetailcomp/Additionalrequirements';
import { HighlightsAndTags } from '@/components/productdetailcomp/highlightsandtags';

// Helper function to calculate the effective price after discount


export const ProductDetail = () => {
    const { id, slug } = useParams<{ id?: string; slug?: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentProduct, isLoading, error } = useSelector((state: RootState) => state.products);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [checkingAvail, setCheckingAvail] = useState(false);
    const [isDateOk, setIsDateOk] = useState<boolean | null>(null);
    const [availablePackages, setAvailablePackages] = useState<any[]>([]);
    const [slotsForPackage, setSlotsForPackage] = useState<any[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width:1023px)');
    const todayStr = new Date().toLocaleDateString('en-US');
    const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
    const [adultsCount, setAdultsCount] = useState(2);
    const [childrenCount, setChildrenCount] = useState(0);
    const { email } = useSelector((state: RootState) => state.auth as { email: string });
    const [abandonedCart, setAbandonedCart] = useState<any>(null);
    const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
    const [cheapestPackage, setCheapestPackage] = useState<any>(null);
    const [departureDropdownOpen, setDepartureDropdownOpen] = useState(false);

    const overviewRef = useRef<HTMLDivElement>(null);
    const itineraryRef = useRef<HTMLDivElement>(null);
    const detailsRef = useRef<HTMLDivElement>(null);
    const reviewsRef = useRef<HTMLDivElement>(null);




    const handleBarChange = ({
        date,
        adults,
        children,
    }: { date: string; adults: number; children: number }) => {
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
        const pkg = currentProduct?.packages?.find((p: any) => p.id === pkgId);
        if (!pkg) return;

        setSelectedPackage(pkg);
        setSelectedSlotId(null);
        setSelectedSlot(null);
        setSelectedTimeSlot(null);
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (id && currentProduct?.slug && !slug) {
            navigate(`/p/${currentProduct.slug}`, { replace: true });
        }
    }, [id, slug, currentProduct, navigate]);

    useEffect(() => {
        if (currentProduct) {
            trackProductView(
                currentProduct.id,
                currentProduct.title,
                currentProduct.category || currentProduct.type
            );
        }
    }, [currentProduct]);

    useEffect(() => {
        if (slug) {
            dispatch(fetchProductBySlug(slug));
        } else if (id) {
            const urlParams = new URLSearchParams(window.location.search);
            const isRecover = urlParams.get('recover') === 'true';

            if (isRecover) {
                const recoveryData = sessionStorage.getItem('recover_cart');
                if (recoveryData) {
                    try {
                        const cartData = JSON.parse(recoveryData);
                        // Only use recovery data if it's for the current product and less than 30 minutes old
                        if (cartData.productId === id && (Date.now() - cartData.timestamp < 30 * 60 * 1000)) {
                            setSelectedDateStr(cartData.selectedDate || todayStr);
                            setAdultsCount(cartData.adults || 2);
                            setChildrenCount(cartData.children || 0);
                            setSelectedTimeSlot(cartData.selectedTimeSlot);

                            // Store IDs to set after product loads
                            sessionStorage.setItem('pending_recovery', JSON.stringify({
                                packageId: cartData.packageId,
                                slotId: cartData.slotId,
                                selectedTimeSlot: cartData.selectedTimeSlot
                            }));
                        }
                    } catch (err) {
                        console.error('Error parsing recovery data:', err);
                        sessionStorage.removeItem('recover_cart');
                    }
                }
            }

            dispatch(fetchProduct(id));
        }
    }, [dispatch, id, slug]);

    if (!isLoading && error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    useEffect(() => {
        if (id && email) {
            checkForAbandonedCart();
        }
    }, [id, email]);

    // Find the cheapest package when product data loads
    useEffect(() => {
        if (!currentProduct || !currentProduct.packages || currentProduct.packages.length === 0) {
            return;
        }

        let cheapest = currentProduct.packages[0];
        let lowestPrice = calculateEffectivePrice(
            cheapest.basePrice,
            cheapest.discountType,
            cheapest.discountValue
        );

        for (const pkg of currentProduct.packages) {
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
    }, [currentProduct]);

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
        hour: 'HOUR', hours: 'HOUR',
        day: 'DAY', days: 'DAY',
        week: 'WEEK', weeks: 'WEEK',
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
            price: currentProduct.lowestDiscountedPackagePrice || currentProduct.lowestPackagePrice || 0,
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
                url={window.location.href}
                type="product"
                keywords={`${currentProduct.tags.join(', ')}, luxury travel, ${currentProduct.location}`}
                image={currentProduct.images[0]}
                structuredData={structuredData}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Abandoned Cart Recovery Prompt */}
                <AbandonedCartPrompt
                    showRecoveryPrompt={showRecoveryPrompt}
                    handleRecoverCart={handleRecoverCart}
                    dismissRecoveryPrompt={dismissRecoveryPrompt}
                />

                {/* Image Gallery */}{/* Thumbnail Grid */}
                <ProductImageGallery
                    setCurrentImageIndex={setCurrentImageIndex}
                    currentImageIndex={currentImageIndex}
                />
                {currentProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-4">
                        {currentProduct.images.slice(0, 10).map((image, index) => (
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
                        <ProductOverview overviewRef={overviewRef} averageRating={averageRating} />

                        {/* Details Section */}
                        <div ref={detailsRef} className="bg-white rounded-lg shadow-sm p-6 mb-8 scroll-mt-20">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Details</h2>

                            {/* Details Dropdowns */}
                            <div className="space-y-4">
                                {/* What's included */}
                                <DetailsDropdown title="What's included" defaultOpen={true}>
                                    <InclusionsExclusions />
                                </DetailsDropdown>

                                {/* Departure and return */}
                                <div data-dropdown="departure-return">
                                    <DetailsDropdown
                                        title="Departure and return"
                                        isOpen={departureDropdownOpen}
                                        onToggle={setDepartureDropdownOpen}
                                    >
                                        <PickupMeetingInfo />
                                    </DetailsDropdown>
                                </div>

                                {/* Accessibility */}
                                <DetailsDropdown title="Accessibility">
                                    <AccessibilityInfo />
                                </DetailsDropdown>

                                {/* Guides and Languages */}
                                {currentProduct.guides && Array.isArray(currentProduct.guides) && currentProduct.guides.length > 0 && (
                                    <DetailsDropdown title="Guides and Languages">
                                        <GuidesAndLanguages />
                                    </DetailsDropdown>
                                )}

                                {/* Highlights and Tags */}
                                {(currentProduct.highlights?.length || currentProduct.tags?.length) > 0 && (
                                    <DetailsDropdown title="Highlights and Tags">
                                        <div className="p-4">
                                            <HighlightsAndTags />
                                        </div>
                                    </DetailsDropdown>
                                )}

                                {/* Additional Information */}
                                {(currentProduct.requirePhone || currentProduct.requireId || currentProduct.requireAge ||
                                    currentProduct.requireMedical || currentProduct.requireDietary ||
                                    currentProduct.requireEmergencyContact || currentProduct.requirePassportDetails ||
                                    (Array.isArray(currentProduct.customRequirementFields) && currentProduct.customRequirementFields.length > 0) ||
                                    currentProduct.additionalRequirements) && (
                                <DetailsDropdown title="Additional information">
                                    <div>
                                        <AdditionalRequirements />
                                    </div>
                                </DetailsDropdown>
                                    )}

                                {/* Cancellation policy */}
                                {currentProduct.cancellationPolicy && (
                                    <DetailsDropdown title="Cancellation policy">
                                        <ProductPolicies />
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
                                                            <span className="text-blue-600 font-medium">+1 (234) 567-890</span>
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
                    currentProduct={currentProduct}
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
        </div>
    );
};
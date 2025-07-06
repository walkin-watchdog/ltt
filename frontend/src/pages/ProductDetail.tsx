import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { trackProductView } from '../components/analytics/GoogleAnalytics';
import { AvailabilityModal } from '../components/common/AvailabilityModal';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { RootState, AppDispatch } from '../store/store';
import { fetchProduct, fetchProductBySlug } from '../store/slices/productsSlice';
import { SEOHead } from '../components/seo/SEOHead';
import { ReviewsWidget } from '../components/reviews/ReviewsWidget';
import { formatDate, parse } from 'date-fns';
import { setStep } from '../store/slices/bookingSlice';
import { isSlotBookable } from '../lib/utils';
import { BookingSidebar } from '@/components/productdetailcomp/BookingSidebar';
import { Itinerary } from '@/components/productdetailcomp/Itinerary';
import { ProductPolicies } from '@/components/productdetailcomp/ProductPolicies';
import { InclusionsExclusions } from '@/components/productdetailcomp/InclusionsExclusions';
import { PickupMeetingInfo } from '@/components/productdetailcomp/PickupMeetingInfo';
import { AccessibilityInfo } from '@/components/productdetailcomp/AccessibilityInfo';
import { GuidesAndLanguages } from '@/components/productdetailcomp/GuidesAndLanguages';
import { ProductOverview } from '@/components/productdetailcomp/ProductOverview';
import { AbandonedCartPrompt } from '@/components/productdetailcomp/AbandonedCartPrompt';
import { ProductImageGallery } from '@/components/productdetailcomp/ProductImageGallery';
import { Navbar } from '@/components/productdetailcomp/Navbar';
import { calculateEffectivePrice } from '@/components/productdetailcomp/globalfunc';

// Helper function to calculate the effective price after discount


export const ProductDetail = () => {
    const { id, slug } = useParams<{ id?: string; slug?: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentProduct, isLoading, error } = useSelector((state: RootState) => state.products);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [showAvail, setShowAvail] = useState(false);
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
   
    const overviewRef = useRef<HTMLDivElement>(null);
    const itineraryRef = useRef<HTMLDivElement>(null);
    const inclusionsRef = useRef<HTMLDivElement>(null);
    const policiesRef = useRef<HTMLDivElement>(null);




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

        if (isMobile) {
            // For mobile, change to slot selection step
            setStep('slot');
            setIsDateOk(true);
        }
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

        // Apply pending recovery data if it exists
        const pendingRecovery = sessionStorage.getItem('pending_recovery');
        if (pendingRecovery) {
            try {
                const recoveryData = JSON.parse(pendingRecovery);

                // Set selected package if it exists
                if (recoveryData.packageId) {
                    const pkg = currentProduct.packages.find(p => p.id === recoveryData.packageId);
                    if (pkg) {
                        setSelectedPackage(pkg);

                        // Set selected slot and time slot after package is selected and slots are loaded
                        setTimeout(() => {
                            if (recoveryData.slotId && pkg.slots) {
                                const slot = pkg.slots.find((s: any) => s.id === recoveryData.slotId);
                                if (slot) {
                                    setSelectedSlotId(recoveryData.slotId);
                                    setSelectedSlot(slot);

                                    if (recoveryData.selectedTimeSlot &&
                                        Array.isArray(slot.Time) &&
                                        slot.Time.includes(recoveryData.selectedTimeSlot)) {
                                        setSelectedTimeSlot(recoveryData.selectedTimeSlot);
                                    }
                                }
                            }
                        }, 500);
                    }
                }

                // Clear pending recovery after applying
                sessionStorage.removeItem('pending_recovery');

            } catch (err) {
                console.error('Error applying recovery data:', err);
                sessionStorage.removeItem('pending_recovery');
            }
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
                    inclusionsRef={inclusionsRef}
                    policiesRef={policiesRef}
                    />
                    {/* Main Content */}
                    <div className="relative mb-8">
                        {/* Overview */}
                      <ProductOverview overviewRef={overviewRef} averageRating={averageRating}/>

                        {/* Guides & Languages */}
                        <GuidesAndLanguages/>

                        {/* Accessibility Features */}
                       <AccessibilityInfo />

                        {/* Pickup & Meeting Information */}
                       <PickupMeetingInfo/>
                        {/* Itinerary */}
                       <Itinerary itineraryRef={itineraryRef} />

                        {/* Inclusions & Exclusions */}
                       <InclusionsExclusions inclusionsRef={inclusionsRef} />

                        {/* Policies */ /* Reviews */}
                       <ProductPolicies policiesRef={policiesRef}/>
                        {/* External Reviews Widget */}
                        <ReviewsWidget
                            googlePlaceId={import.meta.env.VITE_GOOGLE_REVIEWS_PLACE_ID}
                            tripadvisorBusinessId={import.meta.env.VITE_TRIPADS_API_KEY}
                            className="mb-8"
                        />
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
                    setShowAvail={setShowAvail}
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
            {showAvail && isMobile && (
                <AvailabilityModal
                    open={showAvail}
                    onClose={() => {
                        setShowAvail(false);
                        setSelectedPackage(null);
                        setSelectedSlotId(null);
                    }}
                    productId={currentProduct.id}
                    packages={currentProduct.packages ?? []}
                    selectedPackageFromProp={selectedPackage}
                    initialDate={selectedDateStr}
                    initialAdults={adultsCount}
                    initialChildren={childrenCount}
                    onPackageSelect={handlePackageSelect}
                />
            )}
        </div>
    );
};
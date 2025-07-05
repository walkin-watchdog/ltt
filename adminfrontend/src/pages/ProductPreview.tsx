import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAuth } from '../contexts/AuthContext';
import { AdminAvailabilityModal } from '../components/common/AdminAvailabilityModal';
import type { Product, PackageOption } from '../types.ts';
import { formatDate, parse } from 'date-fns';

// Import the new refactored components
import { BookingInfoCard } from '../components/productpreviewcomp/Bookinginfocard.tsx';
import { ProductImageGallery } from '../components/productpreviewcomp/ProductImageGallery';
import { AvailabilityStatusBanner } from '../components/productpreviewcomp/AvailabilityStatusBanner';
import { ProductNavigationTabs } from '../components/productpreviewcomp/ProductNavigationTabs';
import { ProductOverview } from '../components/productpreviewcomp/ProductOverview';
import { GuidesLanguages } from '../components/productpreviewcomp/GuidesLanguages';
import { AccessibilityFeatures } from '../components/productpreviewcomp/AccessibilityFeatures';
import { PickupMeetingInfo } from '../components/productpreviewcomp/PickupMeetingInfo';
import { ProductItinerary } from '../components/productpreviewcomp/ProductItinerary';
import { InclusionsExclusions } from '../components/productpreviewcomp/InclusionsExclusions';
import { ProductPolicies } from '../components/productpreviewcomp/ProductPolicies';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'inclusions' | 'policies'>('overview');
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
    console.log('product.packages:', product?.packages);
    console.log('pkgId:', pkgId);
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

      {/* Image Gallery */}
      <ProductImageGallery
        product={product}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />

      {/* Status banner */}
      <AvailabilityStatusBanner product={product} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          {/* Navigation tabs */}
          <ProductNavigationTabs
            activeTab={activeTab}
            handleTabClick={handleTabClick}
          />

          {/* Overview Section */}
          <div ref={overviewRef}>
            <ProductOverview product={product} />
          </div>

          {/* Guides & Languages */}
          <GuidesLanguages product={product} />

          {/* Accessibility Features */}
          <AccessibilityFeatures product={product} />

          {/* Pickup & Meeting Information */}
          <PickupMeetingInfo product={product} />

          {/* Itinerary Section */}
          <div ref={itineraryRef}>
            <ProductItinerary product={product} />
          </div>

          {/* Inclusions / Exclusions Section */}
          <div ref={inclusionsRef}>
            <InclusionsExclusions product={product} />
          </div>

          {/* Policies Section */}
          <div ref={policiesRef}>
            <ProductPolicies product={product} />
          </div>
        </section>

        {/* Booking Info Card */}
        <BookingInfoCard
          product={product}
          cheapestPackage={cheapestPackage}
          selectedDateStr={selectedDateStr}
          adultsCount={adultsCount}
          childrenCount={childrenCount}
          isMobile={isMobile}
          checkingAvail={checkingAvail}
          isDateOk={isDateOk}
          availablePkgs={availablePkgs}
          selectedPackage={selectedPackage}
          handleBarChange={handleBarChange}
          handlePackageSelect={handlePackageSelect}
          checkAvailabilityDesktop={checkAvailabilityDesktop}
          setShowAvail={setShowAvail}
          calculateEffectivePrice={calculateEffectivePrice}
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
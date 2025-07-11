import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, User, CreditCard, CheckCircle, MapPin, CalendarIcon, AlertTriangle, Clock } from 'lucide-react';
import { useAbandonedCart } from '../hooks/useAbandonedCart';
import { PriceDisplay } from '../components/common/PriceDisplay';
import type { RootState, AppDispatch } from '../store/store';
import { fetchProduct } from '../store/slices/productsSlice';
import { createBooking, rnpaylater } from '../store/slices/bookingSlice';
import { trackBookingStart } from '../components/analytics/GoogleAnalytics';
import { formatDate, parse } from 'date-fns';
import { CouponForm } from '../components/payment/CouponForm';
import { toast } from 'react-hot-toast';
import { isSlotBookable } from '../lib/utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getCurrencyForProduct } from '../lib/utils';
import { PayPalButton } from '../components/payment/PayPalButton';

interface BookingFormData {
  selectedDate: string;
  adults: number;
  children: number;
  selectedPackage: any | null;
  selectedTimeSlot: any | null;
  selectedSlot: any | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  currency: string;
}

export const BookingFlow = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const recoverToken = searchParams.get('recoverToken');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentProduct, isLoading: productLoading } = useSelector((state: RootState) => state.products);
  const { isLoading: bookingLoading } = useSelector((state: RootState) => state.booking);

  const [currentStep, setCurrentStep] = useState(1);
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPaypalBtn, setShowPaypalBtn] = useState(false);
  const [paypalOrder, setPaypalOrder] = useState<{bookingId:string,orderId:string}|null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY'|'PAYPAL'>('RAZORPAY');

  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: '',
    adults: 2,
    children: 0,
    selectedPackage: null,
    selectedSlot: null,
    selectedTimeSlot: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
    currency: 'INR'
  });
  const productCap      = currentProduct?.capacity ?? Infinity;
  const selectedPkgCap  = formData.selectedPackage?.maxPeople ?? Infinity;
  const maxCapacity     = Math.min(productCap, selectedPkgCap);

  // Check if children are allowed based on selected package
  const childrenAllowed = !formData.selectedPackage || formData.selectedPackage.ageGroups?.child?.enabled !== false;
  const payLater = async() => {
    if (currentStep === 3) {

      const bookingData = {
        productId: productId!,
        packageId: formData.selectedPackage?.id,
        slotId: formData.selectedSlot?.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        adults: formData.adults,
        children: formData.children,
        bookingDate: formData.selectedDate,
        selectedTimeSlot: formData.selectedTimeSlot,
        notes: formData.notes,
        couponCode,
        discountAmount: appliedDiscount,
        currency: formData.selectedPackage.currency
      };
      try {
        await dispatch(rnpaylater(bookingData)).unwrap();
        clearAbandonedCart(formData.customerEmail);
        toast.success('Reservation Complete!')
        setCurrentStep(4)
      } catch (error) {
        console.error('Booking failed:', error);
        toast.error('Booking Failed')
      }
    }
  };

  useEffect(() => {
    if (currentProduct?.packages && currentProduct.packages.length > 0) {
      const packageId = searchParams.get('package');
      let date = searchParams.get('date');
      const adults = searchParams.get('adults');
      const children = searchParams.get('children');
      const slotId = searchParams.get('slot');
      const timeParam = searchParams.get('time');
      if (date) {
        const parsed = parse(date, 'MM/dd/yyyy', new Date());
        if (!isNaN(parsed.getTime())) {
          date = formatDate(parsed, 'MM/dd/yyyy');
        } else {
          const isoParsed = new Date(date);
          date = isNaN(isoParsed.getTime())
            ? ''
            : formatDate(isoParsed, 'MM/dd/yyyy');
        }
      }
  
      const selectedPkg = packageId 
        ? currentProduct.packages.find(p => p.id === packageId)
        : currentProduct.packages[0];
  
      // Validate cutoff time before setting the package
      if (selectedPkg && date && timeParam) {
        const cutoffTime = currentProduct.cutoffTime || 24;
        const { isBookable, reason } = isSlotBookable(date, timeParam, cutoffTime);
        
        if (!isBookable) {
          toast.error(reason || 'This time slot is no longer available for booking');
          navigate(`/product/${currentProduct.id}`, { replace: true });
          return;
        }
      }

      // Set selected package
      const updatedFormData = {
        ...formData,
        selectedPackage: selectedPkg,
        selectedDate: date || formData.selectedDate,
        selectedTimeSlot: formData.selectedTimeSlot,
        adults: adults ? parseInt(adults) : formData.adults,
        children: children ? parseInt(children) : formData.children,
      };
      
      // If slot was provided, set it
      if (slotId && selectedPkg) {
        const slot = selectedPkg.slots?.find((s: any) => s.id === slotId);
        if (slot) {
          updatedFormData.selectedSlot = slot;
          if (timeParam) {
            updatedFormData.selectedTimeSlot = timeParam;
          }
        }
      }
      
      setFormData(updatedFormData);
    }
  }, [currentProduct, searchParams, navigate]);

 useEffect(() => {
  if (
    currentProduct &&
    formData.selectedPackage &&
    formData.selectedDate &&
    formData.selectedTimeSlot
  ) {
    // Validate date before parsing
    const parsedDate = parse(formData.selectedDate, 'MM/dd/yyyy', new Date());
    if (isNaN(parsedDate.getTime())) {
      // Invalid date, skip or handle error
      return;
    }
    const cutoffTime = currentProduct.cutoffTime || 24;
    const { isBookable, reason } = isSlotBookable(
      formatDate(parsedDate, 'yyyy-MM-dd'),
      formData.selectedTimeSlot,
      cutoffTime
    );

    if (!isBookable) {
      toast.error(reason || 'This time slot is no longer available for booking');
      navigate(`/product/${currentProduct.id}`, { replace: true });
      return;
    }
  }
}, [currentProduct, formData.selectedPackage, formData.selectedDate, formData.selectedTimeSlot, navigate]);

  // Helper function to calculate effective price with discount
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

  const calculateTotal = useCallback(() => {
    const basePrice = formData.selectedPackage?.basePrice || 0;
    // Apply package discount if available
    let adultPrice = basePrice;
    if (formData.selectedPackage?.discountType === 'percentage' && formData.selectedPackage?.discountValue) {
      adultPrice = basePrice * (1 - (formData.selectedPackage.discountValue / 100));
    } else if (formData.selectedPackage?.discountType === 'fixed' && formData.selectedPackage?.discountValue) {
      adultPrice = Math.max(0, basePrice - formData.selectedPackage.discountValue);
    }
    
    // If we have a selected slot with pricing tiers, use those instead
    let totalAdultPrice = adultPrice * formData.adults;
    let totalChildPrice = 0;
    
    // Check if we have slot with tiered pricing
    if (formData.selectedSlot) {
      // Handle adult tier pricing
      if (formData.selectedSlot.adultTiers && formData.selectedSlot.adultTiers.length > 0) {
        // Find applicable tier based on number of adults
        const applicableTier = formData.selectedSlot.adultTiers.find((tier: any) => 
          formData.adults >= tier.min && formData.adults <= tier.max
        );
        
        if (applicableTier) {
          // Apply package discount to tier price
          const tierPriceWithDiscount = calculateEffectivePrice(
            applicableTier.price,
            formData.selectedPackage?.discountType,
            formData.selectedPackage?.discountValue
          );
          totalAdultPrice = tierPriceWithDiscount * formData.adults;
        }
      }
      
      // Handle child tier pricing
      if (formData.children > 0 && formData.selectedSlot.childTiers && formData.selectedSlot.childTiers.length > 0) {
        // Find applicable tier based on number of children
        const applicableTier = formData.selectedSlot.childTiers.find((tier: any) => 
          formData.children >= tier.min && formData.children <= tier.max
        );
        
        if (applicableTier) {
          // Apply package discount to child tier price
          const tierPriceWithDiscount = calculateEffectivePrice(
            applicableTier.price,
            formData.selectedPackage?.discountType,
            formData.selectedPackage?.discountValue
          );
          totalChildPrice = tierPriceWithDiscount * formData.children;
        } else {
          // Default fallback if no tier matches
          totalChildPrice = (adultPrice * 0.5) * formData.children;
        }
      } else if (formData.children > 0) {
        // Default child pricing if no specific tiers exist
        totalChildPrice = (adultPrice * 0.5) * formData.children;
      }
    } else {
      // Default behavior without slots
      totalChildPrice = (adultPrice * 0.5) * formData.children;
    }
    
    // Apply coupon discount if any
    const subtotal = totalAdultPrice + totalChildPrice;
    return Math.max(0, subtotal - appliedDiscount);
  },
  [
    formData.adults,
    formData.children,
    formData.selectedPackage,
    formData.selectedSlot,
    currentProduct,
    appliedDiscount
  ]);

  const calculatePayNow = useCallback(() => {
    if (!currentProduct) return calculateTotal();
    switch (currentProduct.paymentType) {
      case 'PARTIAL':
        return Math.round(
          calculateTotal() * ((currentProduct.minimumPaymentPercent ?? 20) / 100)
        );
      case 'DEPOSIT':
        return currentProduct.depositAmount && currentProduct.depositAmount > 0
          ? currentProduct.depositAmount
          : calculateTotal();
      default:
        return calculateTotal();
    }
  }, [currentProduct, calculateTotal]);


  const { saveAbandonedCart, clearAbandonedCart } = useAbandonedCart(productId);
  const beganRef = useRef(false);

  useEffect(() => {
    if (!recoverToken || !productId || !currentProduct) return;
    (async () => {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_API_URL}/abandoned-carts/recover/${recoverToken}`,
          { credentials: 'include' }
        );
        if (!resp.ok) return;
        const data = await resp.json();

        setFormData(prev => {
          let pkg = prev.selectedPackage;
          if (currentProduct && data.packageId) {
            const foundPkg = currentProduct.packages?.find((p: any) => p.id === data.packageId);
            if (foundPkg) pkg = foundPkg;
          }

          let slot = prev.selectedSlot;
          if (pkg && data.slotId) {
            const foundSlot = (pkg.slots || []).find((s: any) => s.id === data.slotId);
            if (foundSlot) slot = foundSlot;
          }
          return {
            ...prev,
            selectedPackage:  pkg,
            selectedSlot:     slot,
            customerName:     data.customerName    ?? prev.customerName,
            customerEmail:    data.customerEmail   ?? prev.customerEmail,
            customerPhone:    data.customerPhone   ?? prev.customerPhone,
            adults:           data.adults         ?? prev.adults,
            children:         data.children       ?? prev.children,
            selectedDate:     data.selectedDate   ?? prev.selectedDate,
            selectedTimeSlot: data.selectedTimeSlot ?? prev.selectedTimeSlot,
          };
        });
      } catch (err) {
        console.error('Failed to recover abandoned cart:', err);
      }
    })();
  }, [recoverToken, productId, currentProduct]);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProduct(productId));
    }
  }, [dispatch, productId]);

  const initializePayPal = async (
    booking: { id: string },
    amount: number,
    setPaypalOrder: React.Dispatch<React.SetStateAction<{ bookingId: string; orderId: string } | null>>,
    setShowPaypalBtn: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!currentProduct) {
      console.error('No product attached to booking');
      return;
    }
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/payments/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        bookingId: booking.id,
        amount,
        currency: getCurrencyForProduct(currentProduct)
      }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || 'PayPal order failed');
    setPaypalOrder({ bookingId: booking.id, orderId: data.orderId });
    setShowPaypalBtn(true);
  };
    
  useEffect(()=>{
    setShowPaypalBtn(false);
  },[paymentMethod, appliedDiscount, formData.adults, formData.children]);

  useEffect(() => {
    if (currentStep === 2 && emailBlurred && formData.customerEmail && currentProduct?.id) {
      saveAbandonedCart({
        productId: productId!,
        packageId: formData.selectedPackage?.id || null,
        slotId: formData.selectedSlot?.id || null,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        adults: formData.adults,
        children: formData.children,
        selectedDate: formData.selectedDate,
        selectedTimeSlot: formData.selectedTimeSlot,
        totalAmount: calculateTotal(),
        currency: formData.selectedPackage?.currency
      });

      if (!beganRef.current) {
       trackBookingStart(productId!, currentProduct.title);
       beganRef.current = true;
      }
    }

    const recoveryData = sessionStorage.getItem('recover_cart');
    if (recoveryData && currentProduct) {
      try {
        const cartData = JSON.parse(recoveryData);
        if (cartData.productId === productId) {
          setFormData(prev => {

            let pkg = prev.selectedPackage;
            if (currentProduct && cartData.packageId) {
              const foundPkg = currentProduct.packages?.find((p: any) => p.id === cartData.packageId);
              if (foundPkg) pkg = foundPkg;
            }

            let slot = prev.selectedSlot;
            if (pkg && cartData.slotId) {
              const foundSlot = (pkg.slots || []).find((s: any) => s.id === cartData.slotId);
              if (foundSlot) slot = foundSlot;
            }

            return {
              ...prev,
              selectedPackage: pkg,
              selectedSlot: slot,
              customerName:    cartData.customerName   || prev.customerName,
              customerEmail:   cartData.customerEmail  || prev.customerEmail,
              customerPhone:   cartData.customerPhone  || prev.customerPhone,
              adults:          cartData.adults ?? prev.adults,
              children:        cartData.children ?? prev.children,
              selectedDate:    cartData.selectedDate   || prev.selectedDate,
              selectedTimeSlot:cartData.selectedTimeSlot|| prev.selectedTimeSlot,
            };
          });
          sessionStorage.removeItem('recover_cart');
        }
      } catch (e) {
        console.error('Error parsing recovery data:', e);
      }
    }
    
  }, [formData, currentStep, emailBlurred, calculateTotal, currentProduct]);

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      // Validate step 1
      if (
        !formData.selectedDate ||
        formData.adults < 1 ||
        formData.adults + formData.children > maxCapacity
      ) {
        toast.error('Please select number of people');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      
      // Validate step 2 and create booking
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
        toast.error('Please fill in all required customer details');
        return;
      }
      
      if (!formData.selectedPackage || !formData.selectedTimeSlot) {
        toast.error('Please select a package and time slot');
        return;
      }

      setCurrentStep(3);

    } else if (currentStep === 3) {

      const bookingData = {
        productId: productId!,
        packageId: formData.selectedPackage?.id,
        slotId: formData.selectedSlot?.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        adults: formData.adults,
        children: formData.children,
        bookingDate: formData.selectedDate,
        selectedTimeSlot: formData.selectedTimeSlot,
        notes: formData.notes,
        couponCode,
        discountAmount: appliedDiscount,
        currency: formData.selectedPackage.currency
      };
      try {
        const booking = await dispatch(createBooking(bookingData)).unwrap();
        clearAbandonedCart(formData.customerEmail);
        initializePayment(booking);
      } catch (error) {
        console.error('Booking failed:', error);
        toast.error('Booking Failed')
      }
    }
  };

  const initializePayment = async (booking: { id: string }) => {
    if (!currentProduct) {
      console.error('No product attached to booking');
      return;
    }
    if (paymentMethod === 'PAYPAL') {
      try {
        const amt = calculatePayNow();
        await initializePayPal(booking, amt, setPaypalOrder, setShowPaypalBtn);
      } catch (err) {
        console.error(err);
        toast.error('Unable to start PayPal payment');
      }
      return;
    }
    try {
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Math.round(calculatePayNow() * 100),
          currency: getCurrencyForProduct(currentProduct)
        })
      });

      const orderData = await orderResponse.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Luxé TimeTravel',
        description: currentProduct?.title,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              setCurrentStep(4);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone
        },
        theme: {
          color: '#ff914d'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
    }
  };

  const handleApplyCoupon = async (code: string) => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          productId: formData.selectedPackage?.productId || productId,
          adults: formData.adults,
          children: formData.children,
          amount: calculateTotal(),
          currency: formData.selectedPackage.currency
        })
      });
      const data = await resp.json();

      if (resp.ok) {
        setAppliedDiscount(data.discount);
        setCouponCode(code);
        setCouponError('');
      } else {
        setAppliedDiscount(0);
        setCouponCode(code);
        setCouponError(data.message || 'Coupon invalid');
      }
    } catch (err) {
      setAppliedDiscount(0);
      setCouponCode(code);
      setCouponError('Failed to validate coupon');
    }
  };

  useEffect(() => {
    if (!couponCode) return;
    (async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponCode,
            productId: formData.selectedPackage?.productId || productId,
            adults: formData.adults,
            children: formData.children,
            amount: calculateTotal()
          })
        });
        const data = await resp.json();
        if (resp.ok) {
          setAppliedDiscount(data.discount);
          setCouponError('');
        } else {
          setAppliedDiscount(0);
          setCouponError(data.message || 'Reapply Coupon after changes');
        }
      } catch {
        setAppliedDiscount(0);
        setCouponError('Failed to re-validate coupon');
      }
    })();
  }, [formData.adults, formData.children]);

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setCouponCode(null);
    setCouponError('');
  };

  const renderBookingSummary = () => {
    if (!formData.selectedPackage || !currentProduct) return null;

    const cutoffTime = currentProduct.cutoffTime || 24;
    const isValidBooking = formData.selectedDate && formData.selectedTimeSlot;
    
    let cutoffValidation = { isBookable: true, reason: '' };
    if (isValidBooking) {
      cutoffValidation = isSlotBookable(
        formatDate(parse(formData.selectedDate, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd'),
        formData.selectedTimeSlot,
        cutoffTime
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
        
        {/* Cutoff Time Warning */}
        {!cutoffValidation.isBookable && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-800">Booking Not Available</p>
                <p className="text-sm text-red-600 mt-1">{cutoffValidation.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking deadline info */}
        {cutoffValidation.isBookable && formData.selectedDate && formData.selectedTimeSlot && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                Book by {(() => {
                  const slotDate = parse(formData.selectedDate, 'MM/dd/yyyy', new Date());
                  const [hours, minutes] = formData.selectedTimeSlot.split(':').map(Number);
                  const slotDateTime = new Date(slotDate);
                  slotDateTime.setHours(hours, minutes, 0, 0);
                  const cutoffDateTime = new Date(slotDateTime);
                  cutoffDateTime.setHours(cutoffDateTime.getHours() - cutoffTime);
                  return cutoffDateTime.toLocaleString();
                })()} to secure your spot
              </p>
            </div>
          </div>
        )}

        {/* Rest of booking summary */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Experience:</span>
            <span className="font-medium">{currentProduct.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Package:</span>
            <span className="font-medium">{formData.selectedPackage.name}</span>
          </div>
          {formData.selectedDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(parse(formData.selectedDate, 'MM/dd/yyyy', new Date())).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
          {formData.selectedTimeSlot && (
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{formData.selectedTimeSlot}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Travelers:</span>
            <span className="font-medium">
              {formData.adults} Adult{formData.adults > 1 ? 's' : ''}
              {formData.children > 0 && `, ${formData.children} Child${formData.children > 1 ? 'ren' : ''}`}
            </span>
          </div>
        </div>

        {/* Total amount */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-1">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <PriceDisplay amount={calculateTotal()} currency={getCurrencyForProduct(currentProduct)} />
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Pay Now:</span>
            <PriceDisplay amount={calculatePayNow()} currency={getCurrencyForProduct(currentProduct)} />
          </div>
          {calculatePayNow() < calculateTotal() && (
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Due Later:</span>
              <PriceDisplay amount={calculateTotal() - calculatePayNow()} currency={getCurrencyForProduct(currentProduct)} />
            </div>
          )}
          {appliedDiscount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-600 mt-1">
              <span>Discount Applied:</span>
              <PriceDisplay amount={appliedDiscount} currency={getCurrencyForProduct(currentProduct)} />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (productLoading || !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  const steps: { number: number; title: string; icon: React.ComponentType<any> }[] = [
    { number: 1, title: 'Number of People', icon: Calendar },
    { number: 2, title: 'Your Information', icon: User },
    { number: 3, title: 'Review & Payment', icon: CreditCard },
    { number: 4, title: 'Confirmation', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Razorpay script */}
      <script key="razorpay" src="https://checkout.razorpay.com/v1/checkout.js"></script>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= stepItem.number
                    ? 'bg-[#ff914d] border-[#ff914d] text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  <stepItem.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= stepItem.number ? 'text-[#ff914d]' : 'text-gray-500'
                  }`}>
                    Step {stepItem.number}
                  </p>
                  <p className="text-sm text-gray-900">{stepItem.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-4 ${
                    currentStep > stepItem.number ? 'bg-[#ff914d]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Recover abandoned cart message - would appear if we detect a returning user */}
            {currentStep === 1 && searchParams.get('recover') && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      We've restored your previous booking details!
                    </p>
                    <p className="text-sm mt-1">
                      You can continue where you left off or update your selection.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: People */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Number of People</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adults *
                        </label>
                        <select
                          value={formData.adults}
                          onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        >
                          {[...Array(maxCapacity - formData.children)]
                            .map((_, i) => i + 1)
                            .map(v => (
                              <option key={v} value={v}>
                                {v} Adult{v > 1 ? 's' : ''}
                              </option>
                          ))}
                        </select>
                      </div>

                      {childrenAllowed && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Children (0-12 years)
                          </label>
                          <select
                            value={formData.children}
                            onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                          >
                            {[...Array(maxCapacity - formData.adults + 1)]
                              .map((_, i) => i)
                              .map(v => (
                                <option key={v} value={v}>
                                  {v} Child{v !== 1 ? 'ren' : ''}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Package Selection */}
                  {formData.selectedPackage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Package
                  </label>
                  <div className="space-y-2">
                    <div
                      className={`w-full text-left p-4 rounded-lg border transition-colors border-[#ff914d] bg-orange-50`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{formData.selectedPackage.name}</p>
                          <p className="text-sm text-gray-600">{formData.selectedPackage.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Display selected time slot if any */}
              {formData.selectedTimeSlot && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Time
                  </label>
                  <div className="text-left p-4 rounded-lg border transition-colors border-[#ff914d] bg-orange-50">
                    <p className="font-medium text-gray-900">
                      { formData.selectedTimeSlot || 'Time not specified'}
                    </p>
                  </div>
                </div>
              )}
                  </div>
                </div>
              )}

              {/* Step 2: Customer Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <PhoneInput
                          country={'in'}
                          value={formData.customerPhone}
                          onChange={(value) =>
                            setFormData(prev => ({ ...prev, customerPhone: value || '' }))
                          }
                          inputProps={{
                            required: true,
                            className:
                              'w-full pl-11 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent',
                            placeholder: '912 345-67',
                          }}
                          buttonClass="absolute left-0 top-0 h-full rounded-l-md border border-r-0 border-gray-300 bg-white pl-3"
                          dropdownClass="phone-dropdown z-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, customerEmail: e.target.value }));
                        }}
                        onBlur={() => setEmailBlurred(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requirements (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Payment */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Payment</h2>
                  
                  <div className="space-y-6">
                    {/* Booking Summary */}
                    {renderBookingSummary()}

                    <fieldset className="mb-6">
                      <legend className="text-sm font-medium text-gray-700 mb-2">Payment Method *</legend>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="payMethod" value="RAZORPAY"
                                 checked={paymentMethod==='RAZORPAY'}
                                 onChange={()=>setPaymentMethod('RAZORPAY')} />
                          <span>Razorpay</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="payMethod" value="PAYPAL"
                                 checked={paymentMethod==='PAYPAL'}
                                 onChange={()=>setPaymentMethod('PAYPAL')} />
                          <span>PayPal</span>
                        </label>
                      </div>
                    </fieldset>

                    {/* Terms */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                          required
                          checked={agreeTerms}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setAgreeTerms(e.target.checked)
                          }
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          I agree to the{' '}
                          <a href="/policies" className="text-[#ff914d] hover:underline">
                            Terms & Conditions
                          </a>{' '}
                          and{' '}
                          <a href="/policies" className="text-[#ff914d] hover:underline">
                            Cancellation Policy
                          </a>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                  <p className="text-gray-600 mb-6">
                    Your booking has been confirmed. You will receive a confirmation email with your voucher shortly.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-[#ff914d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors"
                  >
                    Return to Home
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(-1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {currentStep === 1 ? 'Back to Product' : 'Previous'}
                  </button>
                  {/* Reserve Now, Pay Later */}
                  {currentProduct?.reserveNowPayLater !== false && (
                    <button
                      onClick={payLater}
                      disabled={bookingLoading || !agreeTerms}
                      hidden={currentStep !== 3}
                      className="px-6 py-2 bg-[#104c57] text-white rounded-lg hover:bg-[#104c57] transition-colors disabled:opacity-50"
                    >
                      Pay Later 
                    </button>
                  )}
                  {/* <button
                    onClick={handleStepSubmit}
                    disabled={bookingLoading || !agreeTerms && currentStep === 3}
                    className="px-6 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors disabled:opacity-50"
                  >
                    {bookingLoading
                    ? 'Processing…'
                    : currentStep === 1
                      ? 'Continue'
                      : currentStep === 2
                        ? 'Review'
                        : currentProduct?.paymentType === 'FULL'
                          ? 'Pay Now'
                          : 'Pay Deposit'}
                  </button> */}
                  {paymentMethod === 'PAYPAL' && currentStep === 3 && showPaypalBtn && paypalOrder
                    ? <PayPalButton
                        amount={calculatePayNow()}
                        currency={getCurrencyForProduct(currentProduct)}
                        orderId={paypalOrder.orderId}
                        onSuccess={async()=> {
                          const cap = await fetch(`${import.meta.env.VITE_API_URL}/payments/paypal/capture`,{
                            method:'POST',
                            headers:{'Content-Type':'application/json'},
                            credentials:'include',
                            body:JSON.stringify(paypalOrder)
                          });
                          if(cap.ok){ setCurrentStep(4); }
                          else { toast.error('Payment verification failed'); }
                        }}
                        onError={()=>toast.error('PayPal error')}
                        onCancel={()=>toast('Payment cancelled')}
                      />
                    : <button
                        onClick={handleStepSubmit}
                        disabled={bookingLoading || (currentStep===3 && !agreeTerms)}
                        className="px-6 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors disabled:opacity-50"
                      >
                        {bookingLoading
                          ? 'Processing…'
                          : currentStep === 1
                            ? 'Continue'
                            : currentStep === 2
                              ? 'Review'
                              : paymentMethod === 'RAZORPAY'
                                ? 'Pay Now'
                                : 'Pay with PayPal'}
                      </button>
                  }
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="mb-4">
                <img
                  src={currentProduct.images[0] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
                  alt={currentProduct.title}
                  className="w-full h-36 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-gray-900">{currentProduct.title}</h4>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{currentProduct.location}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formData.selectedDate ? new Date(formData.selectedDate).toLocaleDateString('en-IN') : 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>People:</span>
                  <span>{formData.adults} Adults{formData.children > 0 && `, ${formData.children} Children`}</span>
                </div>
                
                {formData.selectedPackage && (
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <span>{formData.selectedPackage.name}</span>
                  </div>
                )}
                
                {formData.selectedTimeSlot && (
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{formData.selectedTimeSlot}</span>
                  </div>
                )}
                
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gross Total:</span>
                  <PriceDisplay 
                    amount={calculateTotal() + appliedDiscount}
                    currency={getCurrencyForProduct(currentProduct)}
                    className="text-[#ff914d]"
                  />
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between font-semibold text-lg text-green-600">
                    <span>Savings:</span>
                    <span><PriceDisplay amount={appliedDiscount} currency={getCurrencyForProduct(currentProduct)} /></span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg">
                  <span>Pay&nbsp;Now:</span>
                  <PriceDisplay amount={calculatePayNow()} currency={getCurrencyForProduct(currentProduct)} className="text-[#ff914d]" />
                </div>
                {calculatePayNow() < calculateTotal() && (
                  <div className="flex justify-between font-semibold text-sm text-gray-600">
                    <span>Due&nbsp;Later:</span>
                    <PriceDisplay amount={calculateTotal() - calculatePayNow()} currency={getCurrencyForProduct(currentProduct)} />
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              {formData.selectedPackage && (
                <CouponForm
                  totalAmount={calculateTotal() + appliedDiscount}
                  productId={formData.selectedPackage.productId || productId || ''}
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  onError={couponError}
                  discount={appliedDiscount}
                  currency={formData.selectedPackage.currency}
                />
              )}

              <div className="mt-6 text-xs text-gray-500">
                <p>• Free cancellation up to 24 hours before the tour</p>
                <p>• Instant confirmation</p>
                <p>• Mobile voucher accepted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
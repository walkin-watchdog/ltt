import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, User, CreditCard, CheckCircle, Phone, Mail, MapPin, CalendarIcon } from 'lucide-react';
import { useAbandonedCart } from '@/hooks/useAbandonedCart';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProduct } from '../store/slices/productsSlice';
import { createBooking } from '../store/slices/bookingSlice';
import { trackBookingStart } from '../components/analytics/GoogleAnalytics';
import { formatDate, parse } from 'date-fns';

interface BookingFormData {
  selectedDate: string;
  adults: number;
  children: number;
  selectedPackage: any;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

export const BookingFlow = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentProduct, isLoading: productLoading } = useSelector((state: RootState) => state.products);
  const { currentBooking, isLoading: bookingLoading } = useSelector((state: RootState) => state.booking);

  const [currentStep, setCurrentStep] = useState(1);
  const [emailBlurred, setEmailBlurred] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: '',
    adults: 2,
    children: 0,
    selectedPackage: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: ''
  });

  useEffect(() => {
    if (currentProduct?.packages && currentProduct.packages.length > 0) {
      const packageId = searchParams.get('package');
      let date = searchParams.get('date');
      const adults = searchParams.get('adults');
      const children = searchParams.get('children');
      const slots = searchParams.get('slots');
      if (date) {
        const iso = formatDate(parse(date, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd');
        if (iso) {
          date = iso
        } else {
          date = '';
        }
      }
  
      const selectedPkg = packageId 
        ? currentProduct.packages.find(p => p.id === packageId)
        : currentProduct.packages[0];
  
      setFormData(prev => ({
        ...prev,
        selectedPackage: selectedPkg,
        selectedDate: date || prev.selectedDate,
        adults: adults ? parseInt(adults) : prev.adults,
        children: children ? parseInt(children) : prev.children,
      }));
    }
  }, [currentProduct, searchParams]);

  const calculateTotal = useCallback(() => {
    const basePrice = formData.selectedPackage?.price || currentProduct?.discountPrice || currentProduct?.price || 0;
    const adultPrice = basePrice * formData.adults;
    const childPrice = basePrice * 0.5 * formData.children;
    return adultPrice + childPrice;
  },
  [
    formData.adults,
    formData.children,
    formData.selectedPackage,
    currentProduct,
  ]);

  const { saveAbandonedCart } = useAbandonedCart(productId);
  const beganRef = useRef(false);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProduct(productId));
    }
  }, [dispatch, productId]);


  useEffect(() => {
    if (currentStep === 2 && emailBlurred && formData.customerEmail && currentProduct?.id) {
      saveAbandonedCart({
        productId: productId!,
        packageId: formData.selectedPackage?.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        adults: formData.adults,
        children: formData.children,
        selectedDate: formData.selectedDate,
        totalAmount: calculateTotal(),
      });

      if (!beganRef.current) {
       trackBookingStart(productId!, currentProduct.title);
       beganRef.current = true;
      }
    }
  }, [formData, currentStep, emailBlurred, calculateTotal]);

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.selectedDate || formData.adults < 1) {
        alert('Please select date and number of participants');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      
      // Validate step 2 and create booking
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
        alert('Please fill in all required fields');
        return;
      }

      const bookingData = {
        productId: productId!,
        packageId: formData.selectedPackage?.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        adults: formData.adults,
        children: formData.children,
        bookingDate: formData.selectedDate,
        notes: formData.notes
      };

      try {
        await dispatch(createBooking(bookingData)).unwrap();
        setCurrentStep(3);
      } catch (error) {
        console.error('Booking failed:', error);
      }
    } else if (currentStep === 3) {
      // Proceed to payment
      initializePayment();
    }
  };

  const initializePayment = async () => {
    if (!currentBooking) return;
    try {
      // Create Razorpay order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: currentBooking.id,
          amount: calculateTotal(),
          currency: 'INR'
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
                bookingId: currentBooking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              setCurrentStep(4);
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
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
      alert('Failed to initialize payment');
    }
  };

  if (productLoading || !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  const steps: { number: number; title: string; icon: React.ComponentType<any> }[] = [
    { number: 1, title: 'Select Date & Participants', icon: Calendar },
    { number: 2, title: 'Your Information', icon: User },
    { number: 3, title: 'Review & Payment', icon: CreditCard },
    { number: 4, title: 'Confirmation', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      
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
              {/* Step 1: Date & Participants */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Participants</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date *
                      </label>
                      <input
                        type="date"
                        value={formData.selectedDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        required
                      />
                    </div>

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
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} Adult{i > 0 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Children (0-12 years)
                        </label>
                        <select
                          value={formData.children}
                          onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        >
                          {[...Array(6)].map((_, i) => (
                            <option key={i} value={i}>{i} Child{i > 1 ? 'ren' : i === 1 ? '' : 'ren'}</option>
                          ))}
                        </select>
                      </div>
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
                        <span className="font-bold text-[#ff914d]">
                          ₹{formData.selectedPackage.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
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
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        onBlur={() => setEmailBlurred(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="Enter your phone number"
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
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{new Date(formData.selectedDate).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span>{formData.adults} Adults{formData.children > 0 && `, ${formData.children} Children`}</span>
                        </div>
                        {formData.selectedPackage && (
                          <div className="flex justify-between">
                            <span>Package:</span>
                            <span>{formData.selectedPackage.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formData.customerName}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formData.customerEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formData.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                          required
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
                  {currentBooking && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-green-800">
                        Booking Code: <span className="font-bold">{currentBooking.bookingCode}</span>
                      </p>
                    </div>
                  )}
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
                  <button
                    onClick={handleStepSubmit}
                    disabled={bookingLoading}
                    className="px-6 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors disabled:opacity-50"
                  >
                    {bookingLoading ? 'Processing...' : 
                     currentStep === 1 ? 'Continue' :
                     currentStep === 2 ? 'Create Booking' :
                     'Review Payment Options'}
                  </button>
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
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-gray-900">{currentProduct.title}</h4>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{currentProduct.location}</span>
                </div>
              </div>

              {formData.selectedDate && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(formData.selectedDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adults:</span>
                    <span>{formData.adults} × ₹{(formData.selectedPackage?.price || currentProduct.discountPrice || currentProduct.price).toLocaleString()}</span>
                  </div>
                  {formData.children > 0 && (
                    <div className="flex justify-between">
                      <span>Children:</span>
                      <span>{formData.children} × ₹{((formData.selectedPackage?.price || currentProduct.discountPrice || currentProduct.price) * 0.5).toLocaleString()}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-[#ff914d]">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
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
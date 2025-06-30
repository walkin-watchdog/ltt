import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  Package, 
  MapPin, 
  Clock, 
  CreditCard, 
  Send, 
  ArrowLeft, 
  Check,
  AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  productCode: string;
  location: string;
  duration: string;
  packages: any[];
}

export const ManualBooking = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<any[]>([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<any[]>([]);
  const [formValues, setFormValues] = useState({
    productId: '',
    packageId: '',
    slotId: '',
    bookingDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    adults: 1,
    children: 0,
    notes: '',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    sendVoucher: true
  });
  
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formValues.productId) {
      const selectedProduct = products.find(p => p.id === formValues.productId);
      if (selectedProduct && selectedProduct.packages) {
        setFilteredPackages(selectedProduct.packages);
      } else {
        setFilteredPackages([]);
      }
      // Reset package and slot selections
      setFormValues(prev => ({...prev, packageId: '', slotId: ''}));
      setFilteredTimeSlots([]);
    } else {
      setFilteredPackages([]);
    }
  }, [formValues.productId, products]);

  useEffect(() => {
    if (formValues.packageId && formValues.bookingDate) {
      fetchTimeSlots();
    } else {
      setFilteredTimeSlots([]);
    }
  }, [formValues.packageId, formValues.bookingDate]);

  useEffect(() => {
    calculateTotalAmount();
  }, [formValues.packageId, formValues.slotId, formValues.adults, formValues.children]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      if (!formValues.packageId || !formValues.bookingDate) return;
      
      const formattedDate = new Date(formValues.bookingDate).toISOString().split('T')[0];
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/package/${formValues.packageId}/slots?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.slots) {
          setFilteredTimeSlots(data.slots);
        } else {
          setFilteredTimeSlots([]);
        }
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setFilteredTimeSlots([]);
    }
  };

  const calculateTotalAmount = () => {
    if (!formValues.packageId) {
      setTotalAmount(null);
      return;
    }

    const selectedPackage = filteredPackages.find(p => p.id === formValues.packageId);
    if (!selectedPackage) {
      setTotalAmount(null);
      return;
    }

    let adultPrice = selectedPackage.basePrice;
    let childPrice = selectedPackage.basePrice * 0.5; // Default child price at 50%

    // Apply package discount if available
    if (selectedPackage.discountType === 'percentage' && selectedPackage.discountValue) {
      adultPrice = adultPrice * (1 - (selectedPackage.discountValue / 100));
      childPrice = childPrice * (1 - (selectedPackage.discountValue / 100));
    } else if (selectedPackage.discountType === 'fixed' && selectedPackage.discountValue) {
      adultPrice = Math.max(0, adultPrice - selectedPackage.discountValue);
      childPrice = Math.max(0, childPrice - selectedPackage.discountValue);
    }

    // Check for slot-specific pricing
    if (formValues.slotId) {
      const selectedSlot = filteredTimeSlots.find(s => s.id === formValues.slotId);
      if (selectedSlot) {
        // Use adult tier pricing if available
        if (selectedSlot.adultTiers && selectedSlot.adultTiers.length > 0) {
          const adultTier = selectedSlot.adultTiers.find(tier => 
            formValues.adults >= tier.min && formValues.adults <= tier.max
          );
          if (adultTier) {
            adultPrice = adultTier.price;
          }
        }

        // Use child tier pricing if available and there are children
        if (formValues.children > 0 && selectedSlot.childTiers && selectedSlot.childTiers.length > 0) {
          const childTier = selectedSlot.childTiers.find(tier => 
            formValues.children >= tier.min && formValues.children <= tier.max
          );
          if (childTier) {
            childPrice = childTier.price;
          }
        }
      }
    }

    // Calculate total
    const total = (adultPrice * formValues.adults) + (childPrice * formValues.children);
    setTotalAmount(total);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formValues.productId) newErrors.productId = 'Product is required';
    if (!formValues.packageId) newErrors.packageId = 'Package is required';
    if (!formValues.slotId) newErrors.slotId = 'Time slot is required';
    if (!formValues.bookingDate) newErrors.bookingDate = 'Booking date is required';
    if (!formValues.customerName) newErrors.customerName = 'Customer name is required';
    if (!formValues.customerEmail) newErrors.customerEmail = 'Customer email is required';
    if (!formValues.customerPhone) newErrors.customerPhone = 'Customer phone is required';
    if (formValues.adults < 1) newErrors.adults = 'At least 1 adult is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    setSuccess(null);
    
    try {
      // Create booking
      const bookingData = {
        productId: formValues.productId,
        packageId: formValues.packageId,
        slotId: formValues.slotId,
        customerName: formValues.customerName,
        customerEmail: formValues.customerEmail,
        customerPhone: formValues.customerPhone,
        adults: formValues.adults,
        children: formValues.children,
        bookingDate: formValues.bookingDate,
        notes: formValues.notes,
        status: formValues.status,
        paymentStatus: formValues.paymentStatus,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bookings/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      // If sending voucher is enabled
      if (formValues.sendVoucher) {
        const voucherResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bookings/${result.id}/send-voucher`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!voucherResponse.ok) {
          toast.warning('Booking created but failed to send voucher email');
        } else {
          setSuccess('Booking created successfully and voucher email sent!');
        }
      } else {
        setSuccess('Booking created successfully!');
      }
      
      toast.success('Booking created successfully');
      
      // Reset form
      setFormValues({
        productId: '',
        packageId: '',
        slotId: '',
        bookingDate: new Date().toISOString().split('T')[0],
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        adults: 1,
        children: 0,
        notes: '',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        sendVoucher: true
      });
      
      // Redirect to bookings page after a brief delay
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/bookings')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Manual Booking</h1>
            <p className="text-gray-600 mt-2">Create a new booking for a customer</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-500" />
            <p>{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Package className="h-5 w-5 mr-2 text-[#ff914d]" />
            Product & Package Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <select
                name="productId"
                value={formValues.productId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.productId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.title} ({product.productCode})
                  </option>
                ))}
              </select>
              {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId}</p>}
            </div>

            {/* Package Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package *
              </label>
              <select
                name="packageId"
                value={formValues.packageId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.packageId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!formValues.productId}
                required
              >
                <option value="">Select a package</option>
                {filteredPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - ₹{pkg.basePrice.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.packageId && <p className="text-red-500 text-xs mt-1">{errors.packageId}</p>}
              {filteredPackages.length === 0 && formValues.productId && (
                <p className="text-amber-500 text-xs mt-1">No packages available for this product</p>
              )}
            </div>

            {/* Booking Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Date *
              </label>
              <input
                type="date"
                name="bookingDate"
                value={formValues.bookingDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.bookingDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.bookingDate && <p className="text-red-500 text-xs mt-1">{errors.bookingDate}</p>}
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot *
              </label>
              <select
                name="slotId"
                value={formValues.slotId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.slotId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!formValues.packageId || !formValues.bookingDate}
                required
              >
                <option value="">Select a time slot</option>
                {filteredTimeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {Array.isArray(slot.Time) && slot.Time.length > 0 
                      ? slot.Time[0] 
                      : "No specific time"}
                  </option>
                ))}
              </select>
              {errors.slotId && <p className="text-red-500 text-xs mt-1">{errors.slotId}</p>}
              {filteredTimeSlots.length === 0 && formValues.packageId && formValues.bookingDate && (
                <p className="text-amber-500 text-xs mt-1">No time slots available for this date</p>
              )}
            </div>

            {/* Number of Adults */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Adults *
              </label>
              <input
                type="number"
                name="adults"
                min="1"
                value={formValues.adults}
                onChange={handleNumberChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.adults ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.adults && <p className="text-red-500 text-xs mt-1">{errors.adults}</p>}
            </div>

            {/* Number of Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Children
              </label>
              <input
                type="number"
                name="children"
                min="0"
                value={formValues.children}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Product Info Display */}
          {formValues.productId && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Product Information</h3>
              {(() => {
                const selectedProduct = products.find(p => p.id === formValues.productId);
                return selectedProduct ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedProduct.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedProduct.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedProduct.productCode}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#ff914d]" />
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formValues.customerName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.customerName ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formValues.customerEmail}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.customerEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formValues.customerPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-[#ff914d] ${
                  errors.customerPhone ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formValues.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-[#ff914d]" />
            Booking Status & Payment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Status
              </label>
              <select
                name="status"
                value={formValues.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={formValues.paymentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              >
                <option value="PENDING">Payment Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {/* Send Voucher */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="sendVoucher"
                  checked={formValues.sendVoucher}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Send booking voucher to customer via email</span>
              </label>
            </div>
          </div>

          {/* Total Amount Display */}
          {totalAmount !== null && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Booking Total</h3>
              <div className="text-2xl font-bold text-[#ff914d]">
                ₹{totalAmount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">
                {formValues.adults} Adults × {formValues.children > 0 ? `, ${formValues.children} Children` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
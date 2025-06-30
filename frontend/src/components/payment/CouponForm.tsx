import { useState, useEffect } from 'react';
import { Ticket, X, CheckCircle, AlertCircle } from 'lucide-react';

interface CouponFormProps {
  totalAmount: number;
  productId: string;
  onApply: (discountAmount: number) => void;
  onRemove: () => void;
}

export const CouponForm = ({ totalAmount, productId, onApply, onRemove }: CouponFormProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validCoupon, setValidCoupon] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }
    
    setIsValidating(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          amount: totalAmount,
          productId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid coupon');
        setValidCoupon(null);
        onRemove();
        return;
      }
      
      const data = await response.json();
      setValidCoupon(data);
      onApply(data.discount);
    } catch (error) {
      console.error('Error validating coupon:', error);
      setError('An error occurred. Please try again.');
      onRemove();
    } finally {
      setIsValidating(false);
    }
  };
  
  const removeCoupon = () => {
    setCouponCode('');
    setValidCoupon(null);
    setError(null);
    onRemove();
  };

  return (
    <div className="mt-4 mb-6">
      {!validCoupon ? (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Apply Coupon Code
          </label>
          <div className="flex">
            <div className="relative flex-grow">
              <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Enter coupon code"
              />
            </div>
            <button
              type="submit"
              disabled={isValidating || !couponCode.trim()}
              className="px-4 py-2 bg-[#104c57] text-white rounded-r-lg hover:bg-[#0d3d47] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Apply'}
            </button>
          </div>
          
          {error && (
            <div className="flex items-start text-red-600 text-xs mt-1">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">{couponCode} applied!</p>
                <p className="text-sm text-green-700">
                  You saved ₹{validCoupon.discount.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
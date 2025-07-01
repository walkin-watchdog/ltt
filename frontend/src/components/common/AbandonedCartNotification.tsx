import { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface AbandonedCartNotificationProps {
  cart: {
    productId: string;
    productTitle: string;
    packageId?: string;
    slotId?: string;
    selectedTimeSlot?: any;
    adults?: number;
    children?: number;
    date: string;
  };
  onDismiss: () => void;
}

export const AbandonedCartNotification: React.FC<AbandonedCartNotificationProps> = ({ 
  cart, 
  onDismiss 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const navigateToProduct = () => {
    window.location.href = `/product/${cart.productId}?recover=true`;
    
    // Store recovery parameters in sessionStorage for detailed state recovery
    sessionStorage.setItem('recover_cart', JSON.stringify({
      productId: cart.productId,
      packageId: cart.packageId,
      slotId: cart.slotId,
      selectedTimeSlot: cart.selectedTimeSlot,
      adults: cart.adults || 2,
      children: cart.children || 0,
      selectedDate: cart.date,
      timestamp: Date.now()
    }));
  };

  return (
    <div 
      className={`fixed ${window.innerWidth < 768 ? 'bottom-6 left-6 right-6' : 'bottom-20 right-6 max-w-sm'} 
      bg-white shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200 
      ${isExiting ? 'animate-fadeOut' : 'animate-fadeIn'}`}
    >
      <div className="bg-blue-600 px-4 py-2 border-b border-blue-700">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-white mr-2" />
            <h3 className="font-medium">Continue Your Booking</h3>
          </div>
          <button 
            onClick={handleDismiss} 
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-700 text-sm mb-2">
          <span className="font-semibold">{cart.productTitle}</span>
        </p>
        <p className="text-gray-600 text-xs mb-3">
          Your selection from {new Date(cart.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} is still saved!
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-700 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={navigateToProduct}
            className="flex-1 text-sm bg-[#ff914d] text-white px-4 py-2 rounded hover:bg-[#e8823d] transition-colors flex items-center justify-center"
          >
            Continue <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
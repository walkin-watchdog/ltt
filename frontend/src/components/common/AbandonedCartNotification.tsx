import { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AbandonedCartNotificationProps {
  cart: {
    productId: string;
    productTitle: string;
    date: string;
  };
  onDismiss: () => void;
}

export const AbandonedCartNotification: React.FC<AbandonedCartNotificationProps> = ({ 
  cart, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-6 max-w-sm bg-white shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200 animate-fadeIn">
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-800">Continue Your Booking</h3>
          </div>
          <button 
            onClick={handleDismiss} 
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-700 text-sm mb-3">
          You were booking <span className="font-semibold">{cart.productTitle}</span>
        </p>
        <p className="text-gray-600 text-xs mb-4">
          Your selection from {new Date(cart.date).toLocaleDateString()} is still saved!
        </p>
        <div className="flex justify-end">
          <Link
            to={`/product/${cart.productId}?recover=true`}
            className="flex items-center text-sm bg-[#ff914d] text-white px-4 py-2 rounded hover:bg-[#e8823d] transition-colors"
          >
            Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};
import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import type { Product } from '../../types.ts';

interface AvailabilityStatusBannerProps {
  product: Product;
}

export const AvailabilityStatusBanner: React.FC<AvailabilityStatusBannerProps> = ({ product }) => {
  const getAvailabilityStatus = () => {
    if (!product) {
      return {
        status: 'unavailable',
        message: 'Currently Unavailable',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        border: 'border-gray-200',
        icon: AlertCircle,
      };
    }

    const { availabilityStatus: status, nextAvailableDate } = product;

    const map = {
      SOLD_OUT: {
        status: 'sold_out',
        message: 'Currently Sold Out',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        border: 'border-red-200',
        icon: AlertCircle,
      },
      NOT_OPERATING: {
        status: 'not_operating',
        message: 'Not Currently Operating',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        border: 'border-gray-200',
        icon: AlertCircle,
      },
    } as const;

    if (status in map) return map[status as keyof typeof map];

    if (nextAvailableDate) {
      const d = new Date(nextAvailableDate);
      if (d > new Date())
        return {
          status: 'upcoming',
          message: `Next Available: ${d.toLocaleDateString()}`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Calendar,
        };
    }

    return {
      status: 'available',
      message: 'Available for Booking',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
    };
  };

  const { bgColor, border, color, icon: StatusIcon, message } = getAvailabilityStatus();

  return (
    <div className={`${bgColor} ${border} border-t-0 border-b px-6 py-3 flex items-center`}>
      <StatusIcon className={`h-5 w-5 mr-2 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{message}</span>
    </div>
  );
};
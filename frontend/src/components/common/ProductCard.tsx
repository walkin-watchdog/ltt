import { Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { PriceDisplay } from './PriceDisplay';

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    title: string;
    type: string;
    location: string;
    duration: string;
    description: string;
    images: string[];
    lowestPackagePrice?: number;
    lowestDiscountedPackagePrice?: number;
  };
  className?: string;
}

export const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${className}`}>
      <div className="relative h-48">
        <Link to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}>
          <img
            src={product.images[0] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.lowestDiscountedPackagePrice && (
            <div className="absolute top-4 left-4 bg-[#ff914d] text-white px-3 py-1 rounded-full text-sm font-semibold">
              Special Offer
            </div>
          )}
        </Link>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#104c57] text-sm font-medium uppercase">
            {product.type}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.8</span>
          </div>
        </div>
        <Link to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#ff914d] transition-colors">{product.title}</h3>
        </Link>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{product.location}</span>
          <Clock className="h-4 w-4 mr-1 ml-4" />
          <span className="text-sm">{product.duration}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {product.lowestDiscountedPackagePrice ? (
              <PriceDisplay 
                amount={product.lowestDiscountedPackagePrice}
                originalAmount={product.lowestPackagePrice}
                currency="INR"
              />
            ) : (
              <PriceDisplay 
                amount={product.lowestPackagePrice || 0}
                currency="INR"
              />
            )}
          </div>
          <Link
            to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}
            className="bg-[#104c57] text-white px-4 py-2 rounded-lg hover:bg-[#0d3d47] transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
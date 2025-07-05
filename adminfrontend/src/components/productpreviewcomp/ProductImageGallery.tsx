import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../types.ts';

interface ProductImageGalleryProps {
  product: Product;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ 
  product, 
  currentImageIndex, 
  setCurrentImageIndex 
}) => {
  const nextImage = () => {
    setCurrentImageIndex(
      currentImageIndex === product.images.length - 1 ? 0 : currentImageIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(
      currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Image Gallery */}
      <div className="relative h-96 rounded-lg overflow-hidden mb-8">
        <img
          src={product.images[currentImageIndex] || 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {product.images.map((_, index) => (
            <button
              key={index}
              aria-label={`Select image ${index + 1}`}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Grid */}
      {product.images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-8">
          {product.images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-20 rounded-lg overflow-hidden border-2 ${
                index === currentImageIndex ? 'border-[#ff914d]' : 'border-transparent'
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
import { Star } from 'lucide-react';
import type { Product } from '../../types.ts';

interface ProductOverviewProps {
  product: Product;
}

export const ProductOverview: React.FC<ProductOverviewProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
      <div className="space-y-6">
        {/* About */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            About this {product.type.toLowerCase()}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Highlights */}
        {product.highlights?.length ? (
          <div>
            <h3 className="text-lg font-semibold mb-3">Highlights</h3>
            <ul className="space-y-2">
              {product.highlights.map((hl, i) => (
                <li key={i} className="flex items-start">
                  <Star className="h-5 w-5 text-[#ff914d] mr-3" />
                  <span className="text-gray-600">{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Health Restrictions */}
        {product.healthRestrictions && Array.isArray(product.healthRestrictions) && product.healthRestrictions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Restrictions</h3>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {product.healthRestrictions.map((restriction: string, idx: number) => (
                <li key={idx}>{restriction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
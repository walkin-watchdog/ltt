import { CheckCircle, XCircle } from 'lucide-react';
import type { Product } from '@/types.ts';

interface InclusionsExclusionsProps {
  product: Product;
}

export const InclusionsExclusions: React.FC<InclusionsExclusionsProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inclusions */}
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-3">
            What's Included
          </h3>
          <ul className="space-y-2">
            {product.inclusions?.map((inc, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-600">{inc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        {product.exclusions?.length ? (
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              What's Not Included
            </h3>
            <ul className="space-y-2">
              {product.exclusions.map((exc, i) => (
                <li key={i} className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-gray-600">{exc}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
};
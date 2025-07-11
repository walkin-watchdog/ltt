import { Check, X } from 'lucide-react';
import type { Product } from '../../types/index.ts';

export const InclusionsExclusions = ({ product }: {product: Product}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Inclusions */}
        <div className="border-r border-gray-200 md:border-r-gray-200">
          <div className="bg-green-50 border-b border-green-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-green-800">What's Included</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {product.inclusions?.map((inc, i) => (
                <li key={i} className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{inc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Exclusions */}
        {product.exclusions?.length ? (
          <div>
            <div className="bg-red-50 border-b border-red-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-red-800">Not Included</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {product.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-0.5">
                      <X className="h-3 w-3 text-red-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
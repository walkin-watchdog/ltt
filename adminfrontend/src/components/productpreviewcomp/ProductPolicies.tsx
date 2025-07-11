import type { Product } from '../../types/index.ts';

export const ProductPolicies = ({ product }:{product: Product;}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 scroll-mt-20">
      <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-amber-800">Cancellation Policy</h3>
      </div>
      <div className="p-6">
        {/* Policy Type Badge */}
        {product.cancellationPolicyType && typeof product.cancellationPolicyType === 'string' && product.cancellationPolicyType !== 'custom' && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">
              {product.cancellationPolicyType === 'standard' && 'Standard Policy'}
              {product.cancellationPolicyType === 'moderate' && 'Moderate Policy'}
              {product.cancellationPolicyType === 'strict' && 'Strict Policy'}
              {product.cancellationPolicyType === 'no_refund' && 'No Refund Policy'}
            </span>
          </div>
        )}

        {/* Structured Policy Terms */}
        {Array.isArray(product.cancellationTerms) && product.cancellationTerms.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 mb-3">Cancellation Terms:</h4>
            {product.cancellationTerms.map((term: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="font-medium text-sm">{term.timeframe}</div>
                  <div className="text-sm text-gray-600 mt-1">{term.description}</div>
                </div>
                <div className="text-right ml-4">
                  <div className={`font-semibold text-lg ${term.refundPercent === 100 ? 'text-green-600' :
                    term.refundPercent > 0 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                    {term.refundPercent}%
                  </div>
                  <div className="text-xs text-gray-500">refund</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.cancellationPolicy ||
                'No specific policy provided. Please contact our customer service for details about cancellations and refunds.'}
            </p>
          </div>
        )}

        {/* Additional Information Requirements */}
        {(product.requirePhone || product.requireId || product.requireAge ||
          product.requireMedical || product.requireDietary ||
          product.requireEmergencyContact || product.requirePassportDetails ||
          (Array.isArray(product.customRequirementFields) && product.customRequirementFields.length > 0) ||
          product.additionalRequirements) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Required Information from Travelers:</h4>
              <div className="space-y-2">
                {product.requirePhone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    Valid phone number
                  </div>
                )}
                {product.requireId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    Government-issued photo ID
                  </div>
                )}
                {product.requireAge && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    Age verification for all travelers
                  </div>
                )}
                {product.requireMedical && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    Medical information and restrictions
                  </div>
                )}
                {product.requireDietary && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    Dietary restrictions and preferences
                  </div>
                )}
                {product.requireEmergencyContact && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    Emergency contact information
                  </div>
                )}
                {product.requirePassportDetails && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    Passport details for international travelers
                    {product.passportDetailsOption && (
                      <span className="ml-1 text-xs text-blue-600">
                        ({product.passportDetailsOption === 'advance' ? 'Required in advance' : 'Required on arrival'})
                      </span>
                    )}
                  </div>
                )}

                {Array.isArray(product.customRequirementFields) && product.customRequirementFields.map((field: any, index: number) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </div>
                ))}

                {product.additionalRequirements && (
                  <div className="flex items-start text-sm text-gray-600 mt-3 p-3 bg-blue-50 rounded-md">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>{product.additionalRequirements}</span>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
import type { Product } from '../../types/index.ts';

export const ProductPolicies = ({ product }:{product: Product;}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
      <h3 className="text-lg font-semibold mb-4">
        Cancellation Policy
      </h3>
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        {/* Policy Type Badge */}
        {product.cancellationPolicyType && typeof product.cancellationPolicyType === 'string' && product.cancellationPolicyType !== 'custom' && (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
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
            <h4 className="font-medium text-gray-800">Cancellation Terms:</h4>
            {product.cancellationTerms.map((term: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                <div className="flex-1">
                  <div className="font-medium text-sm">{term.timeframe}</div>
                  <div className="text-sm text-gray-600">{term.description}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-lg ${term.refundPercent === 100 ? 'text-green-600' :
                    term.refundPercent > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                    {term.refundPercent}%
                  </div>
                  <div className="text-xs text-gray-500">refund</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            {product.cancellationPolicy ||
              'No specific policy provided.'}
          </p>
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
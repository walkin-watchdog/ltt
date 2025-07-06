import type { RootState } from "../../store/store";
import { Star } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const ProductPolicies = ({ policiesRef }: { policiesRef: React.RefObject<HTMLDivElement | null> }) => {
    const { currentProduct } = useSelector((state: RootState) => state.products);
      if (!currentProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <Link to="/destinations" className="text-[#ff914d] hover:underline">
                        Back to Destinations
                    </Link>
                </div>
            </div>
        );
    }
    return (
        <div>
            <div ref={policiesRef} className="bg-white rounded-lg shadow-sm p-6 mb-8 scroll-mt-20">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">
                        {currentProduct.cancellationPolicy || 'No specific policy provided.'}
                    </p>
                </div>
            </div>

            {(currentProduct.requirePhone || currentProduct.requireId || currentProduct.requireAge ||
                currentProduct.requireMedical || currentProduct.requireDietary ||
                currentProduct.requireEmergencyContact || currentProduct.requirePassportDetails ||
                (Array.isArray(currentProduct.customRequirementFields) && currentProduct.customRequirementFields.length > 0) ||
                currentProduct.additionalRequirements) && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3">Required Information from Travelers:</h4>
                        <div className="space-y-2">
                            {currentProduct.requirePhone && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    Valid phone number
                                </div>
                            )}
                            {currentProduct.requireId && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    Government-issued photo ID
                                </div>
                            )}
                            {currentProduct.requireAge && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    Age verification for all travelers
                                </div>
                            )}
                            {currentProduct.requireMedical && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    Medical information and restrictions
                                </div>
                            )}
                            {currentProduct.requireDietary && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    Dietary restrictions and preferences
                                </div>
                            )}
                            {currentProduct.requireEmergencyContact && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    Emergency contact information
                                </div>
                            )}
                            {currentProduct.requirePassportDetails && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    Passport details for international travelers
                                </div>
                            )}

                            {Array.isArray(currentProduct.customRequirementFields) && currentProduct.customRequirementFields.map((field: any, index: number) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-[#ff914d] rounded-full mr-2"></span>
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </div>
                            ))}

                            {currentProduct.additionalRequirements && (
                                <div className="flex items-start text-sm text-gray-600 mt-3 p-3 bg-blue-50 rounded-md">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                    <span>{currentProduct.additionalRequirements}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                 {currentProduct.reviews && currentProduct.reviews.length > 0 && (
                                            <div className="bg-white rounded-lg shadow-sm p-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                                                <div className="space-y-4">
                                                    {currentProduct.reviews.slice(0, 3).map((review: any) => (
                                                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className="font-medium text-gray-900">{review.name}</h3>
                                                                <div className="flex items-center">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-700">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

        </div>)
}
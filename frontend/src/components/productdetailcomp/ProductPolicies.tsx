import type { RootState } from "../../store/store";
import { Star, RotateCcw } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const ProductPolicies = () => {
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
        <div className="p-6">
            <div className="space-y-6">
                {/* Cancellation Policy */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <RotateCcw className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Cancellation Policy</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
                            <p className="text-gray-700 leading-relaxed">
                                {currentProduct.cancellationPolicy || 'No specific policy provided. Please contact our customer service for details about cancellations and refunds.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                {currentProduct.reviews && currentProduct.reviews.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Star className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Customer Reviews</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {currentProduct.reviews.slice(0, 3).map((review: any) => (
                                    <div key={review.id} className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{review.name}</h3>
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 transition-colors duration-200 ${
                                                            i < review.rating 
                                                                ? 'text-yellow-400 fill-yellow-400' 
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                            
                            {currentProduct.reviews.length > 3 && (
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        <Star className="h-4 w-4 mr-2" />
                                        +{currentProduct.reviews.length - 3} more reviews available
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>)
}
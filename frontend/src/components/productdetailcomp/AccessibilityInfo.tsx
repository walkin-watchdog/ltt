import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

 export const AccessibilityInfo = () => {
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
 <div className="mb-6">
                            <h3 className="text-md font-semibold text-gray-900 mb-3">Accessibility Information</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Wheelchair Accessibility */}
                                    {currentProduct.wheelchairAccessible && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Wheelchair Accessible:</span>
                                            <span className={`text-sm font-medium ${currentProduct.wheelchairAccessible === 'yes' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {currentProduct.wheelchairAccessible === 'yes' ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Stroller Accessibility */}
                                    {currentProduct.strollerAccessible && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Stroller Friendly:</span>
                                            <span className={`text-sm font-medium ${currentProduct.strollerAccessible === 'yes' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {currentProduct.strollerAccessible === 'yes' ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Service Animals */}
                                    {currentProduct.serviceAnimalsAllowed && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Service Animals:</span>
                                            <span className={`text-sm font-medium ${currentProduct.serviceAnimalsAllowed === 'yes' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {currentProduct.serviceAnimalsAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Public Transport Access */}
                                    {currentProduct.publicTransportAccess && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Public Transport:</span>
                                            <span className={`text-sm font-medium ${currentProduct.publicTransportAccess === 'yes' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {currentProduct.publicTransportAccess === 'yes' ? 'Accessible' : 'Limited Access'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Infant Seating */}
                                    {currentProduct.infantSeatsRequired && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Infant Seating:</span>
                                            <span className="text-sm font-medium text-gray-600">
                                                {currentProduct.infantSeatsRequired === 'yes' ? 'Must sit on laps' : 'Separate seating available'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Infant Seats Available */}
                                    {currentProduct.infantSeatsAvailable && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Infant Seats:</span>
                                            <span className={`text-sm font-medium ${currentProduct.infantSeatsAvailable === 'yes' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {currentProduct.infantSeatsAvailable === 'yes' ? 'Available' : 'Not Available'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Accessibility Features */}
                                {currentProduct.accessibilityFeatures &&
                                    Array.isArray(currentProduct.accessibilityFeatures) &&
                                    currentProduct.accessibilityFeatures.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-800 mb-2">Additional Features:</h4>
                                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                                {currentProduct.accessibilityFeatures.map((feature: string, idx: number) => (
                                                    <li key={idx}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                {/* Physical Difficulty Level */}
                                {currentProduct.difficulty && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Physical Difficulty:</span>
                                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentProduct.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                currentProduct.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                    currentProduct.difficulty === 'Challenging' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {currentProduct.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
 )}
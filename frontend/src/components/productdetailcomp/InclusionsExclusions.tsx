import type { RootState } from "../../store/store";
import { Check, X, Gift, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

 export const InclusionsExclusions = () => {
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
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {currentProduct.inclusions.length > 0 && (
                                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                <Gift className="h-5 w-5 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white">What's Included</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <ul className="space-y-4">
                                            {currentProduct.inclusions.map((inclusion, index) => (
                                                <li key={index} className="group/item flex items-start hover:bg-white/50 rounded-lg p-3 transition-all duration-200">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover/item:bg-green-200 transition-colors duration-200">
                                                        <Check className="h-4 w-4 text-green-600 group-hover/item:scale-110 transition-transform duration-200" />
                                                    </div>
                                                    <span className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">{inclusion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {currentProduct.exclusions.length > 0 && (
                                <div className="group bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                <AlertCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white">Not Included</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <ul className="space-y-4">
                                            {currentProduct.exclusions.map((exclusion, index) => (
                                                <li key={index} className="group/item flex items-start hover:bg-white/50 rounded-lg p-3 transition-all duration-200">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover/item:bg-red-200 transition-colors duration-200">
                                                        <X className="h-4 w-4 text-red-600 group-hover/item:scale-110 transition-transform duration-200" />
                                                    </div>
                                                    <span className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">{exclusion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
  )}
import type { RootState } from "../../store/store";
import { Check, X } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

 export const InclusionsExclusions = ({ inclusionsRef }: { inclusionsRef: React.RefObject<HTMLDivElement | null> }) => {
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
 <div ref={inclusionsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 scroll-mt-20">
                            {currentProduct.inclusions.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Included</h2>
                                    <ul className="space-y-2">
                                        {currentProduct.inclusions.map((inclusion, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-4 w-4 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700 text-sm">{inclusion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {currentProduct.exclusions.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Not Included</h2>
                                    <ul className="space-y-2">
                                        {currentProduct.exclusions.map((exclusion, index) => (
                                            <li key={index} className="flex items-start">
                                                <X className="h-4 w-4 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700 text-sm">{exclusion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
  )}
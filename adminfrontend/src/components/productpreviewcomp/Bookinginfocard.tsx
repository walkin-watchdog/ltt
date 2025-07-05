import type { PackageOption, Product } from "@/types.ts";
import { Clock, MapPin, Users } from "lucide-react";
import { AdminAvailabilityBar } from "../common/AdminAvailabilityBar";

interface BookingInfoCardProps {
    product: Product;
    cheapestPackage: PackageOption | null;
    selectedDateStr: string;
    adultsCount: number;
    childrenCount: number;
    isMobile: boolean;
    checkingAvail: boolean;
    isDateOk: boolean | null;
    availablePkgs: PackageOption[];
    selectedPackage: PackageOption | null;
    handleBarChange: (args: { date: string; adults: number; children: number }) => void;
    handlePackageSelect: (pkgId: string | PackageOption) => void;
    checkAvailabilityDesktop: () => void;
    setShowAvail: (show: boolean) => void;
    calculateEffectivePrice: (basePrice: number, discountType?: string, discountValue?: number) => number;
  }
  
  export const BookingInfoCard: React.FC<BookingInfoCardProps> = ({
    product,
    cheapestPackage,
    selectedDateStr,
    adultsCount,
    childrenCount,
    isMobile,
    checkingAvail,
    isDateOk,
    availablePkgs,
    selectedPackage,
    handleBarChange,
    handlePackageSelect,
    checkAvailabilityDesktop,
    setShowAvail,
    calculateEffectivePrice,
  }) => {
    return (
        <div>
            <aside className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6 space-y-6">
                    {/* Price */}
                    <div>
                        <div className="flex items-baseline space-x-2">
                            {cheapestPackage ? (
                                <>
                                    <span className="text-3xl font-bold text-[#ff914d]">
                                        {cheapestPackage.currency === 'INR' ? '₹' :
                                            cheapestPackage.currency === 'USD' ? '$' :
                                                cheapestPackage.currency === 'EUR' ? '€' : '£'}
                                        {calculateEffectivePrice(
                                            cheapestPackage.basePrice,
                                            cheapestPackage.discountType,
                                            cheapestPackage.discountValue
                                        ).toLocaleString()}
                                    </span>
                                    {cheapestPackage && cheapestPackage.discountType !== 'none' && cheapestPackage.discountValue && cheapestPackage.discountValue > 0 && (
                                        <span className="text-lg text-gray-500 line-through">
                                            {cheapestPackage.currency === 'INR' ? '₹' :
                                                cheapestPackage.currency === 'USD' ? '$' :
                                                    cheapestPackage.currency === 'EUR' ? '€' : '£'}
                                            {cheapestPackage.basePrice.toLocaleString()}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-[#ff914d]">Price unavailable</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            {cheapestPackage?.isPerGroup ? 'per group' : 'per person'}
                            {cheapestPackage?.maxPeople && ` (up to ${cheapestPackage.maxPeople} people)`}
                        </p>
                    </div>

                    {/* Availability bar */}
                    <AdminAvailabilityBar
                        selectedDate={selectedDateStr}
                        adults={adultsCount}
                        children={childrenCount}
                        onChange={handleBarChange}
                        onCheck={() => {
                            if (isMobile) {
                                setShowAvail(true);
                                return;
                            }
                            checkAvailabilityDesktop();
                        }}
                        selectedPackage={selectedPackage}
                    />

                    {/* dynamic feedback */}
                    {!isMobile && (
                        <>
                            {checkingAvail && (
                                <p className="text-center text-gray-500">Checking availability…</p>
                            )}
                            {isDateOk === false && !checkingAvail && (
                                <p className="text-center text-red-600">
                                    Not enough spots for {adultsCount + (childrenCount > 0 ? childrenCount : 0)}{' '}
                                    participant{(adultsCount + childrenCount) > 1 ? 's' : ''}.
                                </p>
                            )}
                            {isDateOk && availablePkgs.length > 0 && (
                                <div className="space-y-2">
                                    {availablePkgs.map(pkg => (
                                        <button
                                            key={pkg.id}
                                            onClick={() => handlePackageSelect(pkg.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg ${selectedPackage?.id === pkg.id
                                                ? 'border-[#ff914d] bg-orange-50'
                                                : 'border-gray-200 hover:border-[#ff914d]'
                                                }`}
                                        >
                                            <span>
                                                <p className="font-medium">{pkg.name}</p>
                                                {pkg.description && (
                                                    <p className="text-sm text-gray-600">
                                                        {pkg.description}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    {pkg.isPerGroup ? 'Per group' : 'Per person'}
                                                    {pkg.maxPeople && ` (up to ${pkg.maxPeople})`}
                                                </p>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Quick facts */}
                    <div className="space-y-3 py-4 border-y">
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-[#ff914d] mr-2" />
                            {product.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-[#ff914d] mr-2" />
                            {product.duration}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 text-[#ff914d] mr-2" />
                            Up&nbsp;to&nbsp;{product.capacity}&nbsp;people
                        </div>
                        {product.phonenumber && (
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium mr-2">Phone:</span>
                                <a href={`tel:${product.phonenumber}`} className="text-blue-700 underline">
                                    {product.phonenumber}
                                </a>
                            </div>
                        )}
                        {product.tourType && (
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium mr-2">Tour Type:</span>
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs capitalize">
                                    {product.tourType}
                                </span>
                            </div>
                        )}
                        {product.difficulty && (
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium mr-2">Difficulty:</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${product.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                        product.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                            product.difficulty === 'Challenging' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {product.difficulty}
                                </span>
                            </div>
                        )}
                        {product.minPeople && Number(product.minPeople) > 1 && (
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium mr-2">Minimum:</span>
                                <span className="text-gray-700">{product.minPeople} people</span>
                            </div>
                        )}
                    </div>

                    {/* Languages */}
                    {product.languages?.length ? (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-1">
                                {product.languages.map((lang, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                    >
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Tags */}
                    {product.tags?.length ? (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-1">
                                {product.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Static package list */}
                    {product.packages?.length ? (
                        <div>
                            <h4 className="text-sm font-medium mb-3">Package Options</h4>
                            <div className="space-y-2">
                                {product.packages.map(pkg => (
                                    <div key={pkg.id} className="border rounded-lg p-3">
                                        <div className="flex justify-between">
                                            <h5 className="font-medium">{pkg.name}</h5>
                                            <div className="text-[#ff914d] font-semibold">
                                                {pkg.currency === 'INR' ? '₹' :
                                                    pkg.currency === 'USD' ? '$' :
                                                        pkg.currency === 'EUR' ? '€' : '£'}
                                                {pkg.basePrice.toLocaleString()}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{pkg.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {pkg.isPerGroup ? 'Per group' : 'Per person'}
                                            {pkg.maxPeople && ` (max ${pkg.maxPeople} people)`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Updated CTA button */}
                    <button
                        disabled
                        className="w-full bg-[#ff914d]/60 text-white py-3 rounded-lg cursor-not-allowed mt-4"
                    >
                        Preview Mode - Booking Disabled
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                        This is a preview of how the product appears to customers
                    </p>
                </div>
            </aside>
        </div>

    )
}
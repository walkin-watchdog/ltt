import type { RootState } from "@/store/store";
import { AlertCircle, Calendar, CheckCircle, Clock, MapPin, Share2, Star, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

  export const ProductOverview = ({ overviewRef, averageRating }: { overviewRef: React.RefObject<HTMLDivElement | null>, averageRating:number }) => {
    const { currentProduct } = useSelector((state: RootState) => state.products);
     const getAvailabilityStatus = () => {
            if (!currentProduct) {
                return {
                    status: 'unavailable',
                    message: 'Currently Unavailable',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    icon: AlertCircle
                };
            }
    
            const { availabilityStatus: status, nextAvailableDate } = currentProduct;
    
            const statusMap = {
                SOLD_OUT: {
                    status: 'sold_out',
                    message: 'Currently Sold Out',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    icon: AlertCircle
                },
                NOT_OPERATING: {
                    status: 'not_operating',
                    message: 'Not Currently Operating',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    icon: AlertCircle
                }
            } as const;
    
            if (status in statusMap) return statusMap[status as keyof typeof statusMap];
    
            if (nextAvailableDate) {
                const date = new Date(nextAvailableDate);
                if (date > new Date()) {
                    return {
                        status: 'upcoming',
                        message: `Next Available: ${date.toLocaleDateString()}`,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        borderColor: 'border-blue-200',
                        icon: Calendar
                    };
                }
            }
    
            return {
                status: 'available',
                message: 'Available for Booking',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                icon: CheckCircle
            };
        };
    
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
  <div ref={overviewRef} className="bg-white rounded-lg shadow-sm p-6 mb-8 scroll-mt-20">
                            {/* Product Info */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-[#104c57] text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {currentProduct.type}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard
                                                .writeText(window.location.href)
                                                .then(() => toast.success('Link copied!'));
                                        }}
                                        className="p-2 text-gray-400 hover:text-[#ff914d] transition-colors"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentProduct.title}</h1>

                            {/* Availability Status */}
                            {(() => {
                                const availability = getAvailabilityStatus();
                                const IconComponent = availability.icon;

                                return (
                                    <div className={`${availability.bgColor} ${availability.borderColor} border rounded-lg p-4 mb-6`}>
                                        <div className="flex items-center">
                                            <IconComponent className={`h-5 w-5 ${availability.color} mr-3`} />
                                            <div>
                                                <p className={`font-medium ${availability.color}`}>
                                                    {availability.message}
                                                </p>
                                                {availability.status === 'sold_out' && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Join our waitlist to be notified when spots become available
                                                    </p>
                                                )}
                                                {availability.status === 'not_operating' && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        This experience is temporarily suspended. Check back later for updates.
                                                    </p>
                                                )}
                                                {availability.status === 'upcoming' && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Booking will open soon for the next available dates
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="flex items-center space-x-6 mb-6">
                                <div className="flex items-center">
                                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                    <span className="ml-1 font-medium">{averageRating.toFixed(1)}</span>
                                    <span className="ml-1 text-gray-500">({currentProduct.reviews?.length || 0} reviews)</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{currentProduct.location}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>{currentProduct.duration}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>Up to {currentProduct.capacity} people</span>
                                </div>
                                {currentProduct.phonenumber && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Phone:</span>
                                        <a href={`tel:${currentProduct.phonenumber}`} className="text-blue-700 underline">
                                            {currentProduct.phonenumber}
                                        </a>
                                    </div>
                                )}
                                {currentProduct.tourType && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Tour Type:</span>
                                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs capitalize">
                                            {currentProduct.tourType}
                                        </span>
                                    </div>
                                )}
                                {currentProduct.difficulty && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Difficulty:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${currentProduct.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                            currentProduct.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                currentProduct.difficulty === 'Challenging' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {currentProduct.difficulty}
                                        </span>
                                    </div>
                                )}
                                {typeof currentProduct.minPeople === 'number' && currentProduct.minPeople > 1 && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Minimum:</span>
                                        <span className="text-gray-700">{currentProduct.minPeople} people</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-700 text-lg leading-relaxed mb-6">
                                {currentProduct.description}
                            </p>

                            {/* highlights */}
                            {currentProduct.highlights?.length ? (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">Highlights</h3>
                                    <ul className="space-y-2">
                                        {currentProduct.highlights.map((hl: string, i: number) => (
                                            <li key={i} className="flex items-start">
                                                <Star className="h-5 w-5 text-[#ff914d] mr-3" />
                                                <span className="text-gray-600">{hl}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {/* Health Restrictions */}
                            {currentProduct.healthRestrictions && Array.isArray(currentProduct.healthRestrictions) && currentProduct.healthRestrictions.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Restrictions</h3>
                                    <div className="bg-red-50 rounded-lg p-4">
                                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                            {currentProduct.healthRestrictions.map((restriction: string, idx: number) => (
                                                <li key={idx}>{restriction}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {currentProduct.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
  )}
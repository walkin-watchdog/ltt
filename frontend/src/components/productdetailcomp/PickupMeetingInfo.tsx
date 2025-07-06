import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";

 export const PickupMeetingInfo = ( ) => {
 const { currentProduct } = useSelector((state: RootState) => state.products);
 if (!currentProduct) {
     return null;
 }
 return (
    <div>

 {(
     (Array.isArray(currentProduct.pickupLocationDetails) && currentProduct.pickupLocationDetails.length > 0) ||
     (Array.isArray(currentProduct.pickupLocations) && currentProduct.pickupLocations.length > 0) ||
     currentProduct.pickupOption ||
     currentProduct.allowTravelersPickupPoint ||
     currentProduct.meetingPoint ||
     (Array.isArray(currentProduct.meetingPoints) && currentProduct.meetingPoints.length > 0)
    ) && (
        <div className="mb-6">
                                    <h3 className="text-md font-semibold text-gray-900 mb-3">Pickup & Meeting Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">

                                        {/* Pickup Option */}
                                        {currentProduct.pickupOption && (
                                            <div>
                                                <span className="font-medium text-gray-800">Pickup Option: </span>
                                                <span className="text-gray-700">{currentProduct.pickupOption}</span>
                                            </div>
                                        )}

                                        {/* Allow Travelers to Choose Pickup Point */}
                                        {typeof currentProduct.allowTravelersPickupPoint === 'boolean' && (
                                            <div>
                                                <span className="font-medium text-gray-800">Allow Travelers to Choose Pickup Point: </span>
                                                <span className={`font-medium ${currentProduct.allowTravelersPickupPoint ? 'text-green-600' : 'text-red-600'}`}>
                                                    {currentProduct.allowTravelersPickupPoint ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Pickup Start Time */}
                                        {currentProduct.pickupStartTime && (
                                            <div>
                                                <span className="font-medium text-gray-800">Pickup Start Time: </span>
                                                <span className="text-gray-700">{currentProduct.pickupStartTime}</span>
                                            </div>
                                        )}

                                        {/* Pickup Locations (Detailed) */}
                                        {Array.isArray(currentProduct.pickupLocationDetails) && currentProduct.pickupLocationDetails.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-800 mb-2">Pickup Locations:</h4>
                                                <ul className="space-y-2">
                                                    {currentProduct.pickupLocationDetails.map((loc: any, idx: number) => (
                                                        <li key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                                                            <div className="font-medium text-sm text-gray-800">{loc.address}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Pickup Locations (String) fallback */}
                                        {(!currentProduct.pickupLocationDetails || currentProduct.pickupLocationDetails.length === 0) &&
                                            Array.isArray(currentProduct.pickupLocations) && currentProduct.pickupLocations.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-800 mb-2">Pickup Locations:</h4>
                                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                                        {currentProduct.pickupLocations.map((location: string, idx: number) => (
                                                            <li key={idx}>{location}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                        {/* Meeting Point (old string) */}
                                        {currentProduct.meetingPoint && typeof currentProduct.meetingPoint === 'string' && !Array.isArray(currentProduct.meetingPoints) && (
                                            <div className="mb-3">
                                                <h4 className="text-sm font-medium text-gray-800 mb-1">Meeting Point:</h4>
                                                <p className="text-sm text-gray-700">{currentProduct.meetingPoint}</p>
                                            </div>
                                        )}

                                        {/* Meeting Points (array) */}
                                        {Array.isArray(currentProduct.meetingPoints) && currentProduct.meetingPoints.length > 0 && (
                                            <div className="mb-3">
                                                <h4 className="text-sm font-medium text-gray-800 mb-2">Meeting Points:</h4>
                                                <div className="space-y-2">
                                                    {currentProduct.meetingPoints.map((point: any, idx: number) => (
                                                        <div key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                                                            <div className="font-medium text-sm text-gray-800">{point.address}</div>
                                                            {point.description && (
                                                                <div className="text-sm text-gray-600 mt-1">{point.description}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tour End at Meeting Point */}
                                        {currentProduct.doesTourEndAtMeetingPoint !== undefined && (
                                            <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-2 h-2 rounded-full ${currentProduct.doesTourEndAtMeetingPoint ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {currentProduct.doesTourEndAtMeetingPoint ? 'Tour ends back at meeting point(s)' : 'Tour does not end at meeting point(s)'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* End Point Locations */}
                                        {Array.isArray(currentProduct.endPoints) && currentProduct.endPoints.length > 0 && (
                                            <div className="bg-white rounded-lg shadow-sm p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">End Point Locations</h3>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <ul className="space-y-2">
                                                        {currentProduct.endPoints.map((loc: any, idx: number) => (
                                                            <li key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                                                                <div className="font-medium text-sm text-gray-800">{loc.address}</div>
                                                                {loc.description && loc.description.trim() !== '' && (
                                                                    <div className="text-xs text-gray-700 mt-1">{loc.description}</div>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}
                            </div>
                        )}
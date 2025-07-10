import type { Product } from '../../types/index.ts';

export const PickupMeetingInfo = ({ product }: { product: Product;}) => {
  const hasPickupMeetingInfo = (
    (Array.isArray(product.pickupLocationDetails) && product.pickupLocationDetails.length > 0) ||
    (Array.isArray(product.pickupLocations) && product.pickupLocations.length > 0) ||
    product.pickupOption ||
    product.allowTravelersPickupPoint ||
    product.meetingPoint ||
    (Array.isArray(product.meetingPoints) && product.meetingPoints.length > 0)
  );

  if (!hasPickupMeetingInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Pickup & Meeting Information</h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">

        {/* Pickup Option */}
        {product.pickupOption && (
          <div>
            <span className="font-medium text-gray-800">Pickup Option: </span>
            <span className="text-gray-700">{product.pickupOption}</span>
          </div>
        )}

        {/* Allow Travelers to Choose Pickup Point */}
        {typeof product.allowTravelersPickupPoint === 'boolean' && (
          <div>
            <span className="font-medium text-gray-800">Allow Travelers to Choose Pickup Point: </span>
            <span className={`font-medium ${product.allowTravelersPickupPoint ? 'text-green-600' : 'text-red-600'}`}>
              {product.allowTravelersPickupPoint ? 'Yes' : 'No'}
            </span>
          </div>
        )}

        {/* Pickup Start Time */}
        {product.pickupStartTime && (
          <div>
            <span className="font-medium text-gray-800">Pickup Start Time: </span>
            <span className="text-gray-700">{product.pickupStartTime}</span>
          </div>
        )}

        {/* Pickup Locations (Detailed) */}
        {Array.isArray(product.pickupLocationDetails) && product.pickupLocationDetails.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">Pickup Locations:</h4>
            <ul className="space-y-2">
              {product.pickupLocationDetails.map((loc: any, idx: number) => (
                <li key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                  <div className="font-medium text-sm text-gray-800">{loc.address}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meeting Point (old string) */}
        {product.meetingPoint && typeof product.meetingPoint === 'string' && !Array.isArray(product.meetingPoints) && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-800 mb-1">Meeting Point:</h4>
            <p className="text-sm text-gray-700">{product.meetingPoint}</p>
          </div>
        )}

        {/* Meeting Points (array) */}
        {Array.isArray(product.meetingPoints) && product.meetingPoints.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Meeting Points:</h4>
            <div className="space-y-2">
              {product.meetingPoints.map((point: any, idx: number) => (
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
        {product.doesTourEndAtMeetingPoint !== undefined && (
          <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${product.doesTourEndAtMeetingPoint ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="text-sm font-medium text-gray-800">
                {product.doesTourEndAtMeetingPoint ? 'Tour ends back at meeting point(s)' : 'Tour does not end at meeting point(s)'}
              </span>
            </div>
          </div>
        )}

        {/* End Points */}
        {Array.isArray(product.endPoints) && product.endPoints.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">End Point Locations</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {product.endPoints.map((loc: any, idx: number) => (
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
  );
};
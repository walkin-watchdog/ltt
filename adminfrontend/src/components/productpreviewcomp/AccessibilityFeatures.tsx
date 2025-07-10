import type { Product } from '../../types/index.ts';

export const AccessibilityFeatures = ({ product }: {product:Product}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility Information</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wheelchair Accessibility */}
          {product.wheelchairAccessible && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Wheelchair Accessible:</span>
              <span className={`text-sm font-medium ${product.wheelchairAccessible === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                {product.wheelchairAccessible === 'yes' ? 'Yes' : 'No'}
              </span>
            </div>
          )}

          {/* Stroller Accessibility */}
          {product.strollerAccessible && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Stroller Friendly:</span>
              <span className={`text-sm font-medium ${product.strollerAccessible === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                {product.strollerAccessible === 'yes' ? 'Yes' : 'No'}
              </span>
            </div>
          )}

          {/* Service Animals */}
          {product.serviceAnimalsAllowed && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Service Animals:</span>
              <span className={`text-sm font-medium ${product.serviceAnimalsAllowed === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                {product.serviceAnimalsAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
              </span>
            </div>
          )}

          {/* Public Transport Access */}
          {product.publicTransportAccess && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Public Transport:</span>
              <span className={`text-sm font-medium ${product.publicTransportAccess === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                {product.publicTransportAccess === 'yes' ? 'Accessible' : 'Limited Access'}
              </span>
            </div>
          )}

          {/* Infant Seating */}
          {product.infantSeatsRequired && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Infant Seating:</span>
              <span className="text-sm font-medium text-gray-600">
                {product.infantSeatsRequired === 'yes' ? 'Must sit on laps' : 'Separate seating available'}
              </span>
            </div>
          )}

          {/* Infant Seats Available */}
          {product.infantSeatsAvailable && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Infant Seats:</span>
              <span className={`text-sm font-medium ${product.infantSeatsAvailable === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                {product.infantSeatsAvailable === 'yes' ? 'Available' : 'Not Available'}
              </span>
            </div>
          )}
        </div>

        {/* Additional Accessibility Features */}
        {product.accessibilityFeatures &&
          Array.isArray(product.accessibilityFeatures) &&
          product.accessibilityFeatures.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Additional Features:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {product.accessibilityFeatures.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Physical Difficulty Level */}
        {product.difficulty && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Physical Difficulty:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                product.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                product.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                product.difficulty === 'Challenging' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {product.difficulty}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
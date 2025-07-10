import { CheckCircle } from 'lucide-react';
import type { Product } from '../../types/index.ts';

export const ProductItinerary = ({ product }: {product: Product;}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 scroll-mt-20">
      <h3 className="text-lg font-semibold mb-4">Itinerary</h3>
      {product.itineraries?.length ? (
        product.itineraries.map(item => (
          <div
            key={item.day}
            className="border-l-4 border-[#ff914d] pl-4 mb-4"
          >
            <h4 className="font-medium">{`Day ${item.day}: ${item.title}`}</h4>
            <p className="text-gray-600">{item.description}</p>
            {item.activities?.length ? (
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mt-2">
                {item.activities.map((act, idx) => (
                  <li key={idx} className="border-l-4 border-[#ff914d] pl-4 mb-4">
                    <div className="font-semibold text-gray-900">{act.location}</div>
                    {act.duration && (
                      <div className="text-sm text-purple-600 mt-1">
                        Duration: {act.duration} {act.durationUnit || 'minutes'}
                      </div>
                    )}
                    {act.isStop && (
                      <div className="text-sm text-blue-600 mt-1">
                        Stop duration: {act.stopDuration || 0} minutes
                      </div>
                    )}
                    {act.isAdmissionIncluded && (
                      <div className="text-sm text-emerald-600 mt-1 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Admission included in tour price
                      </div>
                    )}
                    {act.inclusions && act.inclusions.length > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        Includes: {act.inclusions.join(', ')}
                      </div>
                    )}
                    {act.exclusions && act.exclusions.length > 0 && (
                      <div className="text-sm text-red-600 mt-1">
                        Excludes: {act.exclusions.join(', ')}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No itinerary available for this product.</p>
      )}
    </div>
  );
};
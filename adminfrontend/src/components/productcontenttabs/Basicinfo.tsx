import { PlusCircle } from "lucide-react";
import { LocationAutocomplete } from "../ui/LocationAutocomplete";
import type { Key} from "react";


interface BasicInfoProps {
    formData: any;
    updateFormData: (updates: any) => void;
    destinations: any
    experienceCategories: any;
    setIsCategoryModalOpen: (open: boolean) => void;
    setIsDestinationModalOpen: (open: boolean) => void;
    isLoadingDestinations: boolean;
    isLoadingCategories: boolean;
    handleSaveAndContinue: () => void;
  }

export const BasicInfo =({
formData,
updateFormData,
destinations,
experienceCategories,
setIsCategoryModalOpen,
isLoadingDestinations,
isLoadingCategories,
handleSaveAndContinue,
setIsDestinationModalOpen
}: BasicInfoProps) => {

return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => updateFormData({ type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            required
          >
            <option value="TOUR">Tour</option>
            <option value="EXPERIENCE">Experience</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Enter product title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Code *
          </label>
          <input
            type="text"
            value={formData.productCode}
            onChange={(e) => updateFormData({ productCode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Enter unique product code"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="flex">
            <LocationAutocomplete
              value={formData.location || ''}
              onChange={(location, lat, lng, placeId) => {
                // Find matching destination by name or coordinates
                const matchingDestination = destinations.find((d: { name: string; lat: number; lng: number; }) =>
                  d.name === location ||
                  (lat && lng && d.lat && d.lng &&
                    Math.abs(d.lat - lat) < 0.001 &&
                    Math.abs(d.lng - lng) < 0.001)
                );

                updateFormData({
                  location: location,
                  destinationId: matchingDestination?.id || null,
                  locationLat: lat,
                  locationLng: lng,
                  locationPlaceId: placeId
                });
              }}
              placeholder="Search for a location..."
              className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setIsDestinationModalOpen(true)}
              className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors flex-shrink-0"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>
          {isLoadingDestinations && (
            <p className="text-sm text-gray-500 mt-1">Loading destinations...</p>
          )}
          {formData.locationLat && formData.locationLng && (
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {formData.locationLat.toFixed(6)}, {formData.locationLng.toFixed(6)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration *
          </label>
          <div className="flex flex-col sm:flex-row sm:space-x-2 sm:items-center space-y-2 sm:space-y-0">
            <input
              type="number"
              min={1}
              value={
                formData.duration === 'Full Day' || formData.duration === 'Half Day'
                  ? 1
                  : formData.duration && formData.duration !== 'Full Day' && formData.duration !== 'Half Day'
                    ? parseInt(formData.duration.split(' ')[0]) || ''
                    : ''
              }
              onChange={e => {
                const value = Number(e.target.value);
                if (value === 1) {
                  updateFormData({ duration: 'Full Day' });
                } else if (value > 1) {
                  updateFormData({ duration: `${value} Days` });
                }
              }}
              className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="e.g., 7"
              required
              disabled={formData.duration === 'Full Day' || formData.duration === 'Half Day'}
            />
            <select
              value={
                formData.duration === 'Full Day'
                  ? 'full'
                  : formData.duration === 'Half Day'
                    ? 'half'
                    : 'days'
              }
              onChange={e => {
                const currentValue =
                  formData.duration && formData.duration !== 'Full Day' && formData.duration !== 'Half Day'
                    ? parseInt(formData.duration.split(' ')[0]) || 1
                    : 1;

                if (e.target.value === 'full') {
                  updateFormData({ duration: 'Full Day' });
                } else if (e.target.value === 'half') {
                  updateFormData({ duration: 'Half Day' });
                } else {
                  updateFormData({ duration: `${currentValue > 1 ? currentValue : 2} Days` });
                }
              }}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              required
            >
              <option value="full">Full Day</option>
              <option value="half" disabled={
                formData.duration !== 'Full Day' && formData.duration !== 'Half Day' &&
                parseInt(formData.duration?.split(' ')[0]) > 1
              }>Half Day</option>
              <option value="days">Days</option>
            </select>
            {(formData.duration === 'Full Day' || formData.duration === 'Half Day') && (
              <span className="text-gray-500 text-sm">
                {formData.duration}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formData.duration === 'Full Day' && 'A single full day experience.'}
            {formData.duration === 'Half Day' && 'A single half day experience.'}
            {formData.duration && formData.duration.includes('Days') && 'Enter the number of days for this tour.'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tour Type *
          </label>
          <select
            value={formData.tourType || ''}
            onChange={e => updateFormData({ tourType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            required
          >
            <option value="">Select tour type</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Capacity *
          </label>
          <input
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => updateFormData({ capacity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Max number of people"
            required
          />
        </div>
      </div>

      {formData.type === 'EXPERIENCE' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="flex">
            <select
              value={formData.category}
              onChange={(e) => updateFormData({
                category: e.target.value,
                experienceCategoryId: experienceCategories.find((c: { name: string; }) => c.name === e.target.value)?.id || null
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              required={formData.type === 'EXPERIENCE'}
            >
              <option value="">Select a category</option>
              {experienceCategories.map((category: { id: Key | null | undefined; name: any }) => (
                <option
                  key={category.id ?? ''}
                  value={category.name != null ? String(category.name) : ''}
                >
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors flex-shrink-0"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>
          {isLoadingCategories && (
            <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          rows={5}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          placeholder="Enter detailed description"
          required
        />
      </div>
      
      <div className="flex justify-end mt-6 md:mt-8">
        <button
          type="button"
          onClick={handleSaveAndContinue}
          className="w-full sm:w-auto px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
        >
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
}
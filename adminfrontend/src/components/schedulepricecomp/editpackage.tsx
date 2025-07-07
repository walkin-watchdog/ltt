import { Plus, Save, X } from "lucide-react";
import { getDescription, predefinedCategories } from "../productcontenttabs/predefinedcategories";
import { calculateEffectivePrice } from "./schedulepricefunc";
import type { EditPackageProps } from "@/types.ts";

export const EditPackage = ({
isAddingPackage,
isEditingPackage,
setIsAddingPackage,
setIsEditingPackage,
packageFormData,
setPackageFormData,
handlePackageChange,
handleSavePackage,
handlePackageToggle,
selectedInclusionCategory,
setSelectedInclusionCategory,
selectedInclusionSubcategory,
setSelectedInclusionSubcategory,
setShowCustomInclusionForm,
showCustomInclusionForm,
customInclusionTitle,
setCustomInclusionTitle,
customInclusionDescription,
setCustomInclusionDescription,
handleAddInclusionFromCategory,
handleAddInclusion,
handleRemoveInclusion,
newInclusion,
setNewInclusion
}: EditPackageProps) => {

return (
    <div>

    {(isAddingPackage || isEditingPackage) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditingPackage ? 'Edit Package' : 'Add Package'}
          </h3>
          <button
            type="button"
            onClick={() => {
                setIsAddingPackage(false);
                setIsEditingPackage(false);
            }}
            className="text-gray-400 hover:text-gray-600"
            >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Package Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                name="name"
                value={packageFormData.name}
                onChange={handlePackageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="e.g., Standard Package"
                required
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Travellers per booking *
              </label>
              <input
                type="number"
                name="maxPeople"
                min={1}
                value={packageFormData.maxPeople}
                onChange={handlePackageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={packageFormData.description}
              onChange={handlePackageChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="Describe what's included in this package"
              required
              />
          </div>

          {/* Pricing Type and Age Groups */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you price your product?
            </label>
            <div className="flex items-center gap-6 mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pricingType"
                  value="per_person"
                  checked={packageFormData.pricingType === 'per_person'}
                  onChange={() => setPackageFormData((prev: any) => ({ ...prev, pricingType: 'per_person'}))}
                  className="h-4 w-4 text-[#ff914d] border-gray-300"
                  />
                <span className="ml-2 text-sm">Per person</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pricingType"
                  value="per_group"
                  checked={packageFormData.pricingType === 'per_group'}
                  onChange={() => setPackageFormData((prev: any) => ({ ...prev, pricingType: 'per_group' }))}
                  className="h-4 w-4 text-[#ff914d] border-gray-300"
                  />
                <span className="ml-2 text-sm">Per vehicle / group</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Define the age groups that can participate
            </label>
            <div className="space-y-2">
              {(['adult', 'child'] as const).map(group => (
                  <div key={group} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={packageFormData.ageGroups?.[group]?.enabled ?? (group === 'adult')}
                    disabled={group === 'adult'}
                    onChange={e => setPackageFormData((prev: { ageGroups: { [x: string]: any; }; }) => ({
                        ...prev,
                        ageGroups: {
                            ...prev.ageGroups,
                            [group]: {
                                ...(prev.ageGroups?.[group] || {}),
                                enabled: e.target.checked
                            }
                        }
                    }))}
                    className="h-4 w-4 text-[#ff914d] border-gray-300"
                    />
                  <span className="w-16 capitalize">{group}</span>
                  <input
                    type="number"
                    min={0}
                    value={packageFormData.ageGroups?.[group]?.min ?? (group === 'adult' ? 18 : '')}
                    onChange={e => setPackageFormData((prev: { ageGroups: { [x: string]: any; }; }) => ({
                        ...prev,
                        ageGroups: {
                            ...prev.ageGroups,
                            [group]: {
                                ...(prev.ageGroups?.[group] || {}),
                                min: Number(e.target.value)
                            }
                        }
                    }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="Min age"
                    />
                  <span>-</span>
                  <input
                    type="number"
                    min={0}
                    value={packageFormData.ageGroups?.[group]?.max ?? (group === 'adult' ? 99 : '')}
                    onChange={e => setPackageFormData((prev: { ageGroups: { [x: string]: any; }; }) => ({
                        ...prev,
                        ageGroups: {
                            ...prev.ageGroups,
                            [group]: {
                                ...(prev.ageGroups?.[group] || {}),
                                max: Number(e.target.value)
                            }
                        }
                    }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="Max age"
                    />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price *
              </label>
              <div className="flex">
                <select
                  name="currency"
                  value={packageFormData.currency}
                  onChange={handlePackageChange}
                  className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                  <option value="INR">₹</option>
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                  <option value="GBP">£</option>
                </select>
                <input
                  type="number"
                  name="basePrice"
                  min={0}
                  value={packageFormData.basePrice}
                  onChange={handlePackageChange}
                  className="w-full px-3 py-2 border-y border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  required
                  />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                name="discountType"
                value={packageFormData.discountType}
                onChange={handlePackageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                <option value="none">No Discount</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {packageFormData.discountType !== 'none' && (
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  name="discountValue"
                  min={0}
                  max={packageFormData.discountType === 'percentage' ? 100 : undefined}
                  value={packageFormData.discountValue}
                  onChange={handlePackageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  />
              </div>
            )}
          </div>

          {/* Effective Price Display */}
          {packageFormData.discountType !== 'none' && packageFormData.discountValue > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                <span className="font-medium">Effective Price: </span>
                {packageFormData.currency === 'INR' ? '₹' :
                  packageFormData.currency === 'USD' ? '$' :
                  packageFormData.currency === 'EUR' ? '€' : '£'}
                {calculateEffectivePrice(
                    packageFormData.basePrice,
                    packageFormData.discountType,
                    packageFormData.discountValue
                ).toLocaleString()}
                <span className="text-gray-500 ml-2 line-through">
                  {packageFormData.currency === 'INR' ? '₹' :
                    packageFormData.currency === 'USD' ? '$' :
                    packageFormData.currency === 'EUR' ? '€' : '£'}
                  {packageFormData.basePrice.toLocaleString()}
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={packageFormData.startDate}
                onChange={handlePackageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                required
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={packageFormData.endDate || ''}
                min={packageFormData.startDate}
                onChange={handlePackageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={packageFormData.isActive}
                onChange={handlePackageToggle}
                className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
              <span className="ml-2 text-sm text-gray-700">Active (available for booking)</span>
            </label>
          </div>

          {/* Updated Inclusions section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inclusions
            </label>
            
            {/* Category-based inclusion selector */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedInclusionCategory}
                  onChange={(e) => {
                      setSelectedInclusionCategory(e.target.value);
                      setSelectedInclusionSubcategory('');
                      setShowCustomInclusionForm(e.target.value === 'Custom');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                    >
                  <option value="">Select category...</option>
                  {Object.keys(predefinedCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {selectedInclusionCategory && selectedInclusionCategory !== 'Custom' && (
                  <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item</label>
                  <select
                    value={selectedInclusionSubcategory}
                    onChange={(e) => setSelectedInclusionSubcategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                    >
                    <option value="">Select item...</option>
                    {predefinedCategories[selectedInclusionCategory as keyof typeof predefinedCategories].items.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  {selectedInclusionSubcategory && (
                      <p className="text-xs text-gray-500 mt-1">
                      {getDescription(selectedInclusionCategory, selectedInclusionSubcategory)}
                    </p>
                  )}
                </div>
              )}

              {showCustomInclusionForm && (
                  <div className="space-y-2 p-3 border border-gray-200 rounded-md bg-white">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Custom Title</label>
                    <input
                      type="text"
                      value={customInclusionTitle}
                      onChange={(e) => setCustomInclusionTitle(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                      placeholder="Enter custom title"
                      />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      value={customInclusionDescription}
                      onChange={(e) => setCustomInclusionDescription(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                      placeholder="Enter description (optional)"
                      rows={2}
                      />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddInclusionFromCategory}
                disabled={(!selectedInclusionSubcategory && !customInclusionTitle)}
                className="w-full px-3 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:bg-gray-300 text-sm"
                >
                Add Inclusion
              </button>
            </div>

            {/* Legacy text input for quick additions */}
            <div className="flex mb-2">
              <input
                type="text"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Or add quick inclusion..."
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInclusion();
                    }
                }}
                />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="px-4 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
                >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {packageFormData.inclusions.length > 0 ? (
                <div className="space-y-2">
                {packageFormData.inclusions.map((inclusion: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span className="text-sm text-gray-700">{inclusion}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInclusion(index)}
                      className="text-gray-400 hover:text-red-600"
                      >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
                <p className="text-sm text-gray-500 italic">No inclusions added</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                  setIsAddingPackage(false);
                  setIsEditingPackage(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePackage}
              className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors flex items-center"
              disabled={!packageFormData.name || !packageFormData.description || packageFormData.basePrice <= 0}
              >
              <Save className="h-4 w-4 mr-2" />
              {isEditingPackage ? 'Update Package' : 'Add Package'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
  </div>
)
}
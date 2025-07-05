import type { Package } from "@/types.ts"
import { Clock, Plus, Trash2 } from "lucide-react"

interface PackageAndSlotConfigProps {
    formData: any
    handleEditPackage: (pkg: Package, index: number) => void
    handleRemovePackage: (index: number) => void
    handleAddSlot: (packageId: string) => void
    handleEditSlot: (packageId: string, slotIndex: number) => void
    handleRemoveSlot: (packageIndex: number, slotIndex: number) => void
}

export const PackageAndSlotConfig = ({
    formData,
    handleEditPackage,
    handleRemovePackage,
    handleAddSlot,
    handleEditSlot,
    handleRemoveSlot
}:PackageAndSlotConfigProps) => {

    return (
        <>
        {formData.packages && formData.packages.length > 0 ? (
            <div className="space-y-4">
              {formData.packages.map((pkg: Package, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                      <div className="mt-2 space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {pkg.currency} {pkg.basePrice.toLocaleString()}
                        </span>
                        {pkg.discountType !== 'none' && pkg.discountValue > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {pkg.discountType === 'percentage' ? `${pkg.discountValue}% off` : `${pkg.currency} ${pkg.discountValue} off`}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Max: {pkg.maxPeople} people
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {pkg.pricingType === 'per_person' ? 'Per Person' : 'Per Group'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-700">
                        <strong>Age Groups:</strong>
                        {Object.entries(pkg.ageGroups || {}).map(([group, val]: any) =>
                          val.enabled ? (
                            <span key={group} className="ml-2">
                              {group.charAt(0).toUpperCase() + group.slice(1)} ({val.min}-{val.max})
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditPackage(pkg, index)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(index)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
  
                  {/* Slot Configurations */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-700">Time Slots</h5>
                      <button
                        type="button"
                        onClick={() => handleAddSlot(pkg.id!)}
                        className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Slot
                      </button>
                    </div>
  
                    {pkg.slotConfigs && pkg.slotConfigs.length > 0 ? (
                      <div className="space-y-2">
                        {pkg.slotConfigs.map((slot: any, slotIndex: number) => (
                          <div key={slotIndex} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                            <div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 text-gray-500 mr-1" />
                                <span className="text-sm font-medium">
                                  {slot.times.join(', ')}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Days: {slot.days.join(', ')}
                              </div>
                              {slot.adultTiers && slot.adultTiers.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  Adult: {slot.adultTiers.map((tier: any) => (
                                    `${tier.min}-${tier.max}: ${pkg.currency} ${tier.price}`
                                  )).join(', ')}
                                </div>
                              )}
                              {slot.childTiers && slot.childTiers.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  Child: {slot.childTiers.map((tier: any) => (
                                    `${tier.min}-${tier.max}: ${pkg.currency} ${tier.price}`
                                  )).join(', ')}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleEditSlot(pkg.id!, slotIndex)}
                              className="text-blue-600 hover:text-blue-800 "
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(index, slotIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No time slots configured</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
            </div>
          )}
        </>
    )
}   

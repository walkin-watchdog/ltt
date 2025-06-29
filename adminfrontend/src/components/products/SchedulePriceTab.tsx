import { useState } from 'react';
import { Plus, Trash, PlusCircle, MinusCircle, Clock, Save, X } from 'lucide-react';

interface Package {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  discountType: 'none' | 'percentage' | 'fixed';
  discountValue: number;
  currency: string;
  inclusions: string[];
  maxPeople: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  slotConfigs?: any[];
}

interface SchedulePriceTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export const SchedulePriceTab: React.FC<SchedulePriceTabProps> = ({ 
  formData, 
  updateFormData,
}) => {
  const [newInclusion, setNewInclusion] = useState('');
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);
  const [packageFormData, setPackageFormData] = useState<Package>({
    name: '',
    description: '',
    basePrice: 0,
    discountType: 'none',
    discountValue: 0,
    currency: 'INR',
    inclusions: [],
    maxPeople: 10,
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [slotFormData, setSlotFormData] = useState<{
    times: string[];
    days: string[];
    adultTiers: { min: number; max: number; price: number; currency: string }[];
    childTiers: { min: number; max: number; price: number; currency: string }[];
  }>({
    times: [''],
    days: [],
    adultTiers: [{ min: 1, max: 10, price: 0, currency: 'INR' }],
    childTiers: [{ min: 1, max: 10, price: 0, currency: 'INR' }]
  });
  
  // Days of the week for slot selection
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Convert numeric fields to numbers
    if (['basePrice', 'discountValue', 'maxPeople'].includes(name)) {
      setPackageFormData(prev => ({
        ...prev,
        [name]: name === 'discountValue' && value === '' ? 0 : Number(value)
      }));
    } else {
      setPackageFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePackageToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPackageFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      setPackageFormData(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, newInclusion.trim()]
      }));
      setNewInclusion('');
    }
  };

  const handleRemoveInclusion = (index: number) => {
    setPackageFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const handleAddPackage = () => {
    setIsAddingPackage(true);
    setPackageFormData({
      name: '',
      description: '',
      basePrice: 0,
      discountType: 'none',
      discountValue: 0,
      currency: 'INR',
      inclusions: [],
      maxPeople: 10,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      slotConfigs: []
    });
  };

  const handleEditPackage = (packageData: Package, index: number) => {
    setIsEditingPackage(true);
    setEditingPackageIndex(index);
    setPackageFormData({
      ...packageData,
      startDate: packageData.startDate ? packageData.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: packageData.endDate ? packageData.endDate.split('T')[0] : ''
    });
  };

  const handleSavePackage = () => {
    const updatedPackages = formData.packages ? [...formData.packages] : [];
    
    const packageToSave = {
      ...packageFormData,
      basePrice: Number(packageFormData.basePrice),
      discountValue: Number(packageFormData.discountValue || 0),
      maxPeople: Number(packageFormData.maxPeople)
    };
    
    if (isEditingPackage && editingPackageIndex !== null) {
      // Update existing package
      updatedPackages[editingPackageIndex] = {
        ...updatedPackages[editingPackageIndex],
        ...packageToSave
      };
    } else {
      // Add new package
      updatedPackages.push(packageToSave);
    }
    
    updateFormData({ packages: updatedPackages });
    setIsAddingPackage(false);
    setIsEditingPackage(false);
    setEditingPackageIndex(null);
    setPackageFormData({
      name: '',
      description: '',
      basePrice: 0,
      discountType: 'none',
      discountValue: 0,
      currency: 'INR',
      inclusions: [],
      maxPeople: 10,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  const handleRemovePackage = (index: number) => {
    if (window.confirm('Are you sure you want to remove this package?')) {
      const updatedPackages = formData.packages.filter((_: any, i: number) => i !== index);
      updateFormData({ packages: updatedPackages });
    }
  };

  const handleAddSlot = (packageId: string) => {
    setIsAddingSlot(true);
    setEditingPackageId(packageId);
    setSlotFormData({
      times: [''],
      days: [],
      adultTiers: [{ min: 1, max: 10, price: 0, currency: 'INR' }],
      childTiers: [{ min: 1, max: 10, price: 0, currency: 'INR' }]
    });
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, index: number) => {
    const { value } = e.target;
    
    if (field === 'times') {
      const updatedTimes = [...slotFormData.times];
      updatedTimes[index] = value;
      setSlotFormData(prev => ({
        ...prev,
        times: updatedTimes
      }));
    }
  };

  const handleTierChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    tierType: 'adultTiers' | 'childTiers',
    tierIndex: number,
    field: 'min' | 'max' | 'price' | 'currency'
  ) => {
    const { value } = e.target;
    const updatedTiers = [...slotFormData[tierType]];
    
    if (field === 'min' || field === 'max' || field === 'price') {
      updatedTiers[tierIndex][field] = Number(value);
    } else {
      updatedTiers[tierIndex][field] = value;
    }
    
    setSlotFormData(prev => ({
      ...prev,
      [tierType]: updatedTiers
    }));
  };

  const handleAddTier = (tierType: 'adultTiers' | 'childTiers') => {
    setSlotFormData(prev => ({
      ...prev,
      [tierType]: [...prev[tierType], { min: 1, max: 10, price: 0, currency: 'INR' }]
    }));
  };

  const handleRemoveTier = (tierType: 'adultTiers' | 'childTiers', index: number) => {
    setSlotFormData(prev => ({
      ...prev,
      [tierType]: prev[tierType].filter((_, i) => i !== index)
    }));
  };

  const handleAddTimeSlot = () => {
    setSlotFormData(prev => ({
      ...prev,
      times: [...prev.times, '']
    }));
  };

  const handleRemoveTimeSlot = (index: number) => {
    setSlotFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const handleDayToggle = (day: string) => {
    setSlotFormData(prev => {
      const isSelected = prev.days.includes(day);
      return {
        ...prev,
        days: isSelected 
          ? prev.days.filter(d => d !== day) 
          : [...prev.days, day]
      };
    });
  };

  const handleSaveSlot = () => {
    if (slotFormData.times.some(time => !time.trim()) || slotFormData.days.length === 0) {
      alert('Please fill in all time slots and select at least one day');
      return;
    }
    
    const updatedPackages = formData.packages.map((pkg: any) => {
      if (pkg.id === editingPackageId) {
        const updatedSlotConfigs = pkg.slotConfigs ? [...pkg.slotConfigs] : [];
        updatedSlotConfigs.push(slotFormData);
        
        return {
          ...pkg,
          slotConfigs: updatedSlotConfigs
        };
      }
      return pkg;
    });
    
    updateFormData({ packages: updatedPackages });
    setIsAddingSlot(false);
    setEditingPackageId(null);
    setSlotFormData({
      times: [''],
      days: [],
      adultTiers: [{ min: 1, max: 10, price: 0, currency: 'INR' }],
      childTiers: [{ min: 1, max: 10, price: 0, currency: 'INR' }]
    });
  };

  const handleRemoveSlot = (packageIndex: number, slotIndex: number) => {
    if (window.confirm('Are you sure you want to remove this slot?')) {
      const updatedPackages = [...formData.packages];
      const updatedSlotConfigs = [...updatedPackages[packageIndex].slotConfigs];
      
      updatedSlotConfigs.splice(slotIndex, 1);
      updatedPackages[packageIndex] = {
        ...updatedPackages[packageIndex],
        slotConfigs: updatedSlotConfigs
      };
      
      updateFormData({ packages: updatedPackages });
    }
  };

  // Calculate effective price after discount
  const calculateEffectivePrice = (basePrice: number, discountType: string, discountValue: number) => {
    if (discountType === 'percentage') {
      return basePrice * (1 - (discountValue / 100));
    } else if (discountType === 'fixed') {
      return Math.max(0, basePrice - discountValue);
    }
    return basePrice;
  };

  return (
    <div className="space-y-8">
      {/* Packages Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Package Options</h3>
          <button
            type="button"
            onClick={handleAddPackage}
            className="flex items-center text-[#ff914d] hover:text-[#e8823d] transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Package
          </button>
        </div>

        {/* Package List */}
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
                      <Trash className="h-4 w-4" />
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
                                  `${tier.min}-${tier.max}: ${tier.currency} ${tier.price}`
                                )).join(', ')}
                              </div>
                            )}
                            {slot.childTiers && slot.childTiers.length > 0 && (
                              <div className="text-xs text-gray-500">
                                Child: {slot.childTiers.map((tier: any) => (
                                  `${tier.min}-${tier.max}: ${tier.currency} ${tier.price}`
                                )).join(', ')}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(index, slotIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash className="h-4 w-4" />
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
            No packages configured. Click "Add Package" to create a package option.
          </div>
        )}
      </div>

      {/* Add/Edit Package Modal */}
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
                    Max People *
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
              
              {/* Inclusions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inclusions
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    placeholder="e.g., Hotel pickup, Lunch, Guide"
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
                    {packageFormData.inclusions.map((inclusion, index) => (
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

      {/* Add/Edit Slot Modal */}
      {isAddingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Time Slot
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSlot(false);
                  setEditingPackageId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slots *
                </label>
                <div className="space-y-3">
                  {slotFormData.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => handleSlotChange(e, 'times', index)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="e.g., 9:00 AM - 12:00 PM"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(index)}
                        disabled={slotFormData.times.length <= 1}
                        className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Another Time Slot
                  </button>
                </div>
              </div>
              
              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Available *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={slotFormData.days.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Adult Pricing Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Adult Pricing Tiers *
                  </label>
                </div>
                <div className="space-y-3">
                  {slotFormData.adultTiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-md bg-blue-50">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                        <input
                          type="number"
                          min={1}
                          value={tier.min}
                          onChange={(e) => handleTierChange(e, 'adultTiers', index, 'min')}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                        <input
                          type="number"
                          min={tier.min}
                          value={tier.max}
                          onChange={(e) => handleTierChange(e, 'adultTiers', index, 'max')}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                        <div className="flex">
                          <select
                            value={tier.currency}
                            onChange={(e) => handleTierChange(e, 'adultTiers', index, 'currency')}
                            className="px-2 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                          >
                            <option value="INR">₹</option>
                            <option value="USD">$</option>
                            <option value="EUR">€</option>
                            <option value="GBP">£</option>
                          </select>
                          <input
                            type="number"
                            min={0}
                            value={tier.price}
                            onChange={(e) => handleTierChange(e, 'adultTiers', index, 'price')}
                            className="w-full px-2 py-1 border-y border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier('adultTiers', index)}
                        disabled={slotFormData.adultTiers.length <= 1}
                        className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed self-end"
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddTier('adultTiers')}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tier
                  </button>
                </div>
              </div>
              
              {/* Child Pricing Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Child Pricing Tiers *
                  </label>
                </div>
                <div className="space-y-3">
                  {slotFormData.childTiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-md bg-green-50">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                        <input
                          type="number"
                          min={1}
                          value={tier.min}
                          onChange={(e) => handleTierChange(e, 'childTiers', index, 'min')}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                        <input
                          type="number"
                          min={tier.min}
                          value={tier.max}
                          onChange={(e) => handleTierChange(e, 'childTiers', index, 'max')}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                        <div className="flex">
                          <select
                            value={tier.currency}
                            onChange={(e) => handleTierChange(e, 'childTiers', index, 'currency')}
                            className="px-2 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                          >
                            <option value="INR">₹</option>
                            <option value="USD">$</option>
                            <option value="EUR">€</option>
                            <option value="GBP">£</option>
                          </select>
                          <input
                            type="number"
                            min={0}
                            value={tier.price}
                            onChange={(e) => handleTierChange(e, 'childTiers', index, 'price')}
                            className="w-full px-2 py-1 border-y border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier('childTiers', index)}
                        disabled={slotFormData.childTiers.length <= 1}
                        className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed self-end"
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddTier('childTiers')}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tier
                  </button>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSlot(false);
                    setEditingPackageId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSlot}
                  className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Slot Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
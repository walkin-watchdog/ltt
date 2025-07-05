import { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { useToast } from '../ui/toaster';
import { getDescription } from '../productcontenttabs/predefinedcategories';
import type { Package, SchedulePriceTabProps, SlotFormData, SlotPickerState } from '../../types.ts';
import { daysOfWeek, getManualTimes } from '../schedulepricecomp/schedulepricefunc';
import { PackageAndSlotConfig } from '../schedulepricecomp/packagendslotconf';
import { EditPackage } from '../schedulepricecomp/editpackage';
import { SlotPicker } from '../schedulepricecomp/SlotPicker';
import { AdultAndChildTiers } from '../schedulepricecomp/adultndchildtier';

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
    endDate: '',
    pricingType: 'per_person',
    ageGroups: {
      adult: { enabled: true, min: 18, max: 99 },
      child: { enabled: false, min: 6, max: 17 },
    }
  });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [slotFormData, setSlotFormData] = useState<SlotFormData>({
    times: [''],
    days: [],
    adultTiers: [{ min: 1, max: 10, price: 0 }],
    childTiers: [{ min: 1, max: 10, price: 0 }]
  });
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [slotPicker, setSlotPicker] = useState<SlotPickerState>({
    start: '',
    end: '',
    duration: 30,
    durationUnit: 'minutes',
    availableTimes: [],
    selectedTime: '',
  });

  const [selectedInclusionCategory, setSelectedInclusionCategory] = useState('');
  const [selectedInclusionSubcategory, setSelectedInclusionSubcategory] = useState('');
  const [customInclusionTitle, setCustomInclusionTitle] = useState('');
  const [customInclusionDescription, setCustomInclusionDescription] = useState('');
  const [showCustomInclusionForm, setShowCustomInclusionForm] = useState(false);
  const toast = useToast()
  const [slotMode, setSlotMode] = useState<'auto' | 'manual'>('auto');
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

  const handleAddInclusionFromCategory = () => {
    let itemToAdd = '';
    if (showCustomInclusionForm && customInclusionTitle) {
      itemToAdd = customInclusionDescription ? `${customInclusionTitle} - ${customInclusionDescription}` : customInclusionTitle;
    } else if (selectedInclusionSubcategory) {
      const description = getDescription(selectedInclusionCategory, selectedInclusionSubcategory);
      itemToAdd = description ? `${selectedInclusionSubcategory} - ${description}` : selectedInclusionSubcategory;
    }

    if (itemToAdd) {
      setPackageFormData(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, itemToAdd]
      }));
      setSelectedInclusionCategory('');
      setSelectedInclusionSubcategory('');
      setCustomInclusionTitle('');
      setCustomInclusionDescription('');
      setShowCustomInclusionForm(false);
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
      slotConfigs: [],
      pricingType: 'per_person',
      ageGroups: {
        adult: { enabled: true, min: 18, max: 99 },
        child: { enabled: false, min: 6, max: 17 },
      }
    });
  };

  const handleEditPackage = (packageData: Package, index: number) => {
    setIsEditingPackage(true);
    setEditingPackageIndex(index);
    setPackageFormData({
      ...packageData,
      startDate: packageData.startDate ? packageData.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: packageData.endDate ? packageData.endDate.split('T')[0] : '',
      ageGroups: packageData.ageGroups || {
        adult: { enabled: true, min: 18, max: 99 },
        child: { enabled: false, min: 6, max: 17 },
      }
    });
  };

  const handleSavePackage = () => {
    const updatedPackages = formData.packages ? [...formData.packages] : [];

    // Deep clone ageGroups to avoid reference issues
    const ageGroups = {
      adult: { ...(packageFormData.ageGroups?.adult || { enabled: true, min: 18, max: 99 }) },
      child: { ...(packageFormData.ageGroups?.child || { enabled: false, min: 6, max: 17 }) }
    };

    const packageToSave = {
      ...packageFormData,
      pricingType: packageFormData.pricingType || 'per_person',
      ageGroups, // Always use the new object
      basePrice: Number(packageFormData.basePrice),
      discountValue: Number(packageFormData.discountValue || 0),
      maxPeople: Number(packageFormData.maxPeople)
    };

    if (isEditingPackage && editingPackageIndex !== null) {
      updatedPackages[editingPackageIndex] = {
        ...updatedPackages[editingPackageIndex],
        ...packageToSave
      };
    } else {
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
      endDate: '',
      pricingType: 'per_person',
      ageGroups: {
        adult: { enabled: true, min: 18, max: 99 },
        child: { enabled: false, min: 6, max: 17 },
      }
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
    setEditingSlotIndex(null); // Not editing, just adding

    const pkg = formData.packages.find((p: any) => p.id === packageId);

    setPackageFormData(pkg || packageFormData);

    setSlotFormData({
      times: [''],
      days: [],
      adultTiers: [{ min: 1, max: 10, price: 0 }],
      childTiers: [{ min: 1, max: 10, price: 0 }]
    });
    setSlotMode('auto');
    setSlotPicker({
      start: '',
      end: '',
      duration: 30,
      durationUnit: 'minutes',
      availableTimes: [],
      selectedTime: '',
    });
  };

  const handleEditSlot = (packageId: string, slotIndex: number) => {
    setIsAddingSlot(true);
    setEditingPackageId(packageId);
    setEditingSlotIndex(slotIndex);

    const pkg = formData.packages.find((p: any) => p.id === packageId);
    setPackageFormData(pkg || packageFormData);

    const slot = pkg?.slotConfigs?.[slotIndex];
    setSlotFormData(slot
      ? {
        times: slot.times || [''],
        days: slot.days || [],
        adultTiers: slot.adultTiers || [{ min: 1, max: 10, price: 0 }],
        childTiers: slot.childTiers || [{ min: 1, max: 10, price: 0 }]
      }
      : {
        times: [''],
        days: [],
        adultTiers: [{ min: 1, max: 10, price: 0 }],
        childTiers: [{ min: 1, max: 10, price: 0 }]
      }
    );
  };

  const handleTierChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    tierType: 'adultTiers' | 'childTiers',
    tierIndex: number,
    field: 'min' | 'max' | 'price'
  ) => {
    const { value } = e.target;
    const updatedTiers = [...slotFormData[tierType]];

    updatedTiers[tierIndex][field] = Number(value);

    setSlotFormData(prev => ({
      ...prev,
      [tierType]: updatedTiers
    }));
  };

  const handleAddTier = (tierType: 'adultTiers' | 'childTiers') => {
    setSlotFormData(prev => ({
      ...prev,
      [tierType]: [...prev[tierType], { min: 1, max: 10, price: 0 }]
    }));
  };

  const handleRemoveTier = (tierType: 'adultTiers' | 'childTiers', index: number) => {
    setSlotFormData(prev => ({
      ...prev,
      [tierType]: prev[tierType].filter((_, i) => i !== index)
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
    // Only keep non-empty slots
    const filteredTimes = slotFormData.times.filter(time => !!time && time.trim() !== '');

    if (filteredTimes.length === 0) {
      toast({
        message: 'Please add at least one valid time slot.',
        type: 'error',
      })
      return;
    }
    if (slotFormData.days.length === 0) {
      toast({
        message: 'Please select at least one day for the slot.',
        type: 'error',
      })
      return;
    }

    const slotData = {
      ...slotFormData,
      times: filteredTimes,
      adultTiers: slotFormData.adultTiers,
      childTiers: packageFormData.ageGroups?.child?.enabled
        ? slotFormData.childTiers
        : undefined,
    };

    const updatedPackages = formData.packages.map((pkg: any) => {
      if (pkg.id === editingPackageId) {
        const updatedSlotConfigs = pkg.slotConfigs ? [...pkg.slotConfigs] : [];
        if (editingSlotIndex !== null) {
          updatedSlotConfigs[editingSlotIndex] = slotData;
        } else {
          updatedSlotConfigs.push(slotData);
        }
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
    setEditingSlotIndex(null);
    setSlotFormData({
      times: [''],
      days: [],
      adultTiers: [{ min: 1, max: 10, price: 0 }],
      childTiers: [{ min: 1, max: 10, price: 0 }]
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


  useEffect(() => {
    if (slotMode === 'manual') {
      const availableTimes = getManualTimes(slotPicker.duration, slotPicker.durationUnit);
      setSlotPicker(prev => ({ ...prev, availableTimes, selectedTime: '' }));
    }
  }, [slotMode, slotPicker.duration, slotPicker.durationUnit]);

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
        <PackageAndSlotConfig
          formData={formData}
          handleAddSlot={handleAddSlot}
          handleEditPackage={handleEditPackage}
          handleRemovePackage={handleRemovePackage}
          handleEditSlot={handleEditSlot}
          handleRemoveSlot={handleRemoveSlot}
        />
      </div>
      <EditPackage
        isAddingPackage={isAddingPackage}
        isEditingPackage={isEditingPackage}
        setIsAddingPackage={setIsAddingPackage}
        setIsEditingPackage={setIsEditingPackage}
        packageFormData={packageFormData}
        setPackageFormData={setPackageFormData}
        handlePackageChange={handlePackageChange}
        handleSavePackage={handleSavePackage}
        handlePackageToggle={handlePackageToggle}
        selectedInclusionCategory={selectedInclusionCategory}
        setSelectedInclusionCategory={setSelectedInclusionCategory}
        selectedInclusionSubcategory={selectedInclusionSubcategory}
        setSelectedInclusionSubcategory={setSelectedInclusionSubcategory}
        setShowCustomInclusionForm={setShowCustomInclusionForm}
        showCustomInclusionForm={showCustomInclusionForm}
        customInclusionTitle={customInclusionTitle}
        setCustomInclusionTitle={setCustomInclusionTitle}
        customInclusionDescription={customInclusionDescription}
        setCustomInclusionDescription={setCustomInclusionDescription}
        handleAddInclusionFromCategory={handleAddInclusionFromCategory}
        handleAddInclusion={handleAddInclusion}
        handleRemoveInclusion={handleRemoveInclusion}
        newInclusion={newInclusion}
        setNewInclusion={setNewInclusion}
      />

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
              {/* Slot Picker */}
              <SlotPicker
              slotFormData={slotFormData}
              setSlotFormData={setSlotFormData}
              slotPicker={slotPicker}
              setSlotPicker={setSlotPicker}
              slotMode={slotMode}
              setSlotMode={setSlotMode}
              />
              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Available *
                </label>
                <button
                  type="button"
                  className="mb-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  onClick={() => setSlotFormData(prev => ({
                    ...prev,
                    days: prev.days.length === daysOfWeek.length ? [] : [...daysOfWeek]
                  }))}
                >
                  {slotFormData.days.length === daysOfWeek.length ? 'Clear All' : 'Select All'}
                </button>
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
                  <AdultAndChildTiers
                  slotFormData={slotFormData}
                  packageFormData={packageFormData}
                  handleTierChange={handleTierChange}
                  handleAddTier={handleAddTier}
                  handleRemoveTier={handleRemoveTier}
                  />
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
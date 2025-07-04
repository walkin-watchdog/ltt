import { useState, useEffect } from 'react';
import { X, Plus, Clock, Package, Trash2, Save } from 'lucide-react';
import dayjs from 'dayjs'; 
import { useToast } from '../ui/toaster';

// Add predefined categories and subcategories (same as ProductContentTab)
const predefinedCategories = {
  'Food and Drink': {
    items: ['Meals', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Bottled water', 'Alcoholic drinks'],
    descriptions: {
      'Meals': 'General meal provision',
      'Breakfast': 'Morning meal included',
      'Lunch': 'Midday meal included',
      'Dinner': 'Evening meal included',
      'Snacks': 'Light refreshments',
      'Beverages': 'Drinks and refreshments',
      'Bottled water': 'Complimentary water',
      'Alcoholic drinks': 'Alcoholic beverages'
    }
  },
  'Excess Charges': {
    items: ['Excess baggage', 'Overweight limit', 'Extra luggage fees', 'Oversized items'],
    descriptions: {
      'Excess baggage': 'Additional baggage beyond limits',
      'Overweight limit': 'Charges for overweight luggage',
      'Extra luggage fees': 'Additional luggage costs',
      'Oversized items': 'Charges for large items'
    }
  },
  'Transportation Amenities': {
    items: ['Private transportation', 'WiFi on board', 'Public transportation', 'Air conditioned vehicle', 'Pick-up and drop-off', 'Fuel surcharge'],
    descriptions: {
      'Private transportation': 'Dedicated vehicle service',
      'WiFi on board': 'Internet connectivity during travel',
      'Public transportation': 'Use of public transport systems',
      'Air conditioned vehicle': 'Climate controlled transport',
      'Pick-up and drop-off': 'Hotel/location transfers',
      'Fuel surcharge': 'Additional fuel costs'
    }
  },
  'Fees': {
    items: ['Landing and facility fees', 'Gratuities', 'Government fees', 'Entrance fees', 'Parking', 'Fuel surcharge', 'Airport/departure tax'],
    descriptions: {
      'Landing and facility fees': 'Airport and facility charges',
      'Gratuities': 'Tips and service charges',
      'Government fees': 'Official government charges',
      'Entrance fees': 'Admission to attractions',
      'Parking': 'Vehicle parking costs',
      'Fuel surcharge': 'Additional fuel costs',
      'Airport/departure tax': 'Airport taxes and fees'
    }
  },
  'Use of Equipment': {
    items: ['Use of SCUBA equipment', 'Use of Segway', 'Use of trikke', 'Use of snorkelling equipment', 'Use of bicycle', 'Booster seat', 'Locker', 'Safety equipment', 'Audio guides'],
    descriptions: {
      'Use of SCUBA equipment': 'Diving gear and equipment',
      'Use of Segway': 'Personal transportation device',
      'Use of trikke': 'Three-wheeled vehicle',
      'Use of snorkelling equipment': 'Swimming and diving gear',
      'Use of bicycle': 'Bicycle rental and use',
      'Booster seat': 'Child safety seat',
      'Locker': 'Storage facility',
      'Safety equipment': 'Safety gear and equipment',
      'Audio guides': 'Audio tour equipment'
    }
  }
} as const;

// Helper function to get description safely
const getDescription = (category: string, item: string): string => {
  const categoryData = predefinedCategories[category as keyof typeof predefinedCategories];
  return categoryData?.descriptions[item as keyof typeof categoryData.descriptions] || '';
};

interface Package {
  pricingType: string;
  ageGroups: any;
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
    endDate: '',
    pricingType: 'per_person',
    ageGroups: {
      adult: { enabled: true, min: 18, max: 99 },
      child: { enabled: false, min: 6, max: 17 },
    }
  });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [slotFormData, setSlotFormData] = useState<{
    times: string[];
    days: string[];
    adultTiers: { min: number; max: number; price: number }[];
    childTiers: { min: number; max: number; price: number }[];
  }>({
    times: [''],
    days: [],
    adultTiers: [{ min: 1, max: 10, price: 0 }],
    childTiers: [{ min: 1, max: 10, price: 0 }]
  });
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [slotPicker, setSlotPicker] = useState({
    start: '',
    end: '',
    duration: 30,
    durationUnit: 'minutes',
    availableTimes: [] as string[],
    selectedTime: '',
  });

  const [selectedInclusionCategory, setSelectedInclusionCategory] = useState('');
  const [selectedInclusionSubcategory, setSelectedInclusionSubcategory] = useState('');
  const [customInclusionTitle, setCustomInclusionTitle] = useState('');
  const [customInclusionDescription, setCustomInclusionDescription] = useState('');
  const [showCustomInclusionForm, setShowCustomInclusionForm] = useState(false);

  const getAvailableTimes = (start: string, end: string, duration: number, unit: string) => {
    if (!start || !end || !duration || duration <= 0) return [];
    const times: string[] = [];
    const today = dayjs().format('YYYY-MM-DD');
    let current = dayjs(`${today}T${start}`);
    let endTime = dayjs(`${today}T${end}`);
    if (endTime.isBefore(current)) endTime = endTime.add(1, 'day');
    const step = unit === 'hours' ? duration * 60 : duration;
    while (current.isBefore(endTime) || current.isSame(endTime)) {
      times.push(current.format('HH:mm'));
      current = current.add(step, 'minute');
    }
    return times;
  };
  const getManualTimes = (duration: number, unit: string) => {
    const times: string[] = [];
    const today = dayjs().format('YYYY-MM-DD');
    let current = dayjs(`${today}T00:00`);
    const step = 30;
    const end   = dayjs(`${today}T23:59`);
    while (current.isBefore(end)) {
      times.push(current.format('HH:mm'));
      current = current.add(step, 'minute');
    }
    return times;
  };
  const toast = useToast()
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
  const [slotMode, setSlotMode] = useState<'auto' | 'manual'>('auto');


  const handleTierChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    tierType: 'adultTiers' | 'childTiers',
    tierIndex: number,
    field: 'min' | 'max' | 'price'
  ) => {
    const { value } = e.target;
    const updatedTiers = [...slotFormData[tierType]];

    // All fields are numbers, so always assign Number(value)
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
  const calculateEffectivePrice = (basePrice: number, discountType: string, discountValue: number) => {
    if (discountType === 'percentage') {
      return basePrice * (1 - (discountValue / 100));
    } else if (discountType === 'fixed') {
      return Math.max(0, basePrice - discountValue);
    }
    return basePrice;
  };

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
                    Max Travellers per booking *
                  </label>
                  <input
                    type="number"
                    name="MaxTravellersPerBooking"
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
                      onChange={() => setPackageFormData(prev => ({ ...prev, pricingType: 'per_person'}))}
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
                      onChange={() => setPackageFormData(prev => ({ ...prev, pricingType: 'per_group' }))}
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
                        onChange={e => setPackageFormData(prev => ({
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
                        onChange={e => setPackageFormData(prev => ({
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
                        onChange={e => setPackageFormData(prev => ({
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
          {/* Slot Picker */}
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center text-sm font-medium">
              <input
                type="radio"
                checked={slotMode === 'auto'}
                onChange={() => setSlotMode('auto')}
                className="h-4 w-4 text-[#ff914d]"
              />
              <span className="ml-2">Generate Slots</span>
            </label>
            <label className="flex items-center text-sm font-medium">
              <input
                type="radio"
                checked={slotMode === 'manual'}
                onChange={() => setSlotMode('manual')}
                className="h-4 w-4 text-[#ff914d]"
              />
              <span className="ml-2">Custom</span>
            </label>
          </div>
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={slotPicker.start}
                  onChange={e => {
                    const start = e.target.value;
                    const availableTimes = getAvailableTimes(start, slotPicker.end, slotPicker.duration, slotPicker.durationUnit);
                    setSlotPicker(prev => ({
                      ...prev,
                      start,
                      availableTimes,
                      selectedTime: '',
                    }));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={slotPicker.end}
                  onChange={e => {
                    const end = e.target.value;
                    const availableTimes = getAvailableTimes(slotPicker.start, end, slotPicker.duration, slotPicker.durationUnit);
                    setSlotPicker(prev => ({
                      ...prev,
                      end,
                      availableTimes,
                      selectedTime: '',
                    }));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="number"
                  min={1}
                  value={slotPicker.duration}
                  onChange={e => {
                    const duration = Number(e.target.value);
                    const availableTimes = getAvailableTimes(slotPicker.start, slotPicker.end, duration, slotPicker.durationUnit);
                    setSlotPicker(prev => ({
                      ...prev,
                      duration,
                      availableTimes,
                      selectedTime: '',
                    }));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={slotPicker.durationUnit}
                  onChange={e => {
                    const durationUnit = e.target.value;
                    const availableTimes = getAvailableTimes(slotPicker.start, slotPicker.end, slotPicker.duration, durationUnit);
                    setSlotPicker(prev => ({
                      ...prev,
                      durationUnit,
                      availableTimes,
                      selectedTime: '',
                    }));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            </div>
            {slotMode === 'auto' && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {slotPicker.availableTimes.length} slot(s) will be created
                </span>
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  onClick={() =>
                    setSlotFormData(prev => ({ ...prev, times: slotPicker.availableTimes }))
                  }
                  disabled={slotPicker.availableTimes.length === 0}
                >
                  Generate all
                </button>
              </div>
            )}

            {slotMode === 'manual' && (
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={slotPicker.selectedTime}
                  onChange={e => setSlotPicker(prev => ({ ...prev, selectedTime: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select time to add</option>
                  {slotPicker.availableTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#ff914d] text-white rounded hover:bg-[#e8823d] text-sm"
                  onClick={() => {
                    if (slotPicker.selectedTime && !slotFormData.times.includes(slotPicker.selectedTime)) {
                      setSlotFormData(prev => ({
                        ...prev,
                        times: [...prev.times, slotPicker.selectedTime]
                      }));
                    }
                  }}
                  disabled={!slotPicker.selectedTime}
                >
                  Add Slot
                </button>
              </div>
            )}
          </div>
          {/* List of added slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Slots *
            </label>
            <div className="space-y-3">
              {slotFormData.times.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTimeSlot(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
                      <div className="flex">
                        <span className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-100 text-sm flex items-center">
                          {packageFormData.currency}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={tier.price}
                          onChange={(e) => handleTierChange(e, 'adultTiers', index, 'price')}
                          className="w-full px-2 py-1 border-y border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier('adultTiers', index)}
                        disabled={slotFormData.adultTiers.length <= 1}
                        className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed self-end"
                      >
                        <Trash2 className="h-5 w-5" />
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
              {packageFormData.ageGroups?.child?.enabled && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Child Pricing Tiers *
                    </label>
                    <span className="text-xs text-gray-500">
                      Consider accessibility needs for children
                    </span>
                  </div>
                  <div className="space-y-3">
                    {slotFormData.childTiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-md bg-green-50">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min </label>
                          <input
                            type="number"
                            min={0}
                            value={tier.min}
                            onChange={(e) => handleTierChange(e, 'childTiers', index, 'min')}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max </label>
                          <input
                            type="number"
                            min={tier.min}
                            max={17}
                            value={tier.max}
                            onChange={(e) => handleTierChange(e, 'childTiers', index, 'max')}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="flex">
                          <span className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-100 text-sm flex items-center">
                            {packageFormData.currency}
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={tier.price}
                            onChange={(e) => handleTierChange(e, 'childTiers', index, 'price')}
                            className="w-full px-2 py-1 border-y border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTier('childTiers', index)}
                          disabled={slotFormData.childTiers.length <= 1}
                          className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed self-end"
                        >
                          <Trash2 className="h-5 w-5" />
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
                    <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-md">
                      <strong>Note:</strong> Consider special pricing for children with accessibility needs or those requiring additional assistance
                    </div>
                  </div>
                </div>
              )}

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
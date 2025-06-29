import { useState } from 'react';
import { Plus, Trash2, Edit, Check, X, Clock } from 'lucide-react';

interface PriceTier {
  min: number;
  max: number;
  price: number;
  currency: string;
}

interface SlotConfig {
  times: string[];
  days: string[]; // <-- Add this line
  adultTiers: PriceTier[];
  childTiers: PriceTier[];
}

// ...existing code...

const defaultDayOptions = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

interface Package {
  id?: string;
  name: string;
  description: string;
  currency: string;
  inclusions: string[];
  slotConfigs: SlotConfig[];
  maxPeople: number;
  isActive: boolean;
  startDate: string; // required
  endDate?: string;  // optional
}

interface SchedulePriceTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

const defaultTimeOptions = [
  '7:00am', '8:00am', '9:00am', '10:00am', '11:00am', '12:00pm', '1:00pm',
  '2:00pm', '3:00pm'
];

const defaultTier = (currency: string): PriceTier => ({
  min: 0,
  max: 1,
  price: 0,
  currency,
});

const defaultSlotConfig = (currency: string): SlotConfig => ({
  times: [],
  days: [], // <-- Add this line
  adultTiers: [defaultTier(currency)],
  childTiers: [defaultTier(currency)],
});

const SlotConfigModal = ({
  open,
  onClose,
  slotConfigs,
  setSlotConfigs,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  slotConfigs: SlotConfig[];
  setSlotConfigs: (slots: SlotConfig[]) => void;
  currency: string;
}) => {
  const [localSlots, setLocalSlots] = useState<SlotConfig[]>(slotConfigs.length ? slotConfigs : [defaultSlotConfig(currency)]);
  const [customTimes, setCustomTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');

  // Combine default and custom times, unique
  const allTimes = Array.from(new Set([...defaultTimeOptions, ...customTimes])).sort((a, b) => {
    // Optional: sort by time if you want, else just alphabetical
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  const updateSlot = (idx: number, updates: Partial<SlotConfig>) => {
    setLocalSlots(slots =>
      slots.map((s, i) => (i === idx ? { ...s, ...updates } : s))
    );
  };


  const updateTier = (
    slotIdx: number,
    type: 'adultTiers' | 'childTiers',
    tierIdx: number,
    updates: Partial<PriceTier>
  ) => {
    setLocalSlots(slots =>
      slots.map((s, i) =>
        i === slotIdx
          ? {
              ...s,
              [type]: s[type].map((t, ti) =>
                ti === tierIdx ? { ...t, ...updates } : t
              ),
            }
          : s
      )
    );
  };

  const addTier = (slotIdx: number, type: 'adultTiers' | 'childTiers') => {
    setLocalSlots(slots =>
      slots.map((s, i) =>
        i === slotIdx
          ? {
              ...s,
              [type]: [...s[type], defaultTier(currency)],
            }
          : s
      )
    );
  };

  const removeTier = (slotIdx: number, type: 'adultTiers' | 'childTiers', tierIdx: number) => {
    setLocalSlots(slots =>
      slots.map((s, i) =>
        i === slotIdx
          ? {
              ...s,
              [type]: s[type].filter((_, ti) => ti !== tierIdx),
            }
          : s
      )
    );
  };

  const addSlot = () => setLocalSlots(slots => [...slots, defaultSlotConfig(currency)]);
  const removeSlot = (idx: number) => setLocalSlots(slots => slots.filter((_, i) => i !== idx));

  // Toggle time selection for a slot
// Toggle time selection for a slot
const toggleArrayValue = (arr: string[], value: string) =>
  arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

const selectAllDays = (idx: number) => {
  updateSlot(idx, { days: [...defaultDayOptions] });
};
const deselectAllDays = (idx: number) => {
  updateSlot(idx, { days: [] });
};
// Select all times for a slot
const selectAllTimes = (idx: number) => {
  updateSlot(idx, { times: [...allTimes] });
};

// Deselect all times for a slot
const deselectAllTimes = (idx: number) => {
  updateSlot(idx, { times: [] });
};

const handleAddTime = () => {
  const time = newTime.trim();
  if (time && !allTimes.includes(time)) {
    setCustomTimes([...customTimes, time]);
    setNewTime('');
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="mr-2" /> Configure Time Slots & Pricing
        </h3>
        {localSlots.map((slot, idx) => (
          <div key={idx} className="border rounded-lg p-4 mb-4">
            {/* Times Multi-select */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Add the times when these prices apply
              </label>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={slot.times.length === defaultTimeOptions.length}
                  onChange={e =>
                    e.target.checked ? selectAllTimes(idx) : deselectAllTimes(idx)
                  }
                  className="mr-2"
                  id={`select-all-times-${idx}`}
                />
                <label htmlFor={`select-all-times-${idx}`} className="text-xs font-medium text-gray-700">
                  Select all
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {defaultTimeOptions.map(time => (
                  <button
                    key={time}
                    type="button"
                    className={`px-3 py-1 rounded border ${slot.times.includes(time) ? 'bg-[#ff914d] text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => updateSlot(idx, { times: toggleArrayValue(slot.times, time) })}
                  >
                    {time}
                  </button>
                ))}
              </div>
              
                {/* Add custom time input */}
                <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  placeholder="Add custom time (e.g. 4:30pm)"
                  className="px-2 py-1 border rounded"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddTime();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="px-3 py-1 bg-[#ff914d] text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="mb-2">
  <label className="block text-xs font-medium text-gray-700 mb-1">
    Select days when these prices apply
  </label>
  <div className="flex items-center mb-2">
    <input
      type="checkbox"
      checked={slot.days.length === defaultDayOptions.length}
      onChange={e =>
        e.target.checked ? selectAllDays(idx) : deselectAllDays(idx)
      }
      className="mr-2"
      id={`select-all-days-${idx}`}
    />
    <label htmlFor={`select-all-days-${idx}`} className="text-xs font-medium text-gray-700">
      Select all
    </label>
  </div>
  <div className="flex flex-wrap gap-2">
    {defaultDayOptions.map(day => (
      <button
        key={day}
        type="button"
        className={`px-3 py-1 rounded border ${slot.days.includes(day) ? 'bg-[#ff914d] text-white' : 'bg-white text-gray-700'}`}
        onClick={() => updateSlot(idx, { days: toggleArrayValue(slot.days, day) })}
      >
        {day}
      </button>
    ))}
  </div>
</div>
            {/* Adult Tiers */}
            <div className="mb-2">
              <div className="font-semibold text-gray-800 mb-1">Adult Pricing Tiers</div>
              {slot.adultTiers.map((tier, ti) => (
                <div key={ti} className="flex gap-2 items-center mb-1">
                  <span className="text-xs">Min</span>
                  <input
                    type="number"
                    min={0}
                    value={tier.min}
                    onChange={e => updateTier(idx, 'adultTiers', ti, { min: parseInt(e.target.value) })}
                    className="w-14 px-1 py-0.5 border rounded"
                  />
                  <span className="text-xs">- Max</span>
                  <input
                    type="number"
                    min={tier.min}
                    value={tier.max}
                    onChange={e => updateTier(idx, 'adultTiers', ti, { max: parseInt(e.target.value) })}
                    className="w-14 px-1 py-0.5 border rounded"
                  />
                  <span className="text-xs">Price</span>
                  <input
                    type="number"
                    min={0}
                    value={tier.price}
                    onChange={e => updateTier(idx, 'adultTiers', ti, { price: parseFloat(e.target.value) })}
                    className="w-20 px-1 py-0.5 border rounded"
                  />
                  <span className="text-xs">{tier.currency}</span>
                  <button
                    type="button"
                    onClick={() => removeTier(idx, 'adultTiers', ti)}
                    className="text-red-400 hover:text-red-700"
                    title="Remove Tier"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTier(idx, 'adultTiers')}
                className="text-xs text-[#ff914d] hover:underline mt-1"
              >
                + Add another tier
              </button>
            </div>
            {/* Child Tiers */}
            <div>
              <div className="font-semibold text-gray-800 mb-1">Child Pricing Tiers</div>
              {slot.childTiers.map((tier, ti) => (
                <div key={ti} className="flex gap-2 items-center mb-1">
                  <span className="text-xs">Min</span>
                  <input
                    type="number"
                    min={0}
                    value={tier.min}
                    onChange={e => updateTier(idx, 'childTiers', ti, { min: parseInt(e.target.value) })}
                    className="w-14 px-1 py-0.5 border rounded"
                  />
                  <span className="text-xs">- Max</span>
                  <input
                    type="number"
                    min={tier.min}
                    value={tier.max}
                    onChange={e => updateTier(idx, 'childTiers', ti, { max: parseInt(e.target.value) })}
                    className="w-14 px-1 py-0.5 border rounded"
                  />
                  <span className="text-xs">Price</span>
                  <input
                    type="number"
                    min={0}
                    value={tier.price}
                    onChange={e => updateTier(idx, 'childTiers', ti, { price: parseFloat(e.target.value) })}
                    className="w-20 px-1 py-0.5 border rounded"
                  />
                  <span className="text-xs">{tier.currency}</span>
                  <button
                    type="button"
                    onClick={() => removeTier(idx, 'childTiers', ti)}
                    className="text-red-400 hover:text-red-700"
                    title="Remove Tier"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTier(idx, 'childTiers')}
                className="text-xs text-[#ff914d] hover:underline mt-1"
              >
                + Add another tier
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeSlot(idx)}
              className="mt-2 text-red-500 hover:text-red-700"
              title="Remove Slot"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSlot}
          className="mt-2 px-3 py-1 bg-[#ff914d] text-white rounded hover:bg-[#e8823d]"
        >
          + Add another slot
        </button>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setSlotConfigs(localSlots);
              onClose();
            }}
            className="px-4 py-2 bg-[#ff914d] text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


export const SchedulePriceTab = ({ formData, updateFormData }: SchedulePriceTabProps) => {
  const [packages, setPackages] = useState<Package[]>(formData.packages || []);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [showSlotConfig, setShowSlotConfig] = useState(false);
  const [slotConfigIndex, setSlotConfigIndex] = useState<number | null>(null);

  const [newPackage, setNewPackage] = useState<Package>({
    name: '',
    description: '',
    currency: 'INR',
    inclusions: [],
    slotConfigs: [],
    maxPeople: 1,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
  ];

  const addPackage = () => {
    if (newPackage.name && newPackage.description && newPackage.startDate) {
      const updatedPackages = [...packages, { ...newPackage }];
      setPackages(updatedPackages);
      updateFormData({ packages: updatedPackages });
      setNewPackage({
        name: '',
        description: '',
        currency: 'INR',
        inclusions: [],
        slotConfigs: [],
        maxPeople: 1,
        isActive: true,
        startDate: '',
        endDate: '',
      });
    }
  };

  const updatePackage = (index: number, updates: Partial<Package>) => {
    const updatedPackages = packages.map((pkg, i) =>
      i === index ? { ...pkg, ...updates } : pkg
    );
    setPackages(updatedPackages);
    updateFormData({ packages: updatedPackages });
  };

  const removePackage = (index: number) => {
    const updatedPackages = packages.filter((_, i) => i !== index);
    setPackages(updatedPackages);
    updateFormData({ packages: updatedPackages });
  };

  const addInclusionToPackage = (packageIndex: number, inclusion: string) => {
    if (inclusion.trim()) {
      const updatedPackages = packages.map((pkg, i) =>
        i === packageIndex
          ? { ...pkg, inclusions: [...pkg.inclusions, inclusion.trim()] }
          : pkg
      );
      setPackages(updatedPackages);
      updateFormData({ packages: updatedPackages });
    }
  };

  const removeInclusionFromPackage = (packageIndex: number, inclusionIndex: number) => {
    const updatedPackages = packages.map((pkg, i) =>
      i === packageIndex
        ? { ...pkg, inclusions: pkg.inclusions.filter((_, ii) => ii !== inclusionIndex) }
        : pkg
    );
    setPackages(updatedPackages);
    updateFormData({ packages: updatedPackages });
  };

  const PackageInclusionsInput = ({ packageIndex, inclusions }: { packageIndex: number; inclusions: string[] }) => {
    const [inputValue, setInputValue] = useState('');
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions</label>
        <div className="space-y-2">
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add inclusion"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInclusionToPackage(packageIndex, inputValue);
                  setInputValue('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                addInclusionToPackage(packageIndex, inputValue);
                setInputValue('');
              }}
              className="px-4 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {inclusions.map((inclusion, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                <span className="text-sm">{inclusion}</span>
                <button
                  type="button"
                  onClick={() => removeInclusionFromPackage(packageIndex, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Base Pricing */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Base Product Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => updateFormData({ price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Price (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.discountPrice || ''}
              onChange={(e) => updateFormData({ discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Package Management */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Package Options*</h3>
          <span className="text-sm text-gray-500">{packages.length} packages configured</span>
        </div>

        {/* Existing Packages */}
        <div className="space-y-4 mb-6">
          {packages.map((pkg, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">{pkg.name}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(editingPackage === index ? null : index)}
                    className="p-2 text-gray-400 hover:text-[#ff914d] transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePackage(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {editingPackage === index ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => updatePackage(index, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max People</label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.maxPeople}
                        onChange={(e) => updatePackage(index, { maxPeople: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={pkg.currency}
                        onChange={(e) => updatePackage(index, { currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      >
                        {currencies.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date*</label>
        <input
          type="date"
          value={pkg.startDate}
          onChange={e => updatePackage(index, { startDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
        <input
          type="date"
          value={pkg.endDate || ''}
          onChange={e => updatePackage(index, { endDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={pkg.description}
                      onChange={(e) => updatePackage(index, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    />
                  </div>
                  <PackageInclusionsInput packageIndex={index} inclusions={pkg.inclusions} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slots & Pricing*
                    </label>
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors"
                      onClick={() => {
                        setSlotConfigIndex(index);
                        setShowSlotConfig(true);
                      }}
                    >
                      Configure Time Slots & Pricing
                    </button>
                    {pkg.slotConfigs && pkg.slotConfigs.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        {pkg.slotConfigs.length} slot(s) configured
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                  {/* SlotConfigModal for editing */}
                  {showSlotConfig && slotConfigIndex === index && (
                    <SlotConfigModal
                      open={showSlotConfig}
                      onClose={() => setShowSlotConfig(false)}
                      slotConfigs={packages[index].slotConfigs}
                      setSlotConfigs={slotConfigs => {
                        updatePackage(index, { slotConfigs });
                        setShowSlotConfig(false);
                      }}
                      currency={pkg.currency}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                  <span className="text-sm text-gray-500">Max {pkg.maxPeople} people</span>
                  {pkg.inclusions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Includes: </span>
                      <span className="text-sm text-gray-600">{pkg.inclusions.join(', ')}</span>
                    </div>
                  )}
                  {pkg.slotConfigs && pkg.slotConfigs.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {pkg.slotConfigs.length} slot(s) configured
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Package */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Package</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Type*
                </label>
                <input
                  type="text"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  placeholder="Enter package type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max People*</label>
                <input
                  type="number"
                  min="1"
                  value={newPackage.maxPeople}
                  onChange={(e) => setNewPackage({ ...newPackage, maxPeople: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={newPackage.currency}
                  onChange={(e) => setNewPackage({ ...newPackage, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date*</label>
    <input
      type="date"
      value={newPackage.startDate}
      onChange={e => setNewPackage({ ...newPackage, startDate: e.target.value })}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      required
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
    <input
      type="date"
      value={newPackage.endDate || ''}
      onChange={e => setNewPackage({ ...newPackage, endDate: e.target.value })}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
    />
  </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
              <textarea
                rows={3}
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Describe what's included in this package"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slots & Pricing*
              </label>
              <button
                type="button"
                className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors"
                onClick={() => {
                  setSlotConfigIndex(-1);
                  setShowSlotConfig(true);
                }}
              >
                Configure Time Slots & Pricing
              </button>
              {newPackage.slotConfigs && newPackage.slotConfigs.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {newPackage.slotConfigs.length} slot(s) configured
                </div>
              )}
            </div>
            <PackageInclusionsInput packageIndex={-1} inclusions={newPackage.inclusions} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addPackage}
                disabled={!newPackage.name || !newPackage.description}
                className="flex items-center px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </button>
            </div>
            {/* SlotConfigModal for new package */}
            {showSlotConfig && slotConfigIndex === -1 && (
              <SlotConfigModal
                open={showSlotConfig}
                onClose={() => setShowSlotConfig(false)}
                slotConfigs={newPackage.slotConfigs}
                setSlotConfigs={slotConfigs => {
                  setNewPackage(np => ({ ...np, slotConfigs }));
                  setShowSlotConfig(false);
                }}
                currency={newPackage.currency}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
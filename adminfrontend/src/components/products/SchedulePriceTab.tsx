import { useState } from 'react';
import { Plus, Trash2, Edit, Check, X, Calendar, AlertCircle } from 'lucide-react';

interface Package {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  inclusions: string[];
  maxPeople: number;
  isActive: boolean;
}

interface SchedulePriceTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export const SchedulePriceTab = ({ formData, updateFormData }: SchedulePriceTabProps) => {
  const [packages, setPackages] = useState<Package[]>(formData.packages || []);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [newPackage, setNewPackage] = useState<Package>({
    name: '',
    description: '',
    price: 0,
    currency: 'INR',
    inclusions: [],
    maxPeople: 1,
    isActive: true,
  });

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
  ];

  const packageTypes = [
    'Car Only',
    'Car + Driver',
    'Car + Guide',
    'Car + Guide + Entry Tickets',
    'Car + Guide + Entry Tickets + Lunch',
    'Accommodation Package',
    'Full Service Package',
    'Group Package',
    'Private Package',
    'Premium Package',
  ];

  const addPackage = () => {
    if (newPackage.name && newPackage.description) {
      const updatedPackages = [...packages, { ...newPackage }];
      setPackages(updatedPackages);
      updateFormData({ packages: updatedPackages });
      setNewPackage({
        name: '',
        description: '',
        price: 0,
        currency: 'INR',
        inclusions: [],
        maxPeople: 1,
        isActive: true,
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
          <h3 className="text-lg font-semibold text-gray-900">Package Options</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <input
                        type="number"
                        min="0"
                        value={pkg.price}
                        onChange={(e) => updatePackage(index, { price: parseFloat(e.target.value) })}
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
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-[#ff914d]">
                      {currencies.find(c => c.code === pkg.currency)?.symbol}{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">Max {pkg.maxPeople} people</span>
                  </div>
                  {pkg.inclusions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Includes: </span>
                      <span className="text-sm text-gray-600">{pkg.inclusions.join(', ')}</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                <select
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                  <option value="">Select package type</option>
                  {packageTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max People</label>
                <input
                  type="number"
                  min="1"
                  value={newPackage.maxPeople}
                  onChange={(e) => setNewPackage({ ...newPackage, maxPeople: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  min="0"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Describe what's included in this package"
              />
            </div>
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
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Availability Period
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.availabilityStartDate || ''}
              onChange={(e) => updateFormData({ availabilityStartDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The first date when this product will be available for booking
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="date"
              value={formData.availabilityEndDate || ''}
              onChange={(e) => updateFormData({ availabilityEndDate: e.target.value })}
              min={formData.availabilityStartDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for ongoing availability. If set, product won't be available after this date.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Availability Management</h4>
              <p className="text-sm text-blue-700 mt-1">
                After creating the product, you can manage specific date availability in the Availability section. 
                You'll be able to block specific dates, mark them as sold out, or set them as not operating.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
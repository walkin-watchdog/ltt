import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Percent, DollarSign } from 'lucide-react';

interface SpecialOffer {
  id?: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'group';
  value: number;
  validFrom: string;
  validUntil: string;
  minParticipants?: number;
  maxDiscount?: number;
  isActive: boolean;
}

interface SpecialOffersTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export const SpecialOffersTab = ({ formData, updateFormData }: SpecialOffersTabProps) => {
  const [offers, setOffers] = useState<SpecialOffer[]>(formData.specialOffers || []);
  const [newOffer, setNewOffer] = useState<SpecialOffer>({
    title: '',
    description: '',
    type: 'percentage',
    value: 0,
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const addOffer = () => {
    if (newOffer.title && newOffer.description && newOffer.validFrom && newOffer.validUntil) {
      const updatedOffers = [...offers, { ...newOffer }];
      setOffers(updatedOffers);
      updateFormData({ specialOffers: updatedOffers });
      setNewOffer({
        title: '',
        description: '',
        type: 'percentage',
        value: 0,
        validFrom: '',
        validUntil: '',
        isActive: true,
      });
    }
  };

  const removeOffer = (index: number) => {
    const updatedOffers = offers.filter((_, i) => i !== index);
    setOffers(updatedOffers);
    updateFormData({ specialOffers: updatedOffers });
  };

  const updateOffer = (index: number, updates: Partial<SpecialOffer>) => {
    const updatedOffers = offers.map((offer, i) => 
      i === index ? { ...offer, ...updates } : offer
    );
    setOffers(updatedOffers);
    updateFormData({ specialOffers: updatedOffers });
  };

  const offerTypes = [
    { value: 'percentage', label: 'Percentage Discount', icon: Percent },
    { value: 'fixed', label: 'Fixed Amount Off', icon: DollarSign },
    { value: 'bogo', label: 'Buy One Get One', icon: Plus },
    { value: 'group', label: 'Group Discount', icon: Plus },
  ];

  return (
    <div className="space-y-8">
      {/* Special Offers Management */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Time-Limited Special Offers</h3>
          <span className="text-sm text-gray-500">{offers.length} offers configured</span>
        </div>

        {/* Existing Offers */}
        <div className="space-y-4 mb-6">
          {offers.map((offer, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    offer.type === 'percentage' ? 'bg-blue-100 text-blue-600' :
                    offer.type === 'fixed' ? 'bg-green-100 text-green-600' :
                    offer.type === 'bogo' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {offerTypes.find(t => t.value === offer.type)?.icon && 
                      React.createElement(offerTypes.find(t => t.value === offer.type)!.icon, { className: 'h-4 w-4' })
                    }
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-gray-900">{offer.title}</h4>
                    <p className="text-sm text-gray-600">{offer.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offer.isActive}
                      onChange={(e) => updateOffer(index, { isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ff914d]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff914d]"></div>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOffer(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={offer.type}
                    onChange={(e) => updateOffer(index, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                    {offerTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value {offer.type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={offer.type === 'percentage' ? 100 : undefined}
                    value={offer.value}
                    onChange={(e) => updateOffer(index, { value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={offer.validFrom}
                    onChange={(e) => updateOffer(index, { validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={offer.validUntil}
                    onChange={(e) => updateOffer(index, { validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  />
                </div>
              </div>

              {(offer.type === 'group' || offer.type === 'percentage') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {offer.type === 'group' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Participants
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={offer.minParticipants || ''}
                        onChange={(e) => updateOffer(index, { minParticipants: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="e.g., 5"
                      />
                    </div>
                  )}
                  {offer.type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={offer.maxDiscount || ''}
                        onChange={(e) => updateOffer(index, { maxDiscount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        placeholder="e.g., 5000"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validUntil).toLocaleDateString()}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {offer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Offer */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Create New Special Offer</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Offer Title</label>
                <input
                  type="text"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  placeholder="e.g., Early Bird Special"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                <select
                  value={newOffer.type}
                  onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                  {offerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={2}
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Describe the offer and its terms"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value {newOffer.type === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={newOffer.type === 'percentage' ? 100 : undefined}
                  value={newOffer.value}
                  onChange={(e) => setNewOffer({ ...newOffer, value: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                <input
                  type="date"
                  value={newOffer.validFrom}
                  onChange={(e) => setNewOffer({ ...newOffer, validFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                <input
                  type="date"
                  value={newOffer.validUntil}
                  onChange={(e) => setNewOffer({ ...newOffer, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addOffer}
                disabled={!newOffer.title || !newOffer.description || !newOffer.validFrom || !newOffer.validUntil}
                className="flex items-center px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Special Offer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Promotions */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Promotion Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableHolidayPricing"
              checked={formData.enableHolidayPricing || false}
              onChange={(e) => updateFormData({ enableHolidayPricing: e.target.checked })}
              className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
            />
            <label htmlFor="enableHolidayPricing" className="ml-2 block text-sm text-gray-700">
              Enable Holiday Premium Pricing (+20%)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableOffSeasonDiscount"
              checked={formData.enableOffSeasonDiscount || false}
              onChange={(e) => updateFormData({ enableOffSeasonDiscount: e.target.checked })}
              className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
            />
            <label htmlFor="enableOffSeasonDiscount" className="ml-2 block text-sm text-gray-700">
              Enable Off-Season Discount (-15%)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
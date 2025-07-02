import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface BookingDetailsTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

interface CancellationTerm {
  timeframe: string;
  refundPercent: number;
  description: string;
}

interface CustomRequirementField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export const BookingDetailsTab = ({ formData, updateFormData }: BookingDetailsTabProps) => {
  const [activePolicyTab, setActivePolicyTab] = useState<'standard' | 'custom'>('standard');

  const predefinedPolicies = {
    standard: {
      label: 'Standard (Recommended)',
      description: 'Full refund 24+ hours before, no refund after',
      freeCancellationHours: 24,
      partialRefundPercent: 0,
      noRefundAfterHours: 24,
      terms: [
        { timeframe: '24+ hours before start', refundPercent: 100, description: 'Full refund available' },
        { timeframe: 'Less than 24 hours', refundPercent: 0, description: 'No refund available' }
      ]
    },
    moderate: {
      label: 'Moderate',
      description: 'Full refund 4+ days before, 50% refund 3-6 days before',
      freeCancellationHours: 96, // 4 days
      partialRefundPercent: 50,
      noRefundAfterHours: 72, // 3 days
      terms: [
        { timeframe: '4+ days before start', refundPercent: 100, description: 'Full refund available' },
        { timeframe: '3-6 days before start', refundPercent: 50, description: '50% refund available' },
        { timeframe: 'Less than 3 days', refundPercent: 0, description: 'No refund available' }
      ]
    },
    strict: {
      label: 'Strict',
      description: 'Full refund 7+ days before, 50% refund 3-6 days before',
      freeCancellationHours: 168, // 7 days
      partialRefundPercent: 50,
      noRefundAfterHours: 72, // 3 days
      terms: [
        { timeframe: '7+ days before start', refundPercent: 100, description: 'Full refund available' },
        { timeframe: '3-6 days before start', refundPercent: 50, description: '50% refund available' },
        { timeframe: 'Less than 3 days', refundPercent: 0, description: 'No refund available' }
      ]
    },
    no_refund: {
      label: 'All Sales Final',
      description: 'No refunds regardless of cancellation timing',
      freeCancellationHours: 0,
      partialRefundPercent: 0,
      noRefundAfterHours: 0,
      terms: [
        { timeframe: 'Any time before start', refundPercent: 0, description: 'No refunds available' }
      ]
    }
  };

  const handlePolicyTypeChange = (policyType: string) => {
    if (policyType === 'custom') {
      updateFormData({ 
        cancellationPolicyType: 'custom',
        cancellationTerms: formData.cancellationTerms || []
      });
      setActivePolicyTab('custom');
    } else {
      const policy = predefinedPolicies[policyType as keyof typeof predefinedPolicies];
      updateFormData({
        cancellationPolicyType: policyType,
        freeCancellationHours: policy.freeCancellationHours,
        partialRefundPercent: policy.partialRefundPercent,
        noRefundAfterHours: policy.noRefundAfterHours,
        cancellationTerms: policy.terms,
        cancellationPolicy: `${policy.label}: ${policy.description}\n\n${policy.terms.map(term => 
          `• ${term.timeframe}: ${term.refundPercent}% refund - ${term.description}`
        ).join('\n')}`
      });
      setActivePolicyTab('standard');
    }
  };

  const addCustomTerm = () => {
    const newTerm: CancellationTerm = {
      timeframe: '',
      refundPercent: 100,
      description: ''
    };
    updateFormData({
      cancellationTerms: [...(formData.cancellationTerms || []), newTerm]
    });
  };

  const updateCustomTerm = (index: number, updates: Partial<CancellationTerm>) => {
    const updatedTerms = [...(formData.cancellationTerms || [])];
    updatedTerms[index] = { ...updatedTerms[index], ...updates };
    updateFormData({ cancellationTerms: updatedTerms });
    
    // Auto-generate policy text from terms
    const policyText = updatedTerms.map(term => 
      `• ${term.timeframe}: ${term.refundPercent}% refund - ${term.description}`
    ).join('\n');
    updateFormData({ cancellationPolicy: policyText });
  };

  const removeCustomTerm = (index: number) => {
    const updatedTerms = (formData.cancellationTerms || []).filter((_: any, i: number) => i !== index);
    updateFormData({ cancellationTerms: updatedTerms });
    
    // Auto-generate policy text from updated terms
    const policyText = updatedTerms.map((term: CancellationTerm) => 
      `• ${term.timeframe}: ${term.refundPercent}% refund - ${term.description}`
    ).join('\n');
    updateFormData({ cancellationPolicy: policyText });
  };

  const addCustomRequirement = () => {
    const newField: CustomRequirementField = {
      id: `custom_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    updateFormData({
      customRequirementFields: [...(formData.customRequirementFields || []), newField]
    });
  };

  const updateCustomRequirement = (index: number, updates: Partial<CustomRequirementField>) => {
    const updatedFields = [...(formData.customRequirementFields || [])];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    updateFormData({ customRequirementFields: updatedFields });
  };

  const removeCustomRequirement = (index: number) => {
    const updatedFields = formData.customRequirementFields.filter((_: any, i: number) => i !== index);
    updateFormData({ customRequirementFields: updatedFields });
  };

  return (
    <div className="space-y-8">
      {/* Booking Process */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmation Type
            </label>
            <select
              value={formData.confirmationType || 'instant'}
              onChange={(e) => updateFormData({ confirmationType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            >
              <option value="instant">Instant Confirmation</option>
              <option value="delayed">Manual Confirmation</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cut-off Time (hours before start)
            </label>
            <input
              type="number"
              min="0"
              value={formData.cutoffTime || 24}
              onChange={(e) => updateFormData({ cutoffTime: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Participants
            </label>
            <input
              type="number"
              min="1"
              value={formData.minParticipants || 1}
              onChange={(e) => updateFormData({ minParticipants: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Participants
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => updateFormData({ capacity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="10"
            />
          </div>
        </div>
      </div>

      {/* Pricing Type */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pricing Type
            </label>
            <select
              value={formData.pricingType || 'per_person'}
              onChange={(e) => updateFormData({ pricingType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            >
              <option value="per_person">Per Person</option>
              <option value="per_group">Per Group</option>
              <option value="per_vehicle">Per Vehicle</option>
              <option value="flat_rate">Flat Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.childDiscount || 50}
              onChange={(e) => updateFormData({ childDiscount: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child Age Limit
            </label>
            <input
              type="number"
              min="0"
              max="18"
              value={formData.childAgeLimit || 12}
              onChange={(e) => updateFormData({ childAgeLimit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Discount (for 10+ people)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.groupDiscount || 10}
              onChange={(e) => updateFormData({ groupDiscount: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="10"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Cancellation Policy */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
        
        {/* Policy Type Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Policy Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(predefinedPolicies).map(([key, policy]) => (
                <div key={key} className="relative">
                  <input
                    type="radio"
                    id={`policy_${key}`}
                    name="cancellationPolicyType"
                    value={key}
                    checked={formData.cancellationPolicyType === key}
                    onChange={(e) => handlePolicyTypeChange(e.target.value)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`policy_${key}`}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.cancellationPolicyType === key
                        ? 'border-[#ff914d] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{policy.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{policy.description}</div>
                  </label>
                </div>
              ))}
              
              <div className="relative">
                <input
                  type="radio"
                  id="policy_custom"
                  name="cancellationPolicyType"
                  value="custom"
                  checked={formData.cancellationPolicyType === 'custom'}
                  onChange={(e) => handlePolicyTypeChange(e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="policy_custom"
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.cancellationPolicyType === 'custom'
                      ? 'border-[#ff914d] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">Custom Policy</div>
                  <div className="text-xs text-gray-600 mt-1">Create your own cancellation terms</div>
                </label>
              </div>
            </div>
          </div>

          {/* Custom Policy Builder */}
          {formData.cancellationPolicyType === 'custom' && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Custom Cancellation Terms</h4>
                <button
                  type="button"
                  onClick={addCustomTerm}
                  className="flex items-center px-3 py-2 text-sm bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Term
                </button>
              </div>

              {formData.cancellationTerms?.map((term: CancellationTerm, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Term {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomTerm(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Timeframe
                      </label>
                      <input
                        type="text"
                        value={term.timeframe}
                        onChange={(e) => updateCustomTerm(index, { timeframe: e.target.value })}
                        placeholder="e.g., 7+ days before"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Refund Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={term.refundPercent}
                        onChange={(e) => updateCustomTerm(index, { refundPercent: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={term.description}
                        onChange={(e) => updateCustomTerm(index, { description: e.target.value })}
                        placeholder="e.g., Full refund available"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(!formData.cancellationTerms || formData.cancellationTerms.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No cancellation terms added yet.</p>
                  <p className="text-sm">Click "Add Term" to create custom cancellation rules.</p>
                </div>
              )}
            </div>
          )}

          {/* Final Policy Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Policy Text *
            </label>
            <textarea
              rows={6}
              value={formData.cancellationPolicy || ''}
              onChange={(e) => updateFormData({ cancellationPolicy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="This will be auto-generated for standard policies, or enter custom policy text..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will appear on booking confirmations and vouchers
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Information Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Information Required from Travelers</h3>
        <div className="space-y-6">
          
          {/* Standard Requirements */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Standard Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requirePhone"
                  checked={formData.requirePhone || false}
                  onChange={(e) => updateFormData({ requirePhone: e.target.checked })}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <label htmlFor="requirePhone" className="ml-2 block text-sm text-gray-700">
                  Phone Number Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireId"
                  checked={formData.requireId || false}
                  onChange={(e) => updateFormData({ requireId: e.target.checked })}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <label htmlFor="requireId" className="ml-2 block text-sm text-gray-700">
                  Photo ID Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireAge"
                  checked={formData.requireAge || false}
                  onChange={(e) => updateFormData({ requireAge: e.target.checked })}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <label htmlFor="requireAge" className="ml-2 block text-sm text-gray-700">
                  Age Verification Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireMedical"
                  checked={formData.requireMedical || false}
                  onChange={(e) => updateFormData({ requireMedical: e.target.checked })}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <label htmlFor="requireMedical" className="ml-2 block text-sm text-gray-700">
                  Medical Information Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireDietary"
                  checked={formData.requireDietary || false}
                  onChange={(e) => updateFormData({ requireDietary: e.target.checked })}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <label htmlFor="requireDietary" className="ml-2 block text-sm text-gray-700">
                  Dietary Restrictions
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireEmergencyContact"
                  checked={formData.requireEmergencyContact || false}
                  onChange={(e) => updateFormData({ requireEmergencyContact: e.target.checked })}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <label htmlFor="requireEmergencyContact" className="ml-2 block text-sm text-gray-700">
                  Emergency Contact Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requirePassportDetails"
                  checked={formData.requirePassportDetails || false}
                  onChange={(e) => updateFormData({ requirePassportDetails: e.target.checked })}
                  className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                />
                <label htmlFor="requirePassportDetails" className="ml-2 block text-sm text-gray-700">
                  Passport Details (for international travelers)
                </label>
              </div>
            </div>
          </div>

          {/* Additional Requirements Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information Requirements
            </label>
            <textarea
              rows={3}
              value={formData.additionalRequirements || ''}
              onChange={(e) => updateFormData({ additionalRequirements: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="Any other information needed from travelers..."
            />
          </div>

          {/* Custom Requirement Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Custom Requirement Fields</h4>
              <button
                type="button"
                onClick={addCustomRequirement}
                className="flex items-center px-3 py-2 text-sm bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Field
              </button>
            </div>

            {formData.customRequirementFields?.map((field: CustomRequirementField, index: number) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg border space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Custom Field {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomRequirement(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomRequirement(index, { label: e.target.value })}
                      placeholder="e.g., Fitness Level"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomRequirement(index, { type: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
                    >
                      <option value="text">Text Input</option>
                      <option value="textarea">Text Area</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required_${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateCustomRequirement(index, { required: e.target.checked })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                      />
                      <label htmlFor={`required_${field.id}`} className="ml-2 text-xs text-gray-700">
                        Required
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Placeholder/Help Text
                  </label>
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => updateCustomRequirement(index, { placeholder: e.target.value })}
                    placeholder="Help text for travelers"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
                  />
                </div>

                {field.type === 'select' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => updateCustomRequirement(index, { 
                        options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt) 
                      })}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
                    />
                  </div>
                )}
              </div>
            ))}

            {(!formData.customRequirementFields || formData.customRequirementFields.length === 0) && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <p>No custom requirement fields added yet.</p>
                <p className="text-sm">Click "Add Custom Field" to create additional information requirements.</p>
              </div>
            )}
          </div>
        </div>
         {/* Package Person Phone Number */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Person Phone Number</h3>
        <input
          type="text"
          value={formData.phonenumber || ''}
          onChange={(e) => updateFormData({ phonenumber: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          placeholder="Enter phone number for package contact"
        />
        <p className="text-xs text-gray-500 mt-1">
          This number will be used for package-related queries and communication.
        </p>
      </div>
      </div>

      {/* Payment Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              value={formData.paymentType || 'full'}
              onChange={(e) => updateFormData({ paymentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            >
              <option value="full">Full Payment Required</option>
              <option value="partial">Partial Payment Allowed</option>
              <option value="deposit">Deposit Required</option>
            </select>
          </div>

          {formData.paymentType === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Payment (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.minimumPaymentPercent || 50}
                onChange={(e) => updateFormData({ minimumPaymentPercent: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="50"
              />
            </div>
          )}

          {formData.paymentType === 'deposit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.depositAmount || 1000}
                onChange={(e) => updateFormData({ depositAmount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="1000"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
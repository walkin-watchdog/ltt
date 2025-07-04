import { Plus, Trash2 } from 'lucide-react';

interface TravelerRequirementsTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

interface CustomRequirementField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export const TravelerRequirementsTab = ({ formData, updateFormData }: TravelerRequirementsTabProps) => {
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
      {/* Information Required from Travelers */}
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
              {formData.requirePassportDetails && (
                <div className="ml-7 mt-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Details
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="passportDetailsOption"
                        value="advance"
                        checked={formData.passportDetailsOption === 'advance'}
                        onChange={() => updateFormData({ passportDetailsOption: 'advance' })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700 text-sm">
                        We need passport details before the day of travel
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="passportDetailsOption"
                        value="day"
                        checked={formData.passportDetailsOption === 'day'}
                        onChange={() => updateFormData({ passportDetailsOption: 'day' })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700 text-sm">
                        We just need to see passports on the day of travel
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="passportDetailsOption"
                        value="both"
                        checked={formData.passportDetailsOption === 'both'}
                        onChange={() => updateFormData({ passportDetailsOption: 'both' })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700 text-sm">
                        We need passport details in advance and we need to see passports on the day of travel
                      </span>
                    </label>
                  </div>
                </div>
              )}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Contact Information</h3>
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
    </div>
  );
};
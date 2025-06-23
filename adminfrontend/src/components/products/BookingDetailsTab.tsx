interface BookingDetailsTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export const BookingDetailsTab = ({ formData, updateFormData }: BookingDetailsTabProps) => {
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

      {/* Cancellation Policy */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy *
            </label>
            <textarea
              rows={6}
              value={formData.cancellationPolicy}
              onChange={(e) => updateFormData({ cancellationPolicy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="Enter detailed cancellation policy..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Cancellation (hours)
              </label>
              <input
                type="number"
                min="0"
                value={formData.freeCancellationHours || 24}
                onChange={(e) => updateFormData({ freeCancellationHours: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partial Refund (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.partialRefundPercent || 50}
                onChange={(e) => updateFormData({ partialRefundPercent: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Refund After (hours)
              </label>
              <input
                type="number"
                min="0"
                value={formData.noRefundAfterHours || 12}
                onChange={(e) => updateFormData({ noRefundAfterHours: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="12"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Information Needed from Travelers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Information Required from Travelers</h3>
        <div className="space-y-4">
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
          </div>

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

interface BookingProcessTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export const BookingProcessTab = ({ formData, updateFormData }: BookingProcessTabProps) => {
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
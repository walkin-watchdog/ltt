import { useAuth } from "../../contexts/AuthContext";
import type { EditProps } from "../../types/index.ts";

export const EditModel: React.FC<EditProps> = ({
saveError,
modalData,
setSaveError,
fetchData,
setModalData,
setIsModalOpen,
products,
editingAvailability,
setEditingAvailability,
}) => {  
      const { token} = useAuth();
     const handleSave = async () => {
        // Validate form data
        if (!modalData.productId || !modalData.startDate) {
          setSaveError('Please fill in all required fields');
          return;
        }
    
        // Validate date is not in the past (unless editing existing)
        const selectedDate = new Date(modalData.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!editingAvailability && selectedDate < today) {
          setSaveError('Cannot set availability for past dates');
          return;
        }
    
        setSaveError('');
    
        try {
          const url = editingAvailability 
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/${editingAvailability.id}`
            : `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability`;
          
          const method = editingAvailability ? 'PUT' : 'POST';
          
          // Prepare data with proper field names
          const requestData = {
            productId: modalData.productId,
            startDate: modalData.startDate,
            endDate: modalData.endDate || null,
            status: modalData.status
          };
          
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });
    
          if (response.ok) {
            fetchData();
            setIsModalOpen(false);
            setEditingAvailability(null);
            setSaveError('');
            setModalData({
              productId: '',
              startDate: '',
              endDate: '',
              status: 'AVAILABLE'
            });
          } else {
            const errorData = await response.json();
            setSaveError(errorData.message || 'Failed to save availability');
          }
        } catch (error) {
          console.error('Error saving availability:', error);
          setSaveError('Network error. Please try again.');
        }
      };
    
    return (
     (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {editingAvailability ? 'Edit Availability' : 'Add Availability'}
        </h3>
        
        {saveError && (
          <div className={`mb-4 p-3 border rounded-md text-sm ${
            saveError.includes('successfully') 
              ? 'bg-green-100 border-green-300 text-green-700'
              : 'bg-red-100 border-red-300 text-red-700'
          }`}>
            {saveError}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
            <select
              value={modalData.productId}
              onChange={(e) => setModalData(prev => ({ ...prev, productId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              disabled={Boolean(editingAvailability)}
              required
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.title} ({product.productCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
            <input
              type="date"
              value={modalData.startDate}
              onChange={(e) => setModalData(prev => ({ ...prev, startDate: e.target.value }))}
              min={editingAvailability ? undefined : new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              required
            />
            {!editingAvailability && (
              <p className="text-xs text-gray-500 mt-1">Cannot select past dates for new availability</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
            <input
              type="date"
              value={modalData.endDate}
              onChange={(e) => setModalData(prev => ({ ...prev, endDate: e.target.value }))}
              min={modalData.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for ongoing availability (forever)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={modalData.status}
              onChange={(e) => setModalData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            >
              <option value="AVAILABLE">Available</option>
              <option value="SOLD_OUT">Sold Out</option>
              <option value="NOT_OPERATING">Not Operating</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingAvailability(null);
                setSaveError('');
                setModalData({
                  productId: '',
                  startDate: '',
                  endDate: '',
                  status: 'AVAILABLE'
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!modalData.productId || !modalData.startDate}
              className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
)
}
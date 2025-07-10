import React from 'react';
import type { Product, BlockDatesProps } from '../../types/index.ts';

export const BlockDates: React.FC<BlockDatesProps> = ({
  saveError,
  selectedProduct,
  setSelectedProduct,
  products,
  blockDates,
  setBlockDates,
  setIsBlockModalOpen,
  handleBulkBlock,
  isDateAlreadyBlocked,
  setSaveError
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Block Dates</h3>
        
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            >
              <option value="">Select Product</option>
              {products.map((product: Product) => (
                <option key={product.id} value={product.id}>
                  {product.title} ({product.productCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Dates</label>
            <input
              type="date"
              onChange={(e) => {
                const date = e.target.value;
                if (date && !blockDates.selectedDates.includes(date)) {
                  // Check if date is already blocked
                  if (selectedProduct && isDateAlreadyBlocked(selectedProduct, date)) {
                    setSaveError(`Date ${new Date(date).toLocaleDateString('en-IN')} is already blocked for this product`);
                    return;
                  }
                  setBlockDates(prev => ({ 
                    ...prev, 
                    selectedDates: [...prev.selectedDates, date] 
                  }));
                  setSaveError(''); // Clear any previous error
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Click to add multiple dates</p>
          </div>

          {/* Selected Dates Display */}
          {blockDates.selectedDates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Dates:</label>
              <div className="flex flex-wrap gap-2">
                {blockDates.selectedDates.map((date, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
                  >
                    {new Date(date).toLocaleDateString('en-IN')}
                    <button
                      onClick={() => {
                        setBlockDates(prev => ({
                          ...prev,
                          selectedDates: prev.selectedDates.filter((_, i) => i !== index)
                        }));
                      }}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
            <input
              type="text"
              value={blockDates.reason}
              onChange={(e) => setBlockDates(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g., Maintenance, Holiday, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsBlockModalOpen(false);
                setBlockDates({ selectedDates: [], reason: '' });
                setSaveError('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkBlock}
              disabled={!selectedProduct || blockDates.selectedDates.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Block Dates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
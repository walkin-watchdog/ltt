import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AvailabilityFormData) => void;
  date: Date | null;
  products: any[];
  selectedProduct: string;
  selectedDates?: Date[];
  isBulkEdit?: boolean;
  initialData?: {
    status: string;
    available: number;
  };
}

export interface AvailabilityFormData {
  productId: string;
  date: Date | null;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  available: number;
  dates?: Date[];
}

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  date,
  products,
  selectedProduct,
  selectedDates = [],
  isBulkEdit = false,
  initialData
}) => {
  const [formData, setFormData] = useState<AvailabilityFormData>({
    productId: selectedProduct,
    date: date,
    status: 'AVAILABLE',
    available: 0,
    dates: isBulkEdit ? selectedDates : undefined
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        status: initialData.status as 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING',
        available: initialData.available
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      productId: selectedProduct,
      date: date,
      dates: isBulkEdit ? selectedDates : undefined
    }));
  }, [initialData, date, selectedProduct, selectedDates, isBulkEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'available' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isBulkEdit 
              ? `Edit Availability for ${selectedDates.length} Dates` 
              : `Edit Availability for ${date ? format(date, 'MMMM d, yyyy') : 'Date'}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                disabled={Boolean(selectedProduct)}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.title} ({product.productCode})
                  </option>
                ))}
              </select>
            </div>

            {isBulkEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Dates
                </label>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                  {selectedDates.length} dates selected from {selectedDates.length > 0 ? format(selectedDates[0], 'MMM d, yyyy') : ''} 
                  {selectedDates.length > 1 ? ` to ${format(selectedDates[selectedDates.length - 1], 'MMM d, yyyy')}` : ''}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD_OUT">Sold Out</option>
                <option value="NOT_OPERATING">Not Operating</option>
              </select>
            </div>

            {formData.status === 'AVAILABLE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Capacity
                </label>
                <input
                  type="number"
                  name="available"
                  value={formData.available}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d]"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
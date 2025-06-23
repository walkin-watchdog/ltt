import { useState } from 'react';
import { Upload, X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProductContentTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export const ProductContentTab = ({ formData, updateFormData }: ProductContentTabProps) => {
    const {token} = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach(file => {
        uploadFormData.append('images', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Make sure token is included
        },
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        const newImages = data.images.map((img: any) => img.url);
        updateFormData({
          images: [...(formData.images || []), ...newImages]
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    updateFormData({ images: newImages });
  };

  const addToArray = (field: string, value: string) => {
    if (value.trim()) {
      const currentArray = formData[field] || [];
      updateFormData({
        [field]: [...currentArray, value.trim()]
      });
    }
  };

  const removeFromArray = (field: string, index: number) => {
    const currentArray = formData[field] || [];
    updateFormData({
      [field]: currentArray.filter((_: any, i: number) => i !== index)
    });
  };

  const ArrayInput = ({ label, field, placeholder }: { label: string; field: string; placeholder: string }) => {
    const [inputValue, setInputValue] = useState('');
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="space-y-2">
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(field, inputValue);
                  setInputValue('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                addToArray(field, inputValue);
                setInputValue('');
              }}
              className="px-4 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {(formData[field] || []).map((item: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                <span className="text-sm">{item}</span>
                <button
                  type="button"
                  onClick={() => removeFromArray(field, index)}
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
      {/* Images Gallery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formData.images?.map((image: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label htmlFor="images" className="cursor-pointer">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB each</p>
          </label>
        </div>
      </div>

      {/* Product Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Enter product title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Code *
          </label>
          <input
            type="text"
            value={formData.productCode}
            onChange={(e) => updateFormData({ productCode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="e.g., LT001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => updateFormData({ type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          >
            <option value="TOUR">Tour</option>
            <option value="EXPERIENCE">Experience</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => updateFormData({ category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="e.g., Heritage, Adventure, Culinary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="e.g., Delhi, India"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => updateFormData({ duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="e.g., 3 hours, Full day, 2 days"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity *
          </label>
          <input
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => updateFormData({ capacity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Maximum number of participants"
            required
          />
        </div>

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
            placeholder="0"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          placeholder="Detailed description of the tour/experience"
          required
        />
      </div>

      {/* Array Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArrayInput
          label="Highlights"
          field="highlights"
          placeholder="Add a highlight"
        />
        <ArrayInput
          label="Inclusions"
          field="inclusions"
          placeholder="Add an inclusion"
        />
        <ArrayInput
          label="Exclusions"
          field="exclusions"
          placeholder="Add an exclusion"
        />
        <ArrayInput
          label="Tags"
          field="tags"
          placeholder="Add a tag"
        />
      </div>

      {/* Meeting & Pickup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Point
          </label>
          <textarea
            rows={3}
            value={formData.meetingPoint || ''}
            onChange={(e) => updateFormData({ meetingPoint: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Describe the meeting point location"
          />
        </div>

        <ArrayInput
          label="Pickup Locations"
          field="pickupLocations"
          placeholder="Add a pickup location"
        />
      </div>

      {/* Tour Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty || ''}
            onChange={(e) => updateFormData({ difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          >
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Challenging">Challenging</option>
            <option value="Extreme">Extreme</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Health Restrictions
          </label>
          <textarea
            rows={3}
            value={formData.healthRestrictions || ''}
            onChange={(e) => updateFormData({ healthRestrictions: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Any health restrictions or requirements"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accessibility
          </label>
          <textarea
            rows={3}
            value={formData.accessibility || ''}
            onChange={(e) => updateFormData({ accessibility: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            placeholder="Accessibility information"
          />
        </div>
      </div>

      {/* Guides and Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArrayInput
          label="Guides"
          field="guides"
          placeholder="Add guide name"
        />
        <ArrayInput
          label="Languages"
          field="languages"
          placeholder="Add language"
        />
      </div>

      {/* Itinerary (for Tours only) */}
      {formData.type === 'TOUR' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Itinerary
          </label>
          <textarea
            rows={6}
            value={formData.itinerary ? JSON.stringify(formData.itinerary, null, 2) : ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateFormData({ itinerary: parsed });
              } catch {
                // Invalid JSON, don't update
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent font-mono text-sm"
            placeholder="Enter itinerary as JSON format"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: {"{"}"day1": "Description", "day2": "Description"{"}"}
          </p>
        </div>
      )}
    </div>
  );
};
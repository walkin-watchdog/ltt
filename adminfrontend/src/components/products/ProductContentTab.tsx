import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/toaster';
import { X, Plus, Image as ImageIcon, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProductContentTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  images: string[];
}

export const ProductContentTab = ({ formData, updateFormData }: ProductContentTabProps) => {
  const { token } = useAuth();
  const toast = useToast();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const [newActivity, setNewActivity] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach(file => {
        uploadFormData.append('images', file);
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/products`,
        uploadFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: ev => {
            const pct = Math.round((ev.loaded * 100) / (ev.total || 1));
            setUploadProgress(pct);   // ➌ live %
          },
        },
      );

      const { images } = res.data as { images: Array<{ url: string }> };
      updateFormData({ images: [...(formData.images || []), ...images.map(i => i.url)] });
      toast({ message: 'Images uploaded successfully', type: 'success' });
    } catch (error) {
      let errorMessage = 'Image upload failed';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast({ message: errorMessage, type: 'error' });
    } finally {
    }
  };

  const handleItineraryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingDay) return;

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach(file => {
        uploadFormData.append('images', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        const newImages = data.images.map((img: any) => img.url);
        setEditingDay({
          ...editingDay,
          images: [...(editingDay.images || []), ...newImages]
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    updateFormData({ images: newImages });
  };

  const removeItineraryImage = (index: number) => {
    if (!editingDay) return;
    const newImages = editingDay.images.filter((_: any, i: number) => i !== index);
    setEditingDay({
      ...editingDay,
      images: newImages
    });
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

  const addActivity = () => {
    if (newActivity.trim() && editingDay) {
      setEditingDay({
        ...editingDay,
        activities: [...editingDay.activities, newActivity.trim()]
      });
      setNewActivity('');
    }
  };

  const removeActivity = (index: number) => {
    if (!editingDay) return;
    setEditingDay({
      ...editingDay,
      activities: editingDay.activities.filter((_, i) => i !== index)
    });
  };

  const saveItineraryDay = () => {
    if (!editingDay) return;
    
    const currentItinerary = formData.itinerary || [];
    const existingIndex = currentItinerary.findIndex((day: ItineraryDay) => day.day === editingDay.day);
    
    let updatedItinerary;
    if (existingIndex >= 0) {
      updatedItinerary = [...currentItinerary];
      updatedItinerary[existingIndex] = editingDay;
    } else {
      updatedItinerary = [...currentItinerary, editingDay].sort((a, b) => a.day - b.day);
    }
    
    updateFormData({ itinerary: updatedItinerary });
    setEditingDay(null);
    setShowItineraryBuilder(false);
  };

  const createNewDay = () => {
    const currentItinerary = formData.itinerary || [];
    const nextDay = currentItinerary.length > 0 ? Math.max(...currentItinerary.map((d: ItineraryDay) => d.day)) + 1 : 1;
    
    setEditingDay({
      day: nextDay,
      title: '',
      description: '',
      activities: [],
      images: []
    });
    setShowItineraryBuilder(true);
  };

  const editDay = (day: ItineraryDay) => {
    setEditingDay({ ...day });
    setShowItineraryBuilder(true);
  };

  const removeDay = (dayNumber: number) => {
    const currentItinerary = formData.itinerary || [];
    const updatedItinerary = currentItinerary.filter((day: ItineraryDay) => day.day !== dayNumber);
    updateFormData({ itinerary: updatedItinerary });
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
        {uploadProgress !== null && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-[#ff914d] h-2.5 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
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
              {uploadProgress !== null ? `${uploadProgress}%` : 'Click to upload images or drag and drop'}
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
          <div className="flex items-center justify-between mb-4">
            <label className="block text-md font-medium text-gray-700">
              Itinerary
            </label>
            <button
              type="button"
              onClick={createNewDay}
              className="flex items-center px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Days
            </button>
          </div>

          {/* Existing Itinerary Days */}
          {formData.itinerary && formData.itinerary.length > 0 && (
            <div className="space-y-4 mb-6">
              {formData.itinerary.map((day: ItineraryDay) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Day {day.day}: {day.title}</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => editDay(day)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDay(day.day)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{day.description}</p>
                  {day.activities.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Activities:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {day.activities.map((activity, idx) => (
                          <li key={idx}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {day.images.length > 0 && (
                    <div className="flex space-x-2 mt-2">
                      {day.images.slice(0, 3).map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-12 h-12 object-cover rounded" />
                      ))}
                      {day.images.length > 3 && (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                          +{day.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Itinerary Builder Modal */}
          {showItineraryBuilder && editingDay && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Day {editingDay.day} Itinerary
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItineraryBuilder(false);
                      setEditingDay(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Day Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day Title *
                    </label>
                    <input
                      type="text"
                      value={editingDay.title}
                      onChange={(e) => setEditingDay({ ...editingDay, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="e.g., Explore Old Delhi"
                    />
                  </div>

                  {/* Day Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      value={editingDay.description}
                      onChange={(e) => setEditingDay({ ...editingDay, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Brief description of the day's activities"
                    />
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activities
                    </label>
                    <div className="space-y-2">
                      <div className="flex">
                        <input
                          type="text"
                          value={newActivity}
                          onChange={(e) => setNewActivity(e.target.value)}
                          placeholder="Add an activity"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addActivity();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addActivity}
                          className="px-4 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {editingDay.activities.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-sm">{activity}</span>
                            <button
                              type="button"
                              onClick={() => removeActivity(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (Optional)
                    </label>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {editingDay.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Day ${editingDay.day} ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeItineraryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="itinerary-images"
                        multiple
                        accept="image/*"
                        onChange={handleItineraryImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="itinerary-images" className="cursor-pointer">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">
                          {uploadProgress !== null ? `${uploadProgress}%` : 'Upload day images'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowItineraryBuilder(false);
                        setEditingDay(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveItineraryDay}
                      className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors"
                      disabled={!editingDay.title || !editingDay.description}
                    >
                      Save Day
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
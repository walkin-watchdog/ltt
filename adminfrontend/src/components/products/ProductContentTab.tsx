import { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, Image as ImageIcon, PlusCircle, Calendar } from 'lucide-react';
// import { useToast } from '@/components/ui/toaster';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { DestinationModal } from './DestinationModal';
import { ExperienceCategoryModal } from './ExperienceCategoryModal';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  images: string[];
}

interface ProductContentTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export const ProductContentTab = ({ formData, updateFormData }: ProductContentTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // ...existing code...
  const [newItem, setNewItem] = useState<{
    highlight: string;
    inclusion: string;
    inclusionText?: string;
    exclusion: string;
    exclusionText?: string;
    tag: string;
    pickupLocation: string;
    guide: string;
    language: string;
  }>({
    highlight: '',
    inclusion: '',
    inclusionText: '',
    exclusion: '',
    exclusionText: '',
    tag: '',
    pickupLocation: '',
    guide: '',
    language: '',
  });
  // ...existing code...
  const { token } = useAuth();
  // const toast = useToast();
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const [newActivity, setNewActivity] = useState('');
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [experienceCategories, setExperienceCategories] = useState<any[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [pickupOption, setPickupOption] = useState(formData.pickupOption || '');

  const healthRestrictionOptions = [
    "Not recommended for travelers with back problems",
    "Not recommended for pregnant travelers",
    "Not recommended for travelers with heart problems or other serious medical conditions"
  ];
  const [customHealthRestrictions, setCustomHealthRestrictions] = useState<string[]>([]);
  const [newCustomHealthRestriction, setNewCustomHealthRestriction] = useState('');

  useEffect(() => {
    if (formData.itineraries && formData.itineraries.length > 0) {
      updateFormData({ itinerary: formData.itineraries });
    }
    fetchDestinations();
    fetchExperienceCategories();
  }, []);

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

    // First check if we need to use itinerary or itineraries
    const currentItinerary = formData.itinerary || formData.itineraries || [];
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
    const currentItinerary = formData.itinerary || formData.itineraries || [];
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
    const currentItinerary = formData.itinerary || formData.itineraries || [];
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

  const fetchDestinations = async () => {
    try {
      setIsLoadingDestinations(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/destinations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDestinations(data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  const fetchExperienceCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/experience-categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setExperienceCategories(data);
      }
    } catch (error) {
      console.error('Error fetching experience categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      files.forEach(file => {
        uploadFormData.append('images', file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/products`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data && response.data.images) {
        const newImages = response.data.images.map((img: any) => img.url);
        updateFormData({ images: [...(formData.images || []), ...newImages] });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    updateFormData({
      images: formData.images.filter((_: any, i: number) => i !== index)
    });
  };

  const addItem = (field: string, value: string) => {
    if (!value.trim()) return;

    updateFormData({
      [field]: [...formData[field], value.trim()]
    });

    setNewItem(prev => ({ ...prev, [field]: '' }));
  };

  const removeItem = (field: string, index: number) => {
    updateFormData({
      [field]: formData[field].filter((_: any, i: number) => i !== index)
    });
  };

  const handleDestinationSelect = (destination: any) => {
    updateFormData({
      location: destination.name,
      destinationId: destination.id
    });
    setIsDestinationModalOpen(false);
  };

  const handleCategorySelect = (category: any) => {
    updateFormData({
      category: category.name,
      experienceCategoryId: category.id
    });
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Images */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {formData.images.map((image: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="h-32 w-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center text-gray-600 hover:text-[#ff914d]"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="mb-2 relative w-10 h-10">
                    <svg className="w-10 h-10 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d={`M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold">{uploadProgress}%</span>
                    </div>
                  </div>
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 mb-1" />
                  <span className="text-sm">Add Images</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Basic Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
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
              placeholder="Enter unique product code"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="Enter detailed description"
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
              required
            >
              <option value="TOUR">Tour</option>
              <option value="EXPERIENCE">Experience</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="flex">
              <select
                value={formData.location}
                onChange={(e) => updateFormData({
                  location: e.target.value,
                  destinationId: destinations.find(d => d.name === e.target.value)?.id || null
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                required
              >
                <option value="">Select a location</option>
                {destinations.map(destination => (
                  <option key={destination.id} value={destination.name}>
                    {destination.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsDestinationModalOpen(true)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
            {isLoadingDestinations && (
              <p className="text-sm text-gray-500 mt-1">Loading destinations...</p>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="flex">
              <select
                value={formData.category}
                onChange={(e) => updateFormData({
                  category: e.target.value,
                  experienceCategoryId: experienceCategories.find(c => c.name === e.target.value)?.id || null
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {experienceCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
            {isLoadingCategories && (
              <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
            )}
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
              placeholder="e.g., 3 hours, 2 days"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Capacity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => updateFormData({ capacity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="Max number of people"
              required
            />
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Highlights */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
          <div className="space-y-4">
            <div className="flex">
              <input
                type="text"
                value={newItem.highlight}
                onChange={(e) => setNewItem({ ...newItem, highlight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a highlight"
              />
              <button
                type="button"
                onClick={() => addItem('highlights', newItem.highlight)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {formData.highlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700">{highlight}</span>
                    <button
                      onClick={() => removeItem('highlights', index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {formData.highlights.length === 0 && (
                  <li className="p-3 text-gray-500 text-center">No highlights added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Inclusions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inclusions</h3>
          <div className="space-y-4">
            <div className="flex mb-2">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                value={newItem.inclusion}
                onChange={e => {
                  const value = e.target.value;
                  if (value && value !== 'Other') {
                    addItem('inclusions', value);
                    setNewItem(prev => ({ ...prev, inclusion: '' }));
                  } else {
                    setNewItem(prev => ({ ...prev, inclusion: value }));
                  }
                }}
              >
                <option value="">Add from predefined...</option>
                <option value="Food and drink">Food and drink</option>
                <option value="Excess charges">Excess charges</option>
                <option value="Transportation amenities">Transportation amenities</option>
                <option value="Fees">Fees</option>
                <option value="Use of Equipment">Use of Equipment</option>
                <option value="Other">Other</option>
              </select>
              {newItem.inclusion === 'Other' && (
                <>
                  <input
                    type="text"
                    value={newItem.inclusionText || ''}
                    onChange={e => setNewItem(prev => ({ ...prev, inclusionText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent ml-2"
                    placeholder="Add a custom inclusion"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newItem.inclusionText?.trim()) {
                        addItem('inclusions', newItem.inclusionText);
                        setNewItem(prev => ({ ...prev, inclusion: '', inclusionText: '' }));
                      }
                    }}
                    className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors ml-2"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {formData.inclusions.map((inclusion: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700">{inclusion}</span>
                    <button
                      onClick={() => removeItem('inclusions', index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {formData.inclusions.length === 0 && (
                  <li className="p-3 text-gray-500 text-center">No inclusions added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Exclusions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exclusions</h3>
          <div className="space-y-4">
            <div className="flex mb-2">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                value={newItem.exclusion}
                onChange={e => {
                  const value = e.target.value;
                  if (value && value !== 'Other') {
                    addItem('exclusions', value);
                    setNewItem(prev => ({ ...prev, exclusion: '' }));
                  } else {
                    setNewItem(prev => ({ ...prev, exclusion: value }));
                  }
                }}
              >
                <option value="">Add from predefined...</option>
                <option value="Food and drink">Food and drink</option>
                <option value="Excess charges">Excess charges</option>
                <option value="Transportation amenities">Transportation amenities</option>
                <option value="Fees">Fees</option>
                <option value="Use of Equipment">Use of Equipment</option>
                <option value="Other">Other</option>
              </select>
              {newItem.exclusion === 'Other' && (
                <>
                  <input
                    type="text"
                    value={newItem.exclusionText || ''}
                    onChange={e => setNewItem(prev => ({ ...prev, exclusionText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent ml-2"
                    placeholder="Add a custom exclusion"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newItem.exclusionText?.trim()) {
                        addItem('exclusions', newItem.exclusionText);
                        setNewItem(prev => ({ ...prev, exclusion: '', exclusionText: '' }));
                      }
                    }}
                    className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors ml-2"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {formData.exclusions.map((exclusion: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700">{exclusion}</span>
                    <button
                      onClick={() => removeItem('exclusions', index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {formData.exclusions.length === 0 && (
                  <li className="p-3 text-gray-500 text-center">No exclusions added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="space-y-4">
            <div className="flex">
              <input
                type="text"
                value={newItem.tag}
                onChange={(e) => setNewItem({ ...newItem, tag: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={() => addItem('tags', newItem.tag)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div>
            <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
                {formData.tags.map((tag: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{tag}</span>
                    <button
                      onClick={() => removeItem('tags', index)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {formData.tags.length === 0 && (
                  <li className="p-3 text-gray-500 text-center">No Tags added</li>
                )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
          <div className="space-y-4">
            <div className="flex">
              <input
                type="text"
                value={newItem.language}
                onChange={(e) => setNewItem({ ...newItem, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a language"
              />
              <button
                type="button"
                onClick={() => addItem('languages', newItem.language)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div>
            <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
                {formData.languages.map((language: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{language}</span>
                    <button
                      onClick={() => removeItem('languages', index)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {formData.languages.length === 0 && (
                  <li className="p-3 text-gray-500 text-center">No Languages added</li>
                )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Guides */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Guides</h3>
          <div className="space-y-4">
            <div className="flex">
              <input
                type="text"
                value={newItem.guide}
                onChange={(e) => setNewItem({ ...newItem, guide: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a guide"
              />
              <button
                type="button"
                onClick={() => addItem('guides', newItem.guide)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {formData.guides.map((guide: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700">{guide}</span>
                    <button
                      onClick={() => removeItem('guides', index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {formData.guides.length === 0 && (
                  <li className="p-3 text-gray-500 text-center">No guides added</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <option value="Difficult">Difficult</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accessibility
            </label>
            <select
              value={formData.accessibility || ''}
              onChange={(e) => updateFormData({ accessibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            >
              <option value="">Select accessibility level</option>
              <option value="Fully accessible">Fully accessible</option>
              <option value="Partially accessible">Partially accessible</option>
              <option value="Not wheelchair accessible">Not wheelchair accessible</option>
              <option value="Limited mobility friendly">Limited mobility friendly</option>
            </select>
          </div>
          <div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health restrictions
              </label>
              <span className="block text-sm text-gray-500 mb-3">Check all that apply</span>
              <div className="space-y-3 mb-4">
                {healthRestrictionOptions.map(option => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.healthRestrictions) && formData.healthRestrictions.includes(option)}
                      onChange={e => {
                        let updated: string[] = Array.isArray(formData.healthRestrictions) ? [...formData.healthRestrictions] : [];
                        if (e.target.checked) {
                          updated.push(option);
                        } else {
                          updated = updated.filter(item => item !== option);
                        }
                        updateFormData({ healthRestrictions: updated });
                      }}
                      className="h-4 w-4 border-gray-300 rounded focus:ring-[#ff914d] accent-[#ff914d]"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
                {customHealthRestrictions.map((custom, idx) => (
                  <label key={custom} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.healthRestrictions) && formData.healthRestrictions.includes(custom)}
                      onChange={e => {
                        let updated: string[] = Array.isArray(formData.healthRestrictions) ? [...formData.healthRestrictions] : [];
                        if (e.target.checked) {
                          updated.push(custom);
                        } else {
                          updated = updated.filter(item => item !== custom);
                        }
                        updateFormData({ healthRestrictions: updated });
                      }}
                      className="h-4 w-4 border-gray-300 rounded focus:ring-[#ff914d] accent-[#ff914d]"
                    />
                    <span className="text-gray-700">{custom}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        setCustomHealthRestrictions(customHealthRestrictions.filter((_, i) => i !== idx));
                        if (Array.isArray(formData.healthRestrictions) && formData.healthRestrictions.includes(custom)) {
                          updateFormData({
                            healthRestrictions: formData.healthRestrictions.filter((item: string) => item !== custom)
                          });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </label>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="text-[#ff914d] hover:underline font-medium"
                  onClick={() => {
                    if (newCustomHealthRestriction.trim()) {
                      setCustomHealthRestrictions([...customHealthRestrictions, newCustomHealthRestriction.trim()]);
                      setNewCustomHealthRestriction('');
                    }
                  }}
                >
                  + Add another
                </button>
                <input
                  type="text"
                  value={newCustomHealthRestriction}
                  onChange={e => setNewCustomHealthRestriction(e.target.value)}
                  placeholder="Custom restriction"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCustomHealthRestriction.trim()) {
                      setCustomHealthRestrictions([...customHealthRestrictions, newCustomHealthRestriction.trim()]);
                      setNewCustomHealthRestriction('');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Options</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Option *
          </label>
          <select
            value={pickupOption}
            onChange={e => {
              setPickupOption(e.target.value);
              updateFormData({ pickupOption: e.target.value });
              if (e.target.value === 'We pick up all travelers') {
                updateFormData({ meetingPoint: '' });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            required
          >
            <option value="">Select pickup option</option>
            <option value="We pick up all travelers">We pick up all travelers</option>
            <option value="We can pick up travelers or meet them at a meeting point">
              We can pick up travelers or meet them at a meeting point
            </option>
            <option value="No, we meet all travelers at a meeting point">
              No, we meet all travelers at a meeting point
            </option>
          </select>
        </div>

        {(pickupOption === 'We can pick up travelers or meet them at a meeting point' ||
          pickupOption === 'No, we meet all travelers at a meeting point') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Point *
              </label>
              <textarea
                rows={3}
                value={formData.meetingPoint || ''}
                onChange={e => updateFormData({ meetingPoint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Describe the meeting point..."
                required
              />
            </div>
          )}
      </div>

      {/* Pickup Locations */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Locations</h3>
        <div className="space-y-4">
          <div className="flex">
            <input
              type="text"
              value={newItem.pickupLocation}
              onChange={(e) => setNewItem({ ...newItem, pickupLocation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="Add a pickup location"
            />
            <button
              type="button"
              onClick={() => addItem('pickupLocations', newItem.pickupLocation)}
              className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {formData.pickupLocations.map((location: string, index: number) => (
                <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                  <span className="text-gray-700">{location}</span>
                  <button
                    onClick={() => removeItem('pickupLocations', index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {formData.pickupLocations.length === 0 && (
                <li className="p-3 text-gray-500 text-center">No pickup locations added</li>
              )}
            </ul>
          </div>
        </div>
      </div>

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

      {/* Destination Modal */}
      {isDestinationModalOpen && (
        <DestinationModal
          isOpen={isDestinationModalOpen}
          onClose={() => setIsDestinationModalOpen(false)}
          onSelect={handleDestinationSelect}
        />
      )}

      {/* Experience Category Modal */}
      {isCategoryModalOpen && (
        <ExperienceCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSelect={handleCategorySelect}
        />
      )}
    </div>
  );
};
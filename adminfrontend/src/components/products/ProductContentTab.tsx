import { ImageUploader } from '../gallery/ImageUploader';
import { useState, useEffect } from 'react';
import { X, Plus, PlusCircle, Calendar, Info, Image, Route, MapPin, Star, Settings, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DestinationModal } from './DestinationModal';
import { ExperienceCategoryModal } from './ExperienceCategoryModal';
import { useToast } from '../ui/toaster';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: ItineraryActivity[]; // Changed from string[] to ItineraryActivity[]
  images: string[];
}

interface ItineraryActivity {
  location: string;
  isStop?: boolean;
  stopDuration?: number; // in minutes
  inclusions?: string[];
  exclusions?: string[];
  order?: number;
}

interface ProductContentTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

const contentTabs = [
  { id: 'basic', name: 'Basic Info', icon: Info },
  { id: 'images', name: 'Images', icon: Image },
  { id: 'itinerary', name: 'Itinerary', icon: Route },
  { id: 'pickup', name: 'Pickup Options', icon: MapPin },
  { id: 'content', name: 'Content Elements', icon: Star },
  { id: 'details', name: 'Additional Details', icon: Settings },
  { id: 'guides', name: 'Guides & Languages', icon: Users },
];

export const ProductContentTab = ({ formData, updateFormData }: ProductContentTabProps) => {
  const [activeContentTab, setActiveContentTab] = useState('basic');
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
    accessibilityFeature?: string;
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
    accessibilityFeature: '',
  });
  const toast = useToast();
  const { token } = useAuth();
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const [newActivity, setNewActivity] = useState<ItineraryActivity>({
    location: '',
    isStop: false,
    stopDuration: undefined,
    inclusions: [],
    exclusions: [],
    order: 0,
  });
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
  }, [formData.itineraries]);

  const validateTab = (tabId: string) => {
    switch (tabId) {
      case 'basic':
        return formData.title && formData.productCode && formData.description &&
          formData.type && formData.location && formData.duration && formData.capacity;
      case 'images':
        return formData.images && formData.images.length > 0;
      case 'itinerary':
        return formData.type !== 'TOUR' || (formData.itinerary && formData.itinerary.length > 0);
      case 'pickup':
        return formData.pickupOption;
      case 'content':
        return true;
      case 'details':
        return true;
      case 'guides':
        return true;
      default:
        return true;
    }
  };


  const validateTabWithToast = (tabId: string): boolean => {
    switch (tabId) {
      case 'basic':
        const missingBasicFields = [];
        if (!formData.title) missingBasicFields.push('Title');
        if (!formData.productCode) missingBasicFields.push('Product Code');
        if (!formData.description) missingBasicFields.push('Description');
        if (!formData.type) missingBasicFields.push('Product Type');
        if (!formData.location) missingBasicFields.push('Location');
        if (!formData.duration) missingBasicFields.push('Duration');
        if (!formData.capacity) missingBasicFields.push('Max Capacity');
        if (formData.type === 'EXPERIENCE' && !formData.category) missingBasicFields.push('Category');

        if (missingBasicFields.length > 0) {
          toast({
            message:`Please fill the following required fields: ${missingBasicFields.join(', ')}`,
              type: 'error'
          })
          return false;
        }
        return true;

      case 'images':
        if (!formData.images || formData.images.length === 0) {
          toast({
            message: 'Please upload at least one product image',
            type: 'error'
          })
          return false;
        }
        return true;

      case 'itinerary':
        if (formData.type === 'TOUR' && (!formData.itinerary || formData.itinerary.length === 0)) {
          toast({
            message: 'Please add at least one day to the itinerary for tours',
            type: 'error'
          })
          return false;
        }
        return true;

      case 'pickup':
        if (!formData.pickupOption) {
          toast({
            message: 'Please select a pickup option',
            type: 'error'
          })
          return false;
        }
        if ((formData.pickupOption === 'We can pick up travelers or meet them at a meeting point' ||
             formData.pickupOption === 'No, we meet all travelers at a meeting point') && 
            !formData.meetingPoint) {
          toast({
            message: 'Please provide meeting point details',
            type: 'error'
          })
          return false;
        }
        return true;

      case 'content':
      case 'details':
      case 'guides':
        return true;

      default:
        return true;
    }
  };

  const handleTabChange = (newTabId: string) => {
    // If trying to move forward, validate current tab
    const currentTabIndex = contentTabs.findIndex(tab => tab.id === activeContentTab);
    const newTabIndex = contentTabs.findIndex(tab => tab.id === newTabId);

    if (newTabIndex > currentTabIndex) {
      // Validate all previous tabs including current one
      for (let i = 0; i <= currentTabIndex; i++) {
        const tabToValidate = contentTabs[i].id;
        if (!validateTabWithToast(tabToValidate)) {
          return;
        }
      }
    }

    setActiveContentTab(newTabId);
  };
  ;

  const addActivity = () => {
    if (newActivity.location.trim() && editingDay) {
      const activityToAdd = {
        ...newActivity,
        order: editingDay.activities.length, // Auto-assign order
      };

      setEditingDay({
        ...editingDay,
        activities: [...editingDay.activities, activityToAdd]
      });

      // Reset form
      setNewActivity({
        location: '',
        isStop: false,
        stopDuration: undefined,
        inclusions: [],
        exclusions: [],
        order: 0,
      });
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

    // Ensure activities have proper order
    const activitiesWithOrder = editingDay.activities.map((activity, index) => ({
      ...activity,
      order: activity.order ?? index
    }));

    const dayToSave = {
      ...editingDay,
      activities: activitiesWithOrder
    };

    const currentItinerary = formData.itinerary || formData.itineraries || [];
    const existingIndex = currentItinerary.findIndex((day: ItineraryDay) => day.day === dayToSave.day);

    let updatedItinerary;
    if (existingIndex >= 0) {
      updatedItinerary = [...currentItinerary];
      updatedItinerary[existingIndex] = dayToSave;
    } else {
      updatedItinerary = [...currentItinerary, dayToSave].sort((a, b) => a.day - b.day);
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
      activities: [], // Now an array of ItineraryActivity objects
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

  const handleSaveAndContinue = () => {
    const currentTabIndex = contentTabs.findIndex(tab => tab.id === activeContentTab);
    if (currentTabIndex < contentTabs.length - 1) {
      setActiveContentTab(contentTabs[currentTabIndex + 1].id);
    }
  };

  const addItem = (field: string, value: string) => {
    if (!value.trim()) return;

    updateFormData({
      [field]: [...(formData[field] || []), value.trim()]
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

  const renderTabContent = () => {
    switch (activeContentTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
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

            {formData.type === 'EXPERIENCE' && (
              <div>
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
                    required={formData.type === 'EXPERIENCE'}
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
            )}

            <div>
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
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Product Images</h4>
              <p className="text-sm text-gray-600 mb-6">Upload high-quality images to showcase your product</p>
            </div>
            <ImageUploader
              images={formData.images || []}
              onChange={(images) => updateFormData({ images })}
              maxImages={10}
              folder="products"
              title="Product Images *"
            />
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>

        );

      case 'itinerary':
        return (
          <div className="space-y-6">
            {formData.type === 'TOUR' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Tour Itinerary</h4>
                    <p className="text-sm text-gray-600">Plan your tour day by day</p>
                  </div>
                  <button
                    type="button"
                    onClick={createNewDay}
                    className="flex items-center px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Day
                  </button>
                </div>

                {formData.itinerary && formData.itinerary.length > 0 ? (
                  <div className="space-y-4">
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
                            <ul className="text-xs text-gray-600 space-y-1">
                              {day.activities.map((activity, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="flex-1">
                                    {activity.location}
                                    {activity.isStop && (
                                      <span className="text-blue-600 ml-1">
                                        (Stop - {activity.stopDuration || 0}min)
                                      </span>
                                    )}
                                  </span>
                                </li>
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
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No itinerary days added yet</p>
                    <p className="text-sm text-gray-500">Click "Add Day" to start planning your tour</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Itinerary is only available for Tours</p>
                <p className="text-sm text-gray-500">Switch to Tour type to add itinerary</p>
              </div>
            )}
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        );

      case 'pickup':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Pickup Configuration</h4>
              <p className="text-sm text-gray-600 mb-6">Configure how travelers will meet or be picked up</p>
            </div>

            <div>
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

            <div>
              <h5 className="text-md font-medium text-gray-900 mb-4">Pickup Locations</h5>
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
                    {(formData.pickupLocations || []).map((location: string, index: number) => (
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
                    {(!formData.pickupLocations || formData.pickupLocations.length === 0) && (
                      <li className="p-3 text-gray-500 text-center">No pickup locations added</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Highlights */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h4>
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
                      {(formData.highlights || []).map((highlight: string, index: number) => (
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
                      {(!formData.highlights || formData.highlights.length === 0) && (
                        <li className="p-3 text-gray-500 text-center">No highlights added</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Inclusions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Inclusions</h4>
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
                      {(formData.inclusions || []).map((inclusion: string, index: number) => (
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
                      {(!formData.inclusions || formData.inclusions.length === 0) && (
                        <li className="p-3 text-gray-500 text-center">No inclusions added</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Exclusions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Exclusions</h4>
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
                      {(formData.exclusions || []).map((exclusion: string, index: number) => (
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
                      {(!formData.exclusions || formData.exclusions.length === 0) && (
                        <li className="p-3 text-gray-500 text-center">No exclusions added</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
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
                  <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto p-3">
                    <div className="flex flex-wrap gap-2">
                      {(formData.tags || []).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeItem('tags', index)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {(!formData.tags || formData.tags.length === 0) && (
                        <span className="text-gray-500 text-sm">No tags added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-8">
            {/* Physical Difficulty Level */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Difficulty Level</h3>
              <p className="text-sm text-gray-600 mb-4">Select the physical difficulty level for this tour/experience</p>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value="Easy"
                    checked={formData.difficulty === 'Easy'}
                    onChange={(e) => updateFormData({ difficulty: e.target.value })}
                    className="mt-1 h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Easy</div>
                    <div className="text-sm text-gray-600">Most travelers can participate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      • Minimal physical activity required
                      • Suitable for all fitness levels
                      • Mostly walking on flat surfaces
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value="Moderate"
                    checked={formData.difficulty === 'Moderate'}
                    onChange={(e) => updateFormData({ difficulty: e.target.value })}
                    className="mt-1 h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Moderate</div>
                    <div className="text-sm text-gray-600">Travelers should have a moderate physical fitness level</div>
                    <div className="text-xs text-gray-500 mt-1">
                      • Some walking and standing involved
                      • May include stairs or uneven surfaces
                      • Basic fitness level recommended
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value="Challenging"
                    checked={formData.difficulty === 'Challenging'}
                    onChange={(e) => updateFormData({ difficulty: e.target.value })}
                    className="mt-1 h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Challenging</div>
                    <div className="text-sm text-gray-600">Travelers should have a strong physical fitness level</div>
                    <div className="text-xs text-gray-500 mt-1">
                      • Significant physical activity required
                      • May involve hiking, climbing, or extended walking
                      • Good fitness level essential
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Accessibility Features */}


            {/* Existing Accessibility Options - Keep for backward compatibility */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Accessibility</h3>
              <p className="text-sm text-gray-600 mb-6">Check all accessibility features that apply to your tour/experience</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wheelchair Accessibility */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Wheelchair Accessibility</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="wheelchairAccessible"
                        value="yes"
                        checked={formData.wheelchairAccessible === 'yes'}
                        onChange={(e) => updateFormData({ wheelchairAccessible: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Yes - Fully wheelchair accessible</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="wheelchairAccessible"
                        value="no"
                        checked={formData.wheelchairAccessible === 'no'}
                        onChange={(e) => updateFormData({ wheelchairAccessible: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No - Not wheelchair accessible</span>
                    </label>
                  </div>
                </div>

                {/* Stroller Accessibility */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Stroller Accessibility</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="strollerAccessible"
                        value="yes"
                        checked={formData.strollerAccessible === 'yes'}
                        onChange={(e) => updateFormData({ strollerAccessible: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Yes - Stroller friendly</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="strollerAccessible"
                        value="no"
                        checked={formData.strollerAccessible === 'no'}
                        onChange={(e) => updateFormData({ strollerAccessible: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No - Not suitable for strollers</span>
                    </label>
                  </div>
                </div>

                {/* Service Animals */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Service Animals</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="serviceAnimalsAllowed"
                        value="yes"
                        checked={formData.serviceAnimalsAllowed === 'yes'}
                        onChange={(e) => updateFormData({ serviceAnimalsAllowed: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Yes - Service animals allowed</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="serviceAnimalsAllowed"
                        value="no"
                        checked={formData.serviceAnimalsAllowed === 'no'}
                        onChange={(e) => updateFormData({ serviceAnimalsAllowed: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No - Service animals not permitted</span>
                    </label>
                  </div>
                </div>

                {/* Public Transportation */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Public Transportation Access</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="publicTransportAccess"
                        value="yes"
                        checked={formData.publicTransportAccess === 'yes'}
                        onChange={(e) => updateFormData({ publicTransportAccess: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Yes - Easy access via public transport</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="publicTransportAccess"
                        value="no"
                        checked={formData.publicTransportAccess === 'no'}
                        onChange={(e) => updateFormData({ publicTransportAccess: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No - Limited public transport access</span>
                    </label>
                  </div>
                </div>

                {/* Infant Seating */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Infant Seating</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="infantSeatsRequired"
                        value="yes"
                        checked={formData.infantSeatsRequired === 'yes'}
                        onChange={(e) => updateFormData({ infantSeatsRequired: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Yes - Infants must sit on laps</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="infantSeatsRequired"
                        value="no"
                        checked={formData.infantSeatsRequired === 'no'}
                        onChange={(e) => updateFormData({ infantSeatsRequired: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No - Separate seating available</span>
                    </label>
                  </div>
                </div>

                {/* Infant Seats Available */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Infant Seats</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="infantSeatsAvailable"
                        value="yes"
                        checked={formData.infantSeatsAvailable === 'yes'}
                        onChange={(e) => updateFormData({ infantSeatsAvailable: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Yes - Infant seats available</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="infantSeatsAvailable"
                        value="no"
                        checked={formData.infantSeatsAvailable === 'no'}
                        onChange={(e) => updateFormData({ infantSeatsAvailable: e.target.value })}
                        className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No - No infant seats provided</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200 p-4 mt-6">
                <p className="text-sm text-gray-600 mb-6">Add specific accessibility features available for this tour/experience</p>

                <div className="space-y-4">
                  {/* Add new accessibility feature */}
                  <div className="flex">
                    <input
                      type="text"
                      value={newItem.accessibilityFeature || ''}
                      onChange={(e) => setNewItem({ ...newItem, accessibilityFeature: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="e.g., Wheelchair accessible entrance, Audio descriptions available"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('accessibilityFeatures', newItem.accessibilityFeature || '')}
                      className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Display existing accessibility features */}
                  <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {(formData.accessibilityFeatures || []).map((feature: string, index: number) => (
                        <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                          <span className="text-gray-700">{feature}</span>
                          <button
                            onClick={() => removeItem('accessibilityFeatures', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                      {(!formData.accessibilityFeatures || formData.accessibilityFeatures.length === 0) && (
                        <li className="p-3 text-gray-500 text-center">No accessibility features added</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Restrictions */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Health Restrictions
              </label>
              <span className="block text-sm text-gray-500 mb-4">Check all that apply</span>
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
                    <span className="text-gray-700 text-sm">{option}</span>
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
                    <span className="text-gray-700 text-sm">{custom}</span>
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
                  className="text-[#ff914d] hover:underline font-medium text-sm"
                  onClick={() => {
                    if (newCustomHealthRestriction.trim()) {
                      setCustomHealthRestrictions([...customHealthRestrictions, newCustomHealthRestriction.trim()]);
                      setNewCustomHealthRestriction('');
                    }
                  }}
                >
                  + Add custom restriction
                </button>
                <input
                  type="text"
                  value={newCustomHealthRestriction}
                  onChange={e => setNewCustomHealthRestriction(e.target.value)}
                  placeholder="Custom restriction"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCustomHealthRestriction.trim()) {
                      setCustomHealthRestrictions([...customHealthRestrictions, newCustomHealthRestriction.trim()]);
                      setNewCustomHealthRestriction('');
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        );

      case 'guides':
        return (
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Guide & Language Matrix</h4>
              <p className="text-sm text-gray-600 mb-6">
                Configure what type of guide is available for each language
              </p>

              {/* Add new language */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const existingGuides = formData.guides || [];
                        const languageExists = existingGuides.some((guide: any) => guide.language === e.target.value);

                        if (!languageExists) {
                          const newGuide = {
                            language: e.target.value,
                            inPerson: false,
                            audio: false,
                            written: false
                          };
                          updateFormData({
                            guides: [...existingGuides, newGuide]
                          });
                        }
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                    <option value="">Add another language</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Dutch">Dutch</option>
                    <option value="Russian">Russian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Korean">Korean</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>

              {/* Guide Matrix Table */}
              {formData.guides && formData.guides.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                          Languages
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                          <div className="flex flex-col items-center">
                            <Users className="h-5 w-5 mb-1 text-blue-600" />
                            <span>In-person</span>
                          </div>
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                          <div className="flex flex-col items-center">
                            <svg className="h-5 w-5 mb-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114a4 4 0 100 1.772V6.114l8-1.6v4.9a4 4 0 100 1.772V3z" />
                            </svg>
                            <span>Audio</span>
                          </div>
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                          <div className="flex flex-col items-center">
                            <svg className="h-5 w-5 mb-1 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span>Written</span>
                          </div>
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.guides.map((guide: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                            {guide.language}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={guide.inPerson || false}
                              onChange={(e) => {
                                const updatedGuides = [...formData.guides];
                                updatedGuides[index] = {
                                  ...updatedGuides[index],
                                  inPerson: e.target.checked
                                };
                                updateFormData({ guides: updatedGuides });
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={guide.audio || false}
                              onChange={(e) => {
                                const updatedGuides = [...formData.guides];
                                updatedGuides[index] = {
                                  ...updatedGuides[index],
                                  audio: e.target.checked
                                };
                                updateFormData({ guides: updatedGuides });
                              }}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={guide.written || false}
                              onChange={(e) => {
                                const updatedGuides = [...formData.guides];
                                updatedGuides[index] = {
                                  ...updatedGuides[index],
                                  written: e.target.checked
                                };
                                updateFormData({ guides: updatedGuides });
                              }}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedGuides = formData.guides.filter((_: any, i: number) => i !== index);
                                updateFormData({ guides: updatedGuides });
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Remove language"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">No languages configured</p>
                  <p className="text-sm">Add a language from the dropdown above to start configuring guide types</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Guide Types:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>In-person:</strong> Live guide physically present with the group</li>
                  <li>• <strong>Audio:</strong> Pre-recorded audio commentary or live audio guide</li>
                  <li>• <strong>Written:</strong> Written materials, brochures, or digital text guides</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-1 overflow-x-auto px-4">
            {contentTabs.map((tab) => {
              const Icon = tab.icon;
              const isValid = validateTab(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${activeContentTab === tab.id
                      ? 'border-[#ff914d] text-[#ff914d]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

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
                <div className="space-y-4">
                  {/* Activity Form */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={newActivity.location}
                          onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                          placeholder="Activity location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newActivity.isStop || false}
                            onChange={(e) => setNewActivity({ ...newActivity, isStop: e.target.checked })}
                            className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-700">Is Stop?</span>
                        </label>

                        {newActivity.isStop && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Duration (mins)
                            </label>
                            <input
                              type="number"
                              value={newActivity.stopDuration || ''}
                              onChange={(e) => setNewActivity({
                                ...newActivity,
                                stopDuration: e.target.value ? parseInt(e.target.value) : undefined
                              })}
                              placeholder="30"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Inclusions (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(newActivity.inclusions || []).join(', ')}
                          onChange={(e) => setNewActivity({
                            ...newActivity,
                            inclusions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          })}
                          placeholder="Guide, Entry ticket"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Exclusions (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(newActivity.exclusions || []).join(', ')}
                          onChange={(e) => setNewActivity({
                            ...newActivity,
                            exclusions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          })}
                          placeholder="Food, Transport"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        onClick={addActivity}
                        disabled={!newActivity.location}
                        className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:bg-gray-300 text-sm"
                      >
                        <Plus className="h-4 w-4 inline mr-1" />
                        Add Activity
                      </button>
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="space-y-2">
                    {editingDay.activities.map((activity, index) => (
                      <div key={index} className="flex items-start justify-between bg-white border border-gray-200 px-4 py-3 rounded-md">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{activity.location}</div>
                          {activity.isStop && (
                            <div className="text-xs text-blue-600 mt-1">
                              Stop • {activity.stopDuration || 0} minutes
                            </div>
                          )}
                          {(activity.inclusions && activity.inclusions.length > 0) && (
                            <div className="text-xs text-green-600 mt-1">
                              Includes: {activity.inclusions.join(', ')}
                            </div>
                          )}
                          {(activity.exclusions && activity.exclusions.length > 0) && (
                            <div className="text-xs text-red-600 mt-1">
                              Excludes: {activity.exclusions.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeActivity(index)}
                          className="text-red-500 hover:text-red-700 ml-3"
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
                <ImageUploader
                  images={editingDay.images}
                  onChange={(images) =>
                    setEditingDay({ ...editingDay, images })
                  }
                  maxImages={10}
                  folder="itinerary"
                  title="Day Images"
                  allowReordering={false}
                  className="mb-4"
                />
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

      {/* Destination Modal */}
      {/* Destination Modal */}
{isDestinationModalOpen && (
  <DestinationModal
    isOpen={isDestinationModalOpen}
    onClose={() => setIsDestinationModalOpen(false)}
    onSelect={handleDestinationSelect}
    onCreated={fetchDestinations} // Add this to refetch destinations
  />
)}

{/* Experience Category Modal */}
{isCategoryModalOpen && (
  <ExperienceCategoryModal
    isOpen={isCategoryModalOpen}
    onClose={() => setIsCategoryModalOpen(false)}
    onSelect={handleCategorySelect}
    onCreated={fetchExperienceCategories} // Add this to refetch categories
  />
)}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Info, Image, Route, MapPin, Star, Settings, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DestinationModal } from './DestinationModal';
import { ExperienceCategoryModal } from './ExperienceCategoryModal';
import { useToast } from '../ui/toaster';
import { BasicInfo } from '../productcontenttabs/Basicinfo';
import { ProductImagesTab } from '../productcontenttabs/images';
import type { ItineraryActivity, ItineraryDay, newItem, ProductContentTabProps } from '@/types.ts';
import { ItineraryTab } from '../productcontenttabs/itinerary';
import { PickupOptionsTab } from '../productcontenttabs/PickupOptions';
import { getDescription } from '../productcontenttabs/predefinedcategories';
import { ContentElements } from '../productcontenttabs/ContentElements';
import { AdditionalDetailsTab } from '../productcontenttabs/AdditionalDetails';
import { GuidesAndLang } from '../productcontenttabs/GuidesamdLang';
import { validateTab, validateTabWithToast } from './Validation';
import { EditItineraryModel } from '../productcontenttabs/edititinerarymodel';

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
  const [newItem, setNewItem] = useState<newItem>({
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
    durationUnit: 'minutes',
    isAdmissionIncluded: false,
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
  const isDraft = formData.isDraft;

  const getAllowedDays = () => {
    if (formData.duration === 'Full Day' || formData.duration === 'Half Day') return 1;
    const n = parseInt(formData.duration?.split(' ')[0] || '0', 10);
    return isNaN(n) || n < 1 ? 0 : n;
  };

  const [activityInclusionCategory, setActivityInclusionCategory] = useState('');
  const [activityInclusionSubcategory, setActivityInclusionSubcategory] = useState('');
  const [activityInclusionCustomTitle, setActivityInclusionCustomTitle] = useState('');
  const [activityInclusionCustomDescription, setActivityInclusionCustomDescription] = useState('');
  const [showActivityInclusionCustomForm, setShowActivityInclusionCustomForm] = useState(false);

  const [activityExclusionCategory, setActivityExclusionCategory] = useState('');
  const [activityExclusionSubcategory, setActivityExclusionSubcategory] = useState('');
  const [activityExclusionCustomTitle, setActivityExclusionCustomTitle] = useState('');
  const [activityExclusionCustomDescription, setActivityExclusionCustomDescription] = useState('');
  const [showActivityExclusionCustomForm, setShowActivityExclusionCustomForm] = useState(false);

  useEffect(() => {
    if (formData.itineraries && formData.itineraries.length > 0) {
      updateFormData({ itinerary: formData.itineraries });
    }
    fetchDestinations();
    fetchExperienceCategories();
  }, [formData.itineraries]);

  const handleTabChange = (newTabId: string) => {
    const currentTabIndex = contentTabs.findIndex(tab => tab.id === activeContentTab);
    const newTabIndex = contentTabs.findIndex(tab => tab.id === newTabId);

    if (newTabIndex > currentTabIndex && !isDraft) {
      for (let i = 0; i <= currentTabIndex; i++) {
        const tabToValidate = contentTabs[i].id;
        if (!validateTabWithToast(tabToValidate, formData, toast)) {
          return;
        }
      }
    }
    setActiveContentTab(newTabId);
  };

  const addActivity = () => {
    if (newActivity.location.trim() && editingDay) {
      const activityToAdd = {
        ...newActivity,
        order: editingDay.activities.length,
      };

      setEditingDay({
        ...editingDay,
        activities: [...editingDay.activities, activityToAdd]
      });

      setNewActivity({
        location: '',
        isStop: false,
        stopDuration: undefined,
        durationUnit: 'minutes',
        isAdmissionIncluded: false,
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

    const next = existingIndex >= 0
      ? currentItinerary.map((d: ItineraryDay, i: number) => i === existingIndex ? dayToSave : d)
      : [...currentItinerary, dayToSave];
    const updatedItinerary = next
      .sort((a: ItineraryDay, b: ItineraryDay) => a.day - b.day)
      .map((d: ItineraryDay, idx: number) => ({ ...d, day: idx + 1 }));

    updateFormData({ itinerary: updatedItinerary });
    setEditingDay(null);
    setShowItineraryBuilder(false);
  };

  const createNewDay = () => {
    const currentItinerary = formData.itinerary || formData.itineraries || [];
    const maxDays = getAllowedDays();
    if (currentItinerary.length >= maxDays) {
      toast({ message: `Itinerary already has the maximum of ${maxDays} day${maxDays > 1 ? 's' : ''}.`, type: 'error' });
      return;
    }
    const nextDay = currentItinerary.length + 1;

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
    const filtered = currentItinerary.filter((day: ItineraryDay) => day.day !== dayNumber);
    const renumbered = filtered.map((d: ItineraryDay, idx: number) => ({ ...d, day: idx + 1 }));
    updateFormData({ itinerary: renumbered });
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

  const addActivityInclusion = () => {
    let itemToAdd = '';
    if (showActivityInclusionCustomForm && activityInclusionCustomTitle) {
      itemToAdd = activityInclusionCustomDescription ?
        `${activityInclusionCustomTitle} - ${activityInclusionCustomDescription}` :
        activityInclusionCustomTitle;
    } else if (activityInclusionSubcategory) {
      const description = getDescription(activityInclusionCategory, activityInclusionSubcategory);
      itemToAdd = description ?
        `${activityInclusionSubcategory} - ${description}` :
        activityInclusionSubcategory;
    }

    if (itemToAdd) {
      setNewActivity({
        ...newActivity,
        inclusions: [...(newActivity.inclusions || []), itemToAdd]
      });
      setActivityInclusionCategory('');
      setActivityInclusionSubcategory('');
      setActivityInclusionCustomTitle('');
      setActivityInclusionCustomDescription('');
      setShowActivityInclusionCustomForm(false);
    }
  };

  const addActivityExclusion = () => {
    let itemToAdd = '';
    if (showActivityExclusionCustomForm && activityExclusionCustomTitle) {
      itemToAdd = activityExclusionCustomDescription ?
        `${activityExclusionCustomTitle} - ${activityExclusionCustomDescription}` :
        activityExclusionCustomTitle;
    } else if (activityExclusionSubcategory) {
      const description = getDescription(activityExclusionCategory, activityExclusionSubcategory);
      itemToAdd = description ?
        `${activityExclusionSubcategory} - ${description}` :
        activityExclusionSubcategory;
    }

    if (itemToAdd) {
      setNewActivity({
        ...newActivity,
        exclusions: [...(newActivity.exclusions || []), itemToAdd]
      });
      setActivityExclusionCategory('');
      setActivityExclusionSubcategory('');
      setActivityExclusionCustomTitle('');
      setActivityExclusionCustomDescription('');
      setShowActivityExclusionCustomForm(false);
    }
  };

  const renderTabContent = () => {
    switch (activeContentTab) {
      case 'basic':
        return (
          <BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            destinations={destinations}
            experienceCategories={experienceCategories}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            setIsDestinationModalOpen={setIsDestinationModalOpen}
            isLoadingCategories={isLoadingCategories}
            isLoadingDestinations={isLoadingDestinations}
            handleSaveAndContinue={handleSaveAndContinue}
          />
        );
      case 'images':
        return (
          <ProductImagesTab
            formData={formData}
            updateFormData={updateFormData}
            handleSaveAndContinue={handleSaveAndContinue}
          />
        );

      case 'itinerary':
        return (
          <ItineraryTab
            formData={formData}
            handleSaveAndContinue={handleSaveAndContinue}
            createNewDay={createNewDay}
            editDay={editDay}
            removeDay={removeDay}
            getAllowedDays={getAllowedDays}
          />
        );
      case 'pickup':
        return (
          <PickupOptionsTab
            formData={formData}
            updateFormData={updateFormData}
            handleSaveAndContinue={handleSaveAndContinue}
            setPickupOption={setPickupOption}
            pickupOption={pickupOption}
          />
        );

      case 'content':
        return (
          <ContentElements
            formData={formData}
            newItem={newItem}
            setNewItem={setNewItem}
            addItem={addItem}
            removeItem={removeItem}
            getDescription={getDescription}
            handleSaveAndContinue={handleSaveAndContinue}
          />
        );

      case 'details':
        return (
          <AdditionalDetailsTab
            formData={formData}
            updateFormData={updateFormData}
            handleSaveAndContinue={handleSaveAndContinue}
            newItem={newItem}
            setNewItem={setNewItem}
            removeItem={removeItem}
            addItem={addItem}
          />
        );

      case 'guides':
        return (
          <GuidesAndLang
            formData={formData}
            updateFormData={updateFormData}
            handleSaveAndContinue={handleSaveAndContinue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-1 overflow-x-auto px-4">
            {contentTabs.map((tab) => {
              const Icon = tab.icon;
              const isValid = validateTab(tab.id, formData);
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

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      <EditItineraryModel
        showItineraryBuilder={showItineraryBuilder}
        setShowItineraryBuilder={setShowItineraryBuilder}
        editingDay={editingDay}
        setEditingDay={setEditingDay}
        newActivity={newActivity}
        setNewActivity={setNewActivity}
        activityInclusionCategory={activityInclusionCategory}
        setActivityInclusionCategory={setActivityInclusionCategory}
        activityInclusionSubcategory={activityInclusionSubcategory}
        setActivityInclusionSubcategory={setActivityInclusionSubcategory}
        activityInclusionCustomTitle={activityInclusionCustomTitle}
        setActivityInclusionCustomTitle={setActivityInclusionCustomTitle}
        activityInclusionCustomDescription={activityInclusionCustomDescription}
        setActivityInclusionCustomDescription={setActivityInclusionCustomDescription}
        showActivityInclusionCustomForm={showActivityInclusionCustomForm}
        setShowActivityInclusionCustomForm={setShowActivityInclusionCustomForm}
        activityExclusionCategory={activityExclusionCategory}
        setActivityExclusionCategory={setActivityExclusionCategory}
        activityExclusionSubcategory={activityExclusionSubcategory}
        setActivityExclusionSubcategory={setActivityExclusionSubcategory}
        activityExclusionCustomTitle={activityExclusionCustomTitle}
        setActivityExclusionCustomTitle={setActivityExclusionCustomTitle}
        activityExclusionCustomDescription={activityExclusionCustomDescription}
        setActivityExclusionCustomDescription={setActivityExclusionCustomDescription}
        showActivityExclusionCustomForm={showActivityExclusionCustomForm}
        setShowActivityExclusionCustomForm={setShowActivityExclusionCustomForm}
        addActivityInclusion={addActivityInclusion}
        addActivityExclusion={addActivityExclusion}
        addActivity={addActivity}
        removeActivity={removeActivity}
        saveItineraryDay={saveItineraryDay}
      />

      {isDestinationModalOpen && (
        <DestinationModal
          isOpen={isDestinationModalOpen}
          onClose={() => setIsDestinationModalOpen(false)}
          onSelect={handleDestinationSelect}
          onCreated={fetchDestinations}
        />
      )}

      {isCategoryModalOpen && (
        <ExperienceCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSelect={handleCategorySelect}
          onCreated={fetchExperienceCategories}
        />
      )}
    </div>
  );
};
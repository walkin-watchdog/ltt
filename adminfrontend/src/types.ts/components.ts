// Component props interfaces
import React from 'react';
import type { 
  Product, 
  newItem
} from './product';
import type { 
  PackageOption, 
  Package, 
  SlotFormData, 
  SlotPickerState
} from './package';
import type { 
  ItineraryDay
} from './itinerary';
import type { 
  LocationDetail, 
  MeetingPoint, 
  EndPoint, 
  Destination, 
  ExperienceCategory 
} from './location';
import type { AvailabilityProp, BlockDate } from './availability';

// Product Content Tab Props
export interface ProductContentTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export interface BasicInfoProps {
  formData: any;
  updateFormData: (updates: any) => void;
  destinations: any;
  experienceCategories: any;
  setIsCategoryModalOpen: (open: boolean) => void;
  setIsDestinationModalOpen: (open: boolean) => void;
  isLoadingDestinations: boolean;
  isLoadingCategories: boolean;
}

export interface ContentElementsProps {
  formData: any;
  newItem: newItem;
  setNewItem: (item: newItem) => void;
  addItem: (type: string, item: string) => void;
  removeItem: (type: string, index: number) => void;
  getDescription: (category: string, item: string) => string;
}

export interface AdditionalDetailsTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  newItem: newItem;
  setNewItem: (item: newItem) => void;
  removeItem: (field: string, index: number) => void;
  addItem: (field: string, value: string) => void;
}

export interface GuidesAndLangProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export interface ProductImagesTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export interface ItineraryTabProps {
  formData: any;
  createNewDay: () => void;
  editDay: (day: ItineraryDay) => void;
  removeDay: (dayNumber: number) => void;
  getAllowedDays: () => number;
}

export interface PickupOptionsTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  pickupOption: string;
  setPickupOption: (option: string) => void;
}

export interface AvailabilityTabProps {
  formData: {
    availabilityStartDate: string;
    availabilityEndDate?: string;
    blockedDates?: BlockDate[];
  };
  updateFormData: (changes: Partial<{
    availabilityStartDate: string;
    availabilityEndDate?: string;
    blockedDates?: BlockDate[];
  }>) => void;
}

export interface CancellationPolicyTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export interface TravelerRequirementsTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

export interface SchedulePriceTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

// Availability and Booking Components
export interface AdminAvailabilityBarProps {
  selectedDate: string;
  adults: number;
  children: number;
  onChange: (v: { date: string; adults: number; children: number }) => void;
  onCheck: () => void;
  selectedPackage?: any;
}

export interface AdminAvailabilityModalProps {
  productId: string;
  packages: any[];
  open: boolean;
  onClose: () => void;
  onPackageSelect: (pkgOrSlotId: string) => void;
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  selectedPackageFromProp?: {
    id: string;
    inclusions?: string[];
    timeSlots?: string[];
    ageGroups?: {
      child?: {
        enabled?: boolean;
      };
    };
  };
}

export interface BookingInfoCardProps {
  product: Product;
  cheapestPackage: PackageOption | null;
  selectedDateStr: string;
  adultsCount: number;
  childrenCount: number;
  isMobile: boolean;
  checkingAvail: boolean;
  isDateOk: boolean | null;
  availablePkgs: PackageOption[];
  selectedPackage: PackageOption | null;
  handleBarChange: (args: { date: string; adults: number; children: number }) => void;
  handlePackageSelect: (pkgId: string | PackageOption) => void;
  checkAvailabilityDesktop: () => void;
  setShowAvail: (show: boolean) => void;
  calculateEffectivePrice: (basePrice: number, discountType?: string, discountValue?: number) => number;
}

// Modal Props
export interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (destination: Destination) => void;
  onCreated?: () => void;
}

export interface ExperienceCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: ExperienceCategory) => void;
  onCreated?: () => void;
}

// Image Components
export interface ImageBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedImages: string[]) => void;
  multiple?: boolean;
  folder?: string;
  preSelectedImages?: string[];
}

export interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  title?: string;
  allowReordering?: boolean;
  className?: string;
}

// Itinerary Modal Props
export interface EditItineraryModelProps {
  showItineraryBuilder: boolean;
  editingDay: any;
  setShowItineraryBuilder: (show: boolean) => void;
  setEditingDay: (day: any) => void;
  newActivity: any;
  setNewActivity: (activity: any) => void;
  activityInclusionCategory: string;
  setActivityInclusionCategory: (category: string) => void;
  activityInclusionSubcategory: string;
  setActivityInclusionSubcategory: (subcategory: string) => void;
  activityInclusionCustomTitle: string;
  setActivityInclusionCustomTitle: (title: string) => void;
  activityInclusionCustomDescription: string;
  setActivityInclusionCustomDescription: (description: string) => void;
  showActivityInclusionCustomForm: boolean;
  setShowActivityInclusionCustomForm: (show: boolean) => void;
  activityExclusionCategory: string;
  setActivityExclusionCategory: (category: string) => void;
  activityExclusionSubcategory: string;
  setActivityExclusionSubcategory: (subcategory: string) => void;
  activityExclusionCustomTitle: string;
  setActivityExclusionCustomTitle: (title: string) => void;
  activityExclusionCustomDescription: string;
  setActivityExclusionCustomDescription: (description: string) => void;
  showActivityExclusionCustomForm: boolean;
  setShowActivityExclusionCustomForm: (show: boolean) => void;
  addActivityInclusion: (activity: any) => void;
  addActivityExclusion: (activity: any) => void;
  addActivity: (activity: any) => void;
  removeActivity: (index: number) => void;
  saveItineraryDay: () => void;
}

// Package and Slot Props
export interface EditPackageProps {
  maxCapacity: number; // New prop for max capacity
  isAddingPackage: boolean;
  isEditingPackage: boolean;
  setIsAddingPackage: (value: boolean) => void;
  setIsEditingPackage: (value: boolean) => void;
  packageFormData: any;
  setPackageFormData: (data: any) => void;
  handlePackageChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSavePackage: () => void;
  handlePackageToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedInclusionCategory: string;
  setSelectedInclusionCategory: (category: string) => void;
  selectedInclusionSubcategory: string;
  setSelectedInclusionSubcategory: (subcategory: string) => void;
  setShowCustomInclusionForm: (show: boolean) => void;
  showCustomInclusionForm: boolean;
  customInclusionTitle: string;
  setCustomInclusionTitle: (title: string) => void;
  customInclusionDescription: string;
  setCustomInclusionDescription: (description: string) => void;
  handleAddInclusionFromCategory: () => void;
  handleAddInclusion: () => void;
  handleRemoveInclusion: (index: number) => void;
  newInclusion: string;
  setNewInclusion: (inclusion: string) => void;
}

export interface PackageAndSlotConfigProps {
  formData: any;
  handleEditPackage: (pkg: Package, index: number) => void;
  handleRemovePackage: (index: number) => void;
  handleAddSlot: (packageId: string) => void;
  handleEditSlot: (packageId: string, slotIndex: number) => void;
  handleRemoveSlot: (packageIndex: number, slotIndex: number) => void;
}

export interface AdultAndChildTiersProps {
  slotFormData: SlotFormData;
  packageFormData: Package;
  handleTierChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    tierType: "adultTiers" | "childTiers",
    index: number,
    field: "min" | "max" | "price"
  ) => void;
  handleRemoveTier: (tierType: "adultTiers" | "childTiers", index: number) => void;
  handleAddTier: (tierType: "adultTiers" | "childTiers") => void;
}

export type SlotPickerProps = {
  slotFormData: SlotFormData;
  setSlotFormData: React.Dispatch<React.SetStateAction<SlotFormData>>;
  slotMode: string;
  setSlotMode: React.Dispatch<React.SetStateAction<'auto' | 'manual'>>;
  slotPicker: SlotPickerState;
  setSlotPicker: React.Dispatch<React.SetStateAction<SlotPickerState>>;
};

// Availability Management Props
export interface BlockDatesProps {
  saveError: string;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  products: Product[];
  blockDates: { selectedDates: string[]; reason: string };
  setBlockDates: React.Dispatch<React.SetStateAction<{ selectedDates: string[]; reason: string }>>;
  setIsBlockModalOpen: (value: boolean) => void;
  handleBulkBlock: () => void;
  isDateAlreadyBlocked: (productId: string, date: string) => boolean;
  setSaveError: (error: string) => void;
}

export interface EditProps {
  saveError: string;
  setSaveError: (error: string) => void;
  products: Product[];
  modalData: {
    productId: string;
    startDate: string;
    endDate?: string;
    status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  };
  setModalData: React.Dispatch<React.SetStateAction<{
    productId: string;
    startDate: string;
    endDate: string;
    status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  }>>;
  editingAvailability: AvailabilityProp | null;
  setEditingAvailability: React.Dispatch<React.SetStateAction<AvailabilityProp | null>>;
  setIsModalOpen: (value: boolean) => void;
  fetchData: () => void;
}

// Map Components
export interface EndPointMapProps {
  endPoints: EndPoint[];
  onEndPointsChange: (endPoints: EndPoint[]) => void;
}

export interface GoogleMapProps {
  locations: LocationDetail[];
  className?: string;
  height?: string;
}

export interface GoogleMapsAutocompleteProps {
  onLocationSelect: (location: LocationDetail) => void;
  placeholder?: string;
  className?: string;
}

export interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number, placeId?: string) => void;
  placeholder?: string;
  className?: string;
  countryRestriction?: string;
  types?: string[];
  disabled?: boolean;
}

export interface MeetingPointMapProps {
  meetingPoints: MeetingPoint[];
  onMeetingPointsChange: (points: MeetingPoint[]) => void;
  className?: string;
}

export interface PickupLocationMapProps {
  locations: LocationDetail[];
  onLocationsChange: (locations: LocationDetail[]) => void;
  className?: string;
  maxLocations?: number;
}

export interface ItineraryActivity {
  id?: string;
  title: string;
  description: string;
  location: string;
  duration?: number; // Duration in minutes
  isStop: boolean;
  stopDuration?: number; // Stop duration in minutes
  inclusions: string[];
  exclusions: string[];
  order: number;
}

export interface ItineraryDay {
  id?: string;
  day: number;
  title: string;
  description: string;
  activities: ItineraryActivity[];
  images: string[];
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  discountType?: 'none' | 'percentage' | 'fixed';
  discountValue?: number;
  effectivePrice?: number;
  inclusions: string[];
  maxPeople?: number;
  timeSlots?: string[];
}

export interface Newsletter {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

export interface MeetingPoint {
  address: string;
  description?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface EndPoint {
  address: string;
  description?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface Product {
  phonenumber: number;
  tourType: string;
  cancellationPolicyType: boolean;
  cancellationTerms: boolean;
  requirePhone: boolean;
  requireId: boolean;
  requireAge: boolean;
  requireMedical: boolean;
  requireDietary: boolean;
  requireEmergencyContact: boolean;
  requirePassportDetails: boolean;
  customRequirementFields: boolean;
  additionalRequirements: string;
  endPoints : EndPoint[];
  pickupLocationDetails: LocationDetail[];
  pickupOption: boolean;
  allowTravelersPickupPoint: boolean;
  pickupStartTime: string;
  meetingPoints: MeetingDetail[];
  doesTourEndAtMeetingPoint: boolean;
  healthRestrictions: boolean;
  guides: boolean;
  infantSeatsRequired:string;
  infantSeatsAvailable: string;
  pickupLocations(pickupLocations: string[]): [];
  meetingPoint: boolean;
  wheelchairAccessible: string;
  strollerAccessible: string;
  serviceAnimalsAllowed: string;
  publicTransportAccess: string;
  id: string;
  title: string;
  productCode: string;
  slug: string;
  description: string;
  type: 'TOUR' | 'EXPERIENCE';
  category: string;
  location: string;
  duration: string;
  capacity: number;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itineraries?: ItineraryDay[];
  images: string[];
  tags: string[];
  packages?: PackageOption[];
  reviews?: Review[];
  languages?: string[];
  difficulty?: string;
  cancellationPolicy?: string;
  availabilities?: any[];
  availabilityStatus: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  nextAvailableDate?: string;
  availableDates?: string[];
  accessibilityFeatures?: string[]; // New field for accessibility features array
}

export interface AvailabilityProp {
  id: string;
  productId: string;
  startDate: string;
  endDate?: string | null;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  booked: number;
  product: Product;
}

export interface BlockedDate {
  id: string;
  productId: string;
  date: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
  product: Product;
}

export interface AbandonedCartProp {
  id: string;
  email: string;
  productId: string;
  packageId?: string;
  customerData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    adults: number;
    children: number;
    selectedDate: string;
    totalAmount: number;
  };
  remindersSent: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    images: string[];
    price: number;
    discountPrice?: number;
  };
}

export interface BookingProp {
  id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  adults: number;
  children: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  bookingDate: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    productCode: string;
  };
  package?: {
    id: string;
    name: string;
  };
}

export interface DashboardStats {
  overview: {
    totalProducts: number;
    totalBookings: number;
    totalRevenue: number;
    monthlyBookings: number;
    monthlyRevenue: number;
    weeklyBookings: number;
    weeklyRevenue: number;
    yearlyRevenue: number;
    pendingRequests: number;
    activeSubscribers: number;
    totalAbandonedCarts: number;
    conversionRate: number;
  };
  trends: {
    monthlyGrowth: {
      bookings: number;
      revenue: number;
    };
  };
  bookingTrends: any[];
  revenueByCategory: any[];
  topProducts: any[];
}

interface BlockDate {
  id?: string;
  date: string;
  reason?: string;
}

export interface ProductFormData {
  // Basic Details
  title: string;
  productCode: string;
  description: string;
  type: 'TOUR' | 'EXPERIENCE';
  destinationId: string;
  experienceCategoryId: string;
  category: string;
  location: string;
  duration: string;
  capacity: number;
  
  // Content
  images: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary?: ItineraryDay[];
  tags: string[];
  
  // Location & Meeting
  meetingPoint?: string;
  pickupLocations: string[];
  
  // Tour Details
  difficulty?: string;
  healthRestrictions?: string;
  guides: string[];
  languages: string[];
  
  // Policies
  cancellationPolicy: string;
  isActive: boolean;
  isDraft: boolean;
  
  // Availability
  availabilityStartDate: string;
  availabilityEndDate?: string;
  blockedDates?: BlockDate[];
  packages?: PackageOption[];
  accessibilityFeatures?: string[]; // New field for accessibility features array
  wheelchairAccessible: string
  strollerAccessible: string
  serviceAnimalsAllowed: string
  publicTransportAccess: string
  infantSeatsRequired: string
  infantSeatsAvailable: string
  accessibilityNotes: string

  pickupOption: string;
  allowTravelersPickupPoint: boolean;
  pickupStartTime?: string;
  additionalPickupDetails?: string;
  pickupLocationDetails: LocationDetail[];
  pickupStartTimeValue?: number;
  pickupStartTimeUnit?: 'minutes' | 'hours';
  meetingPoints: MeetingDetail[];

  cancellationPolicyType: string;
  freeCancellationHours: number
  partialRefundPercent: number
  noRefundAfterHours: number
  cancellationTerms: string[]; // Array of cancellation terms
  requirePhone: boolean
  requireId: boolean
  requireAge: boolean
  requireMedical: boolean
  requireDietary: boolean
  requireEmergencyContact: boolean
  requirePassportDetails: boolean
  additionalRequirements: string;
  customRequirementFields: string[];
  phonenumber: string;
  tourType: string,

}

export interface LocationDetail {
  address: string;
  lat: number;
  lng: number;
  radius: number;
  placeId?: string;
}

interface MeetingDetail {
  address: string;
  lat: number;
  lng: number;
  description?: string;
  placeId?: string;
}

export interface Productprop {
  difficulty: any;
  wheelchairAccessible: string;
  strollerAccessible: string;
  serviceAnimalsAllowed: string;
  accessibilityFeatures: boolean;
  discountPrice: any;
  id: string;
  title: string;
  productCode: string;
  type: 'TOUR' | 'EXPERIENCE';
  category: string;
  location: string;
  duration: string;
  capacity: number;
  images: string[];
  isActive: boolean;
  isDraft: boolean;
  createdAt: string;
  _count?: {
    bookings: number;
  };
}

export interface TripRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  budget: string;
  interests: string[];
  accommodation: string;
  transport: string;
  specialRequests?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface BlockDatesProps {
    saveError: string;
    selectedProduct: string;
    setSelectedProduct: (value: string) => void;
    products: Product[]; // Changed from generic object to Product[]
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
      endDate: string ;
      status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
    }>>;
    editingAvailability: AvailabilityProp | null;
    setEditingAvailability: React.Dispatch<React.SetStateAction<AvailabilityProp | null>>;
    setIsModalOpen: (value: boolean) => void;
    fetchData: () => void;
  }
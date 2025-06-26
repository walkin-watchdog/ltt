export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  images?: string[];
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  price: number;
  childPrice?: number;
  currency: string;
  inclusions: string[];
  maxPeople?: number;
  timeSlots?: string[];
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

export interface Product {
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
  price: number;
  discountPrice?: number;
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
  category: string;
  location: string;
  duration: string;
  capacity: number;
  price: number;
  discountPrice?: number;
  
  // Content
  images: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary?: any;
  tags: string[];
  
  // Location & Meeting
  meetingPoint?: string;
  pickupLocations: string[];
  
  // Tour Details
  difficulty?: string;
  healthRestrictions?: string;
  accessibility?: string;
  guides: string[];
  languages: string[];
  
  // Policies
  cancellationPolicy: string;
  isActive: boolean;
  
  // Availability
  availabilityStartDate: string;
  availabilityEndDate?: string;
  blockedDates?: BlockDate[];
  packages?: PackageOption[];
}

export interface Productprop {
  id: string;
  title: string;
  productCode: string;
  type: 'TOUR' | 'EXPERIENCE';
  category: string;
  location: string;
  duration: string;
  capacity: number;
  price: number;
  discountPrice?: number;
  images: string[];
  isActive: boolean;
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

// ...existing interfaces...

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

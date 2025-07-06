// Booking related types
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

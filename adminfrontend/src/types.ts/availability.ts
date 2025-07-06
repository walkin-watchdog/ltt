// Availability related types
export interface AvailabilityProp {
  id: string;
  productId: string;
  startDate: string;
  endDate?: string | null;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  booked: number;
  product: any; // Import Product type when needed
}

export interface BlockedDate {
  id: string;
  productId: string;
  date: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
  product: any; // Import Product type when needed
}

export interface BlockDate {
  id?: string;
  date: string;
  reason?: string;
}

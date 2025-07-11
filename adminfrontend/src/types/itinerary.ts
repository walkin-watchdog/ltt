// Itinerary related types
export interface ItineraryDay {
  id: string;
  day: number;
  title: string;
  description: string;
  activities: ItineraryActivity[];
  images: string[];
}

export interface ItineraryActivity {
  images: string[];
  location: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  isStop?: boolean;
  stopDuration?: number;
  description?: string; // Optional description for the activity
  duration?: number;
  durationUnit?: string;
  isAdmissionIncluded?: boolean;
  inclusions?: string[];
  exclusions?: string[];
  order?: number;
}

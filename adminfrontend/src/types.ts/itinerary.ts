// Itinerary related types
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: ItineraryActivity[];
  images: string[];
}

export interface ItineraryActivity {
  location: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  isStop?: boolean;
  stopDuration?: number;
  duration?: number;
  durationUnit?: string;
  isAdmissionIncluded?: boolean;
  inclusions?: string[];
  exclusions?: string[];
  order?: number;
}

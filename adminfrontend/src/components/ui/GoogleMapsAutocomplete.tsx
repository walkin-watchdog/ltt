import React, { useRef, useEffect, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import type { LocationDetail } from '../../types.ts';


interface GoogleMapsAutocompleteProps {
  onLocationSelect: (location: LocationDetail) => void;
  placeholder?: string;
  className?: string;
}

export const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  onLocationSelect,
  placeholder = "Search for a location...",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key is missing. Please check your environment variables.');
      setIsLoading(false);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
      setIsLoaded(true);
      setIsLoading(false);
    } else {
      loadGoogleMapsScript(apiKey);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const loadGoogleMapsScript = (apiKey: string) => {
    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for existing script to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogle);
          initializeAutocomplete();
          setIsLoaded(true);
          setIsLoading(false);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      initializeAutocomplete();
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setError('Failed to load Google Maps. Please check your API key and internet connection.');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'IN' },
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      });

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      console.log('Autocomplete initialized successfully');
    } catch (err) {
      console.error('Error initializing autocomplete:', err);
      setError('Failed to initialize location search. Please refresh the page.');
    }
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    console.log('Place selected:', place);
    
    if (place.geometry && place.geometry.location) {
      const location: LocationDetail = {
        address: place.formatted_address || place.name || '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        radius: 1, // Default 1km radius
        placeId: place.place_id
      };

      console.log('Location selected:', location);
      onLocationSelect(location);
      
      // Clear the input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      // Reinitialize autocomplete for next search
      setTimeout(() => {
        if (inputRef.current && window.google) {
          // Clear existing instance
          if (autocompleteRef.current) {
            google.maps.event.clearInstanceListeners(autocompleteRef.current);
          }
          
          // Create new instance
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['geocode'],
            componentRestrictions: { country: 'IN' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id']
          });
          
          autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        }
      }, 100);
    } else {
      console.warn('No geometry found for selected place');
    }
  };

  if (error) {
    return (
      <div className={`flex items-center px-3 py-2 border border-red-300 rounded-md bg-red-50 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
        <span className="text-red-700 text-sm">{error}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 ${className}`}>
        <MapPin className="h-4 w-4 text-gray-400 mr-2 animate-pulse" />
        <span className="text-gray-500 text-sm">Loading Google Maps...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <MapPin className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          disabled={!isLoaded}
        />
      </div>
      {isLoaded && (
        <div className="text-xs text-gray-500 mt-1">
          ✓ Google Maps loaded successfully
        </div>
      )}
    </div>
  );
};

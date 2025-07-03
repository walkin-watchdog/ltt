import React, { useState, useRef, useEffect } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number, placeId?: string) => void;
  placeholder?: string;
  className?: string;
  countryRestriction?: string;
  types?: string[];
  disabled?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search for a location...",
  className = "",
  countryRestriction = 'IN',
  types = ['geocode'],
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !disabled) {
      initializeAutocomplete();
    }
    return () => {
      cleanupAutocomplete();
    };
  }, [isLoaded, disabled]);

  const cleanupAutocomplete = () => {
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
  };

  const initializeAutocomplete = () => {
    if (
      !inputRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places ||
      disabled
    ) return;
  
    cleanupAutocomplete();
  
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types,
        componentRestrictions: countryRestriction ? { country: countryRestriction } : undefined,
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      });
  
      autocompleteRef.current.addListener('place_changed', onPlaceChanged);
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const locationName = place.formatted_address || place.name || '';
      
      setInputValue(locationName);
      onChange(locationName, lat, lng, place.place_id);
      
      // Reinitialize autocomplete
      setTimeout(() => {
        initializeAutocomplete();
      }, 100);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If user clears the input or types manually, clear coordinates
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  if (loadError) {
    return (
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} pr-10`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span title={loadError}>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={isLoaded ? placeholder : "Loading Google Maps..."}
        disabled={!isLoaded || disabled}
        className={`${className} pr-10`}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {!isLoaded ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff914d]"></div>
        ) : (
          <MapPin className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap } from './GoogleMap';
import { MapPin, X, Edit2, Map, AlertCircle, Plus } from 'lucide-react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { useToast } from './toaster';
import type { LocationDetail, PickupLocationMapProps } from '@/types';


export const PickupLocationMap: React.FC<PickupLocationMapProps> = ({
  locations,
  onLocationsChange,
  className = "",
  maxLocations = 10
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      initializeAutocomplete();
    }
    return () => {
      cleanupAutocomplete();
    };
  }, [isLoaded]);

  const cleanupAutocomplete = () => {
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    cleanupAutocomplete();
    
    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'IN' },
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

      // Check if location already exists
      const existingLocation = locations.find(loc => 
        Math.abs(loc.lat - lat) < 0.0001 && Math.abs(loc.lng - lng) < 0.0001
      );

      if (existingLocation) {
        toast({
          message: 'This location is already added.',
          type: 'info',
        })
        setSearchValue('');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      const newLocation: LocationDetail = {
        address: place.formatted_address || place.name || '',
        lat,
        lng,
        radius: 2,
        placeId: place.place_id
      };

      handleLocationSelect(newLocation);
      
      // Clear and reinitialize
      setSearchValue('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      setTimeout(() => {
        initializeAutocomplete();
      }, 100);
    }
  };

  const handleLocationSelect = (location: LocationDetail) => {
    if (locations.length >= maxLocations) {
     toast({
        message: `Maximum of ${maxLocations} pickup locations reached.`,
        type: 'error',
     })
      return;
    }
    onLocationsChange([...locations, location]);
  };

  const handleLocationRemove = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    onLocationsChange(updatedLocations);
    // Reset editing if the location being edited is removed
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleRadiusChange = (index: number, radius: number) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = { ...updatedLocations[index], radius };
    onLocationsChange(updatedLocations);
    setEditingIndex(null);
  };

  if (loadError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center px-3 py-2 border border-red-300 rounded-md bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Pickup Locations</h3>
          <p className="text-sm text-gray-600">
            Add up to {maxLocations} pickup locations for travelers to choose from
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {locations.length} / {maxLocations} locations
        </div>
      </div>

      {/* Add Location Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Pickup Location
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={isLoaded ? "Search and select pickup location..." : "Loading Google Maps..."}
            disabled={!isLoaded || locations.length >= maxLocations}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent disabled:bg-gray-100"
          />
          {!isLoaded ? (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff914d]"></div>
            </div>
          ) : locations.length >= maxLocations ? (
            <div className="absolute right-3 top-2.5">
              <AlertCircle className="h-4 w-4 text-gray-400" />
            </div>
          ) : (
            <div className="absolute right-3 top-2.5">
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
        {locations.length >= maxLocations && (
          <p className="text-xs text-amber-600 mt-1">
            Maximum number of pickup locations reached
          </p>
        )}
      </div>

      {/* Map Display */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Map View
          </label>
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center space-x-1 text-sm text-[#ff914d] hover:text-[#e8823d]"
          >
            <Map className="h-4 w-4" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>
        {showMap && isLoaded && (
          <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            <GoogleMap
              locations={locations}
              className="w-full h-full"
              height="400px"
            />
          </div>
        )}
      </div>

      {/* Locations List */}
      {locations.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Pickup Locations ({locations.length})
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md">
            {locations.map((location, index) => (
              <div key={index} className="flex items-start justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-[#ff914d] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate" title={location.address}>
                        {location.address}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Radius:
                        </span>
                        {editingIndex === index ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0.5"
                              max="10"
                              step="0.5"
                              value={location.radius}
                              onChange={(e) => handleRadiusChange(index, parseFloat(e.target.value))}
                              onBlur={() => setEditingIndex(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setEditingIndex(null);
                                }
                                if (e.key === 'Escape') {
                                  setEditingIndex(null);
                                }
                              }}
                              className="w-16 px-1 py-0 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff914d]"
                              autoFocus
                            />
                            <span className="text-xs text-gray-500">km</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingIndex(index)}
                            className="flex items-center space-x-1 text-xs text-[#ff914d] hover:text-[#e8823d]"
                          >
                            <span>{location.radius}km</span>
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLocationRemove(index)}
                  className="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
                  title="Remove this pickup location"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {locations.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No pickup locations added yet</p>
          <p className="text-gray-400 text-xs">Use the search above to add pickup locations</p>
        </div>
      )}
    </div>
  );
};

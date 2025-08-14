'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { googleMapsService, LocationSuggestion } from '@/lib/googleMapsService';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search for restaurant location...",
  className = ""
}: GooglePlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false); // Add this to track selection state
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Google Maps on component mount
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        console.log('Google Maps API Key check:', {
          hasKey: !!apiKey,
          keyLength: apiKey?.length || 0,
          keyStart: apiKey ? apiKey.substring(0, 10) + '...' : 'undefined'
        });
        
        // Only initialize if API key is provided
        if (apiKey) {
          await googleMapsService.initialize();
          setIsGoogleMapsLoaded(true);
          console.log('Google Maps initialized successfully');
        } else {
          console.log('Google Maps API key not found, using fallback');
          setIsGoogleMapsLoaded(false);
        }
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        setIsGoogleMapsLoaded(false);
      }
    };

    initializeGoogleMaps();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Handle search input changes with debouncing
  useEffect(() => {
    // Don't search if we're in the middle of selecting
    if (isSelecting) {
      return;
    }
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        // Double-check we're not selecting
        if (isSelecting) {
          return;
        }
        
        setIsLoading(true);
        try {
          if (isGoogleMapsLoaded) {
            const results = await googleMapsService.searchPlaces(value);
            setSuggestions(results);
          } else {
            // Fallback to static location service if Google Maps fails
            const { searchLocations } = await import('@/lib/locationService');
            const results = searchLocations(value);
            
            // Convert local results to proper format
            const formattedResults = results.map(result => ({
              address: result.address,
              city: result.city,
              province: result.province,
              latitude: result.latitude,
              longitude: result.longitude,
              placeId: `local_${result.address.replace(/\s+/g, '_')}`
            }));
            
            setSuggestions(formattedResults);
            console.log(`Local search for "${value}":`, {
              searchTerm: value,
              resultsFound: formattedResults.length,
              results: formattedResults.slice(0, 3) // Show first 3 for debugging
            });
          }
          
          // Only show suggestions if we're not in the middle of selecting
          if (!isSelecting) {
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        }
        setIsLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [value, isGoogleMapsLoaded, isSelecting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    console.log('Suggestion clicked:', suggestion);
    
    // Set selection state to prevent any further dropdown showing
    setIsSelecting(true);
    
    // Clear any pending timeouts immediately
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    // Force hide suggestions and clear suggestions array
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Update input value
    onChange(suggestion.address);
    
    // Blur the input to remove focus and prevent re-opening
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // Prepare location data for callback
    let locationData = suggestion;

    // If this is a Google Places result, try to get detailed information
    if (suggestion.placeId && isGoogleMapsLoaded && !suggestion.placeId.startsWith('local_')) {
      try {
        console.log('Getting detailed location for place ID:', suggestion.placeId);
        const detailedLocation = await googleMapsService.getLocationDetails(suggestion.placeId);
        if (detailedLocation) {
          locationData = detailedLocation;
          console.log('Got detailed location:', detailedLocation);
        }
      } catch (error) {
        console.error('Error getting location details:', error);
        // Continue with original suggestion data
      }
    }

    // Always call onLocationSelect if provided
    if (onLocationSelect) {
      console.log('Calling onLocationSelect with:', locationData);
      onLocationSelect(locationData);
    }
    
    // Reset selection state after a longer delay to ensure everything is settled
    setTimeout(() => {
      setIsSelecting(false);
    }, 500);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && !isSelecting) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Don't hide suggestions if we're in the middle of selecting
    if (isSelecting) {
      return;
    }
    
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // Delay hiding suggestions to allow click events, but make it shorter
    blurTimeoutRef.current = setTimeout(() => {
      if (!isSelecting) {
        setShowSuggestions(false);
      }
    }, 100);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-10 border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
          placeholder={placeholder}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Google Maps Status Indicator */}
      <div className="absolute top-0 right-0 -mr-1 -mt-1">
        <div className={`text-xs px-2 py-1 rounded-full text-white ${
          isGoogleMapsLoaded 
            ? 'bg-green-600' 
            : 'bg-yellow-600'
        }`}>
          {isGoogleMapsLoaded ? '🌍' : '📍'}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.placeId || index}
                onMouseDown={(e) => {
                  // Prevent default to avoid focus issues
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
              >
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {suggestion.address}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {suggestion.city && suggestion.province ? 
                        `${suggestion.city}, ${suggestion.province}` : 
                        suggestion.province || 'South Africa'
                      }
                    </div>
                    {suggestion.placeId && (
                      <div className="text-green-400 text-xs mt-1">
                        📍 Verified location
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-400 text-sm">
              {isLoading ? 'Searching...' : 'No locations found. Try a different search term.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

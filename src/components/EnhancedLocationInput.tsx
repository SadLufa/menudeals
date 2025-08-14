'use client';

import React, { useState } from 'react';
import { MapPin, Globe, Navigation } from 'lucide-react';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

interface LocationWithCoordinates {
  address: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  province?: string;
  placeId?: string;
}

interface EnhancedLocationInputProps {
  value: string;
  onChange: (address: string) => void;
  onLocationSelect: (location: LocationWithCoordinates) => void;
  placeholder?: string;
  className?: string;
}

export default function EnhancedLocationInput({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Enter restaurant address...",
  className = ""
}: EnhancedLocationInputProps) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCoords, setManualCoords] = useState({
    latitude: '',
    longitude: ''
  });
  const [isUsingBrowserLocation, setIsUsingBrowserLocation] = useState(false);

  const handleGooglePlacesSelect = (location: LocationWithCoordinates) => {
    onLocationSelect(location);
    setShowManualEntry(false);
  };

  const handleManualCoordsSubmit = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude coordinates');
      return;
    }

    // Basic validation for South African coordinates
    if (lat < -35 || lat > -22 || lng < 16 || lng > 33) {
      alert('Coordinates appear to be outside South Africa. Please verify the coordinates.');
      return;
    }

    onLocationSelect({
      address: value || `${lat}, ${lng}`,
      latitude: lat,
      longitude: lng,
      city: 'Manual Entry',
      province: 'Manual Entry',
      placeId: `manual_${lat}_${lng}`
    });

    setShowManualEntry(false);
    setManualCoords({ latitude: '', longitude: '' });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setIsUsingBrowserLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setManualCoords({
          latitude: lat.toString(),
          longitude: lng.toString()
        });

        onLocationSelect({
          address: value || `Current Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
          latitude: lat,
          longitude: lng,
          city: 'Current Location',
          province: 'Current Location',
          placeId: `current_${lat}_${lng}`
        });

        setIsUsingBrowserLocation(false);
        setShowManualEntry(false);
      },
      (error) => {
        console.error('Error getting current location:', error);
        alert('Unable to get current location. Please enter coordinates manually.');
        setIsUsingBrowserLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-2">
      {/* Main Google Places Input */}
      <GooglePlacesAutocomplete
        value={value}
        onChange={onChange}
        onLocationSelect={handleGooglePlacesSelect}
        placeholder={placeholder}
        className={className}
      />

      {/* Manual Entry Toggle */}
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span>Manual coordinates</span>
        </button>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isUsingBrowserLocation}
          className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors disabled:text-gray-500"
        >
          <Navigation className="w-4 h-4" />
          <span>{isUsingBrowserLocation ? 'Getting location...' : 'Use current location'}</span>
        </button>
      </div>

      {/* Manual Coordinate Entry */}
      {showManualEntry && (
        <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">Manual Coordinate Entry</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={manualCoords.latitude}
                onChange={(e) => setManualCoords(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="-26.1956"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={manualCoords.longitude}
                onChange={(e) => setManualCoords(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="28.0341"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="text-xs text-gray-400">
            <p>💡 <strong>How to get coordinates:</strong></p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Maps</a></li>
              <li>Right-click on the restaurant location</li>
              <li>Click the coordinates that appear at the top</li>
              <li>Copy and paste them here</li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleManualCoordsSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
            >
              Set Location
            </button>
            <button
              type="button"
              onClick={() => setShowManualEntry(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coordinate Display */}
      {value && (
        <div className="text-xs text-gray-400">
          <span>📍 Address: {value}</span>
        </div>
      )}
    </div>
  );
}

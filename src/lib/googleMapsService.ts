// Google Maps Places API service for location autocomplete
import { Loader } from '@googlemaps/js-api-loader';

export interface GooglePlaceResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface LocationSuggestion {
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

class GoogleMapsService {
  private loader: Loader;
  private isLoaded = false;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places']
    });
  }

  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not found');
    }

    try {
      await this.loader.load();
      this.autocompleteService = new google.maps.places.AutocompleteService();
      
      // Create a placeholder div for PlacesService (required by Google Maps API)
      const placeholderDiv = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(placeholderDiv);
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load Google Maps API:', error);
      throw error;
    }
  }

  async searchPlaces(query: string): Promise<LocationSuggestion[]> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.autocompleteService || !query || query.length < 2) {
      return [];
    }

    return new Promise((resolve) => {
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: 'za' }, // Restrict to South Africa
        types: ['establishment', 'geocode'], // Include businesses and addresses
      };

      this.autocompleteService!.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions: LocationSuggestion[] = predictions.map(prediction => ({
            address: prediction.description,
            city: this.extractCity(prediction),
            province: this.extractProvince(prediction),
            placeId: prediction.place_id
          }));
          resolve(suggestions);
        } else {
          console.warn('Google Places API error:', status);
          resolve([]);
        }
      });
    });
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.placesService) {
      return null;
    }

    return new Promise((resolve) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ['place_id', 'formatted_address', 'name', 'geometry', 'address_components']
      };

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place as GooglePlaceResult);
        } else {
          console.warn('Google Place Details API error:', status);
          resolve(null);
        }
      });
    });
  }

  async getLocationDetails(placeId: string): Promise<LocationSuggestion | null> {
    const placeDetails = await this.getPlaceDetails(placeId);
    
    if (!placeDetails) {
      return null;
    }

    return {
      address: placeDetails.formatted_address,
      city: this.extractCityFromComponents(placeDetails.address_components),
      province: this.extractProvinceFromComponents(placeDetails.address_components),
      latitude: placeDetails.geometry.location.lat(),
      longitude: placeDetails.geometry.location.lng(),
      placeId: placeDetails.place_id
    };
  }

  private extractCity(prediction: google.maps.places.AutocompletePrediction): string {
    // Try to extract city from the description
    const terms = prediction.terms;
    if (terms && terms.length >= 2) {
      return terms[terms.length - 2].value;
    }
    return '';
  }

  private extractProvince(prediction: google.maps.places.AutocompletePrediction): string {
    // Try to extract province from the description
    const description = prediction.description.toLowerCase();
    
    const provinces = [
      'western cape', 'gauteng', 'kwazulu-natal', 'eastern cape',
      'mpumalanga', 'limpopo', 'north west', 'free state', 'northern cape'
    ];

    for (const province of provinces) {
      if (description.includes(province)) {
        return this.capitalizeWords(province);
      }
    }

    return 'South Africa';
  }

  private extractCityFromComponents(components: Array<{long_name: string; types: string[]}>): string {
    const cityComponent = components.find(component => 
      component.types.includes('locality') || 
      component.types.includes('sublocality') ||
      component.types.includes('administrative_area_level_3')
    );
    return cityComponent?.long_name || '';
  }

  private extractProvinceFromComponents(components: Array<{long_name: string; types: string[]}>): string {
    const provinceComponent = components.find(component => 
      component.types.includes('administrative_area_level_1')
    );
    return provinceComponent?.long_name || 'South Africa';
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Singleton instance
export const googleMapsService = new GoogleMapsService();

// Fallback function that combines Google Places with our static data
export async function searchLocationsWithGoogle(query: string): Promise<LocationSuggestion[]> {
  try {
    // First try Google Places API
    const googleResults = await googleMapsService.searchPlaces(query);
    
    if (googleResults.length > 0) {
      return googleResults.slice(0, 8); // Limit to 8 results
    }
    
    // Fallback to static data if Google API fails or no results
    const { searchLocations } = await import('./locationService');
    return searchLocations(query);
  } catch (error) {
    console.error('Google Places API error, falling back to static data:', error);
    
    // Fallback to static data
    const { searchLocations } = await import('./locationService');
    return searchLocations(query);
  }
}

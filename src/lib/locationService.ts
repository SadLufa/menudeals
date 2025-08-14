// Location service for address autocomplete with comprehensive South African locations
// This can be integrated with Google Places API for real autocomplete

export interface LocationSuggestion {
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

// Comprehensive South African locations database
export const southAfricanLocations: LocationSuggestion[] = [
  // Western Cape - Cape Town Metro
  { address: "Long Street, Cape Town, Western Cape", city: "Cape Town", province: "Western Cape", latitude: -33.9249, longitude: 18.4241 },
  { address: "V&A Waterfront, Cape Town, Western Cape", city: "Cape Town", province: "Western Cape", latitude: -33.9036, longitude: 18.4196 },
  { address: "Sea Point, Cape Town, Western Cape", city: "Cape Town", province: "Western Cape", latitude: -33.9249, longitude: 18.3826 },
  { address: "Camps Bay, Cape Town, Western Cape", city: "Cape Town", province: "Western Cape", latitude: -33.9508, longitude: 18.3774 },
  { address: "Constantia, Cape Town, Western Cape", city: "Cape Town", province: "Western Cape", latitude: -34.0341, longitude: 18.4292 },
  { address: "Bellville, Cape Town, Western Cape", city: "Bellville", province: "Western Cape", latitude: -33.9036, longitude: 18.6290 },
  { address: "Stellenbosch, Western Cape", city: "Stellenbosch", province: "Western Cape", latitude: -33.9321, longitude: 18.8602 },
  { address: "Paarl, Western Cape", city: "Paarl", province: "Western Cape", latitude: -33.7353, longitude: 18.9648 },
  { address: "Worcester, Western Cape", city: "Worcester", province: "Western Cape", latitude: -33.6513, longitude: 19.4481 },
  { address: "George, Western Cape", city: "George", province: "Western Cape", latitude: -33.9628, longitude: 22.4619 },

  // Gauteng - Johannesburg Metro
  { address: "Sandton, Johannesburg, Gauteng", city: "Johannesburg", province: "Gauteng", latitude: -26.1076, longitude: 28.0567 },
  { address: "Rosebank, Johannesburg, Gauteng", city: "Johannesburg", province: "Gauteng", latitude: -26.1467, longitude: 28.0436 },
  { address: "Rosemead, Johannesburg, Gauteng", city: "Johannesburg", province: "Gauteng", latitude: -26.1234, longitude: 28.0456 },
  { address: "Fourways, Johannesburg, Gauteng", city: "Johannesburg", province: "Gauteng", latitude: -25.9985, longitude: 28.0088 },
  { address: "Randburg, Johannesburg, Gauteng", city: "Randburg", province: "Gauteng", latitude: -26.0940, longitude: 27.9779 },
  { address: "Midrand, Johannesburg, Gauteng", city: "Midrand", province: "Gauteng", latitude: -25.9895, longitude: 28.1288 },
  { address: "Roodepoort, Johannesburg, Gauteng", city: "Roodepoort", province: "Gauteng", latitude: -26.1625, longitude: 27.8669 },
  { address: "Soweto, Johannesburg, Gauteng", city: "Soweto", province: "Gauteng", latitude: -26.2678, longitude: 27.8546 },
  { address: "Bedfordview, Johannesburg, Gauteng", city: "Bedfordview", province: "Gauteng", latitude: -26.1730, longitude: 28.1187 },
  { address: "Benoni, Johannesburg, Gauteng", city: "Benoni", province: "Gauteng", latitude: -26.1885, longitude: 28.3207 },
  { address: "Boksburg, Johannesburg, Gauteng", city: "Boksburg", province: "Gauteng", latitude: -26.2081, longitude: 28.2627 },
  { address: "Germiston, Johannesburg, Gauteng", city: "Germiston", province: "Gauteng", latitude: -26.2309, longitude: 28.1775 },
  { address: "Kempton Park, Johannesburg, Gauteng", city: "Kempton Park", province: "Gauteng", latitude: -26.1011, longitude: 28.2305 },
  
  // Gauteng - Pretoria Metro
  { address: "Pretoria Central, Pretoria, Gauteng", city: "Pretoria", province: "Gauteng", latitude: -25.7479, longitude: 28.2293 },
  { address: "Hatfield, Pretoria, Gauteng", city: "Pretoria", province: "Gauteng", latitude: -25.7496, longitude: 28.2336 },
  { address: "Centurion, Gauteng", city: "Centurion", province: "Gauteng", latitude: -25.8601, longitude: 28.1878 },
  { address: "Menlyn, Pretoria, Gauteng", city: "Pretoria", province: "Gauteng", latitude: -25.7845, longitude: 28.2777 },
  
  // KwaZulu-Natal - Durban Metro
  { address: "Durban Central, Durban, KwaZulu-Natal", city: "Durban", province: "KwaZulu-Natal", latitude: -29.8587, longitude: 31.0218 },
  { address: "Umhlanga, Durban, KwaZulu-Natal", city: "Umhlanga", province: "KwaZulu-Natal", latitude: -29.7273, longitude: 31.0844 },
  { address: "Westville, Durban, KwaZulu-Natal", city: "Westville", province: "KwaZulu-Natal", latitude: -29.8394, longitude: 30.9286 },
  { address: "Pietermaritzburg, KwaZulu-Natal", city: "Pietermaritzburg", province: "KwaZulu-Natal", latitude: -29.6007, longitude: 30.3794 },
  { address: "Newcastle, KwaZulu-Natal", city: "Newcastle", province: "KwaZulu-Natal", latitude: -27.7576, longitude: 29.9319 },

  // Mpumalanga
  { address: "Nelspruit, Mpumalanga", city: "Nelspruit", province: "Mpumalanga", latitude: -25.4753, longitude: 30.9700 },
  { address: "eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8676, longitude: 29.2339 },
  { address: "Witbank, Mpumalanga", city: "Witbank", province: "Mpumalanga", latitude: -25.8738, longitude: 29.2278 },
  { address: "Secunda, Mpumalanga", city: "Secunda", province: "Mpumalanga", latitude: -26.5503, longitude: 29.1781 },
  { address: "Sabie, Mpumalanga", city: "Sabie", province: "Mpumalanga", latitude: -25.1201, longitude: 30.7704 },
  { address: "Hazyview, Mpumalanga", city: "Hazyview", province: "Mpumalanga", latitude: -25.0421, longitude: 31.1206 },
  
  // Mpumalanga - eMalahleni/Witbank Streets and Areas
  { address: "Erasmus Street, eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8700, longitude: 29.2350 },
  { address: "Mandela Drive, eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8650, longitude: 29.2300 },
  { address: "Beatrix Street, eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8720, longitude: 29.2320 },
  { address: "Voortrekker Street, eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8680, longitude: 29.2280 },
  { address: "Church Street, eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8690, longitude: 29.2340 },
  { address: "Klipfontein, eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8800, longitude: 29.2400 },
  { address: "Highveld Ridge, eMalahleni, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8600, longitude: 29.2250 },
  { address: "eMalahleni Central, Mpumalanga", city: "eMalahleni", province: "Mpumalanga", latitude: -25.8676, longitude: 29.2339 },
  
  // Mpumalanga - Nelspruit Streets and Areas
  { address: "Henshall Street, Nelspruit, Mpumalanga", city: "Nelspruit", province: "Mpumalanga", latitude: -25.4750, longitude: 30.9720 },
  { address: "Paul Kruger Street, Nelspruit, Mpumalanga", city: "Nelspruit", province: "Mpumalanga", latitude: -25.4760, longitude: 30.9710 },
  { address: "Brown Street, Nelspruit, Mpumalanga", city: "Nelspruit", province: "Mpumalanga", latitude: -25.4740, longitude: 30.9690 },
  { address: "West Acres, Nelspruit, Mpumalanga", city: "Nelspruit", province: "Mpumalanga", latitude: -25.4800, longitude: 30.9650 },
  { address: "Riverside Mall, Nelspruit, Mpumalanga", city: "Nelspruit", province: "Mpumalanga", latitude: -25.4700, longitude: 30.9750 },
  { address: "Sonheuwel, Nelspruit, Mpumalanga", city: "Nelspruit", province: "Mpumalanga", latitude: -25.4820, longitude: 30.9680 },

  // Limpopo
  { address: "Polokwane, Limpopo", city: "Polokwane", province: "Limpopo", latitude: -23.9045, longitude: 29.4689 },
  { address: "Tzaneen, Limpopo", city: "Tzaneen", province: "Limpopo", latitude: -23.8328, longitude: 30.1634 },
  { address: "Thohoyandou, Limpopo", city: "Thohoyandou", province: "Limpopo", latitude: -22.9463, longitude: 30.4845 },

  // North West
  { address: "Mahikeng, North West", city: "Mahikeng", province: "North West", latitude: -25.8601, longitude: 25.6358 },
  { address: "Rustenburg, North West", city: "Rustenburg", province: "North West", latitude: -25.6672, longitude: 27.2423 },
  { address: "Klerksdorp, North West", city: "Klerksdorp", province: "North West", latitude: -26.8523, longitude: 26.6647 },
  { address: "Potchefstroom, North West", city: "Potchefstroom", province: "North West", latitude: -26.7056, longitude: 27.0982 },

  // Free State
  { address: "Bloemfontein, Free State", city: "Bloemfontein", province: "Free State", latitude: -29.0852, longitude: 26.1596 },
  { address: "Welkom, Free State", city: "Welkom", province: "Free State", latitude: -27.9770, longitude: 26.7312 },
  { address: "Kroonstad, Free State", city: "Kroonstad", province: "Free State", latitude: -27.6506, longitude: 27.2340 },

  // Eastern Cape
  { address: "Port Elizabeth, Eastern Cape", city: "Port Elizabeth", province: "Eastern Cape", latitude: -33.9608, longitude: 25.6022 },
  { address: "East London, Eastern Cape", city: "East London", province: "Eastern Cape", latitude: -33.0153, longitude: 27.8546 },
  { address: "Grahamstown, Eastern Cape", city: "Grahamstown", province: "Eastern Cape", latitude: -33.3047, longitude: 26.5328 },

  // Northern Cape
  { address: "Kimberley, Northern Cape", city: "Kimberley", province: "Northern Cape", latitude: -28.7282, longitude: 24.7499 },
  { address: "Upington, Northern Cape", city: "Upington", province: "Northern Cape", latitude: -28.4478, longitude: 21.256 },

  // Additional street-level locations for major cities
  { address: "Main Street, Johannesburg, Gauteng", city: "Johannesburg", province: "Gauteng", latitude: -26.2041, longitude: 28.0473 },
  { address: "Church Street, Pretoria, Gauteng", city: "Pretoria", province: "Gauteng", latitude: -25.7479, longitude: 28.2293 },
  { address: "Adderley Street, Cape Town, Western Cape", city: "Cape Town", province: "Western Cape", latitude: -33.9249, longitude: 18.4241 },
  { address: "West Street, Durban, KwaZulu-Natal", city: "Durban", province: "KwaZulu-Natal", latitude: -29.8587, longitude: 31.0218 },
  
  // Shopping Centers and Landmarks
  { address: "Sandton City, Sandton, Gauteng", city: "Sandton", province: "Gauteng", latitude: -26.1076, longitude: 28.0567 },
  { address: "Canal Walk, Cape Town, Western Cape", city: "Cape Town", province: "Western Cape", latitude: -33.8950, longitude: 18.5078 },
  { address: "Gateway Theatre of Shopping, Durban, KwaZulu-Natal", city: "Durban", province: "KwaZulu-Natal", latitude: -29.7273, longitude: 31.0844 },
  { address: "Mall of Africa, Midrand, Gauteng", city: "Midrand", province: "Gauteng", latitude: -25.9895, longitude: 28.1288 },
  { address: "Menlyn Park Shopping Centre, Pretoria, Gauteng", city: "Pretoria", province: "Gauteng", latitude: -25.7845, longitude: 28.2777 },
];

export function searchLocations(query: string): LocationSuggestion[] {
  if (!query || query.length < 2) {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  // First try exact matches
  let results = southAfricanLocations.filter((location: LocationSuggestion) => {
    return (
      location.address.toLowerCase().includes(searchTerm) ||
      location.city.toLowerCase().includes(searchTerm) ||
      location.province.toLowerCase().includes(searchTerm)
    );
  });
  
  // If no exact matches, try fuzzy matching (partial words)
  if (results.length === 0) {
    results = southAfricanLocations.filter((location: LocationSuggestion) => {
      const addressLower = location.address.toLowerCase();
      const cityLower = location.city.toLowerCase();
      const provinceLower = location.province.toLowerCase();
      
      // Split search term into words and check if any word partially matches
      const searchWords = searchTerm.split(' ').filter(word => word.length > 1);
      const locationText = `${addressLower} ${cityLower} ${provinceLower}`;
      
      return searchWords.some(searchWord => {
        // Check if search word is contained in any part of the location
        return locationText.split(/[\s,]+/).some(locationWord => 
          locationWord.includes(searchWord) || searchWord.includes(locationWord)
        );
      });
    });
  }
  
  // Sort results by relevance (city matches first, then address)
  results.sort((a, b) => {
    const aCityMatch = a.city.toLowerCase().includes(searchTerm);
    const bCityMatch = b.city.toLowerCase().includes(searchTerm);
    
    if (aCityMatch && !bCityMatch) return -1;
    if (!aCityMatch && bCityMatch) return 1;
    
    return a.city.localeCompare(b.city);
  });
  
  return results.slice(0, 10); // Limit to 10 suggestions
}

// Enhanced search with province and city filtering
export function searchLocationsByProvince(query: string, province?: string): LocationSuggestion[] {
  if (!query || query.length < 2) {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  let filteredLocations = southAfricanLocations;
  
  // Filter by province if specified
  if (province) {
    filteredLocations = southAfricanLocations.filter((location: LocationSuggestion) => 
      location.province.toLowerCase() === province.toLowerCase()
    );
  }
  
  // First try exact matching
  let results = filteredLocations.filter((location: LocationSuggestion) => {
    const addressMatch = location.address.toLowerCase().includes(searchTerm);
    const cityMatch = location.city.toLowerCase().includes(searchTerm);
    return addressMatch || cityMatch;
  });
  
  // If no exact matches and query has multiple words, try partial matching
  if (results.length === 0 && searchTerm.includes(' ')) {
    const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
    results = filteredLocations.filter((location: LocationSuggestion) => {
      const locationText = `${location.address} ${location.city}`.toLowerCase();
      return searchWords.some(word => locationText.includes(word));
    });
  }
  
  // Limit results
  results = results.slice(0, 10);
  
  // If still no results found and we have a province, allow custom address
  if (results.length === 0 && province && query.length >= 3) {
    const customLocation: LocationSuggestion = {
      address: `${query}, ${province}`,
      city: query.split(',')[0].trim(),
      province: province
    };
    return [customLocation];
  }
  
  return results;
}

// Get all unique provinces
export function getProvinces(): string[] {
  const provinces = [...new Set(southAfricanLocations.map(location => location.province))];
  return provinces.sort();
}

// Get cities by province
export function getCitiesByProvince(province: string): string[] {
  const cities = southAfricanLocations
    .filter(location => location.province.toLowerCase() === province.toLowerCase())
    .map(location => location.city);
  return [...new Set(cities)].sort();
}

// In a real implementation, this would call Google Places API
export async function getLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!query || query.length < 2) {
    return [];
  }
  
  return searchLocations(query);
}

// Extract coordinates from address for mapping integration
export function getCoordinatesFromAddress(address: string): { latitude?: number; longitude?: number } {
  const location = southAfricanLocations.find((loc: LocationSuggestion) => loc.address === address);
  return {
    latitude: location?.latitude,
    longitude: location?.longitude
  };
}

// Find nearby locations based on coordinates
export function findNearbyLocations(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 25
): LocationSuggestion[] {
  return southAfricanLocations.filter((location: LocationSuggestion) => {
    if (!location.latitude || !location.longitude) return false;
    
    const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
    return distance <= radiusKm;
  });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

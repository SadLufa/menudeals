'use client';

// Updated: August 2025 - Automatic location detection & enhanced More modal v0.1.2
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, MessageCircle, Star } from 'lucide-react';
import Image from 'next/image';
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete';

interface Deal {
  id: string;
  title: string;
  description: string;
  restaurant: string;
  cuisine: string;
  price: number;
  originalPrice: number;
  distance: number;
  views: number;
  rating: number;
  deliveryTime: string;
  hasDelivery: boolean;
  image: string;
  isPromoted: boolean;
  isFeatured?: boolean; // Add isFeatured property
  position?: number;
  mealTime: string;
  latitude?: number;
  longitude?: number;
  locationGroup?: string;
}

// Initialize with empty deals array - will be populated from database API
const mockDeals: Deal[] = [];

export default function HomePage() {
  const [location, setLocation] = useState('Getting your location...');
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [showSuperBoost, setShowSuperBoost] = useState(false);
  const [superBoostTimer, setSuperBoostTimer] = useState(7);
  const [selectedCuisine, setSelectedCuisine] = useState('All Cuisine');
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('Any');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(25); // Default 25km radius
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState('Today');
  const [selectedMealTime, setSelectedMealTime] = useState('All day');
  const [randomizedDeals, setRandomizedDeals] = useState<Deal[]>([]);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [loading, setLoading] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [activeMoreSection, setActiveMoreSection] = useState<string | null>(null);
  const [returnToDealModal, setReturnToDealModal] = useState(false);
  const [locationSearchValue, setLocationSearchValue] = useState('');

  // Fetch deals from API
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      // Use user coordinates if available, otherwise fallback to default location (eMalahleni)
      const lat = userCoordinates?.lat || -25.8758;
      const lng = userCoordinates?.lng || 29.2364;
      
      const params = new URLSearchParams({
        day: selectedCalendarDay,
        lat: lat.toString(),
        lng: lng.toString(),
        radius: selectedRadius.toString(),
        cuisine: selectedCuisine,
        mealTime: selectedMealTime,
        hasDelivery: selectedDeliveryOption
      });

      const response = await fetch(`/api/deals?${params}`);
      const data = await response.json();
      
      const apiDeals = data.deals || [];
      
      // Get mock deals from localStorage and filter by location/distance
      const mockDeals = JSON.parse(localStorage.getItem('menudeals_mock_deals') || '[]');
      const filteredMockDeals = mockDeals.filter((deal: Deal) => {
        if (!deal.latitude || !deal.longitude) return false;
        
        // Calculate distance from user location to mock deal
        const distance = calculateDistance(lat, lng, deal.latitude, deal.longitude);
        return distance <= selectedRadius;
      }).map((deal: Deal) => ({
        ...deal,
        distance: calculateDistance(lat, lng, deal.latitude!, deal.longitude!)
      }));
      
      // Combine API deals with filtered mock deals
      const allDeals = [...apiDeals, ...filteredMockDeals];
      
      setDeals(allDeals);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      // Fallback to mock data only
      const mockDeals = JSON.parse(localStorage.getItem('menudeals_mock_deals') || '[]');
      setDeals(mockDeals);
    } finally {
      setLoading(false);
    }
  }, [selectedCalendarDay, selectedCuisine, selectedMealTime, selectedDeliveryOption, selectedRadius, userCoordinates]);

  // Distance calculation function (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return Math.round(d);
  };

  // Fetch deals when filters change or location updates
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Fisher-Yates shuffle algorithm for randomizing arrays
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get current day and generate days array starting from yesterday (or Monday if today is Tuesday)
  const getCurrentDayIndex = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  };

  const generateDaysArray = () => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentIndex = getCurrentDayIndex();
    
    // If today is Tuesday (index 1), start with Monday
    const startIndex = currentIndex === 0 ? 0 : currentIndex - 1;
    
    const orderedDays = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (startIndex + i) % 7;
      const dayName = dayNames[dayIndex];
      if (dayIndex === currentIndex) {
        orderedDays.push('Today');
      } else {
        orderedDays.push(dayName);
      }
    }
    
    return orderedDays;
  };

  const days = generateDaysArray();

  // Randomize deals on component mount and when selected day changes
  useEffect(() => {
    setRandomizedDeals(shuffleArray(deals));
  }, [selectedCalendarDay, deals]);

  // Get deals for specific day with different featured deals
  const getDealsForDay = (day: string) => {
    // Start with the fetched deals (or randomized if available)
    const baseDeals = randomizedDeals.length > 0 ? [...randomizedDeals] : [...deals];
    
    // Reset all promotions first
    baseDeals.forEach(deal => {
      deal.isPromoted = false;
      delete deal.position;
    });
    
    // Get featured deal IDs for the selected day
    const getFeaturedDealsForDay = (selectedDay: string) => {
      switch(selectedDay) {
        case 'Today':
        case 'Monday':
          return ['1', '2', '3']; // Burger, Pizza, Traditional Breakfast
        case 'Tuesday':
          return ['2', '4', '7']; // Pizza Tuesday, Bunny Chow, Coffee
        case 'Wednesday':
          return ['4', '11', '6']; // Bunny Chow Wednesday, Gatsby, Fish & Chips
        case 'Thursday':
          return ['14', '5', '15']; // Steak Thursday, Grilled Chicken, Chicken Tikka
        case 'Friday':
          return ['8', '9', '19']; // Braai Platter, Sushi, Peri-Peri
        case 'Saturday':
          return ['16', '20', '13']; // Breakfast Burger, Milkshake & Waffle, Gourmet Salad
        case 'Sunday':
          return ['18', '10', '12']; // Bobotie, Lamb Curry, Vetkoek
        default:
          return ['1', '2', '3'];
      }
    };
    
    const featuredDealIds = getFeaturedDealsForDay(day);
    
    // Extract featured deals and set their positions
    const featuredDeals: Deal[] = [];
    const regularDeals: Deal[] = [];
    
    baseDeals.forEach(deal => {
      const featuredIndex = featuredDealIds.indexOf(deal.id);
      if (featuredIndex !== -1) {
        // This is a featured deal
        deal.isPromoted = true;
        deal.position = featuredIndex + 1;
        featuredDeals[featuredIndex] = deal;
      } else {
        // This is a regular deal
        regularDeals.push(deal);
      }
    });
    
    // Combine featured deals (in order) with randomized regular deals
    const finalDeals = [...featuredDeals.filter(Boolean), ...regularDeals];
    
    return finalDeals;
  };

  // Filter deals based on selected filters and day (API handles most filtering)
  const currentDayDeals = getDealsForDay(selectedCalendarDay);
  const filteredDeals = currentDayDeals; // API already filters, so we use all returned deals

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealModal(true);
    // Track view analytics
    console.log('Deal viewed:', deal.title);
  };

  const handleCallRestaurant = (deal: Deal) => {
    // Simulate phone call
    alert(`Calling ${deal.restaurant}...`);
    console.log('Call clicked for:', deal.restaurant);
  };

  const handleWhatsApp = (deal: Deal) => {
    // Simulate WhatsApp message
    const message = `Hi, I am interested in your "${deal.title}" which I found on MenuDeals.online`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    console.log('WhatsApp clicked for:', deal.restaurant);
  };

  // Show Super Boost popup after location is detected and only once per day
  useEffect(() => {
    // Only show super boost if we have user location (either detected or default)
    if (!userCoordinates) return;
    
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem('lastSuperBoostSeen');
    
    console.log('SuperBoost check:', { 
      today, 
      lastSeen, 
      hasLocation: !!userCoordinates,
      shouldShow: lastSeen !== today 
    });
    
    // Show super boost only if:
    // 1. User has location coordinates
    // 2. Haven't seen it today
    if (lastSeen !== today) {
      // Add a small delay to ensure location is properly set
      const timer = setTimeout(() => {
        setShowSuperBoost(true);
        setSuperBoostTimer(7);
        
        // Countdown timer
        const countdown = setInterval(() => {
          setSuperBoostTimer((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              setShowSuperBoost(false);
              localStorage.setItem('lastSuperBoostSeen', today);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Cleanup countdown function
        return () => clearInterval(countdown);
      }, 2000); // 2 second delay after location is detected
      
      // Cleanup timer function
      return () => clearTimeout(timer);
    }
  }, [userCoordinates]); // Depend on userCoordinates instead of component mount

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      
      if (data.city && data.principalSubdivision) {
        return `${data.city}, ${data.principalSubdivision}`;
      } else if (data.locality && data.principalSubdivision) {
        return `${data.locality}, ${data.principalSubdivision}`;
      } else if (data.principalSubdivision) {
        return data.principalSubdivision;
      } else {
        return 'Current location';
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      return 'Current location';
    }
  };

  // Handle location selection from search (for manual location setting)
  const handleLocationSelect = (selectedLocation: { address: string; latitude?: number; longitude?: number }) => {
    console.log('Location selected:', selectedLocation);
    
    setLocation(selectedLocation.address);
    
    if (selectedLocation.latitude && selectedLocation.longitude) {
      console.log('Setting coordinates:', {
        address: selectedLocation.address,
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude
      });
      
      const newCoordinates = {
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude
      };
      
      setUserCoordinates(newCoordinates);
      
      // Persist selected location to localStorage
      localStorage.setItem('userSelectedLocation', JSON.stringify({
        address: selectedLocation.address,
        coordinates: newCoordinates,
        timestamp: Date.now()
      }));
      
      console.log('Location saved to localStorage');
    }
  };

  const requestLocation = useCallback((isAutomatic = false) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('Location granted:', position.coords);
          const { latitude, longitude } = position.coords;
          
          // Store coordinates
          setUserCoordinates({ lat: latitude, lng: longitude });
          
          // Clear any saved manual location since user is using current location
          if (!isAutomatic) {
            localStorage.removeItem('userSelectedLocation');
          }
          
          // Show a loading state while geocoding
          if (isAutomatic) {
            setLocation('Getting your location...');
          }
          
          try {
            const locationName = await reverseGeocode(latitude, longitude);
            setLocation(locationName);
            console.log('Location set to:', locationName);
          } catch (error) {
            console.error('Failed to get location name:', error);
            setLocation('Current location');
          }
        },
        (error) => {
          console.log('Location denied:', error);
          // Fallback to default location if automatic request fails
          if (isAutomatic) {
            setLocation('eMalahleni, Mpumalanga');
          } else {
            // Only show error for manual requests
            alert('Location access was denied. Please enable location services or select a location manually.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else if (isAutomatic) {
      // Geolocation not supported, use default location
      setLocation('eMalahleni, Mpumalanga');
    }
  }, []);

  // Auto-request location on app load
  useEffect(() => {
    // First check if user has a saved location preference
    const savedLocation = localStorage.getItem('userSelectedLocation');
    
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        const timeDiff = Date.now() - parsed.timestamp;
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        // Use saved location if it's less than 1 hour old
        if (timeDiff < oneHour && parsed.address && parsed.coordinates) {
          console.log('Using saved location:', parsed);
          setLocation(parsed.address);
          setUserCoordinates(parsed.coordinates);
          return; // Don't request automatic location
        } else {
          // Clear old saved location
          localStorage.removeItem('userSelectedLocation');
        }
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('userSelectedLocation');
      }
    }
    
    // Only request automatic location if no valid saved location
    requestLocation(true);
  }, [requestLocation]);

  return (
    <div className="min-h-screen">
      {/* Super Boost Popup - Redesigned */}
      {showSuperBoost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-semibold tracking-wide">FEATURED DEAL</span>
              </div>
              <button 
                onClick={() => {
                  setShowSuperBoost(false);
                  localStorage.setItem('lastSuperBoostSeen', new Date().toDateString());
                }}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Deal Image */}
            <div className="relative h-40 bg-gradient-to-br from-amber-100 to-amber-200">
              <img 
                src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop&auto=format&q=80" 
                alt="Super Boost Deal"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-3 left-3 bg-amber-500 rounded-lg px-3 py-1">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Super Boost</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Restaurant Info */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-1">2-for-1 Gourmet Burgers</h3>
                <p className="text-amber-400 font-semibold text-sm">Burger Palace</p>
                <div className="flex items-center justify-center space-x-3 text-gray-400 text-xs mt-1">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    2.5km away
                  </span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    4.8 rating
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-gray-700 rounded-xl p-3 text-center border border-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold text-amber-400">R89.99</span>
                  <span className="text-sm text-gray-400 line-through">R149.98</span>
                </div>
                <p className="text-green-400 font-semibold text-xs mt-1">Save R59.99 (40% off)</p>
              </div>
                
              {/* View Deal Button */}
              <button 
                onClick={() => {
                  setShowSuperBoost(false);
                  localStorage.setItem('lastSuperBoostSeen', new Date().toDateString());
                }}
                className="w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>View Deal</span>
              </button>

              {/* Timer */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-gray-300 text-sm">Auto-closing in</span>
                <span className="bg-amber-500 text-white font-bold px-2 py-1 rounded text-sm min-w-[1.5rem] text-center">
                  {superBoostTimer}
                </span>
                <span className="text-gray-300 text-sm">sec</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="container mx-auto max-w-2xl pb-24">
        
        {/* Header */}
        <header className="p-4">
          {/* Logo - Full Width */}
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="MenuDeals Logo" 
              width={200} 
              height={60}
              className="w-full max-w-xs h-auto object-contain"
            />
          </div>
          
          {/* Location Section */}
          <div>
            <p className="text-sm text-gray-400">Deals near</p>
            <h1 className="text-2xl font-bold text-white flex items-center">
              {location}
              <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </h1>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for deals or restaurants" 
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Filter Options - Dropdown Design */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
          {/* Cuisine Dropdown */}
          <div className="relative">
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg py-3 px-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="All Cuisine">🍽️ All Cuisine</option>
              <option value="Traditional">🍗 Traditional</option>
              <option value="Italian">🍕 Italian</option>
              <option value="Indian">🍛 Indian</option>
              <option value="American">🍔 American</option>
              <option value="Seafood">🐟 Seafood</option>
              <option value="BBQ">🔥 BBQ</option>
              <option value="Healthy">🥗 Healthy</option>
              <option value="Cape Malay">🌶️ Cape Malay</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {/* Meal Time Dropdown */}
          <div className="relative">
            <select
              value={selectedMealTime}
              onChange={(e) => setSelectedMealTime(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg py-3 px-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="All day">🕒 All day</option>
              <option value="Breakfast">🌅 Breakfast</option>
              <option value="Lunch">🌞 Lunch</option>
              <option value="Dinner">🌙 Dinner</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {/* Delivery Type Dropdown */}
          <div className="relative">
            <select
              value={selectedDeliveryOption}
              onChange={(e) => setSelectedDeliveryOption(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg py-3 px-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Any">📦 Any</option>
              <option value="Delivery">🚚 Delivery</option>
              <option value="Collect">🏪 Collect</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

        {/* Promoted Deals Section */}
        <div className="px-4 space-y-4 mb-8">
          {(() => {
            const promotedDeals = filteredDeals.filter(deal => deal.isPromoted || deal.isFeatured);
            console.log('All deals:', filteredDeals.length);
            console.log('Promoted/Featured deals:', promotedDeals.length);
            console.log('Promoted deals details:', promotedDeals.map(d => ({ id: d.id, title: d.title, isPromoted: d.isPromoted, isFeatured: d.isFeatured })));
            return promotedDeals;
          })().map((deal) => (
            <div key={deal.id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-105 cursor-pointer border border-gray-700">
              <div className="relative">
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                  {deal.isFeatured ? 'FEATURED' : 'BOOSTED'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{deal.title}</h3>
                <p className="text-sm text-gray-400">{deal.restaurant} • {deal.distance}km away</p>
                
                {/* Delivery Status */}
                <div className="mt-2 mb-3">
                  {deal.hasDelivery ? (
                    <span className="text-green-400 text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Delivery available
                    </span>
                  ) : (
                    <span className="text-red-400 text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Collect only
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-400 line-through">R{deal.originalPrice}</span>
                    <span className="text-2xl font-extrabold text-amber-400">R{deal.price}</span>
                  </div>
                  <button 
                    onClick={() => handleViewDeal(deal)}
                    className="font-semibold text-sm text-amber-400 hover:text-amber-300"
                  >
                    View Deal →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All Deals Section */}
        <div className="px-4">
          <h2 className="text-xl font-bold mb-4 text-white">
            {selectedCalendarDay === 'Today' ? "Today's Top Deals" : `Deals for ${selectedCalendarDay}`}
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-2xl overflow-hidden flex items-center border border-gray-700 animate-pulse">
                  <div className="w-28 h-28 bg-gray-700"></div>
                  <div className="p-4 flex-grow">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No deals found matching your criteria.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeals.filter(deal => !deal.isPromoted && !deal.isFeatured).map((deal) => (
                <div 
                  key={deal.id} 
                  onClick={() => handleViewDeal(deal)}
                  className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex items-center transition transform hover:scale-105 cursor-pointer border border-gray-700"
                >
                  <img 
                    src={deal.image} 
                    alt={deal.title}
                    className="w-28 h-28 object-cover flex-shrink-0"
                  />
                  <div className="p-4 flex-grow">
                    <h3 className="font-bold text-white">{deal.title}</h3>
                    <p className="text-sm text-gray-400">{deal.restaurant} • {deal.distance}km</p>
                    
                    {/* Delivery Status */}
                    <div className="mt-1 mb-2">
                      {deal.hasDelivery ? (
                        <span className="text-green-400 text-xs font-medium flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Delivery available
                        </span>
                      ) : (
                        <span className="text-red-400 text-xs font-medium flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          Collect only
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">R{deal.originalPrice}</span>
                        <span className="text-lg font-bold text-gray-200">R{deal.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{deal.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 shadow-lg">
        <div className="flex justify-around max-w-2xl mx-auto">
          <button className="flex flex-col items-center justify-center text-amber-500 p-3 w-full">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.657 1.086h13.2a.75.75 0 00.657-1.086C16.454 11.665 16 9.887 16 8a6 6 0 00-6-6zM3.755 15.001a4.502 4.502 0 018.49 0H3.755z"></path>
            </svg>
            <span className="text-xs font-bold">Deals</span>
          </button>
          <button 
            onClick={() => setShowLocationModal(true)}
            className="flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 p-3 w-full"
          >
            <MapPin className="w-6 h-6" />
            <span className="text-xs font-medium">Location</span>
          </button>
          <button 
            onClick={() => setShowCalendarModal(true)}
            className="flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 p-3 w-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-xs font-medium">Calendar</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 p-3 w-full"
            onClick={() => setShowMoreModal(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Deal Modal */}
      {showDealModal && selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-700">
            {/* Modal Header */}
            <div className="relative">
              <img 
                src={selectedDeal.image} 
                alt={selectedDeal.title}
                className="w-full h-56 object-cover rounded-t-2xl"
              />
              <button 
                onClick={() => {
                  setShowDealModal(false);
                  setReturnToDealModal(false);
                }}
                className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full p-2 hover:bg-black/80 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-1">{selectedDeal.title}</h2>
              <p className="text-md text-gray-300 mb-4">{selectedDeal.restaurant} • {selectedDeal.distance}km away</p>
              
              <div className="flex items-center space-x-1 mb-4 text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg">{selectedDeal.rating}</span>
                <span className="text-sm text-gray-400">({selectedDeal.views} ratings)</span>
              </div>

              <p className="text-gray-300 mb-6">{selectedDeal.description}</p>
              
              <div className="mb-6">
                <p className="text-sm text-gray-400">Terms & Conditions</p>
                <p className="text-xs text-gray-500">Valid for dine-in and takeaway. Cannot be combined with other offers. Subject to availability.</p>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-400">Total Price</span>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-white">R{selectedDeal.price}</p>
                  {selectedDeal.originalPrice > selectedDeal.price && (
                    <p className="text-sm text-gray-500 line-through">R{selectedDeal.originalPrice}</p>
                  )}
                </div>
              </div>

              {/* Disclaimer Text */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-300 text-center leading-relaxed">
                  By contacting the restaurant you agree that you have read and understand our{' '}
                  <button
                    onClick={() => {
                      setShowDealModal(false);
                      setReturnToDealModal(true);
                      setShowMoreModal(true);
                      setActiveMoreSection('disclaimer');
                    }}
                    className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                  >
                    disclaimer
                  </button>
                  .
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleWhatsApp(selectedDeal)}
                  className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Order on WhatsApp</span>
                </button>
                <button 
                  onClick={() => handleCallRestaurant(selectedDeal)}
                  className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-600 transition-colors"
                >
                  <Phone className="w-6 h-6" />
                  <span>Call to Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md mx-auto shadow-2xl border border-gray-700">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Filter by Location</h2>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {/* Current Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span className="text-white">{location}</span>
                </div>
                <button 
                  onClick={() => requestLocation(false)}
                  className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  📍 Use my current location
                </button>
              </div>

              {/* Location Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Search for a Location</label>
                <GooglePlacesAutocomplete
                  value={locationSearchValue}
                  onChange={setLocationSearchValue}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search for your city or area..."
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Find restaurants and deals near any location in South Africa
                </p>
              </div>

              {/* Radius Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Search Radius: {selectedRadius}km
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1km</span>
                  <span>25km</span>
                  <span>50km</span>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Deals found:</span>
                  <span className="text-amber-400 font-bold">{filteredDeals.length}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-300">Within radius:</span>
                  <span className="text-gray-400">{selectedRadius}km</span>
                </div>
                {userCoordinates && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-300">Search center:</span>
                    <span className="text-gray-400 text-xs">
                      {userCoordinates.lat.toFixed(4)}, {userCoordinates.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <button 
                onClick={() => setShowLocationModal(false)}
                className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md mx-auto shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Weekly Meal Deals</h2>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {/* Day Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Select Day</label>
                <div className="grid grid-cols-2 gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedCalendarDay(day);
                        setShowCalendarModal(false);
                      }}
                      className={`p-3 rounded-lg text-sm transition-colors ${
                        selectedCalendarDay === day
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* More Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
            {!activeMoreSection ? (
              <>
                {/* Main More Menu */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">More Options</h2>
                  <button 
                    onClick={() => setShowMoreModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-3">
                  <button
                    onClick={() => setActiveMoreSection('restaurant-signup')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-4 rounded-xl flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold">Restaurant Signup</div>
                      <div className="text-sm text-gray-400">List your restaurant with us</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMoreSection('rate-restaurant')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-4 rounded-xl flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold">Rate a Restaurant</div>
                      <div className="text-sm text-gray-400">Share your dining experience</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMoreSection('disclaimer')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-4 rounded-xl flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold">Disclaimer</div>
                      <div className="text-sm text-gray-400">Terms & conditions</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMoreSection('support')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-4 rounded-xl flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold">Support</div>
                      <div className="text-sm text-gray-400">Get help or contact us</div>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Back Button Header */}
                <div className="flex items-center p-6 border-b border-gray-700">
                  <button 
                    onClick={() => {
                      if (returnToDealModal && activeMoreSection === 'disclaimer') {
                        setActiveMoreSection(null);
                        setShowMoreModal(false);
                        setReturnToDealModal(false);
                        setShowDealModal(true);
                      } else {
                        setActiveMoreSection(null);
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors mr-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-white flex-1">
                    {activeMoreSection === 'restaurant-signup' && 'Restaurant Signup'}
                    {activeMoreSection === 'rate-restaurant' && 'Rate a Restaurant'}
                    {activeMoreSection === 'disclaimer' && 'Disclaimer'}
                    {activeMoreSection === 'support' && 'Support'}
                  </h2>
                  <button 
                    onClick={() => {
                      if (returnToDealModal && activeMoreSection === 'disclaimer') {
                        setActiveMoreSection(null);
                        setShowMoreModal(false);
                        setReturnToDealModal(false);
                        setShowDealModal(true);
                      } else {
                        setShowMoreModal(false);
                        setActiveMoreSection(null);
                        setReturnToDealModal(false);
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* Restaurant Signup Form */}
                {activeMoreSection === 'restaurant-signup' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Join MenuDeals</h3>
                      <p className="text-gray-400 text-sm">
                        Get your restaurant featured and reach thousands of hungry customers in your area. Fill out the form below and we&apos;ll contact you with more information.
                      </p>
                    </div>
                    
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Restaurant Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="Enter your restaurant name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Contact Person *</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="0XX XXX XXXX"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Restaurant Location *</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="City, Province"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cuisine Type</label>
                        <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                          <option value="">Select cuisine type</option>
                          <option value="Traditional">Traditional South African</option>
                          <option value="Italian">Italian</option>
                          <option value="Indian">Indian</option>
                          <option value="American">American</option>
                          <option value="Seafood">Seafood</option>
                          <option value="BBQ">BBQ/Braai</option>
                          <option value="Healthy">Healthy</option>
                          <option value="Cape Malay">Cape Malay</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Additional Information</label>
                        <textarea
                          rows={3}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                          placeholder="Tell us about your restaurant, special offers, or any questions you have..."
                        ></textarea>
                      </div>
                      
                      {/* Simple Captcha */}
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Security Check *</label>
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-400 font-mono text-lg">8 + 3 = ?</span>
                          <input
                            type="number"
                            required
                            className="w-20 bg-gray-600 border border-gray-500 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            placeholder="?"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Submit Application
                      </button>
                    </form>
                  </div>
                )}

                {/* Rate Restaurant Form */}
                {activeMoreSection === 'rate-restaurant' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Rate Your Experience</h3>
                      <p className="text-gray-400 text-sm">
                        Help other customers by sharing your dining experience. Your feedback helps restaurants improve their service.
                      </p>
                    </div>
                    
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="0XX XXX XXXX (optional)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Restaurant Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="Which restaurant are you rating?"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Overall Rating *</label>
                        <div className="flex space-x-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="text-3xl text-gray-600 hover:text-amber-400 transition-colors focus:outline-none"
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">Click the stars to rate (1 = Poor, 5 = Excellent)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Review</label>
                        <textarea
                          rows={4}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                          placeholder="Share your experience... What did you like? What could be improved?"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Concerns or Issues</label>
                        <textarea
                          rows={3}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                          placeholder="Any specific concerns, complaints, or issues you'd like to highlight?"
                        ></textarea>
                      </div>
                      
                      {/* Simple Captcha */}
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Security Check *</label>
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-400 font-mono text-lg">15 - 7 = ?</span>
                          <input
                            type="number"
                            required
                            className="w-20 bg-gray-600 border border-gray-500 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            placeholder="?"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Submit Rating
                      </button>
                    </form>
                  </div>
                )}

                {/* Disclaimer */}
                {activeMoreSection === 'disclaimer' && (
                  <div className="p-6">
                    <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Platform Disclaimer</h3>
                        <p className="mb-4">
                          MenuDeals.online (&quot;the Platform&quot;) is an independent advertising and promotional platform that connects customers with local restaurants and food establishments. By using this platform, you acknowledge and agree to the following terms:
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">No Affiliation</h4>
                        <p className="mb-4">
                          MenuDeals has no ownership, partnership, joint venture, employment, or any other business relationship with the restaurants, food establishments, or vendors advertised on this platform. We are solely an advertising intermediary.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Limited Liability</h4>
                        <p className="mb-4">
                          MenuDeals shall not be held liable for:
                        </p>
                        <ul className="list-disc ml-6 space-y-1 mb-4">
                          <li>Food quality, safety, preparation, or service provided by restaurants</li>
                          <li>Any foodborne illnesses, allergic reactions, or health issues</li>
                          <li>Pricing discrepancies, unavailable menu items, or changed offerings</li>
                          <li>Poor customer service, delayed orders, or cancelled reservations</li>
                          <li>Any disputes between customers and restaurants</li>
                          <li>Inaccurate restaurant information, hours, or contact details</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Customer Responsibility</h4>
                        <p className="mb-4">
                          Customers are responsible for:
                        </p>
                        <ul className="list-disc ml-6 space-y-1 mb-4">
                          <li>Verifying deal availability and terms directly with restaurants</li>
                          <li>Confirming allergen information and dietary requirements</li>
                          <li>Making direct arrangements and payments with restaurants</li>
                          <li>Resolving any issues directly with the restaurant</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Information Accuracy</h4>
                        <p className="mb-4">
                          While we strive to provide accurate information, restaurant details, deals, and promotions are subject to change without notice. We recommend contacting restaurants directly to confirm current offerings and availability.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Third-Party Content</h4>
                        <p className="mb-4">
                          All restaurant descriptions, images, and promotional content are provided by the respective establishments. MenuDeals does not verify, endorse, or guarantee the accuracy of such content.
                        </p>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-amber-400 font-medium text-center">
                          By using MenuDeals, you agree to use the platform at your own risk and hold the platform harmless from any claims, damages, or losses arising from your interactions with advertised restaurants.
                        </p>
                      </div>
                      
                      <div className="text-center pt-4">
                        <p className="text-xs text-gray-500">
                          Last updated: August 2025
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Support Form */}
                {activeMoreSection === 'support' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
                      <p className="text-gray-400 text-sm">
                        Need help? Have a question? We&apos;re here to assist both customers and restaurant partners. Fill out the form below and we&apos;ll get back to you soon.
                      </p>
                    </div>
                    
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">I am a *</label>
                        <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                          <option value="">Select your role</option>
                          <option value="customer">Customer</option>
                          <option value="restaurant">Restaurant Owner/Manager</option>
                          <option value="potential-partner">Potential Restaurant Partner</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="0XX XXX XXXX (optional)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                        <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                          <option value="">Select a topic</option>
                          <option value="technical-issue">Technical Issue</option>
                          <option value="restaurant-inquiry">Restaurant Information</option>
                          <option value="deal-problem">Deal/Promotion Problem</option>
                          <option value="account-help">Account Help</option>
                          <option value="partnership">Partnership Inquiry</option>
                          <option value="feedback">General Feedback</option>
                          <option value="complaint">Complaint</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                        <textarea
                          rows={5}
                          required
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                          placeholder="Please describe your inquiry or issue in detail..."
                        ></textarea>
                      </div>
                      
                      {/* Simple Captcha */}
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Security Check *</label>
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-400 font-mono text-lg">12 ÷ 4 = ?</span>
                          <input
                            type="number"
                            required
                            className="w-20 bg-gray-600 border border-gray-500 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            placeholder="?"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 leading-relaxed">
                          <strong>Response Time:</strong> We typically respond within 24-48 hours during business days. 
                          For urgent restaurant-related issues, please contact the restaurant directly.
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

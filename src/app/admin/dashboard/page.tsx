'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, DollarSign, CheckCircle, XCircle, CreditCard, Edit3, Pause, Play, Activity, UserPlus, Trash2, LogOut, MapPin, Database, Zap, Star, Settings, Eye, EyeOff, Save } from 'lucide-react';
import EnhancedLocationInput from '@/components/EnhancedLocationInput';
import { simpleRestaurantService } from '@/lib/simple-supabase';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  username?: string;
  password?: string;
  whatsappLink?: string;
  customerCode?: string;
  subscriptionStatus?: string;
  promoCredits?: number;
  trialClickLimit?: number;
  trialClicksUsed?: number;
  latitude?: number;
  longitude?: number;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  restaurant: string;
  restaurantId: string;
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
  isFeatured: boolean;
  position?: number;
  mealTime: string;
  daysActive: string[];
  latitude?: number;
  longitude?: number;
  city?: string;
  province?: string;
  locationGroup?: string; // Add location group for organizing mock data
}

interface RestaurantUser {
  id: string;
  email: string;
  password: string;
  restaurantId: string;
  restaurantName: string;
  isActive: boolean;
  createdDate: string;
  lastLogin: string | null;
}

// Empty stats object - will be loaded from database
const mockStats = {
  totalRestaurants: 0,
  activeRestaurants: 0,
  totalDeals: 0,
  totalRevenue: 0,
  monthlyGrowth: 0,
};

// Empty arrays - will be loaded from database
const mockRestaurantUsers: RestaurantUser[] = [];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState(10);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantUsers, setRestaurantUsers] = useState<RestaurantUser[]>(mockRestaurantUsers);
  const [selectedUser, setSelectedUser] = useState<RestaurantUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showMockDataModal, setShowMockDataModal] = useState(false);
  const [showEditDealModal, setShowEditDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  
  // Account Settings State
  const [accountForm, setAccountForm] = useState({
    currentEmail: '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  
  const [mockDataForm, setMockDataForm] = useState({
    dealCount: 7,
    location: '',
    locationName: '', // Add location name for grouping
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    city: '',
    province: ''
  });
  const [newRestaurant, setNewRestaurant] = useState<Partial<Restaurant>>({
    name: '',
    location: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    username: '',
    password: '',
    customerCode: '',
    subscriptionStatus: 'TRIAL',
    promoCredits: 0,
    whatsappLink: ''
  });
  const router = useRouter();

  // Fetch restaurants data from Supabase
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      console.log('🎯 Admin Dashboard: Starting fetchRestaurants...');
      
      // Clear any localStorage data first
      localStorage.removeItem('menudeals_restaurants');
      console.log('🗑️ Cleared localStorage restaurants');
      
      // Fetch from Supabase instead of localStorage
      const restaurantData = await simpleRestaurantService.fetchRestaurants();
      
      console.log('📊 Admin Dashboard received:', restaurantData);
      console.log('📊 Restaurant count:', restaurantData?.length || 0);
      
      setRestaurants(restaurantData);
      
      // Update stats based on real data
      const activeRestaurants = restaurantData.filter((r: { subscriptionStatus?: string }) => r.subscriptionStatus === 'ACTIVE').length;
      setStats({
        totalRestaurants: restaurantData.length,
        activeRestaurants,
        totalDeals: 0, // Will be calculated from deals API later
        totalRevenue: activeRestaurants * 499,
        monthlyGrowth: 15 // Placeholder
      });
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp link validation and formatting
  const formatWhatsAppLink = (phoneNumber: string): string => {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, replace with 27 (South Africa)
    if (digits.startsWith('0')) {
      return `https://wa.me/27${digits.substring(1)}`;
    }
    
    // If it doesn't start with country code, add 27
    if (!digits.startsWith('27') && digits.length === 10) {
      return `https://wa.me/27${digits}`;
    }
    
    // If it already has country code
    if (digits.startsWith('27')) {
      return `https://wa.me/${digits}`;
    }
    
    return `https://wa.me/${digits}`;
  };

  // Handle WhatsApp input
  const handleWhatsAppChange = (value: string) => {
    if (selectedRestaurant) {
      // If user enters a phone number, format it to WhatsApp link
      if (value && !value.startsWith('https://wa.me/')) {
        const formattedLink = formatWhatsAppLink(value);
        setSelectedRestaurant({...selectedRestaurant, whatsappLink: formattedLink});
      } else {
        setSelectedRestaurant({...selectedRestaurant, whatsappLink: value});
      }
    }
  };

  const loadCurrentAccountInfo = () => {
    const currentEmail = localStorage.getItem('adminEmail') || 'admin@menudeals.online';
    setAccountForm(prev => ({
      ...prev,
      currentEmail: currentEmail
    }));
  };

  // Check authentication on component mount and fetch data
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchRestaurants();
      // Load existing mock deals
      const mockDeals = JSON.parse(localStorage.getItem('menudeals_mock_deals') || '[]');
      setDeals(mockDeals);
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  // Load account info when account tab is opened
  useEffect(() => {
    if (activeTab === 'account') {
      loadCurrentAccountInfo();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const handleApproveRestaurant = async (restaurantId: string) => {
    // Simple approach: update via updateRestaurant
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const result = await simpleRestaurantService.updateRestaurant(restaurantId, {
        ...restaurant,
        subscriptionStatus: 'ACTIVE'
      });
      if (result.success) {
        await fetchRestaurants();
      } else {
        alert(`Failed to approve restaurant: ${result.error}`);
      }
    }
  };

  const handlePauseRestaurant = async (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const result = await simpleRestaurantService.updateRestaurant(restaurantId, {
        ...restaurant,
        subscriptionStatus: 'PAUSED'
      });
      if (result.success) {
        await fetchRestaurants();
      } else {
        alert(`Failed to pause restaurant: ${result.error}`);
      }
    }
  };

  const handleResumeRestaurant = async (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const result = await simpleRestaurantService.updateRestaurant(restaurantId, {
        ...restaurant,
        subscriptionStatus: 'ACTIVE'
      });
      if (result.success) {
        await fetchRestaurants();
      } else {
        alert(`Failed to resume restaurant: ${result.error}`);
      }
    }
  };

  const handleDisableRestaurant = async (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const result = await simpleRestaurantService.updateRestaurant(restaurantId, {
        ...restaurant,
        subscriptionStatus: 'INACTIVE'
      });
      if (result.success) {
        await fetchRestaurants();
      } else {
        alert(`Failed to disable restaurant: ${result.error}`);
      }
    }
  };

  const handleMarkPaid = async (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const result = await simpleRestaurantService.updateRestaurant(restaurantId, {
        ...restaurant,
        subscriptionStatus: 'ACTIVE'
      });
      if (result.success) {
        await fetchRestaurants();
      } else {
        alert(`Failed to mark as paid: ${result.error}`);
      }
    }
  };

  const handleAddCredits = async (restaurantId: string, credits: number) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const result = await simpleRestaurantService.updateRestaurant(restaurantId, {
        ...restaurant,
        promoCredits: (restaurant.promoCredits || 0) + credits
      });
      if (result.success) {
        await fetchRestaurants();
        setShowCreditsModal(false);
        alert(`Successfully added ${credits} credits!`);
      } else {
        alert(`Failed to add credits: ${result.error}`);
      }
    }
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowEditModal(true);
  };

  const handleSaveRestaurant = async (updatedRestaurant: Restaurant) => {
    try {
      setLoading(true);
      
      const result = await simpleRestaurantService.updateRestaurant(
        updatedRestaurant.id,
        {
          name: updatedRestaurant.name,
          location: updatedRestaurant.location,
          contactNumber: updatedRestaurant.contactNumber,
          subscriptionStatus: updatedRestaurant.subscriptionStatus,
          promoCredits: updatedRestaurant.promoCredits,
          whatsappLink: updatedRestaurant.whatsappLink,
          latitude: updatedRestaurant.latitude,
          longitude: updatedRestaurant.longitude
        }
      );

      if (result.success) {
        alert('Restaurant updated successfully!');
        
        // Refresh the restaurants list
        await fetchRestaurants();
        
        setShowEditModal(false);
        setSelectedRestaurant(null);
      } else {
        alert(`Failed to update restaurant: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('An error occurred while updating the restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewRestaurant = () => {
    // Generate a new customer code
    const newCode = `MC${String(restaurants.length + 1).padStart(6, '0')}`;
    setNewRestaurant(prev => ({
      ...prev,
      customerCode: newCode,
      trialClickLimit: 30, // Default trial click limit
      trialClicksUsed: 0
    }));
    setShowAddRestaurantModal(true);
  };

  // Mock data generation functions
  const generateMockDeals = () => {
    const foodImages = [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80', // Pizza
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80', // Burger
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80', // Salad
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80', // Steak
      'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=400&h=300&fit=crop&q=80', // Pasta
      'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=300&fit=crop&q=80', // Fried Chicken
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80', // Fish
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop&q=80', // Sandwich
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80', // Breakfast
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&q=80', // Grilled food
    ];

    const mockDealTemplates = [
      { title: '2-for-1 Burger Special', description: 'Buy one burger, get one free! Classic beef burgers with chips.', cuisine: 'Fast Food', mealTime: 'All Day' },
      { title: 'Pizza Tuesday Deal', description: 'Large pizza for the price of a medium. Choose any toppings!', cuisine: 'Italian', mealTime: 'Lunch' },
      { title: 'Traditional Breakfast', description: 'Full South African breakfast with boerewors, eggs, and pap.', cuisine: 'Traditional', mealTime: 'Breakfast' },
      { title: 'Bunny Chow Wednesday', description: 'Authentic Durban bunny chow with your choice of curry.', cuisine: 'Indian', mealTime: 'Lunch' },
      { title: 'Grilled Chicken Special', description: 'Flame-grilled chicken with rice and vegetables.', cuisine: 'Grilled', mealTime: 'Dinner' },
      { title: 'Fish & Chips Friday', description: 'Fresh hake with crispy chips and tartar sauce.', cuisine: 'Seafood', mealTime: 'Lunch' },
      { title: 'Steak Night Special', description: '300g rump steak with potato and salad.', cuisine: 'Steakhouse', mealTime: 'Dinner' },
      { title: 'Veggie Burger Deal', description: 'Plant-based burger with sweet potato fries.', cuisine: 'Vegetarian', mealTime: 'All Day' },
      { title: 'Pasta Monday', description: 'Creamy pasta with your choice of sauce and protein.', cuisine: 'Italian', mealTime: 'Dinner' },
      { title: 'Braai Platter', description: 'Mixed grill with boerewors, chops, and chicken.', cuisine: 'Traditional', mealTime: 'Dinner' }
    ];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const newDeals: Deal[] = [];

    for (let i = 0; i < mockDataForm.dealCount; i++) {
      const template = mockDealTemplates[Math.floor(Math.random() * mockDealTemplates.length)];
      const originalPrice = Math.floor(Math.random() * 200) + 50; // R50-R250
      const dealPrice = Math.floor(originalPrice * (0.6 + Math.random() * 0.3)); // 60-90% of original
      
      const deal: Deal = {
        id: `mock-${Date.now()}-${i}`,
        title: template.title,
        description: template.description,
        restaurant: `Mock Restaurant ${i + 1}`,
        restaurantId: `mock-rest-${i + 1}`,
        cuisine: template.cuisine,
        price: dealPrice,
        originalPrice: originalPrice,
        distance: Math.floor(Math.random() * 25) + 1, // 1-25km
        views: Math.floor(Math.random() * 500),
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, // 3.5-5.0 with 1 decimal
        deliveryTime: Math.random() > 0.5 ? '30-45 min' : 'Collect only',
        hasDelivery: Math.random() > 0.5,
        image: foodImages[i % foodImages.length], // Cycle through available food images
        isPromoted: false,
        isFeatured: false,
        mealTime: template.mealTime,
        daysActive: daysOfWeek, // All 7 days by default
        latitude: mockDataForm.latitude,
        longitude: mockDataForm.longitude,
        city: mockDataForm.city,
        province: mockDataForm.province,
        locationGroup: mockDataForm.locationName || mockDataForm.city // Group by location name or city
      };
      
      newDeals.push(deal);
    }

    setDeals(prev => [...prev, ...newDeals]);
    
    // Also store mock deals in localStorage for API access
    const existingMockDeals = JSON.parse(localStorage.getItem('menudeals_mock_deals') || '[]');
    localStorage.setItem('menudeals_mock_deals', JSON.stringify([...existingMockDeals, ...newDeals]));
    
    setShowMockDataModal(false);
    
    // Reset form
    setMockDataForm({
      dealCount: 7,
      location: '',
      locationName: '',
      latitude: undefined,
      longitude: undefined,
      city: '',
      province: ''
    });
  };

  const clearAllMockData = () => {
    if (confirm('Are you sure you want to remove all mock deals? This action cannot be undone.')) {
      console.log('Clearing all mock data...');
      setDeals(deals.filter(deal => !deal.id.startsWith('mock-')));
      // Also clear from localStorage
      localStorage.removeItem('menudeals_mock_deals');
      console.log('Mock data cleared from localStorage');
      
      // Force a page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const fixMockDataImages = () => {
    console.log('Starting to fix mock data images...');
    const workingImages = [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80', // Pizza
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80', // Burger
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80', // Salad
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80', // Steak
      'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=400&h=300&fit=crop&q=80', // Pasta
      'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=300&fit=crop&q=80', // Fried Chicken
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80', // Fish
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop&q=80', // Sandwich
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80', // Breakfast
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&q=80', // Grilled food
    ];

    console.log('Current deals before fix:', deals.length);
    console.log('Deals:', deals.map(d => ({ id: d.id, image: d.image })));

    const updatedDeals = deals.map((deal, index) => {
      if (deal.id.startsWith('mock-')) {
        const newImage = workingImages[index % workingImages.length];
        console.log(`Fixing deal ${deal.id}: ${deal.image} -> ${newImage}`);
        return {
          ...deal,
          image: newImage
        };
      }
      return deal;
    });

    console.log('Updated deals after fix:', updatedDeals.filter(d => d.id.startsWith('mock-')).length);
    setDeals(updatedDeals);
    
    // Update localStorage
    const mockDeals = updatedDeals.filter(d => d.id.startsWith('mock-'));
    localStorage.setItem('menudeals_mock_deals', JSON.stringify(mockDeals));
    console.log('Updated localStorage with fixed deals:', mockDeals.length);
    
    alert(`Fixed images for ${mockDeals.length} mock deals!`);
  };

  const toggleDealFeature = (dealId: string, featureType: 'featured' | 'boosted') => {
    console.log('Toggling deal feature:', dealId, featureType);
    
    const updatedDeals = deals.map(deal => {
      if (deal.id === dealId) {
        if (featureType === 'featured') {
          const newDeal = { ...deal, isFeatured: !deal.isFeatured };
          console.log('Updated featured status:', newDeal.isFeatured);
          return newDeal;
        } else {
          const newDeal = { ...deal, isPromoted: !deal.isPromoted };
          console.log('Updated boosted status:', newDeal.isPromoted);
          return newDeal;
        }
      }
      return deal;
    });
    
    setDeals(updatedDeals);
    
    // Update localStorage mock deals
    const mockDeals = JSON.parse(localStorage.getItem('menudeals_mock_deals') || '[]');
    console.log('Current mock deals in localStorage:', mockDeals.length);
    
    const updatedMockDeals = mockDeals.map((deal: Deal) => {
      if (deal.id === dealId) {
        if (featureType === 'featured') {
          const newDeal = { ...deal, isFeatured: !deal.isFeatured };
          console.log('Updated localStorage featured:', newDeal.isFeatured);
          return newDeal;
        } else {
          const newDeal = { ...deal, isPromoted: !deal.isPromoted };
          console.log('Updated localStorage boosted:', newDeal.isPromoted);
          return newDeal;
        }
      }
      return deal;
    });
    
    localStorage.setItem('menudeals_mock_deals', JSON.stringify(updatedMockDeals));
    console.log('Updated localStorage with new mock deals');
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setShowEditDealModal(true);
  };

  const handleSaveEditedDeal = () => {
    if (!editingDeal) return;
    
    const updatedDeals = deals.map(deal => 
      deal.id === editingDeal.id ? editingDeal : deal
    );
    setDeals(updatedDeals);
    
    // Save to localStorage
    const mockDeals = updatedDeals.filter(d => d.id.startsWith('mock-'));
    localStorage.setItem('menudeals_mock_deals', JSON.stringify(mockDeals));
    
    setShowEditDealModal(false);
    setEditingDeal(null);
  };

  const handleSaveNewRestaurant = async () => {
    if (!newRestaurant.name || !newRestaurant.email || !newRestaurant.contactNumber) {
      alert('Please fill in required fields: Name, Email, and Phone');
      return;
    }

    try {
      setLoading(true);
      
      const result = await simpleRestaurantService.addRestaurant({
        name: newRestaurant.name || '',
        email: newRestaurant.email || '',
        phone: newRestaurant.contactNumber || '',
        address: newRestaurant.location || '',
        latitude: newRestaurant.latitude,
        longitude: newRestaurant.longitude,
        whatsapp: newRestaurant.whatsappLink || ''
      });

      if (result.success) {
        alert(result.data?.message || 'Restaurant added successfully!');
        
        // Refresh the restaurants list
        await fetchRestaurants();
        
        setShowAddRestaurantModal(false);
        
        // Reset form
        setNewRestaurant({
          name: '',
          location: '',
          contactPerson: '',
          contactNumber: '',
          email: '',
          username: '',
          password: '',
          customerCode: '',
          subscriptionStatus: 'TRIAL',
          promoCredits: 0,
          whatsappLink: ''
        });
      } else {
        alert(`Failed to add restaurant: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding restaurant:', error);
      alert('An error occurred while adding the restaurant');
    } finally {
      setLoading(false);
    }
  };

  // User management functions
  const handleCreateUser = (userData: Partial<RestaurantUser>) => {
    const newUser: RestaurantUser = {
      id: Date.now().toString(),
      email: userData.email || '',
      password: userData.password || '',
      restaurantId: userData.restaurantId || '',
      restaurantName: userData.restaurantName || '',
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: null,
    };
    setRestaurantUsers(prev => [...prev, newUser]);
    setShowUserModal(false);
  };

  const handleEditUser = (userId: string, userData: Partial<RestaurantUser>) => {
    setRestaurantUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, ...userData } : u)
    );
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setRestaurantUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleToggleUserStatus = (userId: string) => {
    setRestaurantUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u)
    );
  };

  // Account Settings Functions
  const handleAccountUpdate = async () => {
    setAccountError('');
    setAccountSuccess('');

    // Validation
    if (accountForm.newEmail && !accountForm.newEmail.includes('@')) {
      setAccountError('Please enter a valid email address');
      return;
    }

    if (accountForm.newPassword) {
      if (accountForm.newPassword.length < 6) {
        setAccountError('New password must be at least 6 characters long');
        return;
      }
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        setAccountError('New password and confirmation do not match');
        return;
      }
      if (!accountForm.currentPassword) {
        setAccountError('Current password is required to change password');
        return;
      }
    }

    if (accountForm.newEmail && !accountForm.currentPassword) {
      setAccountError('Current password is required to change email');
      return;
    }

    // Simulate update process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get current admin credentials
    const currentEmail = localStorage.getItem('adminEmail') || 'admin@menudeals.online';
    const currentPassword = localStorage.getItem('adminPassword') || '@Daily19900107';

    // Verify current password
    if (accountForm.currentPassword !== currentPassword) {
      setAccountError('Current password is incorrect');
      return;
    }

    // Update email in localStorage if provided
    if (accountForm.newEmail && accountForm.newEmail !== currentEmail) {
      localStorage.setItem('adminEmail', accountForm.newEmail);
      setAccountSuccess(`Email updated successfully to ${accountForm.newEmail}`);
    }

    // Update password in localStorage if provided
    if (accountForm.newPassword) {
      localStorage.setItem('adminPassword', accountForm.newPassword);
      setAccountSuccess(prev => prev + (prev ? ' and password updated successfully' : 'Password updated successfully'));
    }

    // Clear form
    setAccountForm({
      currentEmail: '',
      newEmail: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">MenuDeals - Admin</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-300">
                Platform Administrator Dashboard
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'restaurants', label: 'Restaurants', icon: Users },
              { id: 'users', label: 'User Management', icon: UserPlus },
              { id: 'payments', label: 'Payments', icon: DollarSign },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'mockdata', label: 'Mock Data', icon: Database },
              { id: 'account', label: 'Account Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-gray-300 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-white">Platform Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Restaurants</p>
                    <p className="text-2xl font-bold text-white">{stats.totalRestaurants}</p>
                  </div>
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Restaurants</p>
                    <p className="text-2xl font-bold text-green-400">{stats.activeRestaurants}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Trial Restaurants</p>
                    <p className="text-2xl font-bold text-yellow-400">{restaurants.filter(r => r.subscriptionStatus === 'TRIAL').length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-400">R{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4 text-white">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">New restaurant registered</span>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">Payment received: R499</span>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">Trial limit reached</span>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Restaurant Management</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddNewRestaurant}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add New Restaurant
                </button>
                <div className="text-sm text-gray-400">
                  Total: {restaurants.length} restaurants
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    <span className="ml-2 text-gray-300">Loading restaurants...</span>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-700 border-b border-gray-600">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Restaurant</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Contact Details</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Login Details</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Subscription</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Credits</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {restaurants.map((restaurant) => (
                        <tr key={restaurant.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{restaurant.name}</div>
                            <div className="text-sm text-gray-400">Restaurant</div>
                            <div className="text-xs text-gray-500">{restaurant.location}</div>
                            <div className="text-xs text-amber-400 mt-1">Code: {restaurant.customerCode}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{restaurant.contactPerson}</div>
                            <div className="text-xs text-gray-400">{restaurant.email}</div>
                            <div className="text-xs text-gray-400">{restaurant.contactNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{restaurant.username}</div>
                            <div className="text-xs mt-1 text-green-400">
                              Active User
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              restaurant.subscriptionStatus === 'ACTIVE' 
                                ? 'bg-green-900 text-green-300 border border-green-700'
                                : restaurant.subscriptionStatus === 'TRIAL'
                                ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                                : restaurant.subscriptionStatus === 'PAUSED'
                                ? 'bg-orange-900 text-orange-300 border border-orange-700'
                                : 'bg-red-900 text-red-300 border border-red-700'
                            }`}>
                              {restaurant.subscriptionStatus}
                            </span>
                            {restaurant.subscriptionStatus === 'TRIAL' && (
                              <div className="text-xs text-gray-400 mt-1">
                                Clicks: {restaurant.trialClicksUsed || 0}/{restaurant.trialClickLimit || 30}
                                {(restaurant.trialClicksUsed || 0) >= (restaurant.trialClickLimit || 30) && (
                                  <span className="text-red-400 block">Trial expired</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-lg font-bold text-amber-400">
                              {restaurant.promoCredits}
                            </div>
                            <div className="text-xs text-gray-400">credits</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditRestaurant(restaurant)}
                                className="p-1 text-blue-400 hover:text-blue-300"
                                title="Edit Details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
                              {restaurant.subscriptionStatus === 'PAUSED' ? (
                                <button
                                  onClick={() => handleResumeRestaurant(restaurant.id)}
                                  className="p-1 text-green-400 hover:text-green-300"
                                  title="Resume Subscription"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePauseRestaurant(restaurant.id)}
                                  className="p-1 text-orange-400 hover:text-orange-300"
                                  title="Pause Subscription"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  setSelectedRestaurant(restaurant);
                                  setShowCreditsModal(true);
                                }}
                                className="p-1 text-purple-400 hover:text-purple-300"
                                title="Manage Credits"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                              
                              {restaurant.subscriptionStatus !== 'ACTIVE' && (
                                <button
                                  onClick={() => handleApproveRestaurant(restaurant.id)}
                                  className="p-1 text-green-400 hover:text-green-300"
                                  title="Activate"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDisableRestaurant(restaurant.id)}
                                className="p-1 text-red-400 hover:text-red-300"
                                title="Disable"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                <UserPlus className="w-4 h-4" />
                Add New User
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">User Details</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Restaurant</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Status</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Created</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Last Login</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {restaurantUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{user.email}</div>
                          <div className="text-sm text-gray-400">Password: {user.password}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{user.restaurantName}</div>
                          <div className="text-xs text-gray-400">ID: {user.restaurantId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-900 text-green-300 border border-green-700'
                              : 'bg-red-900 text-red-300 border border-red-700'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{user.createdDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{user.lastLogin || 'Never'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title="Edit User"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`p-1 ${user.isActive ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-2 text-white">Total Users</h3>
                <div className="text-3xl font-bold text-amber-500">{restaurantUsers.length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-2 text-white">Active Users</h3>
                <div className="text-3xl font-bold text-green-400">{restaurantUsers.filter(u => u.isActive).length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-2 text-white">Recent Logins</h3>
                <div className="text-3xl font-bold text-blue-400">{restaurantUsers.filter(u => u.lastLogin).length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-white">Payment Management</h2>
            
            <div className="grid gap-6">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Manual Payment Processing</h3>
                <p className="text-gray-300 mb-4">
                  Mark restaurants as paid after receiving EFT payments or add promotional credits.
                </p>
                
                <div className="space-y-4">
                  {restaurants.filter(r => r.subscriptionStatus !== 'ACTIVE').map((restaurant) => (
                    <div key={restaurant.id} className="border border-gray-700 rounded-lg p-4 bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{restaurant.name}</h4>
                          <p className="text-sm text-gray-400">{restaurant.contactPerson}</p>
                          <p className="text-sm text-gray-400">
                            Status: {restaurant.subscriptionStatus}
                            {restaurant.subscriptionStatus === 'TRIAL' && 
                              ` (Trial active)`
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarkPaid(restaurant.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                          >
                            Mark as Paid (R499)
                          </button>
                          <button
                            onClick={() => handleAddCredits(restaurant.id, 10)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                          >
                            Add 10 Credits
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Revenue Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">R{mockStats.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">R{(mockStats.totalRevenue * 0.85).toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Last Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">+{mockStats.monthlyGrowth}%</div>
                    <div className="text-sm text-gray-400">Growth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-white">Platform Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Restaurant Performance */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Recent Restaurants</h3>
                <div className="space-y-3">
                  {restaurants
                    .slice(0, 5)
                    .map((restaurant, index) => (
                    <div key={restaurant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-900 rounded-full flex items-center justify-center text-sm font-bold text-amber-300 border border-amber-700">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{restaurant.name}</div>
                          <div className="text-sm text-gray-400">{restaurant.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">{restaurant.promoCredits}</div>
                        <div className="text-sm text-gray-400">credits</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscription Status Breakdown */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Subscription Status</h3>
                <div className="space-y-3">
                  {['ACTIVE', 'TRIAL', 'PAUSED', 'INACTIVE'].map((status) => {
                    const count = restaurants.filter(r => r.subscriptionStatus === status).length;
                    const percentage = ((count / restaurants.length) * 100).toFixed(1);
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'ACTIVE' ? 'bg-green-400' :
                            status === 'TRIAL' ? 'bg-yellow-400' :
                            status === 'PAUSED' ? 'bg-orange-400' : 'bg-red-400'
                          }`}></div>
                          <span className="capitalize text-white">{status.toLowerCase()}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-white">{count}</span>
                          <span className="text-sm text-gray-400 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue Trends */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Revenue Trends</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Subscriptions</span>
                    <span className="font-bold text-green-400">
                      R{(restaurants.filter(r => r.subscriptionStatus === 'ACTIVE').length * 499).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Projected Monthly</span>
                    <span className="font-bold text-blue-400">
                      R{((restaurants.filter(r => r.subscriptionStatus === 'ACTIVE').length + 
                         restaurants.filter(r => r.subscriptionStatus === 'TRIAL').length * 0.7) * 499).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Credits Issued</span>
                    <span className="font-bold text-purple-400">
                      {restaurants.reduce((sum, r) => sum + (r.promoCredits || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Platform Health</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Credits Issued</span>
                    <span className="font-bold text-white">
                      {restaurants.reduce((sum, r) => sum + (r.promoCredits || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg. Credits per Restaurant</span>
                    <span className="font-bold text-white">
                      {restaurants.length > 0 ? (restaurants.reduce((sum, r) => sum + (r.promoCredits || 0), 0) / restaurants.length).toFixed(1) : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Retention Rate</span>
                    <span className="font-bold text-green-400">
                      {restaurants.length > 0 ? ((restaurants.filter(r => r.subscriptionStatus !== 'INACTIVE').length / restaurants.length) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mockdata' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Mock Data Management</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMockDataModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Generate Mock Data
                </button>
                <button
                  onClick={fixMockDataImages}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fix Images
                </button>
                <button
                  onClick={() => {
                    if (confirm('Clear all localStorage and reload page? This will fix any persistent image errors.')) {
                      console.log('Clearing all localStorage...');
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Force Reset
                </button>
                <button
                  onClick={clearAllMockData}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Mock Data
                </button>
              </div>
            </div>

            {/* Mock Data Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Mock Deals</p>
                    <p className="text-2xl font-bold text-white">{deals.filter(d => d.id.startsWith('mock-')).length}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Featured Deals</p>
                    <p className="text-2xl font-bold text-white">{deals.filter(d => d.isFeatured).length}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Boosted Deals</p>
                    <p className="text-2xl font-bold text-white">{deals.filter(d => d.isPromoted).length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Mock Deals List */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">Generated Mock Deals</h3>
                <p className="text-gray-400">Manage mock deals for testing visibility and promotion features</p>
              </div>
              
              <div className="p-6">
                {deals.filter(d => d.id.startsWith('mock-')).length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No mock deals generated yet</p>
                    <p className="text-sm text-gray-500">Click &quot;Generate Mock Data&quot; to create test deals</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group deals by location */}
                    {Object.entries(
                      deals
                        .filter(d => d.id.startsWith('mock-'))
                        .reduce((groups: Record<string, Deal[]>, deal) => {
                          const group = deal.locationGroup || 'Unknown Location';
                          if (!groups[group]) groups[group] = [];
                          groups[group].push(deal);
                          return groups;
                        }, {})
                    ).map(([locationGroup, locationDeals]) => (
                      <div key={locationGroup} className="border border-gray-600 rounded-lg">
                        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-400" />
                              {locationGroup}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                              <span>{locationDeals.length} deals</span>
                              <span>{locationDeals.filter(d => d.isFeatured).length} featured</span>
                              <span>{locationDeals.filter(d => d.isPromoted).length} boosted</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                          {locationDeals.map((deal) => (
                      <div key={deal.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-white">{deal.title}</h4>
                            <div className="flex gap-2">
                              {deal.isFeatured && (
                                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded-full">Featured</span>
                              )}
                              {deal.isPromoted && (
                                <span className="px-2 py-1 bg-amber-900 text-amber-300 text-xs rounded-full">Boosted</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-300">{deal.restaurant} • {deal.cuisine} • R{deal.price}</p>
                          <p className="text-xs text-gray-400">{deal.city}, {deal.province} • {deal.distance}km away</p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditDeal(deal)}
                            className="px-3 py-1 bg-blue-900 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                          
                          <button
                            onClick={() => toggleDealFeature(deal.id, 'featured')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              deal.isFeatured 
                                ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            {deal.isFeatured ? 'Remove Featured' : 'Set Featured'}
                          </button>
                          
                          <button
                            onClick={() => toggleDealFeature(deal.id, 'boosted')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              deal.isPromoted 
                                ? 'bg-amber-900 text-amber-300 hover:bg-amber-800' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            {deal.isPromoted ? 'Remove Boost' : 'Set Boosted'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setDeals(deals.filter(d => d.id !== deal.id));
                              // Also remove from localStorage
                              const mockDeals = JSON.parse(localStorage.getItem('menudeals_mock_deals') || '[]');
                              const updatedMockDeals = mockDeals.filter((d: Deal) => d.id !== deal.id);
                              localStorage.setItem('menudeals_mock_deals', JSON.stringify(updatedMockDeals));
                            }}
                            className="px-3 py-1 bg-red-900 text-red-300 rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Account Settings</h2>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-white mb-6">Update Email & Password</h3>
              
              {accountError && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
                  {accountError}
                </div>
              )}

              {accountSuccess && (
                <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm mb-4">
                  {accountSuccess}
                </div>
              )}

              <div className="space-y-6">
                {/* Current Email Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Email
                  </label>
                  <div className="bg-gray-700 border border-gray-600 text-gray-300 rounded-lg px-3 py-2">
                    {accountForm.currentEmail}
                  </div>
                </div>

                {/* New Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Email (optional)
                  </label>
                  <input
                    type="email"
                    value={accountForm.newEmail}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, newEmail: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter new email address"
                  />
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={accountForm.currentPassword}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={accountForm.newPassword}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                {accountForm.newPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={accountForm.confirmPassword}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Update Button */}
                <div className="pt-4">
                  <button
                    onClick={handleAccountUpdate}
                    disabled={!accountForm.currentPassword || (!accountForm.newEmail && !accountForm.newPassword)}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    Update Account
                  </button>
                  <p className="text-sm text-gray-400 mt-2">
                    * Required fields. Enter current password to make any changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mock Data Generation Modal */}
      {showMockDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Generate Mock Data</h3>
              <p className="text-gray-400">Create test deals for visibility and promotion testing</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Deals
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={mockDataForm.dealCount}
                    onChange={(e) => setMockDataForm({...mockDataForm, dealCount: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location Group Name *
                  </label>
                  <input
                    type="text"
                    value={mockDataForm.locationName}
                    onChange={(e) => setMockDataForm({...mockDataForm, locationName: e.target.value})}
                    placeholder="e.g., Kempton Park, eMalahleni"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <EnhancedLocationInput
                  value={mockDataForm.location}
                  onChange={(address) => {
                    setMockDataForm({
                      ...mockDataForm,
                      location: address
                    });
                  }}
                  onLocationSelect={(location) => {
                    setMockDataForm({
                      ...mockDataForm,
                      location: location.address,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      city: location.city || '',
                      province: location.province || '',
                      locationName: mockDataForm.locationName || location.city || '' // Keep existing name or use city
                    });
                  }}
                  placeholder="Enter location for mock deals..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Deals will be generated for this location area
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowMockDataModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateMockDeals}
                  disabled={!mockDataForm.location || !mockDataForm.latitude || !mockDataForm.longitude || !mockDataForm.locationName}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Generate Deals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditModal && selectedRestaurant && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setSelectedRestaurant(null);
            }
          }}
        >
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Edit Restaurant Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={selectedRestaurant.name}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, name: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={selectedRestaurant.contactPerson}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, contactPerson: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedRestaurant.email}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, email: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={selectedRestaurant.contactNumber}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, contactNumber: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Location
                  </label>

                  {/* Enhanced Location Input */}
                  <EnhancedLocationInput
                    value={selectedRestaurant.location}
                    onChange={(location) => setSelectedRestaurant({...selectedRestaurant, location})}
                    onLocationSelect={(locationData) => {
                      setSelectedRestaurant({
                        ...selectedRestaurant, 
                        location: locationData.address,
                        latitude: locationData.latitude,
                        longitude: locationData.longitude
                      });
                    }}
                    placeholder="Search for restaurant location..."
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  
                  <p className="text-xs text-gray-400 mt-1">
                    Enhanced location search with Google Places integration. Fallback to local database available.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={selectedRestaurant.username}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, username: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Login username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={selectedRestaurant.password || ''}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, password: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Set new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Customer Code</label>
                  <input
                    type="text"
                    value={selectedRestaurant.customerCode}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, customerCode: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="MC000001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp Contact</label>
                  <input
                    type="text"
                    value={selectedRestaurant.whatsappLink || ''}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter phone number (e.g., 013-692-1234) or WhatsApp link"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter phone number and it will be automatically formatted to WhatsApp link
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Status</label>
                  <select
                    value={selectedRestaurant.subscriptionStatus}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, subscriptionStatus: e.target.value as Restaurant['subscriptionStatus']})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="TRIAL">Trial</option>
                    <option value="PAUSED">Paused</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                {selectedRestaurant.subscriptionStatus === 'TRIAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Trial Click Limit</label>
                    <input
                      type="number"
                      value={selectedRestaurant.trialClickLimit || 30}
                      onChange={(e) => setSelectedRestaurant({...selectedRestaurant, trialClickLimit: parseInt(e.target.value)})}
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="1"
                      max="200"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Current clicks: {selectedRestaurant.trialClicksUsed || 0}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRestaurant(null);
                }}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRestaurant(selectedRestaurant)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCreditsModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Manage Advertising Credits</h3>
              <p className="text-sm text-gray-400 mt-1">{selectedRestaurant.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Credits</label>
                <div className="text-2xl font-bold text-amber-500">{selectedRestaurant.promoCredits}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Add Credits</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2">
                {[5, 10, 25, 50].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setCreditAmount(amount)}
                    className="px-3 py-1 text-sm border border-gray-600 text-gray-300 rounded hover:bg-gray-700"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreditsModal(false);
                  setSelectedRestaurant(null);
                }}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddCredits(selectedRestaurant.id, creditAmount)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add {creditAmount} Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">
                {selectedUser ? 'Edit User' : 'Create New User'}
              </h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userData = {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                restaurantId: formData.get('restaurantId') as string,
                restaurantName: restaurants.find(r => r.id === formData.get('restaurantId'))?.name || '',
              };
              
              if (selectedUser) {
                handleEditUser(selectedUser.id, userData);
              } else {
                handleCreateUser(userData);
              }
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser?.email || ''}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="user@restaurant.co.za"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="text"
                    name="password"
                    defaultValue={selectedUser?.password || ''}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="password123"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Restaurant</label>
                  <select
                    name="restaurantId"
                    defaultValue={selectedUser?.restaurantId || ''}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {selectedUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Restaurant Modal */}
      {showAddRestaurantModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddRestaurantModal(false);
            }
          }}
        >
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Add New Restaurant</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter restaurant name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newRestaurant.contactPerson}
                    onChange={(e) => setNewRestaurant({...newRestaurant, contactPerson: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Contact person name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newRestaurant.email}
                    onChange={(e) => setNewRestaurant({...newRestaurant, email: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="restaurant@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newRestaurant.contactNumber}
                    onChange={(e) => setNewRestaurant({...newRestaurant, contactNumber: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="013-123-4567"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Location
                  </label>

                  {/* Enhanced Location Input */}
                  <EnhancedLocationInput
                    value={newRestaurant.location || ''}
                    onChange={(location) => setNewRestaurant({...newRestaurant, location})}
                    onLocationSelect={(locationData) => {
                      setNewRestaurant({
                        ...newRestaurant, 
                        location: locationData.address,
                        latitude: locationData.latitude,
                        longitude: locationData.longitude
                      });
                    }}
                    placeholder="Search for restaurant location..."
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  
                  <p className="text-xs text-gray-400 mt-1">
                    🌍 Google Places search with manual coordinate fallback
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={newRestaurant.username}
                    onChange={(e) => setNewRestaurant({...newRestaurant, username: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Login username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={newRestaurant.password}
                    onChange={(e) => setNewRestaurant({...newRestaurant, password: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Set login password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Customer Code</label>
                  <input
                    type="text"
                    value={newRestaurant.customerCode}
                    onChange={(e) => setNewRestaurant({...newRestaurant, customerCode: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="MC000001"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Trial Click Limit</label>
                  <input
                    type="number"
                    value={newRestaurant.trialClickLimit || 30}
                    onChange={(e) => setNewRestaurant({...newRestaurant, trialClickLimit: parseInt(e.target.value)})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Number of customer clicks before trial expires
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp Contact</label>
                  <input
                    type="text"
                    value={newRestaurant.whatsappLink}
                    onChange={(e) => setNewRestaurant({...newRestaurant, whatsappLink: e.target.value})}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter phone number (e.g., 013-692-1234)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Phone number will be automatically formatted to WhatsApp link
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddRestaurantModal(false);
                  setNewRestaurant({
                    name: '',
                    location: '',
                    contactPerson: '',
                    contactNumber: '',
                    email: '',
                    username: '',
                    password: '',
                    customerCode: '',
                    subscriptionStatus: 'TRIAL',
                    promoCredits: 0,
                    whatsappLink: ''
                  });
                }}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewRestaurant}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Restaurant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {showEditDealModal && editingDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Edit Mock Deal</h3>
              <p className="text-gray-400">Customize the mock deal details and image</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deal Title
                  </label>
                  <input
                    type="text"
                    value={editingDeal.title}
                    onChange={(e) => setEditingDeal({...editingDeal, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={editingDeal.restaurant}
                    onChange={(e) => setEditingDeal({...editingDeal, restaurant: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingDeal.description}
                  onChange={(e) => setEditingDeal({...editingDeal, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (R)
                  </label>
                  <input
                    type="number"
                    value={editingDeal.price}
                    onChange={(e) => setEditingDeal({...editingDeal, price: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Price (R)
                  </label>
                  <input
                    type="number"
                    value={editingDeal.originalPrice}
                    onChange={(e) => setEditingDeal({...editingDeal, originalPrice: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cuisine Type
                  </label>
                  <select
                    value={editingDeal.cuisine}
                    onChange={(e) => setEditingDeal({...editingDeal, cuisine: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Fast Food">Fast Food</option>
                    <option value="Italian">Italian</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Indian">Indian</option>
                    <option value="Grilled">Grilled</option>
                    <option value="Seafood">Seafood</option>
                    <option value="Steakhouse">Steakhouse</option>
                    <option value="Vegetarian">Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Food Image
                </label>
                
                <div className="space-y-3">
                  {/* URL Input - Primary Option */}
                  <div>
                    <input
                      type="url"
                      value={editingDeal.image.startsWith('data:') ? '' : editingDeal.image}
                      onChange={(e) => setEditingDeal({...editingDeal, image: e.target.value})}
                      placeholder="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={editingDeal.image.startsWith('data:')}
                    />
                  </div>
                  
                  {/* File Upload - Alternative Option */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Or upload your own image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setEditingDeal({...editingDeal, image: result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-gray-400 flex-1">
                    💡 Quick samples: 
                    <button 
                      type="button"
                      onClick={() => setEditingDeal({...editingDeal, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'})}
                      className="text-blue-400 hover:underline ml-1"
                    >
                      Pizza
                    </button> | 
                    <button 
                      type="button"
                      onClick={() => setEditingDeal({...editingDeal, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'})}
                      className="text-blue-400 hover:underline ml-1"
                    >
                      Burger
                    </button> | 
                    <button 
                      type="button"
                      onClick={() => setEditingDeal({...editingDeal, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'})}
                      className="text-blue-400 hover:underline ml-1"
                    >
                      Salad
                    </button>
                  </p>
                  <button 
                    type="button"
                    onClick={() => setEditingDeal({...editingDeal, image: ''})}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-400 rounded"
                  >
                    Clear
                  </button>
                </div>
                
                {editingDeal.image && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-400 mb-1">Image Preview:</div>
                    <img
                      src={editingDeal.image}
                      alt="Deal preview"
                      className="w-32 h-24 object-cover rounded-lg border border-gray-600"
                      onError={(e) => {
                        console.error('Failed to load image:', editingDeal.image);
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        // Show error message
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'block';
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', editingDeal.image);
                        const target = e.currentTarget;
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'none';
                      }}
                    />
                    <div className="text-red-400 text-xs mt-1 hidden">
                      ⚠️ Failed to load image. Try using one of the sample images above or check the URL format.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingDeal.isFeatured}
                    onChange={(e) => setEditingDeal({...editingDeal, isFeatured: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Featured Deal</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingDeal.isPromoted}
                    onChange={(e) => setEditingDeal({...editingDeal, isPromoted: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Boosted Deal</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditDealModal(false);
                    setEditingDeal(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedDeal}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

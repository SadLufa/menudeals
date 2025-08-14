// Enhanced Admin Dashboard with Supabase Integration
// This file replaces localStorage operations with direct Supabase calls

import { createClient } from '@supabase/supabase-js';

// Types
interface RestaurantData {
  name: string;
  location: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  password: string;
  customerCode?: string;
  subscriptionStatus?: string;
  promoCredits?: number;
  whatsappLink?: string;
  trialClickLimit?: number;
  trialClicksUsed?: number;
  latitude?: number;
  longitude?: number;
}

interface RestaurantUpdate {
  name?: string;
  location?: string;
  contactNumber?: string;
  subscriptionStatus?: string;
  promoCredits?: number;
  whatsappLink?: string;
  latitude?: number;
  longitude?: number;
}

// Supabase client setup
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Restaurant management functions
export const supabaseRestaurantService = {
  // Fetch all restaurants from Supabase
  async fetchRestaurants() {
    console.log('🔍 Starting fetchRestaurants...');
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('❌ No Supabase client available');
      return [];
    }

    try {
      console.log('🎯 Trying to fetch from restaurants table...');
      
      // Start with the simplest possible query
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name, address, phoneNumber, subscriptionStatus, promoCredits')
        .limit(10);

      console.log('📊 Simple query result:', { restaurants, error });

      if (error) {
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          hint: error.hint,
          details: error.details
        });
        return [];
      }

      console.log('✅ Successfully fetched restaurants:', restaurants?.length || 0);

      // Transform to admin dashboard format with safe defaults
      return (restaurants || []).map((restaurant: {
        id: string;
        name: string;
        address?: string;
        phoneNumber?: string;
        whatsAppNumber?: string;
        subscriptionStatus?: string;
        promoCredits?: number;
        latitude?: number;
        longitude?: number;
        createdAt?: string;
        updatedAt?: string;
        created_at?: string;
        updated_at?: string;
      }) => ({
        id: restaurant.id || 'unknown',
        name: restaurant.name || 'Unknown Restaurant',
        location: restaurant.address || 'Unknown Location',
        contactPerson: 'Admin', // We'll get this from users later
        contactNumber: restaurant.phoneNumber || '',
        email: '', // We'll get this from users later
        username: '', // We'll get this from users later
        password: '••••••••', // Hidden for security
        customerCode: `MC${(restaurant.id || '000000').slice(-6)}`,
        subscriptionStatus: restaurant.subscriptionStatus || 'TRIAL',
        promoCredits: restaurant.promoCredits || 0,
        whatsappLink: restaurant.whatsAppNumber ? `https://wa.me/${restaurant.whatsAppNumber}` : '',
        trialClickLimit: 30,
        trialClicksUsed: 0,
        latitude: restaurant.latitude || 0,
        longitude: restaurant.longitude || 0,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt
      }));
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      return [];
    }
  },

  // Add new restaurant to Supabase
  async addRestaurant(restaurantData: RestaurantData) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'No Supabase client' };

    try {
      // 1. Create User first
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: restaurantData.email,
          passwordHash: restaurantData.password, // In production, hash this
          role: 'RESTAURANT_OWNER'
        })
        .select()
        .single();

      if (userError) {
        console.error('User creation error:', userError);
        return { success: false, error: userError.message };
      }

      // 2. Create Restaurant
      const { data: restaurant, error: restError } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantData.name,
          address: restaurantData.location,
          latitude: restaurantData.latitude || -25.8719, // Default to eMalahleni
          longitude: restaurantData.longitude || 29.2350,
          phoneNumber: restaurantData.contactNumber,
          whatsAppNumber: restaurantData.whatsappLink?.replace('https://wa.me/', '') || restaurantData.contactNumber.replace(/\D/g, ''),
          subscriptionStatus: 'TRIAL',
          promoCredits: 0,
          trialClickCount: 0,
          ownerId: user.id
        })
        .select()
        .single();

      if (restError) {
        console.error('Restaurant creation error:', restError);
        // Clean up user if restaurant creation fails
        await supabase.from('User').delete().eq('id', user.id);
        return { success: false, error: restError.message };
      }

      return { 
        success: true, 
        data: {
          user,
          restaurant,
          message: `Restaurant "${restaurant.name}" added successfully! Login: ${user.email}`
        }
      };
    } catch (error) {
      console.error('Add restaurant error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Update restaurant in Supabase
  async updateRestaurant(restaurantId: string, updates: RestaurantUpdate) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'No Supabase client' };

    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .update({
          name: updates.name,
          address: updates.location,
          phoneNumber: updates.contactNumber,
          whatsAppNumber: updates.whatsappLink?.replace('https://wa.me/', ''),
          subscriptionStatus: updates.subscriptionStatus,
          promoCredits: updates.promoCredits,
          latitude: updates.latitude,
          longitude: updates.longitude
        })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: restaurant };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Update subscription status
  async updateSubscriptionStatus(restaurantId: string, status: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false };

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ subscriptionStatus: status })
        .eq('id', restaurantId);

      return { success: !error, error: error?.message };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Add credits to restaurant
  async addCredits(restaurantId: string, creditsToAdd: number) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false };

    try {
      // Get current credits
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('promoCredits')
        .eq('id', restaurantId)
        .single();

      if (!restaurant) return { success: false, error: 'Restaurant not found' };

      // Update credits
      const { error } = await supabase
        .from('restaurants')
        .update({ promoCredits: restaurant.promoCredits + creditsToAdd })
        .eq('id', restaurantId);

      return { success: !error, error: error?.message };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

// Restaurant login service
export const supabaseLoginService = {
  // Authenticate restaurant user
  async authenticate(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'No Supabase client' };

    try {
      // Find user with restaurant
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          restaurant:restaurants(*)
        `)
        .eq('email', email)
        .eq('passwordHash', password) // In production, use proper password hashing
        .eq('role', 'RESTAURANT_OWNER')
        .single();

      if (userError || !user) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (!user.restaurant) {
        return { success: false, error: 'No restaurant associated with this account' };
      }

      return {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          restaurantId: user.restaurant.id,
          restaurantName: user.restaurant.name,
          subscriptionStatus: user.restaurant.subscriptionStatus
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

const supabaseServices = { supabaseRestaurantService, supabaseLoginService };
export default supabaseServices;

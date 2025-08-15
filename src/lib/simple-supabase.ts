// Ultra-Simple Supabase Service - Phase 1
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Simple restaurant service - no complex joins, no enums
export const simpleRestaurantService = {
  // Clear all restaurants from database
  async clearAllRestaurants() {
    console.log('🗑️ Clearing ALL restaurants from database...');
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('❌ No Supabase client available');
      return { success: false, error: 'No Supabase client' };
    }

    try {
      // First, let's see what tables exist and check for foreign key relationships
      console.log('🔍 Checking database schema...');
      
      // Try to get deals that might reference restaurants
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, restaurant_id')
        .limit(5);
      
      if (!dealsError && deals) {
        console.log(`🔗 Found ${deals.length} deals that reference restaurants`);
        console.log('📋 Sample deals:', deals);
      } else {
        console.log('📋 Deals table check:', dealsError?.message || 'No deals found');
      }

      // Check for other potential foreign key tables
      const { data: promotions, error: promotionsError } = await supabase
        .from('promotions')
        .select('id, restaurant_id')
        .limit(5);
        
      if (!promotionsError && promotions) {
        console.log(`🔗 Found ${promotions.length} promotions that reference restaurants`);
      }

      // First, get all restaurant IDs
      const { data: restaurants, error: fetchError } = await supabase
        .from('restaurants')
        .select('id');

      if (fetchError) {
        console.error('❌ Error fetching restaurant IDs:', fetchError);
        return { success: false, error: fetchError.message };
      }

      if (!restaurants || restaurants.length === 0) {
        console.log('✅ No restaurants to delete - database already empty');
        return { success: true, message: 'Database already empty' };
      }

      console.log(`🔍 Found ${restaurants.length} restaurants to delete`);
      
      // Since we have foreign key constraints, we need to delete in the right order
      // First delete deals, then restaurants
      console.log('🗑️ Step 1: Deleting all deals first...');
      const { error: dealsDeleteError } = await supabase
        .from('deals')
        .delete()
        .gt('created_at', '1900-01-01');
        
      if (dealsDeleteError) {
        console.log('⚠️ Could not delete deals:', dealsDeleteError.message);
      } else {
        console.log('✅ Deals deleted successfully');
      }

      // Try to delete promotions too
      console.log('🗑️ Step 2: Deleting all promotions...');
      const { error: promotionsDeleteError } = await supabase
        .from('promotions')
        .delete()
        .gt('created_at', '1900-01-01');
        
      if (promotionsDeleteError) {
        console.log('⚠️ Could not delete promotions:', promotionsDeleteError.message);
      } else {
        console.log('✅ Promotions deleted successfully');
      }

      // Now try to delete restaurants
      console.log('🗑️ Step 3: Deleting all restaurants...');
      const { data, error } = await supabase
        .from('restaurants')
        .delete()
        .gt('created_at', '1900-01-01');

      console.log('🗑️ Delete result:', { data, error });
      
      if (error) {
        console.error('❌ Error clearing restaurants:', error);
        return { success: false, error: `Foreign key constraint issue: ${error.message}. You need to delete related records first.` };
      }

      console.log('✅ All restaurants cleared from database');
      return { success: true, message: `Cleared ${restaurants.length} restaurants and their related data` };
    } catch (error) {
      console.error('❌ Failed to clear restaurants:', error);
      return { success: false, error: 'Failed to clear restaurants' };
    }
  },

  // Fetch all restaurants
  async fetchRestaurants() {
    console.log('🔍 Fetching restaurants (simple approach)...');
    console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Supabase Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.log('❌ No Supabase client available');
      return [];
    }

    try {
      // Force a fresh query with no cache
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Raw Supabase data (after clearing):', restaurants);
      console.log('� Data length:', restaurants?.length || 0);
      console.log('�🔍 Error (if any):', error);
      console.log('🕐 Query timestamp:', new Date().toISOString());

      if (error) {
        console.error('❌ Error:', error);
        return [];
      }

      if (!restaurants || restaurants.length === 0) {
        console.log('✅ Database is empty as expected after clearing!');
        return [];
      }

      console.log('⚠️ Found restaurants after clearing - this should not happen!');
      console.log('📋 Restaurant names:', restaurants?.map(r => r.name) || []);
      console.log('📋 Restaurant IDs:', restaurants?.map(r => r.id) || []);
      
      // Show full details to understand what data exists
      console.log('📝 Full restaurant details:');
      restaurants.forEach((restaurant, index) => {
        console.log(`  ${index + 1}. ${restaurant.name}`);
        console.log(`     ID: ${restaurant.id}`);
        console.log(`     Email: ${restaurant.email || 'None'}`);
        console.log(`     Address: ${restaurant.address || 'None'}`);
        console.log(`     Phone: ${restaurant.phone || 'None'}`);
        console.log(`     Created: ${restaurant.created_at || 'None'}`);
        console.log('     ---');
      });
      
      // Transform to admin dashboard format
      return (restaurants || []).map((restaurant: {
        id: string;
        name: string;
        address?: string;
        email?: string;
        phone?: string;
        whatsapp_number?: string;
        latitude?: number;
        longitude?: number;
        subscription_status?: string;
        promo_credits?: number;
        created_at?: string;
        updated_at?: string;
      }) => ({
        id: restaurant.id,
        name: restaurant.name,
        location: restaurant.address || '',
        contactPerson: restaurant.email,
        contactNumber: restaurant.phone,
        email: restaurant.email,
        username: restaurant.email,
        password: '••••••••',
        customerCode: `MC${String(restaurant.id).slice(-6)}`, // Convert to string first
        subscriptionStatus: restaurant.subscription_status,
        promoCredits: restaurant.promo_credits,
        whatsappLink: restaurant.whatsapp_number ? `https://wa.me/${restaurant.whatsapp_number}` : '',
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        createdAt: restaurant.created_at,
        updatedAt: restaurant.updated_at
      }));
    } catch (error) {
      console.error('❌ Failed to fetch restaurants:', error);
      return [];
    }
  },

  // Add new restaurant
  async addRestaurant(restaurantData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    whatsapp?: string;
  }) {
    console.log('🏪 Adding restaurant:', restaurantData.name);
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'No Supabase client' };

    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantData.name,
          email: restaurantData.email,
          phone: restaurantData.phone,
          address: restaurantData.address || '',
          latitude: restaurantData.latitude || 0,
          longitude: restaurantData.longitude || 0,
          whatsapp_number: restaurantData.whatsapp || '',
          password: 'temp123', // Store as plain text password for now
          username: restaurantData.email // Use email as username by default
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding restaurant:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Restaurant added successfully:', restaurant.name);
      return { 
        success: true, 
        data: { message: `Restaurant "${restaurant.name}" added successfully! Login: ${restaurantData.email} / temp123` }
      };
    } catch (error) {
      console.error('❌ Failed to add restaurant:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Update restaurant
  async updateRestaurant(restaurantId: string, updates: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    location?: string; // Admin dashboard format
    contactNumber?: string; // Admin dashboard format
    latitude?: number;
    longitude?: number;
    whatsapp_number?: string;
    whatsappLink?: string; // Admin dashboard format
    subscription_status?: string;
    subscriptionStatus?: string; // Admin dashboard format
    promo_credits?: number;
    promoCredits?: number; // Admin dashboard format
  }) {
    console.log('📝 Updating restaurant:', restaurantId);
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'No Supabase client' };

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: updates.name,
          address: updates.location,
          phone: updates.contactNumber,
          subscription_status: updates.subscriptionStatus,
          promo_credits: updates.promoCredits,
          whatsapp_number: updates.whatsappLink?.replace('https://wa.me/', '') || '',
          latitude: updates.latitude,
          longitude: updates.longitude
        })
        .eq('id', restaurantId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Simple login (Phase 1 - just check email/password)
  async authenticate(email: string, password: string) {
    console.log('🔐 Authenticating:', email);
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'No Supabase client' };

    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // Simple check for now
        .single();

      if (error || !restaurant) {
        return { success: false, error: 'Invalid credentials' };
      }

      return {
        success: true,
        data: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          email: restaurant.email,
          subscriptionStatus: restaurant.subscription_status
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

export default simpleRestaurantService;

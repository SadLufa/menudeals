// Quick Supabase Database Setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection and check/create tables
export async function setupDatabase() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    // Test 1: Check if any tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1);
      
    if (tablesError && tablesError.code === 'PGRST205') {
      console.log('❌ Tables do not exist yet');
      console.log('📋 You need to create the database tables first.');
      console.log('🔧 Go to your Supabase dashboard and run the SQL from setup_database.sql');
      return false;
    }
    
    console.log('✅ Database tables exist and are accessible');
    return true;
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// Create a simple restaurant for testing
export async function createTestRestaurant() {
  console.log('🏪 Creating test restaurant...');
  
  try {
    // Create test user first
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: 'test-user-' + Date.now(),
        email: 'test@restaurant.com',
        passwordHash: 'password123',
        role: 'RESTAURANT_OWNER'
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return false;
    }

    // Create test restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .insert({
        id: 'test-restaurant-' + Date.now(),
        name: 'Test Restaurant',
        address: 'Test Address, eMalahleni',
        latitude: -25.8719,
        longitude: 29.2350,
        phoneNumber: '0123456789',
        ownerId: user.id
      })
      .select()
      .single();

    if (restError) {
      console.error('Restaurant creation error:', restError);
      return false;
    }

    console.log('✅ Test restaurant created successfully:', restaurant.name);
    return true;
    
  } catch (error) {
    console.error('❌ Test restaurant creation failed:', error);
    return false;
  }
}

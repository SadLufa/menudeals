// Add test restaurant to both localStorage AND Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function addTestRestaurantBoth() {
  console.log('🔄 Adding test restaurant to BOTH localStorage format AND Supabase...');
  
  // Test restaurant data
  const testRestaurant = {
    id: 'rest_test_001',
    name: 'Test Burger Palace',
    location: '123 Test Street, eMalahleni, Mpumalanga',
    contactPerson: 'Test Owner',
    contactNumber: '013-123-4567',
    email: 'testburger@test.com',
    username: 'testburger',
    password: 'test123',
    customerCode: 'MC000001',
    subscriptionStatus: 'TRIAL',
    promoCredits: 0,
    whatsappLink: 'https://wa.me/27131234567',
    trialClickLimit: 30,
    trialClicksUsed: 0,
    latitude: -25.8719,
    longitude: 29.2350
  };

  // 1. Add to localStorage format (for your local app)
  console.log('1. ✅ Restaurant data ready for localStorage');
  console.log('   Copy this data to your browser localStorage:');
  console.log('   Key: menudeals_restaurants');
  console.log('   Value:', JSON.stringify([testRestaurant], null, 2));
  
  // 2. Add to Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  try {
    console.log('\n2. 🔄 Adding to Supabase database...');
    
    // Add to User table first
    const { data: user, error: userError } = await supabase
      .from('User')
      .insert({
        id: 'user_test_001',
        email: testRestaurant.email,
        passwordHash: 'test123', // In production, this would be hashed
        role: 'RESTAURANT_OWNER'
      })
      .select()
      .single();
    
    if (userError && !userError.message.includes('duplicate')) {
      console.error('❌ User creation error:', userError);
      return;
    }
    
    console.log('   ✅ User added to Supabase');
    
    // Add to Restaurant table
    const { data: restaurant, error: restError } = await supabase
      .from('Restaurant')
      .insert({
        id: testRestaurant.id,
        name: testRestaurant.name,
        address: testRestaurant.location,
        latitude: testRestaurant.latitude,
        longitude: testRestaurant.longitude,
        phoneNumber: testRestaurant.contactNumber,
        whatsAppNumber: testRestaurant.whatsappLink,
        subscriptionStatus: testRestaurant.subscriptionStatus,
        promoCredits: testRestaurant.promoCredits,
        trialClickCount: testRestaurant.trialClicksUsed,
        ownerId: 'user_test_001'
      })
      .select()
      .single();
    
    if (restError && !restError.message.includes('duplicate')) {
      console.error('❌ Restaurant creation error:', restError);
      return;
    }
    
    console.log('   ✅ Restaurant added to Supabase');
    
    console.log('\n🎉 SUCCESS!');
    console.log('📋 Login credentials:');
    console.log('   Username: testburger');
    console.log('   Password: test123');
    console.log('\n📍 Next steps:');
    console.log('1. For LOCAL: Add the restaurant data to browser localStorage');
    console.log('2. For LIVE: Restaurant is now in Supabase database');
    console.log('3. Update your app to read from Supabase instead of localStorage');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

addTestRestaurantBoth();

// Script to add test restaurant to Supabase database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function addTestRestaurant() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  console.log('🔐 Adding test restaurant to Supabase database...');
  
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash('test123', 10);
    
    // 1. First add the User
    console.log('1. Creating user...');
    const { data: user, error: userError } = await supabase
      .from('User')
      .insert({
        id: 'user_test_001',
        email: 'testburger@test.com',
        passwordHash: passwordHash,
        role: 'RESTAURANT_OWNER'
      })
      .select()
      .single();
    
    if (userError) {
      console.error('❌ User creation error:', userError);
      return;
    }
    
    console.log('✅ User created:', user.email);
    
    // 2. Then add the Restaurant
    console.log('2. Creating restaurant...');
    const { data: restaurant, error: restError } = await supabase
      .from('Restaurant')
      .insert({
        id: 'rest_test_001',
        name: 'Test Burger Palace',
        address: '123 Test Street, eMalahleni, Mpumalanga',
        latitude: -25.8719,
        longitude: 29.2350,
        phoneNumber: '013-123-4567',
        whatsAppNumber: '27131234567',
        subscriptionStatus: 'TRIAL',
        promoCredits: 0,
        trialClickCount: 0,
        ownerId: user.id
      })
      .select()
      .single();
    
    if (restError) {
      console.error('❌ Restaurant creation error:', restError);
      return;
    }
    
    console.log('✅ Restaurant created:', restaurant.name);
    
    // 3. Add a test deal
    console.log('3. Creating test deal...');
    const { data: deal, error: dealError } = await supabase
      .from('Deal')
      .insert({
        id: 'deal_test_001',
        title: '2-for-1 Burger Special',
        description: 'Buy one burger, get one free! Classic beef burgers with chips.',
        price: 89.99,
        images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80'],
        daysActive: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        isRecurring: true,
        isActive: true,
        restaurantId: restaurant.id
      })
      .select()
      .single();
    
    if (dealError) {
      console.error('❌ Deal creation error:', dealError);
      return;
    }
    
    console.log('✅ Deal created:', deal.title);
    
    console.log('\n🎉 Test restaurant setup complete!');
    console.log('📋 Login details:');
    console.log('   Email: testburger@test.com');
    console.log('   Password: test123');
    console.log('   Restaurant: Test Burger Palace');
    console.log('\n🔗 Try logging in at:');
    console.log('   Local: http://localhost:3001/restaurant/dashboard');
    console.log('   Live: Your live site restaurant dashboard');
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
  }
}

addTestRestaurant();

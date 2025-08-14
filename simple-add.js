// Simple Supabase insert script
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://yahptwlgpkielctfxmfs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaHB0d2xncGtpZWxjdGZ4bWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTAxNDIsImV4cCI6MjA3MDU4NjE0Mn0.Zxo5Sd0Ls7u_V9p6Ssw0qfWgH__W0_WsotyFT9dM9xs"
);

async function addTestData() {
  console.log('🔄 Adding test restaurant to Supabase...');
  
  try {
    // Add User
    const { data: user, error: userError } = await supabase
      .from('User')
      .insert({
        email: 'testburger@test.com',
        passwordHash: 'test123',
        role: 'RESTAURANT_OWNER'
      })
      .select()
      .single();
    
    if (userError) {
      console.log('User error:', userError.message);
      if (!userError.message.includes('duplicate')) return;
    } else {
      console.log('✅ User created:', user.email);
    }
    
    // Get the user ID (might exist already)
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', 'testburger@test.com')
      .single();
    
    const userId = existingUser?.id || user?.id;
    console.log('Using user ID:', userId);
    
    // Add Restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('Restaurant')
      .insert({
        name: 'Test Burger Palace',
        address: '123 Test Street, eMalahleni, Mpumalanga',
        latitude: -25.8719,
        longitude: 29.2350,
        phoneNumber: '013-123-4567',
        whatsAppNumber: '27131234567',
        subscriptionStatus: 'TRIAL',
        promoCredits: 0,
        trialClickCount: 0,
        ownerId: userId
      })
      .select()
      .single();
    
    if (restError) {
      console.log('Restaurant error:', restError.message);
    } else {
      console.log('✅ Restaurant created:', restaurant.name);
    }
    
    console.log('\n🎉 Done! Check your Supabase dashboard');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addTestData();

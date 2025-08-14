// Simple test to check database connection and tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://yahptwlgpkielctfxmfs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaHB0d2xncGtpZWxjdGZ4bWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTAxNDIsImV4cCI6MjA3MDU4NjE0Mn0.Zxo5Sd0Ls7u_V9p6Ssw0qfWgH__W0_WsotyFT9dM9xs";

async function testDirectConnection() {
  console.log('🔍 Testing direct database connection...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test lowercase restaurants table
    console.log('\n1. Testing lowercase "restaurants" table:');
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restError) {
      console.log('❌ Error:', restError.message);
    } else {
      console.log(`✅ Found ${restaurants.length} restaurants:`);
      restaurants.slice(0, 3).forEach(r => console.log(`   - ${r.name}`));
    }
    
    // Test uppercase Restaurant table
    console.log('\n2. Testing uppercase "Restaurant" table:');
    const { data: Restaurant, error: RestError } = await supabase
      .from('Restaurant')
      .select('*');
    
    if (RestError) {
      console.log('❌ Error:', RestError.message);
    } else {
      console.log(`✅ Found ${Restaurant.length} restaurants in Restaurant table`);
    }
    
    // Test User table
    console.log('\n3. Testing "User" table:');
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('*');
    
    if (userError) {
      console.log('❌ Error:', userError.message);
    } else {
      console.log(`✅ Found ${users.length} users`);
    }
    
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testDirectConnection();

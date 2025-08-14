require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkDatabase() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  console.log('🔍 Checking actual database tables...');
  
  try {
    // Check simple restaurants table
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restError) {
      console.log('❌ Simple restaurants table error:', restError.message);
    } else {
      console.log(`✅ Simple restaurants table: ${restaurants.length} records`);
      restaurants.forEach(rest => {
        console.log(`   - ${rest.name} (${rest.cuisine})`);
      });
    }
    
    // Check Prisma Restaurant table (uppercase)
    const { data: Restaurant, error: RestError } = await supabase
      .from('Restaurant')
      .select('*');
    
    if (RestError) {
      console.log('❌ Prisma Restaurant table error:', RestError.message);
    } else {
      console.log(`✅ Prisma Restaurant table: ${Restaurant.length} records`);
    }
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

checkDatabase();

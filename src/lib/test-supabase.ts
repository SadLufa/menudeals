// Test Supabase Connection
// Open browser console and run: testSupabaseConnection()

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvmkztkqbgkwxlttaaol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bWt6dGtxYmdrd3hsdHRhYW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTMyMjIsImV4cCI6MjA1MzM4OTIyMn0.YowzYR0EGiaMPZ8uCpxR-Wf8zd1-WaVfaIwHxqcK7SI';

export async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: Try to list all tables
  try {
    console.log('📋 Testing table access...');
    
    // Try restaurants table
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1);
      
    console.log('🏪 Restaurants table test:', { data: restaurants, error: restError });
    
    // Try users table  
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    console.log('👥 Users table test:', { data: users, error: userError });
    
    // Try deals table
    const { data: deals, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .limit(1);
      
    console.log('🍽️ Deals table test:', { data: deals, error: dealError });
    
    return { restaurants, users, deals };
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return null;
  }
}

// Run test automatically in browser
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
  console.log('🧪 Test function loaded! Run: testSupabaseConnection()');
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Starting database cleanup...');
    
    // Get auth header for security
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_SECRET_KEY || 'admin123'; // Change this!
    
    if (authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Delete all deals first (due to foreign key constraints)
    console.log('Deleting all deals...');
    const { error: dealError } = await supabase
      .from('Deal')
      .delete()
      .neq('id', ''); // This deletes all records

    if (dealError) {
      console.error('Error deleting deals:', dealError);
      return NextResponse.json(
        { error: 'Failed to delete deals', details: dealError },
        { status: 500 }
      );
    }

    // Delete all restaurants
    console.log('Deleting all restaurants...');
    const { error: restaurantError } = await supabase
      .from('Restaurant')
      .delete()
      .neq('id', ''); // This deletes all records

    if (restaurantError) {
      console.error('Error deleting restaurants:', restaurantError);
      return NextResponse.json(
        { error: 'Failed to delete restaurants', details: restaurantError },
        { status: 500 }
      );
    }

    console.log('✅ Database cleanup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'All mock data cleared from database',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Count current records
    const { count: dealCount } = await supabase
      .from('Deal')
      .select('*', { count: 'exact', head: true });

    const { count: restaurantCount } = await supabase
      .from('Restaurant')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      dealCount: dealCount || 0,
      restaurantCount: restaurantCount || 0,
      message: 'Current database status'
    });

  } catch (error) {
    console.error('Database status error:', error);
    return NextResponse.json(
      { error: 'Failed to get database status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

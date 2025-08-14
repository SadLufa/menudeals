import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

// Type definition for database deal
interface DatabaseDeal {
  id: string;
  title: string;
  description: string;
  dealPrice: number;
  originalPrice: number;
  savingsAmount: number;
  mealTime: string;
  day: string;
  isActive: boolean;
  Restaurant: Restaurant | Restaurant[];
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  phone: string;
  hasDelivery: boolean;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

// Helper function to create Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters for filtering
    const day = searchParams.get('day') || 'TODAY';
    const userLat = parseFloat(searchParams.get('lat') || '-25.8758'); // Default to eMalahleni
    const userLng = parseFloat(searchParams.get('lng') || '29.2364');
    const radius = parseFloat(searchParams.get('radius') || '25'); // Default 25km radius
    const cuisine = searchParams.get('cuisine');
    const mealTime = searchParams.get('mealTime');
    const hasDelivery = searchParams.get('hasDelivery');
    
    console.log('Deal API filters:', { 
      day, userLat, userLng, radius, cuisine, mealTime, hasDelivery 
    });

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Fetch deals from Supabase with correct table and column names
    let query = supabase
      .from('Deal')
      .select(`
        id,
        title,
        description,
        dealPrice,
        originalPrice,
        savingsAmount,
        mealTime,
        day,
        isActive,
        Restaurant!inner (
          id,
          name,
          cuisine,
          address,
          phone,
          hasDelivery,
          latitude,
          longitude,
          isActive
        )
      `)
      .eq('isActive', true)
      .eq('Restaurant.isActive', true)

    // Apply filters
    if (cuisine && cuisine !== 'All Cuisine') {
      query = query.eq('Restaurant.cuisine', cuisine)
    }

    if (mealTime && mealTime !== 'All day') {
      query = query.eq('mealTime', mealTime.toUpperCase())
    }

    if (hasDelivery === 'Delivery') {
      query = query.eq('Restaurant.hasDelivery', true)
    } else if (hasDelivery === 'Collect') {
      query = query.eq('Restaurant.hasDelivery', false)
    }

    const { data: deals, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      // Fallback to mock data if database fails
      return NextResponse.json({ deals: [] })
    }

    // Transform data and apply location-based filtering
    const transformedDeals = deals?.map((deal: DatabaseDeal) => {
      // Handle restaurant data - it might be an object or array depending on Supabase configuration
      const restaurant = Array.isArray(deal.Restaurant) ? deal.Restaurant[0] : deal.Restaurant;
      
      // Calculate distance from user location to restaurant
      const distance = restaurant?.latitude && restaurant?.longitude 
        ? calculateDistance(userLat, userLng, restaurant.latitude, restaurant.longitude)
        : 999; // Set very high distance if coordinates are missing
      
      return {
        id: deal.id.toString(),
        title: deal.title,
        description: deal.description,
        restaurant: restaurant?.name || 'Unknown Restaurant',
        cuisine: restaurant?.cuisine || 'Various',
        price: deal.dealPrice,
        originalPrice: deal.originalPrice,
        distance: distance,
        views: 0, // Default views
        rating: 4.5, // Default rating
        deliveryTime: restaurant?.hasDelivery ? '30-45 min' : 'Collect only',
        hasDelivery: restaurant?.hasDelivery || false,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format&q=80',
        isPromoted: false,
        mealTime: deal.mealTime,
        // Include restaurant coordinates for potential future use
        restaurantLat: restaurant?.latitude,
        restaurantLng: restaurant?.longitude
      };
    }).filter(deal => deal.distance <= radius) // Filter by radius
      .sort((a, b) => a.distance - b.distance) || [] // Sort by distance (closest first)

    console.log(`Found ${transformedDeals.length} deals within ${radius}km of user location`);

    return NextResponse.json({ deals: transformedDeals })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ deals: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, action } = body;

    if (action === 'view') {
      // Increment view count
      console.log(`Incrementing view count for deal ${dealId}`);
      
      return NextResponse.json({
        success: true,
        message: 'View recorded',
      });
    }

    if (action === 'click') {
      // Increment click count
      console.log(`Incrementing click count for deal ${dealId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Click recorded',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing deal action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

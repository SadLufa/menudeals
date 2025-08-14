import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Interface for restaurant data (matches admin dashboard requirements)
interface RestaurantData {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  username: string;
  password?: string;
  whatsappLink?: string;
  customerCode: string;
  subscriptionStatus: string;
  promoCredits: number;
}

// Helper function to create Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Fetch restaurants from the actual database table
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      // Return empty array with sample data if database connection fails
      const sampleData: RestaurantData[] = [
        {
          id: '1',
          name: 'Burger Palace eMalahleni',
          location: '123 Main Street, eMalahleni, Mpumalanga',
          contactPerson: 'John Smith',
          contactNumber: '013-692-1234',
          email: 'owner@burgerpalace.co.za',
          username: 'johnsmith',
          password: '••••••••',
          whatsappLink: 'https://wa.me/27136921234',
          customerCode: 'MC000001',
          subscriptionStatus: 'TRIAL',
          promoCredits: 3
        },
        {
          id: '2',
          name: 'Braai Spot Witbank',
          location: '456 Church Street, Witbank, Mpumalanga',
          contactPerson: 'Sarah Johnson',
          contactNumber: '013-692-5678',
          email: 'manager@braaispot.co.za',
          username: 'sarahjohnson',
          password: '••••••••',
          whatsappLink: 'https://wa.me/27136925678',
          customerCode: 'MC000002',
          subscriptionStatus: 'ACTIVE',
          promoCredits: 10
        }
      ];
      
      return NextResponse.json({ 
        restaurants: sampleData,
        total: sampleData.length,
        note: 'Using sample data - database connection failed'
      });
    }

    // Transform data to match admin dashboard interface
    const transformedRestaurants: RestaurantData[] = restaurants?.map((restaurant: {
      id: number;
      name: string;
      address: string;
      contact_person?: string;
      phone?: string;
      email?: string;
      username?: string;
      whatsapp_link?: string;
      subscription_status?: string;
      subscription_end?: string;
      is_active?: boolean;
      customer_code?: string;
      promo_credits?: number;
    }) => ({
      id: restaurant.id.toString(),
      name: restaurant.name,
      location: restaurant.address,
      contactPerson: restaurant.contact_person || 'Restaurant Owner',
      contactNumber: restaurant.phone || 'N/A',
      email: restaurant.email || 'owner@restaurant.com',
      username: restaurant.username || restaurant.name.toLowerCase().replace(/\s+/g, ''),
      password: '••••••••', // Don't send actual password
      whatsappLink: restaurant.whatsapp_link || '',
      customerCode: restaurant.customer_code || `MC${restaurant.id.toString().padStart(6, '0')}`,
      subscriptionStatus: restaurant.subscription_status || 'TRIAL',
      promoCredits: restaurant.promo_credits || 3,
    })) || [];

    return NextResponse.json({ 
      restaurants: transformedRestaurants,
      total: transformedRestaurants.length
    });

  } catch (error) {
    console.error('API error:', error);
    // Return sample data if API fails completely
    const sampleData: RestaurantData[] = [
      {
        id: '1',
        name: 'Sample Restaurant 1',
        location: 'Sample Address 1',
        contactPerson: 'John Doe',
        contactNumber: '013-123-4567',
        email: 'john@sample.com',
        username: 'johndoe',
        password: '••••••••',
        whatsappLink: 'https://wa.me/27131234567',
        customerCode: 'MC000001',
        subscriptionStatus: 'TRIAL',
        promoCredits: 3
      }
    ];
    
    return NextResponse.json({ 
      restaurants: sampleData,
      total: sampleData.length,
      note: 'Using sample data - API error occurred'
    }, { status: 200 });
  }
}

// Update restaurant data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, updates } = body;

    const supabase = getSupabaseClient();

    // Update restaurant data - now supports all fields including password and WhatsApp
    const updateData: {
      name: string;
      address: string;
      contact_person: string;
      email: string;
      phone: string;
      subscription_status: string;
      promo_credits: number;
      customer_code: string;
      username: string;
      whatsapp_link: string;
      password?: string;
      password_hash?: string;
    } = {
      name: updates.name,
      address: updates.location, // Map location back to address
      contact_person: updates.contactPerson,
      email: updates.email,
      phone: updates.contactNumber,
      subscription_status: updates.subscriptionStatus,
      promo_credits: updates.promoCredits,
      customer_code: updates.customerCode,
      username: updates.username,
      whatsapp_link: updates.whatsappLink
    };

    // Only update password if provided and not the placeholder
    if (updates.password && updates.password !== '••••••••' && updates.password.length > 0) {
      // In a real app, you'd hash this password
      updateData.password_hash = updates.password;
    }

    const { data, error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', parseInt(restaurantId))
      .select();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update restaurant' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      restaurant: data[0]
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

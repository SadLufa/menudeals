'use client';

import { useState } from 'react';
import { simpleRestaurantService } from '@/lib/simple-supabase';

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: string;
    success: boolean;
    count?: number;
    error?: unknown;
    message?: string;
  } | null>(null);
  const [restaurants, setRestaurants] = useState<{
    id: string;
    name: string;
    contactPerson?: string;
    location?: string;
    phone?: string;
    createdAt?: string;
  }[]>([]);

  const handleFetchRestaurants = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching restaurants...');
      const data = await simpleRestaurantService.fetchRestaurants();
      setRestaurants(data);
      setResult({ type: 'fetch', success: true, count: data.length });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setResult({ type: 'fetch', success: false, error: error });
    }
    setLoading(false);
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      console.log('🗑️ Clearing all restaurants...');
      const result = await simpleRestaurantService.clearAllRestaurants();
      setResult({ type: 'clear', ...result });
      
      // Refresh the list after clearing
      if (result.success) {
        const data = await simpleRestaurantService.fetchRestaurants();
        setRestaurants(data);
      }
    } catch (error) {
      console.error('Error clearing restaurants:', error);
      setResult({ type: 'clear', success: false, error: error });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Database Debug Tool</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={handleFetchRestaurants}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Restaurants'}
        </button>
        
        <button
          onClick={handleClearAll}
          disabled={loading}
          className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Loading...' : 'Clear ALL Restaurants'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded mb-6 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <h3 className="font-bold">Operation Result:</h3>
          <pre className="mt-2 text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="bg-gray-100 p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Current Restaurants ({restaurants.length})</h2>
        
        {restaurants.length === 0 ? (
          <p className="text-gray-600">No restaurants found</p>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant, index) => (
              <div key={restaurant.id || index} className="bg-white p-4 rounded border">
                <h3 className="font-bold">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">ID: {restaurant.id}</p>
                <p className="text-sm text-gray-600">Email: {restaurant.contactPerson || 'None'}</p>
                <p className="text-sm text-gray-600">Location: {restaurant.location || 'None'}</p>
                <p className="text-sm text-gray-600">Phone: {restaurant.phone || 'None'}</p>
                <p className="text-sm text-gray-600">Created: {restaurant.createdAt || 'None'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded">
        <h3 className="font-bold text-yellow-800">Instructions:</h3>
        <ol className="mt-2 text-sm text-yellow-700 space-y-1">
          <li>1. Click &quot;Fetch Restaurants&quot; to see what&apos;s currently in the database</li>
          <li>2. Check the browser console for detailed debugging output</li>
          <li>3. Click &quot;Clear ALL Restaurants&quot; to delete everything from the database</li>
          <li>4. Click &quot;Fetch Restaurants&quot; again to verify the database is empty</li>
          <li>5. If restaurants still appear after clearing, we know there&apos;s a data source issue</li>
        </ol>
      </div>
    </div>
  );
}

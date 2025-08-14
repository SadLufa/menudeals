'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, BarChart3, CreditCard, Calendar, ArrowLeft, X, Save, LogOut } from 'lucide-react';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  regularPrice: number;
  specialPrice: number;
  description: string;
  daysActive: string[];
  mealTime: string;
  isActive: boolean;
  views: number;
  clicks: number;
  image?: string;
}

// Restaurant data will be loaded from database
const mockRestaurant = {
  name: 'Sample Restaurant 1',
  address: '123 Main Street, Cape Town',
  phone: '+27 21 123 4567',
  whatsapp: '+27 21 123 4567',
  subscriptionStatus: 'TRIAL' as const,
  promoCredits: 0,
  trialClickLimit: 30,
  trialClicksUsed: 12,
};

// Empty deals array - will be populated from database
const mockDeals: Deal[] = [];

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('deals');
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  
  // Form state for deal creation/editing - MOVED TO TOP
  const [dealForm, setDealForm] = useState({
    title: '',
    regularPrice: '',
    specialPrice: '',
    description: '',
    daysActive: [] as string[],
    mealTime: 'All Day',
    isActive: true,
    image: '',
  });
  
  const router = useRouter();
  
  // Check authentication on component mount
  useEffect(() => {
    const authData = localStorage.getItem('restaurantAuth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        setIsAuthenticated(true);
        setRestaurantName(auth.restaurantName || 'Sample Restaurant 1');
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/restaurant/login');
      }
    } else {
      router.push('/restaurant/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('restaurantAuth');
    router.push('/restaurant/login');
  };

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const mealTimes = ['Breakfast', 'Lunch', 'Dinner', 'All Day'];

  const resetForm = () => {
    setDealForm({
      title: '',
      regularPrice: '',
      specialPrice: '',
      description: '',
      daysActive: [],
      mealTime: 'All Day',
      isActive: true,
      image: '',
    });
  };

  const openAddDealModal = () => {
    setEditingDeal(null);
    resetForm();
    setShowDealModal(true);
  };

  const openEditDealModal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title,
      regularPrice: deal.regularPrice.toString(),
      specialPrice: deal.specialPrice.toString(),
      description: deal.description,
      daysActive: deal.daysActive,
      mealTime: deal.mealTime,
      isActive: deal.isActive,
      image: deal.image || '',
    });
    setShowDealModal(true);
  };

  const handleSaveDeal = () => {
    if (!dealForm.title || !dealForm.regularPrice || !dealForm.specialPrice || !dealForm.description || dealForm.daysActive.length === 0) {
      alert('Please fill in all fields and select at least one day.');
      return;
    }

    const regularPrice = parseFloat(dealForm.regularPrice);
    const specialPrice = parseFloat(dealForm.specialPrice);
    
    if (isNaN(regularPrice) || regularPrice <= 0 || isNaN(specialPrice) || specialPrice <= 0) {
      alert('Please enter valid prices.');
      return;
    }

    if (specialPrice >= regularPrice) {
      alert('Special price must be lower than regular price.');
      return;
    }

    if (editingDeal) {
      // Update existing deal
      setDeals(deals.map(deal => 
        deal.id === editingDeal.id 
          ? { 
              ...deal, 
              title: dealForm.title,
              regularPrice,
              specialPrice,
              description: dealForm.description,
              daysActive: dealForm.daysActive,
              mealTime: dealForm.mealTime,
              isActive: dealForm.isActive,
              image: dealForm.image,
            }
          : deal
      ));
    } else {
      // Create new deal
      const newDeal: Deal = {
        id: Date.now().toString(),
        title: dealForm.title,
        regularPrice,
        specialPrice,
        description: dealForm.description,
        daysActive: dealForm.daysActive,
        mealTime: dealForm.mealTime,
        isActive: dealForm.isActive,
        views: 0,
        clicks: 0,
        image: dealForm.image,
      };
      setDeals([...deals, newDeal]);
    }

    setShowDealModal(false);
    resetForm();
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals(deals.filter(deal => deal.id !== dealId));
    setShowDeleteConfirm(null);
  };

  const toggleDealStatus = (dealId: string) => {
    setDeals(deals.map(deal => 
      deal.id === dealId 
        ? { ...deal, isActive: !deal.isActive }
        : deal
    ));
  };

  const handleDayToggle = (day: string) => {
    if (dealForm.daysActive.includes(day)) {
      setDealForm({
        ...dealForm,
        daysActive: dealForm.daysActive.filter(d => d !== day)
      });
    } else {
      setDealForm({
        ...dealForm,
        daysActive: [...dealForm.daysActive, day]
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{restaurantName}</h1>
                <p className="text-gray-300">Restaurant Management Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Status</div>
                <div className="font-semibold text-green-400">Active</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Promo Credits & Subscription Info */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-400">Your promo credits = </span>
                <span className="font-semibold text-amber-400">{mockRestaurant.promoCredits}</span>
              </div>
              {mockRestaurant.subscriptionStatus === 'TRIAL' && (
                <div className="text-sm">
                  <span className="text-gray-400">Trial clicks remaining = </span>
                  <span className="font-semibold text-blue-400">
                    {mockRestaurant.trialClickLimit - mockRestaurant.trialClicksUsed}/{mockRestaurant.trialClickLimit}
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Your subscription is valid until </span>
              <span className="font-semibold text-green-400">
                {mockRestaurant.subscriptionStatus === 'TRIAL' 
                  ? 'End of Trial Period' 
                  : 'March 15, 2025'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 md:gap-8 min-w-max">
            {[
              { id: 'deals', label: 'My Deals', icon: BarChart3 },
              { id: 'promotions', label: 'Promotions', icon: CreditCard },
              { id: 'profile', label: 'Profile', icon: Edit },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'deals' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">My Deals</h2>
              <button 
                onClick={openAddDealModal}
                className="flex items-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors w-full sm:w-auto justify-center touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                Add New Deal
              </button>
            </div>

            <div className="grid gap-6">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                    <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{deal.title}</h3>
                        <button
                          onClick={() => toggleDealStatus(deal.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium w-fit transition-colors ${
                            deal.isActive ? 'bg-green-900 text-green-400 hover:bg-green-800' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {deal.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <p className="text-gray-300 mb-2">{deal.description}</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-gray-400">
                        <span>
                          Special: <span className="text-amber-400 font-semibold">R{deal.specialPrice}</span>
                          {deal.regularPrice > deal.specialPrice && (
                            <span className="text-gray-500 line-through ml-2">R{deal.regularPrice}</span>
                          )}
                        </span>
                        <span>Days: <span className="text-blue-400">{deal.daysActive.join(', ')}</span></span>
                        <span>Time: <span className="text-purple-400">{deal.mealTime}</span></span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button 
                        onClick={() => openEditDealModal(deal)}
                        className="p-3 text-gray-400 hover:text-amber-400 transition-colors bg-gray-700 rounded-lg touch-manipulation"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(deal.id)}
                        className="p-3 text-gray-400 hover:text-red-400 transition-colors bg-gray-700 rounded-lg touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{deal.views}</div>
                      <div className="text-sm text-gray-400">Total Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{deal.clicks}</div>
                      <div className="text-sm text-gray-400">Contact Clicks</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 text-white">Promotion Store</h2>
              <p className="text-gray-300">Use your promo credits to boost your deals to the top positions.</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Available Promotion Slots - This Week</h3>
                
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="border border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{day}</h4>
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[1, 2, 3].map((position) => (
                          <div key={position} className="border border-gray-600 rounded p-3 text-center bg-gray-800">
                            <div className="font-medium mb-1 text-white">Position {position}</div>
                            <div className="text-xs text-gray-400 mb-2">
                              <span className="text-amber-400 font-semibold">
                                {position === 1 ? '10 credits' : position === 2 ? '7 credits' : '5 credits'}
                              </span>
                            </div>
                            <button className="w-full px-3 py-2 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600 transition-colors touch-manipulation">
                              Book
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-white">Restaurant Profile</h2>
            
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      defaultValue={mockRestaurant.name}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue={mockRestaurant.phone}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      defaultValue={mockRestaurant.whatsapp}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      defaultValue={mockRestaurant.address}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operating Hours
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-20 text-sm text-gray-300">{day}</span>
                        <input
                          type="time"
                          defaultValue="09:00"
                          className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <span className="text-sm text-gray-400">to</span>
                        <input
                          type="time"
                          defaultValue="22:00"
                          className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Deal Creation/Edit Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl mx-auto shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <button 
                onClick={() => setShowDealModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Deal Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deal Title *
                </label>
                <input
                  type="text"
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g., 2-for-1 Burger Special"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Regular Price (R) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dealForm.regularPrice}
                    onChange={(e) => setDealForm({ ...dealForm, regularPrice: e.target.value })}
                    placeholder="149.99"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Special Price (R) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dealForm.specialPrice}
                    onChange={(e) => setDealForm({ ...dealForm, specialPrice: e.target.value })}
                    placeholder="89.99"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deal Image
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // In a real app, you'd upload this to a server
                        // For now, we'll create a local URL
                        const imageUrl = URL.createObjectURL(file);
                        setDealForm({ ...dealForm, image: imageUrl });
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                  />
                  {dealForm.image && (
                    <div className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={dealForm.image} 
                        alt="Deal preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setDealForm({ ...dealForm, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={dealForm.description}
                  onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                  placeholder="Describe your deal in detail..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Meal Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Available For *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {mealTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDealForm({ ...dealForm, mealTime: time })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dealForm.mealTime === time
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days Active */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Active Days *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dealForm.daysActive.includes(day)
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dealActive"
                  checked={dealForm.isActive}
                  onChange={(e) => setDealForm({ ...dealForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="dealActive" className="text-sm font-medium text-gray-300">
                  Make this deal active immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDealModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDeal}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md mx-auto shadow-2xl border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">Delete Deal</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this deal? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDeal(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

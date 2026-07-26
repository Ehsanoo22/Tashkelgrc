import React, { useState, useEffect } from 'react';
import { Search, Bell, X, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export default function AdminTopBar({ onMobileMenuClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Real-time listener for new activities
  useEffect(() => {
    fetchActivities();
    
    const channel = supabase
      .channel('public:activity_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, payload => {
        setActivities(prev => [payload.new, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setActivities(data);
  };

  const handleNotificationsOpen = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setUnreadCount(0);
  };

  return (
    <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 relative">
      
      {/* Mobile Menu Button */}
      <div className="flex md:hidden">
        <button onClick={onMobileMenuClick} className="text-stone-500 hover:text-brand-dark p-2 -ml-2">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Global Search */}
      <div className="flex-1 flex justify-center md:justify-start lg:ml-6">
        <div className="w-full max-w-lg relative">
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative text-stone-400 focus-within:text-stone-600">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="search"
              className="block w-full h-10 bg-stone-50 border border-stone-200 rounded-lg py-2 pl-10 pr-3 text-sm placeholder-stone-400 focus:outline-none focus:bg-white focus:border-brand-warm focus:ring-1 focus:ring-brand-warm transition-colors"
              placeholder="Search leads, quotes, projects (Press / to focus)"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-4 flex items-center md:ml-6 gap-4">
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={handleNotificationsOpen}
            className="p-2 text-stone-400 hover:text-brand-dark relative transition-colors bg-stone-50 rounded-full hover:bg-stone-100"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-brand-warm ring-2 ring-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
              <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
                <p className="text-sm font-bold text-brand-dark flex items-center gap-2"><Activity size={16} className="text-brand-warm"/> Activity Feed</p>
                <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600"><X size={16}/></button>
              </div>
              <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {activities.length === 0 ? (
                  <div className="p-4 text-center text-sm text-stone-500">No recent activity.</div>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="p-3 hover:bg-stone-50 rounded-xl transition-colors cursor-default">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">{activity.type}</span>
                        <span className="text-xs text-stone-400">{new Date(activity.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-stone-600">{activity.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Avatar (Static for now) */}
        <div className="flex items-center gap-2 border-l border-stone-200 pl-4">
          <div className="h-8 w-8 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-xs">
            TG
          </div>
          <div className="hidden md:block text-xs font-medium text-stone-700">Admin</div>
        </div>

      </div>
    </header>
  );
}

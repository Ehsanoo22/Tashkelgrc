import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Image as ImageIcon, Settings, Users, LogOut, Menu, X } from 'lucide-react';
import LeadsView from './LeadsView';
import SiteSettings from './SiteSettings';
import GalleryManager from './GalleryManager';
import AnalyticsView from './AnalyticsView';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate('/tashkeladmin/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/tashkeladmin/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-brand-dark">Loading...</div>;
  }

  if (!session) return null;

  const navItems = [
    { name: 'Analytics', path: '/tashkeladmin', icon: LayoutDashboard },
    { name: 'Leads', path: '/tashkeladmin/leads', icon: Users },
    { name: 'Gallery', path: '/tashkeladmin/gallery', icon: ImageIcon },
    { name: 'Settings', path: '/tashkeladmin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-brand-dark flex flex-col md:flex-row" dir="ltr">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-stone-200 p-4 flex justify-between items-center">
        <img src="/assets/logo_new.png" alt="Tashkel" className="h-8 object-contain" />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-stone-600">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`md:w-64 bg-white border-r border-stone-200 flex flex-col ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="p-8 hidden md:block">
          <img src="/assets/logo_new.png" alt="Tashkel" className="h-10 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-brand-dark text-white' 
                    : 'text-stone-600 hover:bg-stone-100 hover:text-brand-dark'
                }`}
              >
                <Icon size={18} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-stone-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<AnalyticsView />} />
            <Route path="/leads" element={<LeadsView />} />
            <Route path="/gallery" element={<GalleryManager />} />
            <Route path="/settings" element={<SiteSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

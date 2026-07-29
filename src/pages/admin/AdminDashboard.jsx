import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Image as ImageIcon, Settings, Users, LogOut, Calculator, FileText, Kanban, Globe } from 'lucide-react';
import LeadsView from './LeadsView';
import LeadsKanban from './LeadsKanban';
import SiteSettings from './SiteSettings';
import SEOSettings from './SEOSettings';
import GalleryManager from './GalleryManager';
import AnalyticsView from './AnalyticsView';
import PortfolioManager from './PortfolioManager';
import PricingSettings from './PricingSettings';
import QuotationsManager from './QuotationsManager'; // Need to create this
import AdminTopBar from '../../components/admin/AdminTopBar';

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
    return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-brand-dark font-bold">Loading Workspace...</div>;
  }

  if (!session) return null;

  const navGroups = [
    {
      title: "Overview",
      items: [
        { name: 'Analytics', path: '/tashkeladmin', icon: LayoutDashboard },
      ]
    },
    {
      title: "Sales & CRM",
      items: [
        { name: 'Leads Pipeline', path: '/tashkeladmin/pipeline', icon: Kanban },
        { name: 'Leads List', path: '/tashkeladmin/leads', icon: Users },
        { name: 'Quotations', path: '/tashkeladmin/quotes', icon: FileText },
      ]
    },
    {
      title: "Content",
      items: [
        { name: 'Portfolio', path: '/tashkeladmin/portfolio', icon: ImageIcon },
        { name: 'Gallery', path: '/tashkeladmin/gallery', icon: ImageIcon },
      ]
    },
    {
      title: "Configuration",
      items: [
        { name: 'Pricing Engine', path: '/tashkeladmin/pricing', icon: Calculator },
        { name: 'SEO Manager', path: '/tashkeladmin/seo', icon: Globe },
        { name: 'Settings', path: '/tashkeladmin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="h-screen bg-stone-50 font-sans text-brand-dark flex overflow-hidden" dir="ltr">
      
      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 ease-in-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:relative`}>
        <div className="h-16 flex items-center px-8 border-b border-stone-200 bg-white">
          <img src="/assets/logo_new.png" alt="Tashkel" className="h-8 object-contain" />
          <span className="ml-3 font-bold text-sm tracking-widest uppercase">Admin</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-8">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{group.title}</h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/tashkeladmin' && location.pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                        isActive 
                          ? 'bg-stone-100 text-brand-dark' 
                          : 'text-stone-600 hover:bg-stone-50 hover:text-brand-dark'
                      }`}
                    >
                      <Icon size={18} className={`mr-3 transition-colors ${isActive ? 'text-brand-warm' : 'text-stone-400 group-hover:text-stone-600'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50/50">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-stone-600 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-200 transition-all"
          >
            <LogOut size={18} className="mr-3 text-stone-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top App Bar */}
        <AdminTopBar onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-stone-50 p-6 md:p-8 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<AnalyticsView />} />
              <Route path="/pipeline" element={<LeadsKanban />} />
              <Route path="/leads" element={<LeadsView />} />
              <Route path="/quotes" element={<QuotationsManager />} />
              <Route path="/portfolio" element={<PortfolioManager />} />
              <Route path="/gallery" element={<GalleryManager />} />
              <Route path="/pricing" element={<PricingSettings />} />
              <Route path="/seo" element={<SEOSettings />} />
              <Route path="/settings" element={<SiteSettings />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

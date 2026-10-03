import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Factory, Package, ClipboardCheck, UserPlus, CalendarClock, 
  Lock, Activity, AlertTriangle, Building2, Briefcase, Globe2, Bell, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ERPOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    piecesInProduction: 0,
    openIssues: 0,
    teamOnline: 0
  });

  const [liveVisitors, setLiveVisitors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // 1. Subscribe to Live Visitors (Presence on Contact Page)
    const presenceChannel = supabase.channel('form_presence');
    
    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      setLiveVisitors(state);
    }).subscribe();

    // 2. Subscribe to real-time inserts on the 'leads' table for notifications
    const leadsSubscription = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
        const newLead = payload.new;
        setNotification(newLead);
        try {
          const audio = new Audio('/assets/notification.mp3');
          audio.play().catch(() => {});
        } catch(e) {}
        setTimeout(() => setNotification(null), 8000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(leadsSubscription);
    };
  }, []);

  const quickActions = [
    { title: 'Production Board', desc: 'Track piece manufacturing progress', icon: Factory, path: '/tashkeladmin/production', color: 'bg-stone-800 text-brand-warm' },
    { title: 'Piece Scanner', desc: 'Find piece by QR code', icon: Package, path: '/tashkeladmin/pieces', color: 'bg-stone-800 text-brand-warm' },
    { title: 'QA & Issues', desc: 'Manage defect reports', icon: ClipboardCheck, path: '/tashkeladmin/qa', color: 'bg-stone-800 text-brand-warm' },
    { title: 'Team Roster', desc: 'Manage employee accounts & roles', icon: UserPlus, path: '/tashkeladmin/team', color: 'bg-white text-stone-800 border border-stone-200' },
    { title: 'Attendance', desc: 'View check-in/out logs', icon: CalendarClock, path: '/tashkeladmin/attendance', color: 'bg-white text-stone-800 border border-stone-200' },
    { title: 'Client Portals', desc: 'Manage client access & documents', icon: Lock, path: '/tashkeladmin/portals', color: 'bg-white text-stone-800 border border-stone-200' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      {/* Real-time Notification Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-8 z-50 bg-stone-900 border border-brand-warm/30 shadow-2xl shadow-brand-warm/20 rounded-2xl p-4 w-96 text-white"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-warm/20 flex items-center justify-center flex-shrink-0 text-brand-warm">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-brand-warm text-sm mb-1">New Inquiry Received!</h4>
                <p className="text-white font-medium">{notification.full_name} <span className="text-stone-400 font-normal">from</span> {notification.company || 'Independent'}</p>
                <p className="text-stone-400 text-xs mt-1 mb-3 truncate">{notification.project_type}</p>
                <button 
                  onClick={() => setNotification(null)} 
                  className="bg-brand-warm text-stone-900 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-yellow-500 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Command Center</h1>
          <p className="text-stone-500 mt-1">Operational overview for Tashkel GFRC ERP.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-stone-100 text-stone-600 rounded-xl">
            <Lock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Active Projects</p>
            <h3 className="text-2xl font-bold text-brand-dark mt-1">-</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-brand-warm/10 text-brand-warm rounded-xl">
            <Factory size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">In Production</p>
            <h3 className="text-2xl font-bold text-brand-dark mt-1">-</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Open QA Issues</p>
            <h3 className="text-2xl font-bold text-brand-dark mt-1">-</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Team Online</p>
            <h3 className="text-2xl font-bold text-brand-dark mt-1">-</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Action Buttons */}
        <div className="xl:col-span-2">
          <h2 className="text-xl font-bold text-brand-dark mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className={`p-6 rounded-2xl text-left transition-all hover:shadow-md hover:-translate-y-1 flex flex-col gap-4 ${action.color}`}
                >
                  <Icon size={28} />
                  <div>
                    <h3 className="font-bold text-lg">{action.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{action.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Visitors Feed */}
        <div className="xl:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
              Live Visitors on Form
              <span className="relative flex h-3 w-3 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-warm opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-warm"></span>
              </span>
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            {Object.keys(liveVisitors).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-400">
                <Activity size={32} className="mb-2 opacity-50" />
                <p>No active users on the contact page.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 overflow-y-auto max-h-[500px]">
                <AnimatePresence initial={false}>
                  {Object.entries(liveVisitors).map(([visitorId, stateArray]) => {
                    const latestState = stateArray[0];
                    const isDesignAssist = latestState.inquiryType === 'design_assist';
                    const isSample = latestState.inquiryType === 'sample';
                    const LeadIcon = isDesignAssist ? Briefcase : (isSample ? Globe2 : Building2);

                    return (
                      <motion.div 
                        key={visitorId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-5 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDesignAssist ? 'bg-blue-50 text-blue-600' : isSample ? 'bg-purple-50 text-purple-600' : 'bg-stone-100 text-stone-600'}`}>
                            <LeadIcon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-bold text-brand-dark truncate">
                                {latestState.startedTyping ? 'Typing an Inquiry...' : 'Browsing Contact Page'}
                              </h4>
                              <span className="text-xs text-stone-400 whitespace-nowrap">
                                Active now
                              </span>
                            </div>
                            <p className="text-xs font-medium text-stone-500 mb-2 truncate">
                              Phase: {latestState.phase === 0 ? 'Triage' : latestState.phase === 1 ? 'Filling Form' : 'Submitted'} 
                              {latestState.inquiryType && ` • ${latestState.inquiryType.replace('_', ' ')}`}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
            
            <button onClick={() => navigate('/tashkeladmin/leads')} className="w-full py-4 text-sm font-bold text-stone-500 hover:text-brand-dark hover:bg-stone-50 border-t border-stone-100 transition-colors flex items-center justify-center gap-2">
              Manage Submitted Leads <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Factory, Package, ClipboardCheck, UserPlus, CalendarClock, 
  Kanban, Lock, Activity, TrendingUp, AlertTriangle, CheckCircle2 
} from 'lucide-react';

export default function ERPOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    piecesInProduction: 0,
    openIssues: 0,
    teamOnline: 0
  });

  // Future enhancement: Fetch real counts from erp_pieces, erp_issues, portal_projects, etc.
  useEffect(() => {
    // For now we simulate loading until the actual queries are wired up.
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      {/* Main Action Buttons */}
      <div>
        <h2 className="text-xl font-bold text-brand-dark mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}

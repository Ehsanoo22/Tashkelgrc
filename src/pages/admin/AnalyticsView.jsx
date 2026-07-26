import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, TrendingUp, DollarSign, Target, PieChart, Map, Activity, Loader2, Award } from 'lucide-react';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: leads, error } = await supabase.from('leads').select('*');
    
    if (error || !leads) {
      console.error("Error fetching leads for analytics", error);
      setLoading(false);
      return;
    }

    if (leads.length === 0) {
      setStats(null);
      setLoading(false);
      return;
    }

    // 1. Core Financials
    const validEstimates = leads.filter(l => l.estimated_value > 0).map(l => l.estimated_value);
    const totalQuotedValue = validEstimates.reduce((a, b) => a + b, 0);
    const avgValue = validEstimates.length ? totalQuotedValue / validEstimates.length : 0;
    const highestValue = validEstimates.length ? Math.max(...validEstimates) : 0;
    const lowestValue = validEstimates.length ? Math.min(...validEstimates) : 0;

    // 2. Conversion Rate
    const wonLeads = leads.filter(l => l.status === 'Won').length;
    const conversionRate = (wonLeads / leads.length) * 100;

    // 3. Frequencies (Helper)
    const getMostFrequent = (arr) => {
      if (!arr || arr.length === 0) return 'N/A';
      const counts = arr.reduce((acc, val) => {
        if (val) acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      if (Object.keys(counts).length === 0) return 'N/A';
      return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };

    const projectTypes = leads.map(l => l.project_type);
    const finishes = leads.map(l => l.design_preferences?.finish);
    const colors = leads.map(l => l.design_preferences?.color);
    const structures = leads.map(l => l.design_preferences?.structuralSupport);
    const locations = leads.map(l => l.design_preferences?.location);
    const sources = leads.map(l => l.source);

    // 4. Average Size
    const areas = leads.map(l => {
      const match = l.estimated_dimensions?.match(/(\d+)/);
      return match ? parseInt(match[0], 10) : 0;
    }).filter(a => a > 0);
    const avgSize = areas.length ? Math.round(areas.reduce((a, b) => a + b, 0) / areas.length) : 0;

    setStats({
      totalLeads: leads.length,
      totalQuotedValue,
      avgValue,
      highestValue,
      lowestValue,
      conversionRate,
      topProjectType: getMostFrequent(projectTypes),
      topFinish: getMostFrequent(finishes),
      topColor: getMostFrequent(colors),
      topStructure: getMostFrequent(structures),
      topLocation: getMostFrequent(locations),
      topSource: getMostFrequent(sources),
      avgSize
    });

    setLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-warm" /></div>;
  
  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <BarChart3 className="w-16 h-16 text-stone-200 mb-4" />
      <h2 className="text-2xl font-bold text-stone-400">No Analytics Available</h2>
      <p className="text-stone-500 mt-2">Generate some estimates to see data here.</p>
    </div>
  );

  const StatCard = ({ title, value, icon, subtitle }) => (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-stone-50 rounded-full text-brand-dark">{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-bold text-brand-dark mb-1">{value}</p>
        {subtitle && <p className="text-xs text-stone-400">{subtitle}</p>}
      </div>
    </div>
  );

  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          <Activity className="text-brand-warm" /> Business Intelligence
        </h1>
        <p className="text-stone-500 mt-2">Real-time insights from your AI Estimator leads.</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Quoted Pipeline" value={formatMoney(stats.totalQuotedValue)} icon={<TrendingUp size={20} />} subtitle="Sum of all generated estimates" />
        <StatCard title="Average Estimate" value={formatMoney(stats.avgValue)} icon={<DollarSign size={20} />} subtitle="Mean quotation value" />
        <StatCard title="Conversion Rate" value={`${stats.conversionRate.toFixed(1)}%`} icon={<Target size={20} />} subtitle="Leads marked as 'Won'" />
        <StatCard title="Highest Estimate" value={formatMoney(stats.highestValue)} icon={<Award size={20} />} subtitle={`Lowest: ${formatMoney(stats.lowestValue)}`} />
      </div>

      {/* Categorical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Project Trends */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2 border-b border-stone-100 pb-4"><PieChart className="text-brand-warm"/> Project Trends</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center"><span className="text-stone-500 font-medium">Most Requested Type</span> <span className="font-bold text-brand-dark text-lg">{stats.topProjectType}</span></div>
            <div className="flex justify-between items-center"><span className="text-stone-500 font-medium">Average Project Size</span> <span className="font-bold text-brand-dark text-lg">{stats.avgSize} Units</span></div>
            <div className="flex justify-between items-center"><span className="text-stone-500 font-medium">Top Lead Source</span> <span className="font-bold text-brand-dark text-lg">{stats.topSource}</span></div>
            <div className="flex justify-between items-center"><span className="text-stone-500 font-medium">Top Location</span> <span className="font-bold text-brand-dark text-lg">{stats.topLocation}</span></div>
          </div>
        </div>

        {/* Design Preferences */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2 border-b border-stone-100 pb-4"><Map className="text-brand-warm"/> Design Preferences</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center"><span className="text-stone-500 font-medium">Most Popular Finish</span> <span className="font-bold text-brand-dark text-lg">{stats.topFinish}</span></div>
            <div className="flex justify-between items-center"><span className="text-stone-500 font-medium">Most Popular Color</span> <span className="font-bold text-brand-dark text-lg">{stats.topColor}</span></div>
            <div className="flex justify-between items-center"><span className="text-stone-500 font-medium">Top Structural System</span> <span className="font-bold text-brand-dark text-lg">{stats.topStructure}</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}

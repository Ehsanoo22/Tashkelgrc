import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Activity, Users, MousePointerClick, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';

const COLORS = ['#1c1917', '#d4af37', '#78716c', '#a8a29e', '#e7e5e4'];

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30days'); // today, 7days, 30days, year
  
  const [stats, setStats] = useState({
    visitors: 0,
    pageViews: 0,
    leadsGenerated: 0,
    quotesGenerated: 0,
    totalQuoteValue: 0,
    conversionRate: 0,
  });

  const [trafficData, setTrafficData] = useState([]);
  const [browserData, setBrowserData] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [quoteTrends, setQuoteTrends] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Calculate date filter
    const now = new Date();
    let startDate = new Date();
    if (timeframe === 'today') startDate.setHours(0, 0, 0, 0);
    else if (timeframe === '7days') startDate.setDate(now.getDate() - 7);
    else if (timeframe === '30days') startDate.setDate(now.getDate() - 30);
    else if (timeframe === 'year') startDate.setFullYear(now.getFullYear() - 1);
    
    const dateStr = startDate.toISOString();

    try {
      // 1. Fetch Sessions (Visitors)
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('started_at, browser, os, device_type')
        .gte('started_at', dateStr);

      // 2. Fetch Events (Page Views)
      const { data: events } = await supabase
        .from('analytics_events')
        .select('timestamp, event_type')
        .eq('event_type', 'page_view')
        .gte('timestamp', dateStr);

      // 3. Fetch Leads
      const { data: leads } = await supabase
        .from('leads')
        .select('created_at, source, status')
        .gte('created_at', dateStr);

      // 4. Fetch Quotations
      const { data: quotes } = await supabase
        .from('quotations')
        .select('created_at, breakdown')
        .gte('created_at', dateStr);

      // Aggregate Stats
      const validQuotes = quotes || [];
      const totalQuoteValue = validQuotes.reduce((acc, q) => acc + (q.breakdown?.grandTotal || 0), 0);
      const wonLeads = (leads || []).filter(l => l.status === 'Won').length;
      const conversionRate = leads?.length ? (wonLeads / leads.length) * 100 : 0;

      setStats({
        visitors: sessions?.length || 0,
        pageViews: events?.length || 0,
        leadsGenerated: leads?.length || 0,
        quotesGenerated: validQuotes.length,
        totalQuoteValue,
        conversionRate
      });

      // Aggregate Traffic Data (Line Chart)
      // Group sessions by day
      const trafficMap = {};
      (sessions || []).forEach(s => {
        const d = new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        trafficMap[d] = (trafficMap[d] || 0) + 1;
      });
      const tData = Object.keys(trafficMap).map(k => ({ date: k, visitors: trafficMap[k] }));
      setTrafficData(tData);

      // Aggregate Browser Data (Pie Chart)
      const browserMap = {};
      (sessions || []).forEach(s => {
        const b = s.browser || 'Other';
        browserMap[b] = (browserMap[b] || 0) + 1;
      });
      const bData = Object.keys(browserMap).map(k => ({ name: k, value: browserMap[k] }));
      setBrowserData(bData);

      // Aggregate Lead Sources
      const sourceMap = {};
      (leads || []).forEach(l => {
        const s = l.source || 'Direct';
        sourceMap[s] = (sourceMap[s] || 0) + 1;
      });
      const sData = Object.keys(sourceMap).map(k => ({ name: k, count: sourceMap[k] }));
      setLeadSources(sData);

      // Aggregate Quote Trends
      const quoteMap = {};
      validQuotes.forEach(q => {
        const d = new Date(q.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        quoteMap[d] = (quoteMap[d] || 0) + (q.breakdown?.grandTotal || 0);
      });
      const qData = Object.keys(quoteMap).map(k => ({ date: k, value: quoteMap[k] }));
      setQuoteTrends(qData);

    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
    setLoading(false);
  };

  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const StatCard = ({ title, value, icon, subtitle }) => (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
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

  return (
    <div className="pb-20">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Activity className="text-brand-warm" /> Business Intelligence
          </h1>
          <p className="text-stone-500 mt-2">Executive overview of website and sales performance.</p>
        </div>
        <div className="flex bg-white rounded-xl border border-stone-200 p-1 shadow-sm">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'year', label: '1 Year' }
          ].map(tf => (
            <button 
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${timeframe === tf.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900'}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-brand-dark font-bold">Loading Data...</div>
      ) : (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Visitors" value={stats.visitors.toLocaleString()} icon={<Users size={20} />} subtitle="Unique sessions" />
            <StatCard title="Page Views" value={stats.pageViews.toLocaleString()} icon={<MousePointerClick size={20} />} subtitle="Total interactions" />
            <StatCard title="Pipeline Value" value={formatMoney(stats.totalQuoteValue)} icon={<DollarSign size={20} />} subtitle={`${stats.quotesGenerated} Quotes Generated`} />
            <StatCard title="Conversion Rate" value={`${stats.conversionRate.toFixed(1)}%`} icon={<Target size={20} />} subtitle={`${stats.leadsGenerated} Total Leads`} />
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Traffic Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-warm"/> Visitor Traffic
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1c1917" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="visitors" stroke="#1c1917" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browser Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-brand-dark mb-2">Browser Distribution</h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={browserData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {browserData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {browserData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs text-stone-600">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Secondary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Quote Value Trend */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-lg font-bold text-brand-dark mb-6">Quotation Value Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quoteTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} dx={-10} tickFormatter={(value) => `$${value/1000}k`} />
                    <RechartsTooltip cursor={{fill: '#f5f5f4'}} formatter={(value) => formatMoney(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lead Sources Bar */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-lg font-bold text-brand-dark mb-6">Lead Sources</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadSources} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1c1917', fontSize: 12, fontWeight: 'bold'}} />
                    <RechartsTooltip cursor={{fill: '#f5f5f4'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#1c1917" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

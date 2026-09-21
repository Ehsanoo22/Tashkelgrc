import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogOut, CheckCircle, Clock, Circle, Calendar, Image as ImageIcon, FileText, MessageCircle, Send, X, FileCheck, DollarSign, Truck, Menu, CheckCircle2, MapPin } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import confetti from 'canvas-confetti';

// ----------------------------------------------------------------------
// Innovative Notes / Chat Overlay Component
// ----------------------------------------------------------------------
const ItemNotesOverlay = ({ targetId, targetType, comments, onClose, onSend, sending }) => {
  const [noteText, setNoteText] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute z-30 right-0 top-full mt-2 w-[340px] bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col"
      style={{ maxHeight: '400px' }}
    >
      <div className="bg-stone-900 border-b border-stone-800 p-4 flex justify-between items-center text-white">
        <h4 className="font-bold flex items-center gap-2 text-sm">
          <MessageCircle size={16} /> Notes & Inquiries
        </h4>
        <button onClick={onClose} className="text-stone-400 hover:text-white"><X size={16} /></button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-stone-950 space-y-4" style={{ minHeight: '150px' }}>
        {comments.length === 0 ? (
          <div className="text-center text-stone-500 text-xs py-8">No notes yet. Ask a question or leave a note for your project manager here!</div>
        ) : (
          comments.map(c => (
            <div key={c.id} className={`flex flex-col ${c.sender_type === 'client' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">{c.sender_type === 'client' ? 'You' : 'Project Manager'}</span>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${c.sender_type === 'client' ? 'bg-brand-warm text-white rounded-tr-sm' : 'bg-stone-800 text-stone-300 rounded-tl-sm shadow-sm'}`}>
                {c.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-stone-900 border-t border-stone-800">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Type your note..." 
            className="flex-1 bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-warm placeholder-stone-500"
            onKeyDown={e => e.key === 'Enter' && (onSend(noteText, targetType, targetId), setNoteText(''))}
          />
          <button 
            onClick={() => { onSend(noteText, targetType, targetId); setNoteText(''); }}
            disabled={sending || !noteText}
            className="bg-brand-warm text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// Main Dashboard Component
// ----------------------------------------------------------------------
export default function PortalDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  
  // Data States
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [logistics, setLogistics] = useState(null);
  const [logisticsSteps, setLogisticsSteps] = useState([]);
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, documents, financials, logistics, messages
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [activeNoteTarget, setActiveNoteTarget] = useState(null);
  const [sendingNote, setSendingNote] = useState(false);

  // Time & Location state
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const userLocation = Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ').split('/').pop() || 'Local';

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const completeOnboarding = async () => {
    setShowOnboarding(false);
    await supabase.from('portal_clients').update({ has_completed_onboarding: true }).eq('id', client.id);
    setClient({ ...client, has_completed_onboarding: true });
  };

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate(`/portal/${slug}`);
      return;
    }

    const { data: cData, error: cError } = await supabase
      .from('portal_clients')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (cError || !cData || cData.slug !== slug) {
      await supabase.auth.signOut();
      navigate(`/portal/${slug}`);
      return;
    }

    setClient(cData);
    
    // Always update last_login_at when they load the dashboard to ensure accuracy
    await supabase.from('portal_clients').update({ last_login_at: new Date().toISOString() }).eq('id', session.user.id);

    if (!cData.has_completed_onboarding) {
      setShowOnboarding(true);
    }

    const { data: pData } = await supabase.from('portal_projects').select('*').eq('client_id', session.user.id).single();

    if (pData) {
      setProject(pData);
      
      const [mData, uData, cmData, dData, iData, lData] = await Promise.all([
        supabase.from('portal_milestones').select('*').eq('project_id', pData.id).order('order_index', { ascending: true }),
        supabase.from('portal_updates').select('*').eq('project_id', pData.id).order('created_at', { ascending: false }),
        supabase.from('portal_comments').select('*').eq('project_id', pData.id).order('created_at', { ascending: true }),
        supabase.from('portal_documents').select('*').eq('project_id', pData.id).order('created_at', { ascending: false }),
        supabase.from('portal_invoices').select('*').eq('project_id', pData.id).order('created_at', { ascending: true }),
        supabase.from('portal_logistics').select('*').eq('project_id', pData.id).maybeSingle()
      ]);

      if (mData.data) setMilestones(mData.data);
      if (uData.data) setUpdates(uData.data);
      if (cmData.data) setComments(cmData.data);
      if (dData.data) setDocuments(dData.data);
      if (iData.data) setInvoices(iData.data);
      
      if (lData.data) {
        setLogistics(lData.data);
        const { data: lsData } = await supabase.from('portal_logistics_steps').select('*').eq('logistics_id', lData.data.id).order('order_index', { ascending: true });
        if (lsData) setLogisticsSteps(lsData);
      }
      
      const channel = supabase.channel(`portal_realtime_v3_${pData.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_milestones', filter: `project_id=eq.${pData.id}` }, (payload) => {
          if (payload.eventType === 'UPDATE') setMilestones(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          else if (payload.eventType === 'INSERT') setMilestones(prev => [...prev, payload.new].sort((a, b) => a.order_index - b.order_index));
          else if (payload.eventType === 'DELETE') setMilestones(prev => prev.filter(m => m.id !== payload.old.id));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_updates', filter: `project_id=eq.${pData.id}` }, (payload) => {
          if (payload.eventType === 'INSERT') setUpdates(prev => [payload.new, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          else if (payload.eventType === 'DELETE') setUpdates(prev => prev.filter(u => u.id !== payload.old.id));
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portal_comments', filter: `project_id=eq.${pData.id}` }, (payload) => {
          setComments(prev => [...prev, payload.new].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_documents', filter: `project_id=eq.${pData.id}` }, (payload) => {
          if (payload.eventType === 'UPDATE') setDocuments(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
          else if (payload.eventType === 'INSERT') setDocuments(prev => [payload.new, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          else if (payload.eventType === 'DELETE') setDocuments(prev => prev.filter(d => d.id !== payload.old.id));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_invoices', filter: `project_id=eq.${pData.id}` }, (payload) => {
          if (payload.eventType === 'UPDATE') setInvoices(prev => prev.map(i => i.id === payload.new.id ? payload.new : i));
          else if (payload.eventType === 'INSERT') setInvoices(prev => [payload.new, ...prev].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
          else if (payload.eventType === 'DELETE') setInvoices(prev => prev.filter(i => i.id !== payload.old.id));
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portal_projects', filter: `id=eq.${pData.id}` }, (payload) => {
          setProject(payload.new);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portal_logistics', filter: `project_id=eq.${pData.id}` }, (payload) => {
          setLogistics(payload.new);
        })
        .subscribe();

      const clientChannel = supabase.channel(`portal_realtime_client_${cData.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portal_clients', filter: `id=eq.${cData.id}` }, (payload) => {
          setClient(payload.new);
          if (payload.new.has_completed_onboarding === false) {
            setShowOnboarding(true);
          }
        })
        .subscribe();
    }
    
    setLoading(false);
  };

  const toggleReadinessItem = async (itemId) => {
    if (!logistics || !logistics.site_readiness) return;
    const updatedArray = logistics.site_readiness.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    // Optimistic UI update
    setLogistics({ ...logistics, site_readiness: updatedArray });
    
    const { error } = await supabase.from('portal_logistics').update({ site_readiness: updatedArray }).eq('id', logistics.id);
    if (error) {
      alert("Failed to save checklist: " + error.message);
      // Revert on error
      setLogistics({ ...logistics });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/portal/${slug}`);
  };

  const sendClientNote = async (text, type, id) => {
    if (!text) return;
    setSendingNote(true);
    const { error } = await supabase.from('portal_comments').insert([{
      project_id: project.id,
      target_type: type,
      target_id: id,
      sender_type: 'client',
      content: text
    }]);
    if (error) alert("Error sending note: " + error.message);
    setSendingNote(false);
  };

  const approveDocument = async (id) => {
    const { error } = await supabase.from('portal_documents').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#ffffff', '#000000']
      });
    } else {
      alert("Error approving document: " + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-900 flex items-center justify-center"><Loader2 className="animate-spin text-brand-warm w-8 h-8" /></div>;

  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
  let daysToInstall = project?.target_installation_date ? differenceInDays(new Date(project.target_installation_date), new Date()) : null;

  const totalContract = project?.total_contract_value || 0;
  const amountPaid = project?.amount_paid || 0;
  const balance = totalContract - amountPaid;
  const financialProgress = totalContract > 0 ? Math.round((amountPaid / totalContract) * 100) : 0;

  const TABS = [
    { id: 'overview', icon: <Calendar size={20} />, label: 'Dashboard' },
    { id: 'documents', icon: <FileCheck size={20} />, label: 'Approvals' },
    { id: 'financials', icon: <DollarSign size={20} />, label: 'Financials' },
    { id: 'logistics', icon: <Truck size={20} />, label: 'Logistics' },
    { id: 'messages', icon: <MessageCircle size={20} />, label: 'Messages' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col md:flex-row relative">
      
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-stone-900 border border-stone-800 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-warm/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
              
              <div className="w-16 h-16 bg-brand-warm/10 text-brand-warm rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to your Control Room</h2>
              <p className="text-stone-400 mb-8 leading-relaxed">
                This is your dedicated portal to track manufacturing progress, review and approve shop drawings, manage financials, and communicate directly with your project team in real-time.
              </p>
              
              <button 
                onClick={completeOnboarding}
                className="bg-brand-warm text-white px-8 py-3 rounded-xl font-bold w-full hover:bg-amber-600 transition-colors shadow-lg shadow-brand-warm/20"
              >
                Let's Get Started
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-stone-950 text-white flex flex-col z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-stone-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {client.logo_url && <img src={client.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover bg-white p-0.5" />}
             <div>
               <h1 className="font-bold text-lg leading-tight truncate w-32">{client.company_name}</h1>
               <p className="text-[10px] text-stone-400 font-medium tracking-wider uppercase">Client Portal</p>
             </div>
          </div>
          <button className="md:hidden text-stone-400" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        
        <nav id="tour-sidebar" className="flex-1 p-4 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === tab.id ? 'bg-brand-warm text-white shadow-lg shadow-brand-warm/20' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
            >
              {tab.icon} {tab.label}
              {tab.id === 'documents' && documents.filter(d => d.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{documents.filter(d => d.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-stone-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm font-medium">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-stone-950 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-2 font-bold"><img src="/tashkel-logo.png" alt="Tashkel" className="h-6 filter brightness-0 invert opacity-80" /> Tashkel Control Room</div>
          <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* Top Right Live Info Widget */}
          <header className="hidden md:flex justify-end items-center mb-8 gap-4 text-stone-500 font-medium text-sm">
             <div className="flex items-center gap-1.5"><MapPin size={16}/> {userLocation}</div>
             <div className="w-1 h-1 bg-stone-300 rounded-full"></div>
             <div className="flex items-center gap-1.5"><Calendar size={16}/> {format(time, 'EEEE, MMM do')}</div>
             <div className="w-1 h-1 bg-stone-300 rounded-full"></div>
             <div className="flex items-center gap-1.5"><Clock size={16}/> <span className="font-mono">{format(time, 'h:mm:ss a')}</span></div>
          </header>

          <AnimatePresence mode="wait">
            {/* ----------------- OVERVIEW TAB ----------------- */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <header className="mb-8">
                  <h2 className="text-3xl font-bold text-brand-dark mb-2">Project Overview</h2>
                  <p className="text-stone-500">{project.name}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div id="tour-progress" className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-warm/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <h3 className="text-stone-500 font-medium mb-4">Manufacturing Progress</h3>
                      <div className="text-5xl font-bold text-brand-dark mb-6">{progressPercent}%</div>
                      <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-dark rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-stone-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-center">
                    <h3 className="text-stone-400 font-medium mb-4 flex items-center gap-2"><Calendar size={18} /> Target Installation</h3>
                    {daysToInstall !== null ? (
                      <>
                        <div className="text-4xl font-bold text-brand-warm mb-2">{daysToInstall > 0 ? daysToInstall : 0} <span className="text-xl text-stone-500 font-normal">Days</span></div>
                        <p className="text-stone-400 text-sm">{format(new Date(project.target_installation_date), 'MMMM do, yyyy')}</p>
                      </>
                    ) : (
                      <div className="text-stone-500 italic">Date pending</div>
                    )}
                  </div>
                </div>

                {/* Team Contacts Widget */}
                {(project?.pm_name || project?.engineer_name) && (
                  <div id="tour-team" className="mb-10">
                    <h3 className="text-lg font-bold text-brand-dark mb-4">Dedicated Project Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {project?.pm_name && (
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Project Manager</p>
                            <p className="font-bold text-lg text-brand-dark">{project.pm_name}</p>
                            <p className="text-sm text-stone-500 mt-1">{project.pm_email}</p>
                            {project.pm_phone && <p className="text-sm text-stone-500">{project.pm_phone}</p>}
                          </div>
                          {project.pm_email && (
                            <a href={`mailto:${project.pm_email}`} className="bg-brand-warm text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-amber-600 transition-colors shadow-lg">
                              <Send size={18} />
                            </a>
                          )}
                        </div>
                      )}
                      {project?.engineer_name && (
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Lead Engineer</p>
                            <p className="font-bold text-lg text-brand-dark">{project.engineer_name}</p>
                            <p className="text-sm text-stone-500 mt-1">{project.engineer_email}</p>
                            {project.engineer_phone && <p className="text-sm text-stone-500">{project.engineer_phone}</p>}
                          </div>
                          {project.engineer_email && (
                            <a href={`mailto:${project.engineer_email}`} className="bg-brand-dark text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-black transition-colors shadow-lg">
                              <Send size={18} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div id="tour-timeline">
                    <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2"><Clock size={20} className="text-brand-warm" /> Live Timeline</h3>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-stone-100">
                        {milestones.map((m) => {
                          const itemComments = comments.filter(c => c.target_type === 'milestone' && c.target_id === m.id);
                          return (
                            <div key={m.id} className="relative flex items-start gap-4">
                              <div className={`flex items-center justify-center w-8 h-8 mt-1 rounded-full border-4 border-white shrink-0 relative z-10 ${m.status === 'Completed' ? 'bg-green-100 text-green-600' : m.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-300'}`}>
                                {m.status === 'Completed' ? <CheckCircle size={14} /> : m.status === 'In Progress' ? <Clock size={14} /> : <Circle size={14} />}
                              </div>
                              <div className="flex-1 relative">
                                <div className={`p-4 rounded-2xl border ${m.status === 'In Progress' ? 'border-blue-200 bg-blue-50/50' : 'border-stone-100 bg-white'}`}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className={`font-bold text-sm ${m.status === 'Not Started' ? 'text-stone-400' : 'text-brand-dark'}`}>{m.phase_name}</h4>
                                      <p className="text-xs text-stone-500 mt-1">{m.status}</p>
                                    </div>
                                    <button onClick={() => setActiveNoteTarget(activeNoteTarget === m.id ? null : m.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${itemComments.length > 0 ? 'bg-brand-dark text-white shadow-md' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                                      <MessageCircle size={14} /> {itemComments.length > 0 ? itemComments.length : 'Note'}
                                    </button>
                                  </div>
                                </div>
                                <AnimatePresence>
                                  {activeNoteTarget === m.id && <ItemNotesOverlay targetId={m.id} targetType="milestone" comments={itemComments} onClose={() => setActiveNoteTarget(null)} onSend={sendClientNote} sending={sendingNote} />}
                                </AnimatePresence>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-brand-warm" /> Factory Feed</h3>
                    <div className="space-y-6">
                      {updates.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center text-stone-400 border border-stone-200 border-dashed">No updates yet.</div>
                      ) : (
                        updates.map(update => {
                          const itemComments = comments.filter(c => c.target_type === 'update' && c.target_id === update.id);
                          return (
                            <div key={update.id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 relative">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
                                  {update.type === 'qa_qc' ? <span className="text-orange-500 flex items-center gap-1"><CheckCircle size={14} /> QA Report</span> :
                                   update.type === 'media' ? <span className="text-purple-500 flex items-center gap-1"><ImageIcon size={14} /> Media</span> :
                                   <span className="text-blue-500 flex items-center gap-1"><FileText size={14} /> Note</span>}
                                  <span>• {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
                                </div>
                                <button onClick={() => setActiveNoteTarget(activeNoteTarget === update.id ? null : update.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${itemComments.length > 0 ? 'bg-brand-warm text-white shadow-md' : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>
                                  <MessageCircle size={14} /> {itemComments.length > 0 ? `${itemComments.length} Notes` : 'Note'}
                                </button>
                              </div>
                              <AnimatePresence>
                                {activeNoteTarget === update.id && <ItemNotesOverlay targetId={update.id} targetType="update" comments={itemComments} onClose={() => setActiveNoteTarget(null)} onSend={sendClientNote} sending={sendingNote} />}
                              </AnimatePresence>
                              {update.content && <p className="text-stone-700 leading-relaxed mb-4">{update.content}</p>}
                              {update.media_url && <img src={update.media_url} alt="Update" className="w-full h-auto max-h-96 object-cover rounded-2xl" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------- DOCUMENTS TAB ----------------- */}
            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <header className="mb-8">
                  <h2 className="text-3xl font-bold text-brand-dark mb-2">Documents & Approvals</h2>
                  <p className="text-stone-500">Review and legally approve Shop Drawings and renders.</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {documents.length === 0 && <div className="col-span-full p-12 text-center text-stone-400 bg-white border border-stone-200 border-dashed rounded-3xl">No documents require your attention right now.</div>}
                  {documents.map(doc => (
                    <div key={doc.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-stone-50 rounded-2xl text-stone-500"><FileCheck size={24} /></div>
                        {doc.status === 'approved' ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Approved</span>
                        ) : doc.status === 'rejected' ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Rejected</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={14}/> Pending</span>
                        )}
                      </div>
                      <h3 className="font-bold text-brand-dark text-lg">{doc.title}</h3>
                      <p className="text-stone-500 text-sm mb-6 uppercase tracking-wider mt-1">{doc.type.replace('_', ' ')}</p>
                      
                      <div className="mt-auto space-y-3">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-stone-100 hover:bg-stone-200 text-brand-dark py-3 rounded-xl font-bold transition-colors">
                          View Document
                        </a>
                        {doc.status === 'pending' && (
                          <button onClick={() => approveDocument(doc.id)} className="block w-full text-center bg-brand-dark hover:bg-black text-white py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02]">
                            Approve Design
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ----------------- FINANCIALS TAB ----------------- */}
            {activeTab === 'financials' && (
              <motion.div key="financials" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <header className="mb-8">
                  <h2 className="text-3xl font-bold text-brand-dark mb-2">Project Financials</h2>
                  <p className="text-stone-500">Track your contract balance and view invoices.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <h3 className="text-stone-500 font-medium mb-4">Payment Progress</h3>
                      <div className="text-5xl font-bold text-brand-dark mb-6">{financialProgress}%</div>
                      <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${financialProgress}%` }} />
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                         <span className="text-green-600">Paid: ${amountPaid.toLocaleString()}</span>
                         <span className="text-stone-400">Total: ${totalContract.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-stone-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-center">
                    <h3 className="text-stone-400 font-medium mb-4 flex items-center gap-2"><DollarSign size={18} /> Remaining Balance</h3>
                    <div className="text-4xl font-bold text-white mb-2">${balance.toLocaleString()}</div>
                    <p className="text-stone-400 text-sm">Please review unpaid invoices below.</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-brand-dark mb-6">Invoices</h3>
                <div className="space-y-4">
                  {invoices.length === 0 && <div className="p-12 text-center text-stone-400 bg-white border border-stone-200 border-dashed rounded-3xl">No invoices have been issued yet.</div>}
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex justify-between items-center p-6 border border-stone-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-bold text-lg text-brand-dark">{inv.title}</h4>
                        <p className="text-stone-500 mt-1 flex items-center gap-2">
                           <span className="font-bold text-brand-dark">${parseFloat(inv.amount).toLocaleString()}</span>
                           <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                           Due: {inv.due_date ? format(new Date(inv.due_date), 'MMM do, yyyy') : 'Upon receipt'}
                        </p>
                      </div>
                      <div>
                        {inv.status === 'paid' ? <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1"><CheckCircle2 size={16}/> Paid</span> :
                         inv.status === 'partial' ? <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1"><Clock size={16}/> Partial</span> :
                         <span className="bg-stone-100 text-stone-600 px-4 py-1.5 rounded-full text-sm font-bold">Unpaid</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ----------------- LOGISTICS TAB ----------------- */}
            {activeTab === 'logistics' && (
              <motion.div key="logistics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <header className="mb-8">
                  <h2 className="text-3xl font-bold text-brand-dark mb-2">Logistics Tracker</h2>
                  <p className="text-stone-500">Live delivery tracking for your manufactured pieces.</p>
                </header>

                {!logistics ? (
                  <div className="p-12 text-center text-stone-400 bg-white border border-stone-200 border-dashed rounded-3xl">
                    Logistics tracking will be available once manufacturing nears completion.
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm max-w-2xl mx-auto">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-6 mb-6">
                      <div>
                        <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Tracking ID</p>
                        <p className="font-mono font-bold text-brand-dark text-xl">{logistics.tracking_number || 'PENDING'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Status</p>
                        <p className="font-bold text-brand-warm capitalize text-lg">{logistics.status.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-[calc(100%-2rem)] before:w-0.5 before:bg-stone-100">
                      {logisticsSteps.map((step, idx) => {
                        const isLast = idx === logisticsSteps.length - 1;
                        return (
                          <div key={step.id} className={`relative flex gap-6 ${!isLast ? 'pb-8' : ''}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative z-10 border-4 border-white ${step.status === 'completed' ? 'bg-green-500 text-white' : step.status === 'active' ? 'bg-brand-warm text-white animate-pulse' : 'bg-stone-100 text-stone-300'}`}>
                              {step.status === 'completed' ? <CheckCircle2 size={16} /> : <MapPin size={16} />}
                            </div>
                            <div className="pt-1">
                              <h4 className={`font-bold text-lg ${step.status === 'pending' ? 'text-stone-400' : 'text-brand-dark'}`}>{step.step_name}</h4>
                              {step.description && <p className="text-stone-500 text-sm mt-1">{step.description}</p>}
                              {step.completed_at && <p className="text-xs font-bold text-stone-400 mt-2">{format(new Date(step.completed_at), 'MMM do, h:mm a')}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {logistics.site_readiness && logistics.site_readiness.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-stone-100">
                        <h4 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                          <CheckCircle2 className="text-brand-warm" size={20} /> Site Readiness Checklist
                        </h4>
                        <p className="text-sm text-stone-500 mb-6">
                          Please confirm the site is ready to prevent delivery delays. All items must be checked before dispatch.
                        </p>
                        <div className="space-y-3">
                          {logistics.site_readiness.map(item => (
                            <label key={item.id} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${item.completed ? 'bg-green-50/50 border-green-200' : 'bg-stone-50 border-stone-200 hover:border-brand-warm'}`}>
                              <div className="pt-0.5">
                                <input 
                                  type="checkbox" 
                                  checked={item.completed}
                                  onChange={() => toggleReadinessItem(item.id)}
                                  className="w-5 h-5 rounded border-stone-300 text-brand-warm focus:ring-brand-warm cursor-pointer"
                                />
                              </div>
                              <span className={`font-medium ${item.completed ? 'text-green-800 line-through opacity-70' : 'text-stone-700'}`}>
                                {item.task}
                              </span>
                            </label>
                          ))}
                        </div>
                        {logistics.site_readiness.every(i => i.completed) && (
                          <div className="mt-6 bg-green-100 text-green-800 p-4 rounded-xl text-center font-bold flex justify-center items-center gap-2">
                            <CheckCircle2 size={18} /> Site is fully ready for delivery
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ----------------- MESSAGES TAB ----------------- */}
            {activeTab === 'messages' && (
               <motion.div key="messages" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <header className="mb-8">
                    <h2 className="text-3xl font-bold text-brand-dark mb-2">Message Center</h2>
                    <p className="text-stone-500">All your project notes and inquiries in one place.</p>
                  </header>
                  
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm max-w-4xl">
                    {comments.length === 0 && <div className="text-center text-stone-400 py-12">You have no messages yet.</div>}
                    <div className="space-y-4">
                      {comments.map(c => (
                        <div key={c.id} className={`p-4 rounded-2xl border flex flex-col ${c.sender_type === 'client' ? 'bg-brand-warm/10 border-brand-warm/20 ml-auto w-3/4' : 'bg-stone-50 border-stone-200 mr-auto w-3/4'}`}>
                          <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-xs uppercase opacity-75">{c.sender_type === 'client' ? 'You' : 'Project Manager'}</span>
                             <span className="text-xs text-stone-500">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                          </div>
                          <p className="text-stone-800">{c.content}</p>
                          <div className="mt-3 pt-3 border-t border-black/5 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                            Attached to: {c.target_type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

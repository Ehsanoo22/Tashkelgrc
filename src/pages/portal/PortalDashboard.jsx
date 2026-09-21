import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogOut, CheckCircle, Clock, Circle, Calendar, Image as ImageIcon, FileText, MessageCircle, Send, X } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

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
      className="absolute z-30 right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
      style={{ maxHeight: '400px' }}
    >
      <div className="bg-stone-50 border-b border-stone-100 p-4 flex justify-between items-center">
        <h4 className="font-bold text-brand-dark flex items-center gap-2 text-sm">
          <MessageCircle size={16} /> Notes & Inquiries
        </h4>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={16} /></button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-stone-50/50 space-y-4" style={{ minHeight: '150px' }}>
        {comments.length === 0 ? (
          <div className="text-center text-stone-400 text-xs py-8">No notes yet. Ask a question or leave a note for your project manager here!</div>
        ) : (
          comments.map(c => (
            <div key={c.id} className={`flex flex-col ${c.sender_type === 'client' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-bold text-stone-400 mb-1 uppercase tracking-wider">{c.sender_type === 'client' ? 'You' : 'Project Manager'}</span>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${c.sender_type === 'client' ? 'bg-brand-dark text-white rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-700 rounded-tl-sm shadow-sm'}`}>
                {c.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-white border-t border-stone-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Type your note..." 
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-warm"
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
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const [activeNoteTarget, setActiveNoteTarget] = useState(null);
  const [sendingNote, setSendingNote] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

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
    if (!cData.has_completed_onboarding) {
      setShowOnboarding(true);
    }

    const { data: pData } = await supabase
      .from('portal_projects')
      .select('*')
      .eq('client_id', session.user.id)
      .single();

    if (pData) {
      setProject(pData);
      
      const { data: mData } = await supabase
        .from('portal_milestones')
        .select('*')
        .eq('project_id', pData.id)
        .order('order_index', { ascending: true });
      if (mData) setMilestones(mData);

      const { data: uData } = await supabase
        .from('portal_updates')
        .select('*')
        .eq('project_id', pData.id)
        .order('created_at', { ascending: false });
      if (uData) setUpdates(uData);

      const { data: cData } = await supabase
        .from('portal_comments')
        .select('*')
        .eq('project_id', pData.id)
        .order('created_at', { ascending: true });
      if (cData) setComments(cData);
    }
    
    setLoading(false);
  };

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    await supabase.from('portal_clients').update({ has_completed_onboarding: true }).eq('id', client.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/portal/${slug}`);
  };

  const sendClientNote = async (text, type, id) => {
    if (!text) return;
    setSendingNote(true);
    const { data, error } = await supabase.from('portal_comments').insert([{
      project_id: project.id,
      target_type: type,
      target_id: id,
      sender_type: 'client',
      content: text
    }]).select();

    if (data) setComments([...comments, data[0]]);
    if (error) alert("Error sending note: " + error.message);
    setSendingNote(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-brand-dark w-8 h-8" /></div>;
  }

  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
  
  let daysToInstall = null;
  if (project?.target_installation_date) {
    daysToInstall = differenceInDays(new Date(project.target_installation_date), new Date());
  }

  return (
    <>
      {/* Spotlight Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Dark overlay with absolute masking isn't strictly necessary if we just do a centered card that points out features, or we can use fixed tooltips over the UI elements. */}
            <div className="absolute inset-0 bg-stone-900/80 pointer-events-auto" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                key={onboardingStep}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl pointer-events-auto relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-stone-100">
                   <div className="h-full bg-brand-warm transition-all duration-300" style={{ width: `${((onboardingStep + 1) / 3) * 100}%` }} />
                </div>

                {onboardingStep === 0 && (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-brand-dark mb-3">Welcome to your Portal</h3>
                    <p className="text-stone-500 mb-8 leading-relaxed">This is your premium space to track your project in real-time. Everything from manufacturing progress to factory photos will be posted right here.</p>
                    <button onClick={() => setOnboardingStep(1)} className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold hover:bg-stone-800">Next</button>
                  </div>
                )}
                {onboardingStep === 1 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={24} /></div>
                    <h3 className="text-2xl font-bold text-brand-dark mb-3">Live Timeline</h3>
                    <p className="text-stone-500 mb-8 leading-relaxed">The timeline on the left updates instantly as we complete each manufacturing phase, so you always know exactly where we are.</p>
                    <button onClick={() => setOnboardingStep(2)} className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold hover:bg-stone-800">Next</button>
                  </div>
                )}
                {onboardingStep === 2 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-warm/10 text-brand-warm rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle size={24} /></div>
                    <h3 className="text-2xl font-bold text-brand-dark mb-3">Add Notes & Inquire</h3>
                    <p className="text-stone-500 mb-8 leading-relaxed">Have a question about a specific photo or timeline phase? Just click the <b>Notes</b> button on any item to instantly chat with your project manager!</p>
                    <button onClick={handleCompleteOnboarding} className="w-full bg-brand-warm text-white py-3 rounded-xl font-bold hover:bg-amber-600">Enter Portal</button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen bg-stone-100 font-sans ${showOnboarding ? 'fixed inset-0 overflow-hidden' : ''}`}>
        
        {/* Header */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {client.logo_url && <img src={client.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-stone-200 bg-white p-1" />}
              <div>
                <h1 className="font-bold text-brand-dark leading-tight">{client.company_name}</h1>
                <p className="text-xs text-stone-500 font-medium tracking-wider uppercase">{project?.name}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-stone-400 hover:text-brand-dark transition-colors flex items-center gap-2 text-sm font-bold">
              <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10 pb-32">
          
          {/* Executive Hero */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-warm/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div>
                <h2 className="text-4xl font-bold text-brand-dark mb-2">{progressPercent}% Complete</h2>
                <p className="text-stone-500 text-lg mb-8">Overall Project Progress</p>
                <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progressPercent}%` }} 
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full bg-brand-dark rounded-full"
                  />
                </div>
              </div>
              
              <div className="md:border-l md:border-stone-100 md:pl-10 flex flex-col justify-center">
                {daysToInstall !== null ? (
                  <>
                    <h3 className="text-stone-500 font-medium flex items-center gap-2 mb-2"><Calendar size={18} /> Target Installation</h3>
                    <div className="text-5xl font-bold text-brand-dark mb-2">
                      {daysToInstall > 0 ? daysToInstall : 0} <span className="text-2xl text-stone-400 font-normal">Days</span>
                    </div>
                    <p className="text-stone-500">{format(new Date(project.target_installation_date), 'MMMM do, yyyy')}</p>
                  </>
                ) : (
                  <div className="text-stone-400 italic">Target date not set</div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Timeline & Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Timeline Column */}
            <div className="lg:col-span-5">
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                <Clock size={20} className="text-brand-warm" /> Live Timeline
              </h3>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-stone-100">
                  {milestones.map((m, idx) => {
                    const itemComments = comments.filter(c => c.target_type === 'milestone' && c.target_id === m.id);
                    return (
                      <div key={m.id} className="relative flex items-start gap-4 group">
                        <div className={`flex items-center justify-center w-8 h-8 mt-1 rounded-full border-4 border-white shrink-0 relative z-10 transition-colors ${m.status === 'Completed' ? 'bg-green-100 text-green-600' : m.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-300'}`}>
                          {m.status === 'Completed' ? <CheckCircle size={14} /> : m.status === 'In Progress' ? <Clock size={14} /> : <Circle size={14} />}
                        </div>
                        <div className="flex-1 relative">
                          <div className={`p-4 rounded-2xl border transition-all ${m.status === 'In Progress' ? 'border-blue-200 bg-blue-50/50 shadow-sm' : 'border-stone-100 bg-white hover:border-stone-200'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`font-bold text-sm ${m.status === 'Not Started' ? 'text-stone-400' : 'text-brand-dark'}`}>{m.phase_name}</h4>
                                <p className="text-xs text-stone-500 mt-1">{m.status}</p>
                              </div>
                              <button 
                                onClick={() => setActiveNoteTarget(activeNoteTarget === m.id ? null : m.id)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${itemComments.length > 0 ? 'bg-brand-dark text-white' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                              >
                                <MessageCircle size={14} /> {itemComments.length > 0 ? itemComments.length : 'Note'}
                              </button>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {activeNoteTarget === m.id && (
                              <ItemNotesOverlay 
                                targetId={m.id} 
                                targetType="milestone" 
                                comments={itemComments} 
                                onClose={() => setActiveNoteTarget(null)}
                                onSend={sendClientNote}
                                sending={sendingNote}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Updates Feed Column */}
            <div className="lg:col-span-7">
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-brand-warm" /> Factory Feed
              </h3>
              
              <div className="space-y-6">
                {updates.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center text-stone-400 border border-stone-200 border-dashed">
                    No updates have been posted yet.
                  </div>
                ) : (
                  updates.map(update => {
                    const itemComments = comments.filter(c => c.target_type === 'update' && c.target_id === update.id);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={update.id} 
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200 relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-stone-400">
                            {update.type === 'qa_qc' ? <span className="text-orange-500 flex items-center gap-1"><CheckCircle size={14} /> QA Report</span> :
                             update.type === 'media' ? <span className="text-purple-500 flex items-center gap-1"><ImageIcon size={14} /> Media</span> :
                             <span className="text-blue-500 flex items-center gap-1"><FileText size={14} /> Note</span>}
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
                          </div>
                          <div className="relative">
                            <button 
                              onClick={() => setActiveNoteTarget(activeNoteTarget === update.id ? null : update.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${itemComments.length > 0 ? 'bg-brand-warm text-white shadow-sm' : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                            >
                              <MessageCircle size={14} /> {itemComments.length > 0 ? `${itemComments.length} Notes` : 'Add Note'}
                            </button>
                            <AnimatePresence>
                              {activeNoteTarget === update.id && (
                                <ItemNotesOverlay 
                                  targetId={update.id} 
                                  targetType="update" 
                                  comments={itemComments} 
                                  onClose={() => setActiveNoteTarget(null)}
                                  onSend={sendClientNote}
                                  sending={sendingNote}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {update.content && <p className="text-stone-700 leading-relaxed mb-6">{update.content}</p>}
                        
                        {update.media_url && (
                          <div className="rounded-2xl overflow-hidden border border-stone-100 bg-stone-50">
                            {update.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video src={update.media_url} controls className="w-full h-auto max-h-[500px] object-contain" />
                            ) : (
                              <img src={update.media_url} alt="Update" className="w-full h-auto max-h-[500px] object-cover cursor-zoom-in hover:opacity-95 transition-opacity" />
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

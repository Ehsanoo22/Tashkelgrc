import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogOut, CheckCircle, Clock, Circle, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

// ----------------------------------------------------------------------
// Onboarding Walkthrough Component
// ----------------------------------------------------------------------
const OnboardingTour = ({ onComplete }) => {
  const steps = [
    { title: 'Welcome to your Lumina Portal', desc: 'A premium space designed exclusively for you to track your project in real-time.' },
    { title: 'Executive Overview', desc: 'At the top, instantly see your overall progress and the countdown to your installation date.' },
    { title: 'Live Timeline', desc: 'Track exactly which phase of manufacturing we are currently in.' },
    { title: 'Factory Feed', desc: 'Scroll down for high-res photos, videos, and QA reports direct from the factory floor.' }
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev === steps.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 2000); // Wait 2s on last slide then complete
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-stone-900 flex flex-col items-center justify-center p-6 text-center text-white"
    >
      <div className="absolute top-8 right-8 cursor-pointer text-stone-500 hover:text-white transition-colors text-sm font-bold" onClick={onComplete}>SKIP TOUR</div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <h2 className="text-4xl font-bold mb-4">{steps[currentStep].title}</h2>
          <p className="text-xl text-stone-400">{steps[currentStep].desc}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-12">
        {steps.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors duration-500 ${i === currentStep ? 'bg-brand-warm' : 'bg-stone-700'}`} />
        ))}
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
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate(`/portal/${slug}`);
      return;
    }

    // Fetch Client
    const { data: cData, error: cError } = await supabase
      .from('portal_clients')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (cError || !cData || cData.slug !== slug) {
      // User doesn't match slug or error
      await supabase.auth.signOut();
      navigate(`/portal/${slug}`);
      return;
    }

    setClient(cData);
    if (!cData.has_completed_onboarding) {
      setShowOnboarding(true);
    }

    // Fetch Project
    const { data: pData } = await supabase
      .from('portal_projects')
      .select('*')
      .eq('client_id', session.user.id)
      .single();

    if (pData) {
      setProject(pData);
      
      // Fetch Milestones
      const { data: mData } = await supabase
        .from('portal_milestones')
        .select('*')
        .eq('project_id', pData.id)
        .order('order_index', { ascending: true });
      if (mData) setMilestones(mData);

      // Fetch Updates
      const { data: uData } = await supabase
        .from('portal_updates')
        .select('*')
        .eq('project_id', pData.id)
        .order('created_at', { ascending: false });
      if (uData) setUpdates(uData);
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

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-brand-dark w-8 h-8" /></div>;
  }

  // Calculate Progress
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
  
  // Calculate Days to Installation
  let daysToInstall = null;
  if (project?.target_installation_date) {
    daysToInstall = differenceInDays(new Date(project.target_installation_date), new Date());
  }

  return (
    <>
      <AnimatePresence>
        {showOnboarding && <OnboardingTour onComplete={handleCompleteOnboarding} />}
      </AnimatePresence>

      <div className={`min-h-screen bg-stone-100 font-sans ${showOnboarding ? 'fixed inset-0 overflow-hidden' : ''}`}>
        
        {/* Header */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {client.logo_url && <img src={client.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-stone-200" />}
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
            <div className="lg:col-span-4">
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                <Clock size={20} className="text-brand-warm" /> Live Timeline
              </h3>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-stone-100">
                  {milestones.map((m, idx) => (
                    <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-colors ${m.status === 'Completed' ? 'bg-green-100 text-green-600' : m.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-300'}`}>
                        {m.status === 'Completed' ? <CheckCircle size={14} /> : m.status === 'In Progress' ? <Clock size={14} /> : <Circle size={14} />}
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)]">
                        <div className={`p-4 rounded-xl border ${m.status === 'In Progress' ? 'border-blue-200 bg-blue-50/50' : 'border-stone-100 bg-white'}`}>
                          <h4 className={`font-bold text-sm ${m.status === 'Not Started' ? 'text-stone-400' : 'text-brand-dark'}`}>{m.phase_name}</h4>
                          <p className="text-xs text-stone-500 mt-1">{m.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Updates Feed Column */}
            <div className="lg:col-span-8">
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-brand-warm" /> Factory Feed
              </h3>
              
              <div className="space-y-6">
                {updates.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center text-stone-400 border border-stone-200 border-dashed">
                    No updates have been posted yet.
                  </div>
                ) : (
                  updates.map(update => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      key={update.id} 
                      className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200"
                    >
                      <div className="flex items-center gap-3 mb-4 text-xs font-bold uppercase tracking-wider text-stone-400">
                        {update.type === 'qa_qc' ? <span className="text-orange-500 flex items-center gap-1"><CheckCircle size={14} /> QA Report</span> :
                         update.type === 'media' ? <span className="text-purple-500 flex items-center gap-1"><ImageIcon size={14} /> Media</span> :
                         <span className="text-blue-500 flex items-center gap-1"><FileText size={14} /> Note</span>}
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
                        
                        {/* New Badge logic (If created after last_login) */}
                        {client.last_login_at && new Date(update.created_at) > new Date(client.last_login_at) && (
                          <span className="bg-brand-warm text-white px-2 py-0.5 rounded-full text-[10px] ml-auto">NEW</span>
                        )}
                      </div>

                      {update.content && <p className="text-stone-700 leading-relaxed mb-6">{update.content}</p>}
                      
                      {update.media_url && (
                        <div className="rounded-2xl overflow-hidden border border-stone-100 bg-stone-50">
                          {update.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={update.media_url} controls className="w-full h-auto max-h-[500px] object-contain" />
                          ) : (
                            <img src={update.media_url} alt="Update" className="w-full h-auto max-h-[500px] object-contain cursor-zoom-in" />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

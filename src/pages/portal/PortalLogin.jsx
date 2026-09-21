import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortalLogin() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientBySlug();
  }, [slug]);

  const fetchClientBySlug = async () => {
    // This requires the public select policy on portal_clients
    const { data, error } = await supabase
      .from('portal_clients')
      .select('company_name, logo_url')
      .eq('slug', slug)
      .single();

    if (data && !error) {
      setClientData(data);
    } else {
      setClientData(null);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError('Invalid credentials. Please try again.');
      setLoginLoading(false);
      return;
    }

    // Update last_login_at
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('portal_clients').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);
    }

    navigate(`/portal/${slug}/dashboard`);
  };

  if (loading) {
    return <div className="min-h-screen bg-stone-900 flex items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8" /></div>;
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white">
        <Lock size={48} className="mb-4 text-stone-700" />
        <h1 className="text-2xl font-bold">Portal Not Found</h1>
        <p className="text-stone-400 mt-2">The requested client portal does not exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-stone-800 to-transparent opacity-50"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-brand-warm/10 blur-[100px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          {clientData.logo_url ? (
             <img src={clientData.logo_url} alt={clientData.company_name} className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-stone-800 shadow-2xl" />
          ) : (
             <div className="w-24 h-24 rounded-full bg-stone-800 text-brand-warm flex items-center justify-center text-3xl font-bold mb-6 shadow-2xl">
               {clientData.company_name.charAt(0)}
             </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-2">{clientData.company_name}</h1>
          <p className="text-stone-400 font-medium tracking-wide">SECURE CLIENT PORTAL</p>
        </div>

        <form onSubmit={handleLogin} className="bg-stone-800/50 backdrop-blur-xl p-8 rounded-3xl border border-stone-700 shadow-2xl">
          {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-6 text-sm text-center border border-red-500/20">{error}</div>}
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-stone-900/50 border border-stone-700 text-white rounded-xl p-3 focus:outline-none focus:border-brand-warm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-stone-900/50 border border-stone-700 text-white rounded-xl p-3 focus:outline-none focus:border-brand-warm transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={loginLoading}
              className="w-full bg-white text-stone-900 py-3.5 rounded-xl font-bold mt-4 hover:bg-stone-200 transition-colors flex justify-center items-center"
            >
              {loginLoading ? <Loader2 size={20} className="animate-spin text-stone-900" /> : 'Enter Portal'}
            </button>
          </div>
          
          <div className="mt-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
            <Lock size={12} /> Encrypted & Powered by Tashkel
          </div>
        </form>
      </motion.div>
    </div>
  );
}

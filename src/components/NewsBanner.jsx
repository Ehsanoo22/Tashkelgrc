import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function NewsBanner({ lang }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // 1. Initial fetch
    async function fetchNews() {
      const { data } = await supabase
        .from('site_settings')
        .select('news_banner_active, news_banner_text_en, news_banner_text_ar, news_banner_link')
        .limit(1)
        .single();
        
      if (data) {
        setSettings(data);
      }
    }
    fetchNews();

    // 2. Realtime subscription for instant updates
    const channel = supabase.channel('news_banner_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          setSettings(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!settings || !settings.news_banner_active) return null;

  const isRtl = lang === 'ar';
  const text = isRtl ? settings.news_banner_text_ar : settings.news_banner_text_en;
  
  if (!text) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-brand-dark text-brand-warm overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-warm opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-warm"></span>
            </span>
            <Bell size={16} className="text-brand-warm hidden md:block" />
            <p className="font-medium text-sm md:text-base tracking-wide uppercase font-semibold">
              {text}
            </p>
          </div>
          
          {settings.news_banner_link && (
            <a 
              href={settings.news_banner_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-warm/10 hover:bg-brand-warm/20 text-brand-warm rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              {isRtl ? 'اكتشف المزيد' : 'Learn More'}
              {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

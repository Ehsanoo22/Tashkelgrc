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
        .select('news_banner_active, news_banner_text_en, news_banner_text_ar, news_banner_link, news_banner_speed')
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
        className="w-full bg-[#111] border-y border-stone-800 text-brand-warm overflow-hidden py-3 relative flex items-center"
      >
        {/* Gradient blur edges for a cinematic look */}
        <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-[#111] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-[#111] to-transparent z-10" />

        <motion.div
          animate={{ x: isRtl ? ['-50%', '0%'] : ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: settings.news_banner_speed || 40 // Dynamic speed controller
          }}
          className="flex whitespace-nowrap items-center w-max"
        >
          {/* Repeat the content enough times to ensure it covers the screen and loops seamlessly */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 mx-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-warm opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-warm"></span>
              </span>
              <p className="font-medium text-xs md:text-sm tracking-wide uppercase font-semibold">
                {text}
              </p>
              {settings.news_banner_link && (
                <a 
                  href={settings.news_banner_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-warm/10 hover:bg-brand-warm/20 text-brand-warm rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ml-2 mr-4"
                >
                  {isRtl ? 'اكتشف المزيد' : 'Learn More'}
                  {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                </a>
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

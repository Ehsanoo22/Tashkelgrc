import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DiscountPopup({ lang }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function fetchPromo() {
      const { data } = await supabase.from('site_settings').select('promo_active, promo_text_en, promo_text_ar, promo_discount_code, promo_delay_seconds, instant_popup_trigger').limit(1).single();
      if (data && data.promo_active) {
        setSettings(data);
        const delayMs = (data.promo_delay_seconds || 5) * 1000;
        
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, delayMs);
        return () => clearTimeout(timer);
      }
    }
    fetchPromo();

    // Listen for instant popup triggers from the dashboard
    const channel = supabase.channel('popup_trigger')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          const newData = payload.new;
          if (newData.promo_active) {
            setSettings(newData);
            // If the instant trigger timestamp changed, show it instantly
            if (newData.instant_popup_trigger) {
              setIsVisible(true);
            }
          } else {
            setIsVisible(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCopy = async () => {
    if (!settings) return;
    try {
      await navigator.clipboard.writeText(settings.promo_discount_code);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!settings || !isVisible) return null;

  const isRtl = lang === 'ar';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.5, type: 'spring', damping: 25 }}
          className="w-full max-w-sm bg-white shadow-2xl rounded-3xl overflow-hidden border border-stone-200"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {/* Header */}
          <div className="bg-brand-dark px-5 py-4 text-white flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">
              {isRtl ? 'عرض خاص' : 'Special Offer'}
            </span>
            <button onClick={() => setIsVisible(false)} className="hover:text-brand-warm transition-colors p-1" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <div className="inline-block px-3 py-1 bg-brand-warm/10 text-brand-warm text-xs font-bold tracking-widest uppercase mb-4 rounded-full">
              {isRtl ? 'عرض حصري' : 'Exclusive Offer'}
            </div>
            
            <h3 className="text-2xl font-light text-brand-dark mb-4 leading-tight">
              {isRtl ? settings.promo_text_ar : settings.promo_text_en}
            </h3>
            
            <div className="mt-6 flex flex-col space-y-3">
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                {isRtl ? 'استخدم الرمز' : 'Use Code'}
              </p>
              
              <button
                onClick={handleCopy}
                className="group relative w-full flex items-center justify-between p-4 border-2 border-dashed border-brand-warm/40 bg-brand-warm/5 hover:bg-brand-warm/10 transition-colors rounded-xl"
              >
                <span className="font-mono text-xl font-bold text-brand-dark tracking-widest">
                  {settings.promo_discount_code}
                </span>
                {hasCopied ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-brand-warm group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

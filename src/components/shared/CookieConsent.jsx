import React, { useState, useEffect } from 'react';
import { grantConsent, declineConsent, hasRespondedToConsent } from '../../lib/analytics';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent({ lang }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't responded yet
    if (!hasRespondedToConsent()) {
      const timer = setTimeout(() => setShow(true), 2000); // delay slightly so it's not jarring
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    grantConsent();
    setShow(false);
  };

  const handleDecline = () => {
    declineConsent();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white/90 backdrop-blur-xl border border-stone-200 p-5 rounded-2xl shadow-2xl z-50 text-brand-dark"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
              <Info size={16} className="text-brand-warm" />
              {lang === 'ar' ? 'نحن نستخدم ملفات تعريف الارتباط' : 'We use cookies'}
            </div>
            <button onClick={handleDecline} className="text-stone-400 hover:text-stone-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <p className="text-sm text-stone-600 mb-5 leading-relaxed">
            {lang === 'ar' 
              ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا، وتحليل حركة المرور، وتخصيص المحتوى. هل توافق على استخدامنا لملفات تعريف الارتباط؟' 
              : 'We use cookies to improve your experience on our site, analyze our traffic, and personalize content. Do you consent to our use of cookies?'}
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleAccept}
              className="flex-1 bg-brand-dark text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-black transition-colors"
            >
              {lang === 'ar' ? 'موافق' : 'Accept All'}
            </button>
            <button 
              onClick={handleDecline}
              className="flex-1 bg-stone-100 text-stone-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-200 transition-colors"
            >
              {lang === 'ar' ? 'رفض' : 'Decline'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

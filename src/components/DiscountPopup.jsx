import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent } from 'lucide-react';

export default function DiscountPopup({ lang }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show popup after 35 seconds
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 35000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  const isRtl = lang === 'ar';

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
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
              <div className="flex items-center gap-2">
                <div className="bg-brand-warm rounded-full p-1">
                  <Percent className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                  {isRtl ? 'عرض خاص' : 'Special Offer'}
                </span>
              </div>
              <button onClick={() => setIsDismissed(true)} className="hover:text-brand-warm transition-colors p-1" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
              <h4 className="text-2xl font-bold text-brand-dark mb-3 tracking-tight">
                {isRtl ? 'احصل على خصم 20٪' : 'Get 20% Off'}
              </h4>
              <p className="text-sm text-stone-500 mb-8 leading-relaxed px-2">
                {isRtl 
                  ? 'تقدم بطلبك عبر الإنترنت الآن واحصل على خصم حصري على مشروعك المعماري القادم.' 
                  : 'Apply online right now and receive an exclusive 20% discount on your next architectural project.'}
              </p>
              <a 
                href="#contact" 
                onClick={() => setIsVisible(false)}
                className="block w-full text-center py-4 bg-brand-dark text-white rounded-xl text-sm font-bold tracking-wide uppercase hover:bg-brand-warm transition-all duration-300 shadow-lg hover:shadow-brand-warm/30 transform active:scale-95"
              >
                {isRtl ? 'استفد من العرض' : 'Apply Discount Now'}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

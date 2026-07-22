import React from 'react';
import { translations } from '../utils/translations';
import { motion } from 'framer-motion';

export default function MaintenanceMode({ lang, setLang }) {
  const t = translations[lang];

  return (
    <div className={`min-h-screen bg-brand-dark flex flex-col justify-center items-center p-6 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header with logo & lang switch */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <img src="/assets/logo_new.png" alt="Tashkel" className="h-10 md:h-12 object-contain filter brightness-0 invert" />
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="text-white/60 hover:text-white transition-colors text-sm font-medium tracking-widest uppercase"
        >
          {t.nav.toggleLang}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center max-w-2xl"
      >
        <div className="inline-block border border-brand-warm/30 rounded-full px-6 py-2 mb-8 text-brand-warm tracking-[0.2em] uppercase text-xs">
          {lang === 'en' ? 'Scheduled Maintenance' : 'صيانة مجدولة'}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-light text-white mb-8 leading-tight">
          {lang === 'en' 
            ? 'We are currently upgrading our platform.' 
            : 'نحن نقوم بتحديث منصتنا حالياً.'}
        </h1>
        
        <p className="text-stone-400 text-lg font-light leading-relaxed mb-12">
          {lang === 'en'
            ? 'Tashkel is undergoing scheduled maintenance to improve your experience. We will be back online shortly. For urgent inquiries, please contact us directly.'
            : 'تخضع منصة تشكّل لصيانة مجدولة لتحسين تجربتك. سنعود للعمل قريباً. للاستفسارات العاجلة، يرجى التواصل معنا مباشرة.'}
        </p>

        <a 
          href="mailto:info@tashkel.com"
          className="inline-flex items-center justify-center px-8 py-4 border border-brand-warm text-brand-warm hover:bg-brand-warm hover:text-white transition-colors duration-300 text-sm tracking-[0.2em] uppercase rounded-none"
        >
          {lang === 'en' ? 'Contact Us' : 'اتصل بنا'}
        </a>
      </motion.div>
    </div>
  );
}

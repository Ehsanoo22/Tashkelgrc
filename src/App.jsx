import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProcessSection from './components/ProcessSection';
import WorkGallery from './components/WorkGallery';
import GFRCSection from './components/GFRCSection';
import About from './components/About';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import DiscountPopup from './components/DiscountPopup';
import { translations } from './utils/translations';

function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  return (
    <div className={`relative min-h-screen bg-white text-brand-dark ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} setLang={setLang} t={t} />
      <Hero t={t} lang={lang} />
      <ProcessSection t={t} lang={lang} />
      <GFRCSection t={t} lang={lang} />
      <WorkGallery t={t} lang={lang} />
      <About t={t} lang={lang} />
      <ContactSection t={t} lang={lang} />
      <Footer t={t} lang={lang} />

      <FloatingWhatsApp lang={lang} />
      <DiscountPopup lang={lang} />
    </div>
  );
}

export default App;

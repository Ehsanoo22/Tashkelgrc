import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProcessSection from '../components/ProcessSection';
import WorkGallery from '../components/WorkGallery';
import GFRCSection from '../components/GFRCSection';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import DiscountPopup from '../components/DiscountPopup';
import MaintenanceMode from '../components/MaintenanceMode';
import NewsBanner from '../components/NewsBanner';
import { translations } from '../utils/translations';
import { supabase } from '../lib/supabase';

export default function PublicSite({ lang, setLang }) {
  const t = translations[lang];
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkMaintenance() {
      const { data } = await supabase.from('site_settings').select('maintenance_mode').limit(1).single();
      if (data && data.maintenance_mode) {
        setIsMaintenance(true);
      }
      setLoading(false);
    }
    checkMaintenance();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-brand-dark"></div>;
  }

  if (isMaintenance) {
    return <MaintenanceMode lang={lang} setLang={setLang} />;
  }

  return (
    <div className={`relative min-h-screen bg-white text-brand-dark ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} setLang={setLang} t={t} />
      <Hero t={t} lang={lang} />
      <NewsBanner lang={lang} />
      <ProcessSection t={t} lang={lang} />
      <GFRCSection t={t} lang={lang} />
      <WorkGallery t={t} lang={lang} />
      <About t={t} lang={lang} />
      <Testimonials t={t} lang={lang} />
      <ContactSection t={t} lang={lang} />
      <Footer t={t} lang={lang} />

      <FloatingWhatsApp lang={lang} />
      <DiscountPopup lang={lang} />
    </div>
  );
}

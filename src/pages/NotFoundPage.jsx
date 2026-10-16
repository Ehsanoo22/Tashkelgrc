import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Home, Compass, PhoneCall } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { translations } from '../utils/translations';

export default function NotFoundPage({ lang, setLang }) {
  const isRtl = lang === 'ar';
  const t = translations[lang] || translations.en;

  return (
    <div className={`min-h-screen flex flex-col bg-[#050505] text-white ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{isRtl ? '٤٠٤ - الصفحة غير موجودة | تشكيل GFRC' : '404 - Page Not Found | Tashkel GFRC'}</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="The architectural page you are looking for does not exist." />
      </Helmet>

      <Navbar lang={lang} setLang={setLang} t={t} theme="dark" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-32 md:py-48 text-center relative overflow-hidden">
        {/* Subtle Architectural Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/4 w-px h-full bg-white/20" />
          <div className="absolute top-0 left-2/4 w-px h-full bg-white/20" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-white/20" />
          <div className="absolute top-1/3 left-0 w-full h-px bg-white/20" />
          <div className="absolute top-2/3 left-0 w-full h-px bg-white/20" />
        </div>

        {/* Big Architectural 404 Watermark */}
        <div className="relative mb-8">
          <span className="text-8xl sm:text-9xl md:text-[14rem] font-bold tracking-tighter text-white/5 select-none leading-none">
            404
          </span>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-brand-warm mb-2">
              {isRtl ? 'خطأ في التوجيه' : 'ROUTING ERROR'}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
              {isRtl ? 'الصفحة غير موجودة' : 'Form Not Found'}
            </h1>
          </div>
        </div>

        <p className="text-white/60 text-base md:text-lg max-w-lg mb-12 leading-relaxed">
          {isRtl 
            ? 'العنصر أو الصفحة المعمارية التي تبحث عنها تم نقلها، تغيير مسارها، أو أنها لم تعد متوفرة.'
            : 'The architectural element or page you are looking for has been relocated, restructured, or no longer exists.'}
        </p>

        {/* Helpful Recovery Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-md w-full">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#050505] font-semibold text-xs tracking-widest uppercase hover:bg-brand-warm hover:text-white transition-all duration-300"
          >
            <Home size={16} />
            {isRtl ? 'الرئيسية' : 'Homepage'}
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 text-white font-semibold text-xs tracking-widest uppercase hover:bg-white/20 transition-all duration-300 border border-white/10"
          >
            <Compass size={16} />
            {isRtl ? 'المشاريع' : 'Projects'}
          </Link>
          <a
            href="/#contact"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 text-white font-semibold text-xs tracking-widest uppercase hover:bg-white/20 transition-all duration-300 border border-white/10"
          >
            <PhoneCall size={16} />
            {isRtl ? 'اتصل بنا' : 'Contact'}
          </a>
        </div>
      </main>

      <Footer t={t} lang={lang} />
    </div>
  );
}

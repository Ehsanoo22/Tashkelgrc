import React from 'react';
import SocialButtons from './SocialButtons';

export default function Footer({ t, lang }) {
  const isRtl = lang === 'ar';
  
  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 mb-20">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-5">
            <img 
              src="/assets/logo_new.png" 
              alt="Tashkel Logo" 
              className="h-16 w-auto mb-8 filter brightness-0 invert"
            />
            <p className="text-white/50 leading-relaxed max-w-sm mb-8 text-sm font-light">
              {isRtl 
                ? 'تشكّل هي شركة رائدة في صناعة وتصميم قوالب وعناصر GFRC المعمارية. نحن ندمج الحرفية اليدوية مع تكنولوجيا CNC لبناء واجهات تدوم.'
                : 'Tashkel is a premier architectural fabrication firm specializing in custom GFRC panels and molding. We merge craftsmanship with CNC precision.'}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-8">
              {isRtl ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-4">
              <li><a href="#work" className="text-white/50 hover:text-white transition-colors text-sm">{t.nav.work}</a></li>
              <li><a href="#gfrc" className="text-white/50 hover:text-white transition-colors text-sm">{t.nav.gfrc}</a></li>
              <li><a href="#about" className="text-white/50 hover:text-white transition-colors text-sm">{t.nav.about}</a></li>
              <li><a href="#contact" className="text-white/50 hover:text-white transition-colors text-sm">{t.nav.contact}</a></li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="md:col-span-4">
            <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-8">
              {isRtl ? 'تواصل معنا' : 'Get in Touch'}
            </h4>
            <ul className="space-y-6">
              <li className="flex flex-col">
                <span className="text-white/30 text-xs uppercase tracking-wider mb-1">{isRtl ? 'العنوان' : 'Location'}</span>
                <span className="text-white/70 text-sm">{t.contact.location}</span>
              </li>
              <li className="flex flex-col">
                <span className="text-white/30 text-xs uppercase tracking-wider mb-1">{isRtl ? 'الهاتف' : 'Phone'}</span>
                <span className="text-white/70 text-sm" dir="ltr">{t.contact.phone}</span>
              </li>
              <li className="flex flex-col">
                <span className="text-white/30 text-xs uppercase tracking-wider mb-1">{isRtl ? 'البريد' : 'Email'}</span>
                <span className="text-white/70 text-sm">{t.contact.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <SocialButtons />
          <p className="text-white/30 text-xs tracking-wider">
            &copy; {new Date().getFullYear()} TASHKEL. {isRtl ? 'جميع الحقوق محفوظة.' : 'ALL RIGHTS RESERVED.'}
          </p>
        </div>
        
      </div>
    </footer>
  );
}

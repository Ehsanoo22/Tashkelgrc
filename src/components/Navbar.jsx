import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar({ lang, setLang, t, theme = 'dark' }) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest < 50) {
      setIsScrolled(false);
      setIsVisible(true);
    } else {
      setIsScrolled(true);
      if (latest > lastY && latest > 100) setIsVisible(false);
      else setIsVisible(true);
    }
    setLastY(latest);
  });

  const isRtl = lang === 'ar';
  
  const links = [
    { label: isRtl ? 'دراسات الحالة' : 'Case Studies', href: '/projects' },
    { label: t.nav.work, href: '/#work' },
    { label: t.nav.about, href: '/#about' },
    { label: t.nav.gfrc, href: '/#gfrc' }
  ];

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 md:mt-8 px-4 pointer-events-none"
      >
        <motion.nav
          layout
          className={`relative pointer-events-auto flex items-center justify-between px-6 md:px-8 py-3 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isScrolled ? 'nav-pill w-full max-w-[95%] lg:w-[950px]' : 'bg-transparent w-full md:w-[95%]'}`}
        >


          {/* Logo */}
          <a href="/" className="flex-shrink-0 hover-target z-10" style={{ textDecoration: 'none' }}>
            <img
              src="/assets/logo_new.png"
              alt="Tashkel"
              className="h-7 md:h-10 w-auto object-contain transition-transform duration-500 hover:scale-105"
              style={{ filter: (isScrolled || theme === 'light') ? 'none' : 'brightness(0) invert(1)' }}
            />
          </a>

          {/* Desktop Links - Absolutely centered for perfect alignment with Hero text */}
          <div className="hidden md:flex items-center justify-center gap-5 lg:gap-8 z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {links.map(link => (
              <motion.a
                key={link.href}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-xs font-semibold tracking-widest uppercase hover-target transition-colors duration-300
                  ${(isScrolled || theme === 'light') ? 'text-brand-dark hover:text-brand-warm' : 'text-white/80 hover:text-white'}`}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 z-10">
            <motion.button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300
                ${(isScrolled || theme === 'light') ? 'text-brand-dark hover:text-brand-warm' : 'text-white/80 hover:text-white'}`}
            >
              {t.nav.toggleLang}
            </motion.button>
            <motion.a 
              href="/#contact" 
              className={`group flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300
                ${(isScrolled || theme === 'light') ? 'text-brand-dark hover:text-brand-warm' : 'text-white hover:text-brand-warm'}`}
            >
              {t.nav.cta}
              <ArrowRight size={14} className={`transition-transform duration-300 group-hover:${isRtl ? '-translate-x-1' : 'translate-x-1'}`} />
            </motion.a>
          </div>

          {/* Mobile Hamburger & Lang */}
          <div className="flex md:hidden items-center gap-4 z-10">
            <motion.button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-xs font-bold tracking-widest uppercase transition-colors duration-300
                ${(isScrolled || theme === 'light') ? 'text-brand-dark' : 'text-white'}`}
            >
              {lang === 'en' ? 'ع' : 'EN'}
            </motion.button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={`p-2 -mr-2 transition-colors ${(isScrolled || theme === 'light') ? 'text-brand-dark' : 'text-white'}`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </motion.nav>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-10%' }}
            animate={{ opacity: 1, y: '0%' }}
            exit={{ opacity: 0, y: '-10%' }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[9999] bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center px-6"
            style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-10 right-10 p-4 text-white/50 hover:text-white transition-colors hover-target"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col items-center gap-10 text-center w-full max-w-sm">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-4xl font-bold tracking-tight text-white hover:text-brand-warm transition-colors w-full pb-6 border-b border-white/10"
                >
                  {link.label}
                </motion.a>
              ))}
              
              <motion.a
                href="/#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 flex items-center justify-center gap-4 w-full text-white hover:text-brand-warm transition-colors pb-6"
              >
                <span className="text-3xl font-bold tracking-tight">{t.nav.cta}</span>
                <ArrowRight size={28} className={isRtl ? 'rotate-180' : ''} />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

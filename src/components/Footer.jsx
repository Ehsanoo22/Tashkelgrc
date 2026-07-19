import React from 'react';

export default function Footer({ t, lang }) {
  const isRtl = lang === 'ar';
  
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Top Section: Logo & Links */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
          {/* Logo */}
          <div className="lg:w-1/3">
            <img 
              src="/assets/logo_new.png" 
              alt="Tashkel Logo" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>

          {/* Links Grid */}
          <div className="lg:w-2/3 flex flex-wrap gap-x-24 gap-y-12">
            <div className="flex flex-col gap-4">
              <a href="#work" className="text-stone-600 hover:text-brand-warm transition-colors font-medium text-lg">{t.nav.work}</a>
              <a href="#gfrc" className="text-stone-600 hover:text-brand-warm transition-colors font-medium text-lg">{t.nav.gfrc}</a>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#process" className="text-stone-600 hover:text-brand-warm transition-colors font-medium text-lg">{t.footer.links.process}</a>
              <a href="#about" className="text-stone-600 hover:text-brand-warm transition-colors font-medium text-lg">{t.nav.about}</a>
              <a href="#contact" className="text-stone-600 hover:text-brand-warm transition-colors font-medium text-lg">{t.nav.contact}</a>
            </div>
          </div>
        </div>

        {/* Middle Section: Feature Quote Box */}
        <div className="relative border border-brand-warm/40 rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-16 flex flex-col md:flex-row items-center bg-white shadow-xl shadow-brand-warm/5">
          {/* Quote Text */}
          <div className="p-10 md:p-16 md:w-[60%] z-20">
            <p className="text-brand-warm text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed">
              "{t.footer.quote}"
            </p>
          </div>
          
          {/* Decorative Image */}
          <div className="relative w-full md:w-[40%] h-64 md:h-full min-h-[350px] z-10 flex">
             {/* Fade Mask (left to right for LTR, right to left for RTL) */}
             <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white via-white/80 to-transparent z-10 rtl:md:bg-gradient-to-l" />
             <img 
               src="/assets/wave_arch_facade.jpg" 
               alt="Tashkel Feature" 
               className="absolute inset-0 w-full h-full object-cover object-right rtl:object-left"
             />
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 border-t border-stone-100">
          <p className="text-stone-500 text-sm font-medium">
            {t.footer.copyright}
          </p>
          
          <div className="flex items-center gap-8">
            <div className="flex gap-6 items-center">
              {/* Minimal Social Links */}
              <a href="#" className="text-stone-400 hover:text-brand-warm transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="#" className="text-stone-400 hover:text-brand-warm transition-colors" aria-label="X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-stone-400 hover:text-brand-warm transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://wa.me/00963933295100" className="text-stone-400 hover:text-brand-warm transition-colors" aria-label="WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.399 0 .018 5.38.018 12.012c0 2.124.553 4.195 1.605 6.015L.05 24l6.113-1.603a11.972 11.972 0 005.868 1.528c6.63 0 12.012-5.382 12.012-12.013S18.663 0 12.031 0zM12.03 21.943c-1.796 0-3.555-.483-5.093-1.395l-.365-.217-3.784.992 1.01-3.69-.237-.378a9.99 9.99 0 01-1.526-5.342c0-5.525 4.497-10.022 10.023-10.022 5.525 0 10.02 4.497 10.02 10.022 0 5.525-4.495 10.02-10.02 10.02h-.028zm5.485-7.48c-.301-.151-1.782-.879-2.06-.98-.277-.1-.479-.151-.68.151-.201.301-.779.98-.956 1.18-.176.202-.353.226-.654.076-1.282-.647-2.42-1.464-3.23-2.673-.207-.31.066-.453.351-.834.1-.132.202-.302.302-.452.1-.151.134-.265.202-.416.07-.151.033-.284-.017-.435-.05-.15-1.025-2.47-1.405-3.382-.37-.887-.745-.766-1.02-.78-.262-.014-.564-.017-.866-.017-.301 0-.791.114-1.205.567-.413.453-1.583 1.547-1.583 3.774 0 2.226 1.62 4.378 1.846 4.679.226.3 3.191 4.871 7.731 6.828.72.309 1.488.543 2.277.697.808.156 1.542.132 2.122.08 1.056-.094 2.453-.98 2.753-1.942.3-.962.3-1.786.202-1.96-.099-.176-.354-.276-.655-.427z"/></svg>
              </a>
            </div>
            
            {/* Scroll to Top */}
            <button 
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
              className="w-12 h-12 rounded-full border border-brand-warm/50 flex items-center justify-center text-brand-warm hover:bg-brand-warm hover:text-white transition-colors hover-target shrink-0 shadow-sm"
              aria-label="Back to top"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
          </div>
        </div>
        
      </div>
    </footer>
  );
}

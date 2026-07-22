import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Waves } from './Waves';
import posthog from 'posthog-js';

// Replace with a high-res architectural 3D render loop or video
const VIDEO_URL = "https://cdn.pixabay.com/video/2020/07/31/46121-446700854_large.mp4";

export default function Hero({ t, lang }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  
  // Parallax out effect
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const isRtl = lang === 'ar';

  return (
    <section ref={heroRef} className="relative h-[100dvh] w-full bg-black overflow-hidden flex items-center justify-center">
      
      {/* Waves Interactive Background */}
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full pointer-events-auto">
        <Waves 
            strokeColor="rgba(255, 255, 255, 0.15)"
            backgroundColor="#000000"
            pointerSize={0} 
        />
        {/* Subtle Vignette overlay to keep text readable */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80 pointer-events-none" />
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity, y }}
        className="relative z-10 text-center px-6 flex flex-col items-center w-full max-w-5xl mt-24 md:mt-32"
      >
        {/* Text Masking Animation */}
        <div className="flex flex-col items-center mb-6 w-full">
          {t.hero.title.split('\n').map((line, i) => (
            <div key={i} className="overflow-hidden pb-2">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.2, delay: 3.0 + (i * 0.15), ease: [0.32, 0.72, 0, 1] }}
                className="text-white text-5xl sm:text-7xl md:text-[6rem] font-bold tracking-tighter leading-none"
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3.2 }}
          className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase mb-8"
        >
          {t.hero.label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5, ease: [0.32, 0.72, 0, 1] }}
          className="text-white/90 text-lg md:text-xl font-medium max-w-3xl leading-relaxed mb-2 tracking-wide"
        >
          {t.hero.seoSubheading}
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.8, ease: [0.32, 0.72, 0, 1] }}
          className="text-white/60 text-base md:text-lg font-light max-w-2xl leading-relaxed mb-12"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 4.2, ease: [0.32, 0.72, 0, 1] }}
          className="flex gap-6 items-center"
        >
          <a href="#work" className="btn-cinematic hover-target" onClick={() => posthog.capture('hero_cta_clicked', { language: lang })}>
            {t.hero.ctaPrimary}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

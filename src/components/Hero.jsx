import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero({ t, lang }) {
  const heroRef = useRef(null);
  const isRtl = lang === 'ar';

  // 1. Scroll Effects
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // 2. Mouse Parallax Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse values
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Map mouse values to slight translations (-10px to 10px)
  const imageX = useTransform(smoothX, [-0.5, 0.5], ['-1%', '1%']);
  const imageY = useTransform(smoothY, [-0.5, 0.5], ['-1%', '1%']);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize coordinates between -0.5 and 0.5
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  // State to trigger the slow zoom once mounted
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section 
      ref={heroRef} 
      onMouseMove={handleMouseMove}
      className={`relative h-[100dvh] w-full bg-[#050505] overflow-hidden flex flex-col justify-end ${isRtl ? 'font-arabic' : 'font-sans'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 
        Background Visual:
        - Absolute position, full screen.
        - Mouse parallax (imageX, imageY)
        - Slow cinematic scale down (scale 1.1 -> 1.0)
        - Scroll parallax (y)
      */}
      <motion.div 
        style={{ y, x: imageX }}
        className="absolute inset-0 w-[105%] h-[105%] -left-[2.5%] -top-[2.5%] pointer-events-none"
      >
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: isLoaded ? 1.0 : 1.15 }}
          transition={{ duration: 15, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img 
            src="/assets/wave_arch_facade.jpg" 
            alt="Tashkel Architectural Facade" 
            className="w-full h-full object-cover opacity-90"
          />
        </motion.div>
        
        {/* Architectural Vignette/Gradient Overlays for text readability & depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-80" />
        <div className={`absolute inset-0 bg-gradient-to-${isRtl ? 'l' : 'r'} from-[#050505]/90 via-[#050505]/30 to-transparent opacity-70`} />
      </motion.div>

      {/* Content Composition */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-32 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
      >
        {/* Left/Main Column */}
        <div className="lg:col-span-8 flex flex-col">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 mb-4 md:mb-10"
          >
            <div className="w-8 h-px bg-white/40" />
            <p className="text-white/70 text-[10px] md:text-sm font-medium tracking-[0.2em] uppercase">
              {t.hero.label}
            </p>
          </motion.div>

          <div className="flex flex-col mb-6 md:mb-8">
            {t.hero.title.split('\n').map((line, i) => (
              <div key={i} className="overflow-hidden py-1">
                <motion.h1
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.1, delay: 2.4 + (i * 0.15), ease: [0.16, 1, 0.3, 1] }}
                  className="text-white text-4xl min-[400px]:text-5xl sm:text-7xl md:text-[6rem] lg:text-[7.5rem] font-bold tracking-tighter leading-[1.05] sm:leading-[0.95]"
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <p className="text-white/90 text-lg md:text-xl font-medium tracking-wide mb-3">
              {t.hero.seoSubheading}
            </p>
            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-10">
              {t.hero.subtitle}
            </p>
            
            <a 
              href="#contact" 
              className="inline-flex items-center gap-3 text-white text-sm font-semibold tracking-widest uppercase hover:text-brand-warm transition-colors duration-300 group"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={18} className={`transition-transform duration-300 group-hover:${isRtl ? '-translate-x-2' : 'translate-x-2'}`} />
            </a>
          </motion.div>
        </div>

        {/* Right Column / Project Index (Hidden on mobile) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.9 }}
          className="hidden lg:flex lg:col-span-4 justify-end pb-2"
        >
          <div className="flex flex-col items-end text-right">
            <span className="text-white/40 text-sm font-medium tracking-widest mb-2">INDEX</span>
            <span className="text-white text-3xl font-light tracking-tight">01 <span className="text-white/20">/ 04</span></span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Architectural Border & Scroll Cue */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 3.0 }}
        className="absolute bottom-0 left-0 w-full px-6 md:px-12 flex justify-between items-end pb-6 z-20 pointer-events-none"
      >
        <div className="w-full border-b border-white/10 absolute bottom-0 left-0" />
        
        <div className="flex flex-col items-start gap-4">
          <div className="h-16 w-px bg-white/20 relative overflow-hidden">
            <motion.div
              animate={{ y: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 w-full h-full bg-white/80"
            />
          </div>
          <p className="text-white/40 text-[10px] font-semibold tracking-[0.3em] uppercase pb-2">
            {t.hero.scrollHint}
          </p>
        </div>
        
        <div className="hidden md:block pb-2">
          <p className="text-white/40 text-[10px] font-semibold tracking-[0.3em] uppercase">
            TASHKEL GFRC © {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>

    </section>
  );
}

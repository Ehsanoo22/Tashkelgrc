import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader({ isVisible, isInitial = true }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    if (isInitial) {
      const startTime = performance.now();
      const duration = 2200; // Duration to reach 100%
      const update = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(Math.round((elapsed / duration) * 100), 100);
        setProgress(p);
        if (elapsed < duration) {
          requestAnimationFrame(update);
        }
      };
      const reqId = requestAnimationFrame(update);
      return () => cancelAnimationFrame(reqId);
    } else {
      // Faster progress for page navigation
      setProgress(100);
    }
  }, [isVisible, isInitial]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={isInitial ? 'initial-loader' : 'route-loader'}
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[99999] bg-[#070707] text-[#f5f4f0] flex flex-col justify-between p-6 md:p-12 overflow-hidden pointer-events-auto select-none"
        >
          {/* Subtle Architectural Drafting Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
          </div>

          {/* Very Subtle Tactile GFRC Material Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-white/[0.03] via-transparent to-black/80" />

          {/* TOP BAR: Technical Architectural Metadata */}
          <div className="relative z-10 flex items-center justify-between text-[10px] md:text-xs font-mono tracking-[0.25em] text-white/40 uppercase">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-warm/80 animate-pulse" />
              <span>TASHKEL GFRC // DAMASCUS</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden sm:flex items-center gap-6 text-white/30"
            >
              <span>SYS.REF: 33.5138° N, 36.2765° E</span>
              <span>DATUM: +0.00</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-mono text-white/50"
            >
              {isInitial ? `01 — ${String(progress).padStart(3, '0')}%` : 'PAGE TRANSITION'}
            </motion.div>
          </div>

          {/* CENTER: Architectural Drafting & Logo Reveal */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            
            {/* The Drafting Coordinate Canvas */}
            <div className="relative w-[280px] h-[220px] sm:w-[360px] sm:h-[260px] flex items-center justify-center">
              
              {/* Drafting Axes & Technical Construction Guides */}
              {isInitial && (
                <svg
                  viewBox="0 0 240 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  {/* Axis Crosshairs */}
                  <motion.line
                    x1="20" y1="90" x2="220" y2="90"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.75"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                  <motion.line
                    x1="120" y1="15" x2="120" y2="165"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.75"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />

                  {/* Corner Dimension Crosshairs */}
                  <g stroke="rgba(255,255,255,0.2)" strokeWidth="0.75">
                    <path d="M 25,20 L 35,20 M 30,15 L 30,25" />
                    <path d="M 205,20 L 215,20 M 210,15 L 210,25" />
                    <path d="M 25,160 L 35,160 M 30,155 L 30,165" />
                    <path d="M 205,160 L 215,160 M 210,155 L 210,165" />
                  </g>

                  {/* Architectural Elevation Level Lines */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0.15] }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                  >
                    <line x1="70" y1="34" x2="170" y2="34" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="60" y1="58" x2="180" y2="58" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="40" y1="125" x2="200" y2="125" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
                  </g>

                  {/* Tower 1 (Left Monolith Construction Lines) */}
                  <motion.path
                    d="M 92,125 L 92,58 L 105,50 L 105,125 Z"
                    stroke="rgba(212, 175, 55, 0.6)"
                    strokeWidth="0.85"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.9, 0.4] }}
                    transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.line
                    x1="98" y1="54" x2="98" y2="125"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />

                  {/* Tower 2 (Center Monolith - Tallest) */}
                  <motion.path
                    d="M 107,125 L 107,34 L 121,46 L 121,125 Z"
                    stroke="rgba(212, 175, 55, 0.8)"
                    strokeWidth="1"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0.4] }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.line
                    x1="114" y1="40" x2="114" y2="125"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />

                  {/* Tower 3 (Right Monolith - Sculptural Facet) */}
                  <motion.path
                    d="M 123,125 L 123,56 Q 133,52 137,62 L 137,125 Z"
                    stroke="rgba(212, 175, 55, 0.6)"
                    strokeWidth="0.85"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.9, 0.4] }}
                    transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Swept GFRC Parabolic Arch 1 (Cantilever Foundation Shell) */}
                  <motion.path
                    d="M 68,78 C 60,110 82,134 118,136 C 146,136 164,116 168,98 C 160,116 142,126 118,124 C 92,122 75,104 68,78 Z"
                    stroke="rgba(212, 175, 55, 0.85)"
                    strokeWidth="1"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0.4] }}
                    transition={{ duration: 1.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Swept GFRC Ribbon 2 (Underbelly Sweep) */}
                  <motion.path
                    d="M 76,96 C 72,120 90,140 124,142 C 146,142 160,126 164,112"
                    stroke="rgba(212, 175, 55, 0.5)"
                    strokeWidth="0.75"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.8, 0.3] }}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Technical Dimension Callout */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0.2] }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  >
                    <text x="145" y="44" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="monospace" letterSpacing="1">EL +18.40</text>
                    <text x="45" y="140" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="monospace" letterSpacing="1">R=4800mm</text>
                  </motion.g>
                </svg>
              )}

              {/* The Actual Pristine Tashkel Logo Mark */}
              <motion.div
                initial={isInitial ? { opacity: 0, scale: 0.96 } : { opacity: 0, scale: 0.92 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  filter: "blur(0px)"
                }}
                transition={{ 
                  duration: isInitial ? 0.9 : 0.4, 
                  delay: isInitial ? 1.1 : 0.1, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="relative z-20 flex flex-col items-center"
              >
                <img
                  src="/assets/logo_new.png"
                  alt="Tashkel GFRC"
                  className="w-32 md:w-44 h-auto object-contain brightness-0 invert drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                />
              </motion.div>
            </div>

            {/* Architectural Identity & Typography */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: isInitial ? 0.8 : 0.3, 
                delay: isInitial ? 1.4 : 0.15, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="mt-6 flex flex-col items-center text-center space-y-2"
            >
              {/* Brand Typography */}
              <h1 className="text-xs md:text-sm font-semibold tracking-[0.38em] uppercase text-white/95">
                TASHKEL GFRC
              </h1>

              {/* Arabic Identity */}
              <span className="font-arabic text-sm md:text-base tracking-[0.25em] text-white/70">
                تشكيل
              </span>

              {/* Micro Label */}
              <div className="pt-3 flex items-center gap-3">
                <span className="w-6 h-px bg-white/20" />
                <span className="text-[10px] tracking-[0.28em] uppercase text-white/40 font-mono">
                  ARCHITECTURAL GRC / GFRC
                </span>
                <span className="w-6 h-px bg-white/20" />
              </div>
            </motion.div>

          </div>

          {/* BOTTOM BAR: Minimal Architectural Line Progress Indicator */}
          <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center gap-3">
            <div className="w-full flex justify-between items-center text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">
              <span>{isInitial ? "CONSTRUCTING FORM" : "CALIBRATING SPACE"}</span>
              <span>{isInitial ? "ENGINEERED IN DAMASCUS" : "STANDBY"}</span>
            </div>

            {/* Precision Datum Hairline Indicator */}
            <div className="relative w-full h-[1px] bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: isInitial ? `${progress}%` : "100%" }}
                transition={{ 
                  duration: isInitial ? 0.1 : 0.4, 
                  ease: "linear" 
                }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-brand-warm to-white"
              />
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

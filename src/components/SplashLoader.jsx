import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashLoader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600); // Allow exit transition to finish
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf9f6] text-[#1a1512]"
        >
          {/* Subtle architectural background texture */}
          <div className="absolute inset-0 grid-overlay opacity-[0.4] pointer-events-none" />

          <div className="relative flex flex-col items-center select-none">
            {/* SVG Logo Graphic */}
            <svg
              width="140"
              height="140"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-8"
            >
              {/* Outer Left Sweeping Arch */}
              <motion.path
                d="M 25,75 C 25,60 40,48 55,48 C 65,48 72,52 75,58 C 68,52 58,52 50,56 C 42,60 36,68 38,77 C 32,77 27,76 25,75 Z"
                stroke="#5a4637"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, fill: "rgba(90, 70, 55, 0)" }}
                animate={{ 
                  pathLength: 1, 
                  fill: "rgba(90, 70, 55, 0.15)",
                  transition: { pathLength: { duration: 1.8, ease: "easeInOut" }, fill: { delay: 1.4, duration: 0.6 } }
                }}
              />

              {/* Inner Sweeping Arch */}
              <motion.path
                d="M 30,81 C 30,71 40,65 52,65 C 65,65 73,71 78,75 M 30,81 C 35,84 48,87 60,86 C 70,85 78,80 81,77"
                stroke="#5a4637"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  transition: { duration: 1.8, ease: "easeInOut" }
                }}
              />

              {/* Tower 1 (Left Column) */}
              <motion.path
                d="M 46,65 L 46,39 L 51,33 L 51,65 Z"
                stroke="#5a4637"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0, fill: "rgba(90, 70, 55, 0)" }}
                animate={{ 
                  pathLength: 1, 
                  fill: "rgba(90, 70, 55, 0.4)",
                  transition: { pathLength: { duration: 2, delay: 0.3, ease: "easeOut" }, fill: { delay: 1.6, duration: 0.5 } }
                }}
              />

              {/* Tower 2 (Middle Column) */}
              <motion.path
                d="M 51,65 L 51,31 L 56,25 L 56,65 Z"
                stroke="#5a4637"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0, fill: "rgba(90, 70, 55, 0)" }}
                animate={{ 
                  pathLength: 1, 
                  fill: "rgba(90, 70, 55, 0.7)",
                  transition: { pathLength: { duration: 2, delay: 0.5, ease: "easeOut" }, fill: { delay: 1.8, duration: 0.5 } }
                }}
              />

              {/* Tower 3 (Right Column - curved detail) */}
              <motion.path
                d="M 56,65 L 56,37 Q 61,35 63,40 L 63,65 Z"
                stroke="#5a4637"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0, fill: "rgba(90, 70, 55, 0)" }}
                animate={{ 
                  pathLength: 1, 
                  fill: "rgba(90, 70, 55, 0.3)",
                  transition: { pathLength: { duration: 2, delay: 0.7, ease: "easeOut" }, fill: { delay: 2.0, duration: 0.5 } }
                }}
              />
            </svg>

            {/* Brand Name Text Fade-in */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              className="text-2xl font-medium tracking-[0.2em] text-[#5a4637]"
            >
              TASHKEL
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="mt-1 text-xs tracking-[0.4em] font-light uppercase text-[#8c8276]"
            >
              GFRC Artistry
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

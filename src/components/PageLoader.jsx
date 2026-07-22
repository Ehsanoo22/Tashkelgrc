import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[99999] bg-stone-950 flex flex-col items-center justify-center pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src="/assets/logo_new.png"
              alt="Tashkel GFRC"
              className="w-32 md:w-48 h-auto object-contain brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

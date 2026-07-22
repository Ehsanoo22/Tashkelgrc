import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[99999] bg-brand-dark flex items-center justify-center pointer-events-auto"
        >
          <motion.img
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            src="/assets/logo_new.png"
            alt="Tashkel GFRC"
            className="w-32 md:w-48 h-auto object-contain brightness-0 invert"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

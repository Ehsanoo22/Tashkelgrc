import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function ProcessSection({ t, lang }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Glowing line height
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <section id="process" ref={containerRef} className="py-32 bg-white relative">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        
        <div className="text-center mb-24">
          <p className="text-brand-warm text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            {t.process.label}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-dark whitespace-pre-line">
            {t.process.title}
          </h2>
        </div>

        <div className="relative">
          {/* Background line track */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-stone-100 -translate-x-1/2" />
          
          {/* Animated Glowing Line */}
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-brand-dark -translate-x-1/2 shadow-[0_0_15px_rgba(29,29,31,0.5)] z-10"
          />

          <div className="space-y-24 relative z-20">
            {t.process.steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  <div className="hidden md:block flex-1" />

                  {/* Node */}
                  <div className="relative flex items-center justify-center w-12 h-12 bg-white border-2 border-stone-200 rounded-full z-20 hover-target">
                    <span className="text-xs font-bold text-stone-400">{step.id}</span>
                  </div>

                  {/* Content */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ margin: "-100px", once: true }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    className="flex-1 bg-stone-50 p-8 rounded-3xl"
                  >
                    <h3 className="text-xl font-bold text-brand-dark mb-3">{step.title}</h3>
                    <p className="text-stone-500 leading-relaxed text-sm">{step.desc}</p>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

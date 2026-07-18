import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function GFRCSection({ t, lang }) {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  
  // Drive animations off scroll progress
  // Start far apart, and combine into a single piece by the end (0.8 to 1.0)
  const layer1Y = useSpring(useTransform(scrollYProgress, [0, 0.8, 1], [-160, 0, 0]), { stiffness: 100, damping: 30 });
  const layer2Y = useSpring(useTransform(scrollYProgress, [0, 0.8, 1], [-80, 0, 0]), { stiffness: 100, damping: 30 });
  const layer3Y = useSpring(useTransform(scrollYProgress, [0, 0.8, 1], [0, 0, 0]), { stiffness: 100, damping: 30 });

  const text1Op = useTransform(scrollYProgress, [0, 0.25, 0.35, 1], [1, 1, 0, 0]);
  const text2Op = useTransform(scrollYProgress, [0, 0.35, 0.45, 0.65, 0.75, 1], [0, 0, 1, 1, 0, 0]);
  const text3Op = useTransform(scrollYProgress, [0, 0.75, 0.85, 1], [0, 0, 1, 1]);

  const texts = t.gfrc.features;

  return (
    <section ref={targetRef} id="gfrc" className="relative h-[250vh] bg-brand-dark text-white">
      <div className="sticky top-0 h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-20 overflow-hidden">
        
        {/* Abstract 3D GFRC Representation */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center relative">
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            
            {/* Top Layer: Surface Finish */}
            <motion.div 
              style={{ y: layer1Y }}
              className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-400 rounded-2xl shadow-xl border border-white/20 transform -rotate-6 z-30"
            />
            {/* Middle Layer: Fiber Mesh */}
            <motion.div 
              style={{ y: layer2Y, scale: 0.95 }}
              className="absolute inset-0 bg-gradient-to-br from-stone-400 to-stone-600 rounded-2xl shadow-xl transform rotate-3 z-20"
            >
              {/* Fake mesh pattern */}
              <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            </motion.div>
            {/* Bottom Layer: Concrete Base */}
            <motion.div 
              style={{ y: layer3Y, scale: 0.9 }}
              className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900 rounded-2xl shadow-2xl transform -rotate-2 z-10"
            />
          </div>
        </div>

        {/* Dynamic Text Points */}
        <div className="w-full md:w-1/2 flex flex-col justify-center h-1/2 md:h-full">
          <p className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase mb-12">
            {t.gfrc.label}
          </p>

          <div className="relative h-64 w-full">
            {/* Point 1 */}
            <motion.div 
              style={{ opacity: text1Op }}
              className="absolute inset-0"
            >
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{texts[0].title}</h3>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm">{texts[0].desc}</p>
            </motion.div>

            {/* Point 2 */}
            <motion.div 
              style={{ opacity: text2Op }}
              className="absolute inset-0 pointer-events-none"
            >
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{texts[1].title}</h3>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm">{texts[1].desc}</p>
            </motion.div>

            {/* Point 3 */}
            <motion.div 
              style={{ opacity: text3Op }}
              className="absolute inset-0 pointer-events-none"
            >
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{texts[2].title}</h3>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm">{texts[2].desc}</p>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}

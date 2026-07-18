import React from 'react';
import { motion } from 'framer-motion';

export default function About({ t, lang }) {
  const isRtl = lang === 'ar';

  return (
    <section id="about" className="bg-brand-dark text-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className={`grid md:grid-cols-2 gap-16 items-center`}>

          {/* Left: Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden">
              <img
                src="/assets/madana_main.jpg"
                alt="Tashkel GFRC team at work"
                className="w-full h-[400px] md:h-[520px] object-cover"
              />
              {/* Accent corner decoration */}
              <div className={`absolute ${isRtl ? 'bottom-0 left-0 border-r-2 border-t-2' : 'bottom-0 right-0 border-l-2 border-t-2'} border-brand-warm w-16 h-16`} />
            </div>
            
            {/* Floating quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className={`absolute -bottom-6 ${isRtl ? '-left-4 md:-left-8' : '-right-4 md:-right-8'} bg-brand-warm px-6 py-4 max-w-xs`}
            >
              <p className="text-white text-sm font-semibold italic leading-snug">"{t.about.tagline}"</p>
            </motion.div>
          </motion.div>

          {/* Right: Text Column */}
          <div className="md:pt-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-label mb-5 text-stone-400"
            >
              {t.about.label}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white whitespace-pre-line mb-8"
            >
              {t.about.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-stone-400 leading-relaxed mb-6 font-light"
            >
              {t.about.body1}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-stone-400 leading-relaxed mb-10 font-light"
            >
              {t.about.body2}
            </motion.p>

            {/* Services list */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              {[
                lang === 'en' ? 'Shop Drawings' : 'مخططات تنفيذية',
                lang === 'en' ? 'Mold Fabrication' : 'تصنيع القوالب',
                lang === 'en' ? 'GFRC Production' : 'إنتاج GFRC',
                lang === 'en' ? 'Crane Installation' : 'تركيب بالرافعات',
                lang === 'en' ? 'Islamic Ornaments' : 'زخارف إسلامية',
                lang === 'en' ? 'Custom Facades' : 'واجهات مخصصة',
              ].map((service, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-stone-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-warm flex-shrink-0" />
                  {service}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

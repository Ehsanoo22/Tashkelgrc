import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function About({ t, lang }) {
  const isRtl = lang === 'ar';
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.05]);
  const textY = useTransform(scrollYProgress, [0, 1], ["10%", "-5%"]);

  // Staggered text animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const services = [
    lang === 'en' ? 'Shop Drawings' : 'مخططات تنفيذية',
    lang === 'en' ? 'Mold Fabrication' : 'تصنيع القوالب',
    lang === 'en' ? 'GFRC Production' : 'إنتاج GFRC',
    lang === 'en' ? 'Crane Installation' : 'تركيب بالرافعات',
    lang === 'en' ? 'Islamic Ornaments' : 'زخارف إسلامية',
    lang === 'en' ? 'Custom Facades' : 'واجهات مخصصة',
  ];

  return (
    <section 
      id="about" 
      ref={containerRef}
      className="relative bg-[#050505] text-white py-32 md:py-48 overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-warm rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3 opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 lg:gap-24 items-center">

          {/* Left: Premium Parallax Image */}
          <div className="w-full lg:w-5/12 relative">
            <motion.div 
              className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl shadow-black/50"
              style={{ scale: imgScale }}
            >
              <motion.img
                style={{ y: imgY }}
                src="/assets/madana_main.jpg"
                alt="Tashkel GFRC Ethos"
                className="absolute inset-0 w-full h-[120%] object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </motion.div>

            {/* Floating Tagline Card */}
            <motion.div
              initial={{ opacity: 0, x: isRtl ? -30 : 30, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute -bottom-10 ${isRtl ? '-left-6 md:-left-12' : '-right-6 md:-right-12'} bg-brand-warm p-8 md:p-10 shadow-xl max-w-[280px] md:max-w-[320px] backdrop-blur-md rounded-tl-3xl rounded-br-3xl`}
            >
              <p className="text-[#050505] text-lg md:text-xl font-bold leading-tight italic">
                "{t.about.tagline}"
              </p>
            </motion.div>
          </div>

          {/* Right: Scrolling Text Content */}
          <motion.div 
            style={{ y: textY }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-7/12 pt-16 lg:pt-0"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-brand-warm" />
              <p className="text-brand-warm font-bold tracking-widest uppercase text-sm">
                {t.about.label}
              </p>
            </motion.div>

            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-white whitespace-pre-line mb-10 leading-[1.1]"
            >
              {t.about.title}
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-8 text-stone-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              <p>{t.about.body1}</p>
              <p>{t.about.body2}</p>
            </motion.div>

            {/* Services Grid with Hover Effects */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-16 pt-12 border-t border-white/10"
            >
              {services.map((service, i) => (
                <div key={i} className="group flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-brand-warm group-hover:bg-brand-warm/10 transition-all duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-warm group-hover:scale-150 transition-transform duration-300" />
                  </div>
                  <span className="text-sm font-medium text-stone-300 group-hover:text-white transition-colors duration-300">
                    {service}
                  </span>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}

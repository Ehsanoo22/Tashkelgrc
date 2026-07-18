import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, ArrowUpRight, Shield, Layers, Scale } from 'lucide-react';

export default function WorkShowcase({ t, lang }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const getIcon = (index) => {
    switch (index) {
      case 0: return <Layers className="w-5 h-5 text-brand-gold" />;
      case 1: return <Scale className="w-5 h-5 text-brand-gold" />;
      case 2: return <Shield className="w-5 h-5 text-brand-gold" />;
      default: return <Layers className="w-5 h-5 text-brand-gold" />;
    }
  };

  return (
    <section id="work" className="py-24 md:py-32 bg-white relative">
      <div className="absolute inset-0 grid-overlay opacity-[0.3] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] text-brand-bronze block mb-3">
              {lang === 'ar' ? 'معرض المنجزات' : 'ARCHITECTURE GALLERY'}
            </span>
            <h2 className={`text-3xl md:text-5xl font-light text-brand-dark mb-4 ${
              lang === 'ar' ? 'font-arabic font-semibold' : 'font-sans'
            }`}>
              {t.work.title}
            </h2>
            <p className="text-sm md:text-base text-brand-gray font-light leading-relaxed">
              {t.work.subtitle}
            </p>
          </div>
        </div>

        {/* Asymmetric Gallery Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Card 1: Left column, large portrait offset (Project 1) */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSelectedProject(t.work.projects[0])}
            className="md:col-span-7 flex flex-col cursor-pointer group"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-brand-light border border-brand-border/40 shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(90,70,55,0.06)] group-hover:border-brand-bronze/20">
              <img
                src={t.work.projects[0].image}
                alt={t.work.projects[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-8">
                <div className="flex items-center gap-3 text-white">
                  <span className="p-2.5 rounded-full bg-white/20 backdrop-blur-md">
                    <Eye className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-medium tracking-wider uppercase">
                    {t.work.viewProject}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-start">
              <div>
                <span className="text-[10px] tracking-widest font-semibold uppercase text-brand-gold">
                  {t.work.projects[0].category}
                </span>
                <h3 className={`text-xl font-medium text-brand-dark mt-1 ${
                  lang === 'ar' ? 'font-arabic font-semibold' : 'font-sans'
                }`}>
                  {t.work.projects[0].title}
                </h3>
              </div>
              <span className="p-2 rounded-full border border-brand-border group-hover:border-brand-bronze/40 transition-colors duration-300">
                <ArrowUpRight className={`w-4 h-4 text-brand-gray transition-transform group-hover:text-brand-bronze group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                  lang === 'ar' ? 'rotate-[-90deg] group-hover:translate-x-[-0.2rem] group-hover:translate-y-[-0.2rem]' : ''
                }`} />
              </span>
            </div>
          </motion.div>

          {/* Right column offsets */}
          <div className="md:col-span-5 flex flex-col gap-12 md:gap-24 md:pt-16">
            
            {/* Card 2: Right column (Project 2) */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelectedProject(t.work.projects[1])}
              className="flex flex-col cursor-pointer group"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-brand-light border border-brand-border/40 shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(90,70,55,0.06)] group-hover:border-brand-bronze/20">
                <img
                  src={t.work.projects[1].image}
                  alt={t.work.projects[1].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-6">
                  <div className="flex items-center gap-3 text-white">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md">
                      <Eye className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-medium tracking-wider uppercase">
                      {t.work.viewProject}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <span className="text-[10px] tracking-widest font-semibold uppercase text-brand-gold">
                    {t.work.projects[1].category}
                  </span>
                  <h3 className={`text-xl font-medium text-brand-dark mt-1 ${
                    lang === 'ar' ? 'font-arabic font-semibold' : 'font-sans'
                  }`}>
                    {t.work.projects[1].title}
                  </h3>
                </div>
                <span className="p-2 rounded-full border border-brand-border group-hover:border-brand-bronze/40 transition-colors duration-300">
                  <ArrowUpRight className={`w-4 h-4 text-brand-gray transition-transform group-hover:text-brand-bronze group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    lang === 'ar' ? 'rotate-[-90deg]' : ''
                  }`} />
                </span>
              </div>
            </motion.div>

            {/* Card 3: Right column (Project 3) */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelectedProject(t.work.projects[2])}
              className="flex flex-col cursor-pointer group"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-brand-light border border-brand-border/40 shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(90,70,55,0.06)] group-hover:border-brand-bronze/20">
                <img
                  src={t.work.projects[2].image}
                  alt={t.work.projects[2].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-6">
                  <div className="flex items-center gap-3 text-white">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md">
                      <Eye className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-medium tracking-wider uppercase">
                      {t.work.viewProject}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <span className="text-[10px] tracking-widest font-semibold uppercase text-brand-gold">
                    {t.work.projects[2].category}
                  </span>
                  <h3 className={`text-xl font-medium text-brand-dark mt-1 ${
                    lang === 'ar' ? 'font-arabic font-semibold' : 'font-sans'
                  }`}>
                    {t.work.projects[2].title}
                  </h3>
                </div>
                <span className="p-2 rounded-full border border-brand-border group-hover:border-brand-bronze/40 transition-colors duration-300">
                  <ArrowUpRight className={`w-4 h-4 text-brand-gray transition-transform group-hover:text-brand-bronze group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    lang === 'ar' ? 'rotate-[-90deg]' : ''
                  }`} />
                </span>
              </div>
            </motion.div>

          </div>
        </div>

      </div>

      {/* Full-Screen Interactive Lightbox Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-brand-dark/80 backdrop-blur-lg flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-sand w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl relative border border-white/20 max-h-[92vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 hover:bg-white text-brand-dark rounded-full shadow-md transition-colors focus:outline-none"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Left Side: Dynamic Gallery Display */}
                  <div className="lg:col-span-7 p-6 md:p-10 flex flex-col gap-6">
                    {/* Main Image */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-light border border-brand-border">
                      <img
                        src={selectedProject.image}
                        alt={selectedProject.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    {/* Detail Image */}
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-brand-light border border-brand-border shadow-inner">
                      <img
                        src={selectedProject.detailImage}
                        alt="Detailed installation shot"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-brand-dark/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-medium uppercase tracking-wider">
                        {lang === 'ar' ? 'تفاصيل التركيب بالموقع' : 'On-Site Detail'}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Technical Specs & Case Study Narrative */}
                  <div className="lg:col-span-5 p-8 md:p-10 md:pt-14 border-t lg:border-t-0 lg:border-s border-brand-border flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] tracking-widest font-semibold uppercase text-brand-gold">
                        {selectedProject.category}
                      </span>
                      <h3 className={`text-2xl md:text-3xl font-light text-brand-dark mt-2 mb-6 ${
                        lang === 'ar' ? 'font-arabic font-semibold' : 'font-sans'
                      }`}>
                        {selectedProject.title}
                      </h3>
                      
                      {/* Material Highlight Stat */}
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-light border border-brand-border/60 mb-6">
                        {getIcon(selectedProject.id - 1)}
                        <div>
                          <p className="text-[11px] font-semibold uppercase text-brand-gray tracking-wider">
                            {lang === 'ar' ? 'مواصفة الخرسانة المسلحة' : 'GFRC Specifications'}
                          </p>
                          <p className="text-xs text-brand-dark font-medium mt-0.5">
                            {selectedProject.id === 1 && (lang === 'ar' ? 'ألياف زجاجية مقاومة للقلويات، خفيفة الوزن' : 'Alkali-Resistant Fibers, High Tensile Strength')}
                            {selectedProject.id === 2 && (lang === 'ar' ? 'دقة صب عالية، محاذاة ليزرية للموقع' : 'High-precision molds, laser-aligned installation')}
                            {selectedProject.id === 3 && (lang === 'ar' ? 'مقاومة قصوى للعوامل الجوية، سمك ١٥ ملم' : 'Max weather durability, 15mm section thickness')}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-brand-gray font-light leading-relaxed mb-6">
                        {selectedProject.description}
                      </p>

                      {/* Technical Tags */}
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium tracking-wide text-brand-bronze bg-brand-bronze/5 border border-brand-bronze/10 px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA in Modal */}
                    <div className="mt-8 pt-8 border-t border-brand-border flex items-center justify-between">
                      <a
                        href="#contact"
                        onClick={() => setSelectedProject(null)}
                        className="text-xs font-semibold tracking-wider text-white bg-brand-bronze hover:bg-brand-dark px-6 py-3 rounded-full shadow-md transition-colors"
                      >
                        {lang === 'ar' ? 'طلب استشارة مماثلة' : 'Request Similar Spec'}
                      </a>
                      <span className="text-[10px] font-semibold text-brand-gray tracking-widest uppercase">
                        Tashkel GFRC
                      </span>
                    </div>

                  </div>

                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}

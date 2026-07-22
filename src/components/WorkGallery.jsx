import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function WorkGallery({ t, lang }) {
  const targetRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dynamicProjects, setDynamicProjects] = useState([]);
  const isRtl = lang === 'ar';

  useEffect(() => {
    async function fetchImages() {
      // 1. Fetch storage images
      const { data: storageData } = await supabase.storage.from('gallery').list();
      if (!storageData) return;

      // 2. Fetch metadata from DB
      const { data: metaData } = await supabase.from('gallery_metadata').select('*');
      
      // Filter out hidden files and folders (folders have id: null)
      const validImages = storageData.filter(file => !file.name.startsWith('.') && file.id !== null);
      
      const mapped = validImages.map((img, i) => {
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(img.name);
        const meta = metaData?.find(m => m.image_name === img.name);
        
        if (meta) {
          return {
            id: img.name,
            image: publicUrl,
            title: isRtl ? (meta.title_ar || meta.title_en || 'بدون عنوان') : (meta.title_en || meta.title_ar || 'Untitled'),
            category: isRtl ? (meta.category_ar || meta.category_en || 'معرض الصور') : (meta.category_en || meta.category_ar || 'Gallery'),
            location: isRtl ? (meta.location_ar || meta.location_en || '') : (meta.location_en || meta.location_ar || ''),
            description: isRtl ? (meta.subtitle_ar || meta.subtitle_en || '') : (meta.subtitle_en || meta.subtitle_ar || ''),
            tags: isRtl ? (meta.tags_ar || meta.tags_en || []) : (meta.tags_en || meta.tags_ar || [])
          };
        }
        
        // Fallback for completely unconfigured images
        return {
          id: img.name,
          image: publicUrl,
          title: isRtl ? `مشروع مميز ${i+1}` : `Featured Project ${i+1}`,
          category: isRtl ? 'معرض الصور' : 'Gallery',
          location: 'Tashkel GFRC',
          description: isRtl ? 'تصميم وتنفيذ عناصر GFRC مخصصة.' : 'Custom GFRC architectural elements.',
          tags: ['GFRC', 'Custom']
        };
      });
      
      setDynamicProjects(mapped);
    }
    fetchImages();
  }, [isRtl]);
  
  const projectsToDisplay = dynamicProjects.length > 0 ? dynamicProjects : t.work.projects;

  // Move the gallery horizontally based on vertical scroll
  const { scrollYProgress } = useScroll({ target: targetRef });
  const scrollTarget = isRtl ? "85%" : "-85%";
  const x = useTransform(scrollYProgress, [0, 1], ["0%", scrollTarget]);
  const springX = useSpring(x, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <>
      <section ref={targetRef} id="work" className="relative h-[300vh] bg-[#f5f5f7]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          
          {/* Intro Text */}
          <div className="px-10 md:px-24 mb-12 shrink-0">
            <p className="text-brand-warm text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              {t.work.label}
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 max-w-7xl">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-dark">
                {t.work.title}
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-cinematic hover-target text-xs px-8 py-4 self-start md:self-auto shrink-0"
              >
                {t.work.viewAll}
              </button>
            </div>
            <p className="text-stone-500 max-w-sm leading-relaxed">
              {t.work.subtitle}
            </p>
          </div>

          {/* Horizontal Track */}
          <motion.div style={{ x: springX }} className="flex gap-12 pl-10 md:pl-24 pr-[20vw] items-center h-[50vh] md:h-[55vh]">
            {projectsToDisplay.map((project) => (
              <div 
                key={project.id} 
                className="relative w-[80vw] md:w-[60vw] h-full flex-shrink-0 group hover-target overflow-hidden rounded-[2rem] shadow-2xl"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700" />
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <p className="text-white/80 text-xs font-semibold tracking-widest uppercase mb-2">
                    {project.category}
                  </p>
                  <h3 className="text-white text-3xl md:text-5xl font-bold tracking-tight mb-2">
                    {project.title}
                  </h3>
                  <p className="text-white/90 font-medium">
                    {project.location}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
          
        </div>
      </section>

      {/* Full-Screen Gallery Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: '0%' }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[9999] bg-white overflow-y-auto"
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-16 border-b border-stone-200 pb-10">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-dark">
                  {t.work.viewAll}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="hover-target p-4 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors flex items-center justify-center"
                  aria-label="Close Gallery"
                >
                  <X className="w-6 h-6 text-brand-dark" />
                </button>
              </div>

              {/* Grid / Card View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-8">
                {projectsToDisplay.map((project, i) => (
                  <motion.div 
                    key={project.id} 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: [0.32, 0.72, 0, 1] }}
                    className="group flex flex-col"
                  >
                    <div className="relative overflow-hidden rounded-[2rem] aspect-[4/5] mb-8 shadow-lg hover:shadow-2xl transition-shadow duration-500">
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-brand-warm text-xs font-bold tracking-[0.2em] uppercase mb-3">
                        {project.category}
                      </p>
                      <h3 className="text-2xl font-bold text-brand-dark mb-4 tracking-tight">
                        {project.title}
                      </h3>
                      <p className="text-stone-500 text-sm leading-relaxed mb-6 font-light">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-stone-100">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium bg-stone-50 text-stone-600 px-3 py-1.5 rounded-full border border-stone-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

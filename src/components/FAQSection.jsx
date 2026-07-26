import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqs } from '../data/faqs';

export default function FAQSection({ t, lang }) {
  const [openId, setOpenId] = useState(null);
  const isRtl = lang === 'ar';
  
  // Filter only featured FAQs and sort by order
  const featuredFaqs = faqs.filter(faq => faq.is_featured).sort((a, b) => a.order_index - b.order_index).slice(0, 5);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Generate FAQ Schema (JSON-LD)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": featuredFaqs.map(faq => ({
      "@type": "Question",
      "name": isRtl ? faq.question_ar : faq.question_en,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": isRtl ? faq.answer_ar : faq.answer_en
      }
    }))
  };

  return (
    <section id="faq" className="bg-brand-dark text-white py-24 md:py-32 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Schema Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <div className="max-w-4xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-brand-warm text-sm font-bold tracking-[0.2em] uppercase mb-4"
          >
            {isRtl ? "المعرفة و الأسئلة الشائعة" : "Knowledge & FAQs"}
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tighter"
          >
            {isRtl ? "إجابات الخبراء لأسئلتك المعمارية." : "Expert Answers to Your Architectural Questions."}
          </motion.h2>
        </div>

        {/* Accordion */}
        <div className="border-t border-stone-800">
          {featuredFaqs.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div 
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-b border-stone-800"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between py-8 text-left hover:text-brand-warm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-warm focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <h3 className={`text-xl md:text-2xl font-medium pr-8 ${isRtl ? 'pl-8 pr-0' : ''}`}>
                    {isRtl ? faq.question_ar : faq.question_en}
                  </h3>
                  <div className="shrink-0 ml-4">
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`p-2 rounded-full border ${isOpen ? 'border-brand-warm text-brand-warm' : 'border-stone-700 text-stone-400'}`}
                    >
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 text-stone-400 text-lg leading-relaxed max-w-3xl">
                        {isRtl ? faq.answer_ar : faq.answer_en}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link 
            to="/faq" 
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-brand-dark font-medium rounded-full hover:bg-stone-200 transition-colors duration-300"
          >
            {isRtl ? "عرض جميع الأسئلة الشائعة" : "View All FAQs"}
            {isRtl ? (
              <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

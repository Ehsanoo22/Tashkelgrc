import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function ContactForm({ t, lang }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [selectedType, setSelectedType] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type === selectedType ? '' : type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('loading');

    // Simulate high-converting server proposal submission
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSelectedType('');
    }, 2000);
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#faf9f6] relative">
      <div className="absolute inset-0 grid-overlay opacity-[0.3] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Column 1: Contact Meta Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] text-brand-bronze block mb-3">
                {lang === 'ar' ? 'تواصل معنا' : 'GET IN TOUCH'}
              </span>
              <h2 className={`text-3xl md:text-5xl font-light text-brand-dark mb-6 ${
                lang === 'ar' ? 'font-arabic font-semibold' : 'font-sans'
              }`}>
                {t.contact.title}
              </h2>
              <p className="text-sm md:text-base text-brand-gray font-light leading-relaxed mb-10">
                {t.contact.subtitle}
              </p>
            </div>

            {/* Quick Contact Info */}
            <div className="flex flex-col gap-6 border-t border-brand-border/60 pt-8 mt-4">
              <div className="flex items-center gap-4 group">
                <span className="p-3.5 rounded-2xl bg-white border border-brand-border/40 text-brand-bronze group-hover:bg-brand-bronze group-hover:text-white transition-all duration-300">
                  <Phone className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-brand-gray tracking-wider">
                    {lang === 'ar' ? 'الهاتف' : 'Phone'}
                  </p>
                  <a href={`tel:${t.footer.phone}`} className="text-xs md:text-sm font-medium text-brand-dark hover:text-brand-bronze transition-colors">
                    {t.footer.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <span className="p-3.5 rounded-2xl bg-white border border-brand-border/40 text-brand-bronze group-hover:bg-brand-bronze group-hover:text-white transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-brand-gray tracking-wider">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <a href={`mailto:${t.footer.email}`} className="text-xs md:text-sm font-medium text-brand-dark hover:text-brand-bronze transition-colors">
                    {t.footer.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <span className="p-3.5 rounded-2xl bg-white border border-brand-border/40 text-brand-bronze group-hover:bg-brand-bronze group-hover:text-white transition-all duration-300">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-brand-gray tracking-wider">
                    {lang === 'ar' ? 'الموقع' : 'Location'}
                  </p>
                  <p className="text-xs md:text-sm font-medium text-brand-dark">
                    {t.footer.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Conversational Booking Form */}
          <div className="lg:col-span-7 bg-white rounded-[32px] p-8 md:p-12 border border-brand-border/40 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Form Input Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
                    {t.contact.name} <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full text-sm px-5 py-3.5 rounded-2xl border border-brand-border hover:border-brand-gray/40 focus:border-brand-bronze focus:ring-1 focus:ring-brand-bronze outline-none bg-brand-light/30 transition-all duration-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
                    {t.contact.email} <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full text-sm px-5 py-3.5 rounded-2xl border border-brand-border hover:border-brand-gray/40 focus:border-brand-bronze focus:ring-1 focus:ring-brand-bronze outline-none bg-brand-light/30 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
                  {t.contact.phone} <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+966 50 000 0000"
                  className="w-full text-sm px-5 py-3.5 rounded-2xl border border-brand-border hover:border-brand-gray/40 focus:border-brand-bronze focus:ring-1 focus:ring-brand-bronze outline-none bg-brand-light/30 transition-all duration-300"
                />
              </div>

              {/* Project Type Select Chips */}
              <div className="flex flex-col gap-3 mt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
                  {t.contact.typeLabel}
                </span>
                
                <div className="flex flex-wrap gap-2.5">
                  {t.contact.types.map((type) => {
                    const isActive = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeSelect(type)}
                        className={`relative text-[11px] font-medium px-4 py-2.5 rounded-full border transition-all duration-300 focus:outline-none select-none ${
                          isActive 
                            ? 'text-white border-brand-bronze bg-brand-bronze shadow-[0_4px_12px_rgba(90,70,55,0.15)]' 
                            : 'text-brand-gray border-brand-border hover:border-brand-gray/40 hover:text-brand-dark bg-transparent'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project message details */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
                  {lang === 'ar' ? 'تفاصيل المشروع' : 'Project Details'}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t.contact.message}
                  className="w-full text-sm px-5 py-4 rounded-2xl border border-brand-border hover:border-brand-gray/40 focus:border-brand-bronze focus:ring-1 focus:ring-brand-bronze outline-none bg-brand-light/30 resize-none transition-all duration-300"
                />
              </div>

              {/* Action/Submit Button with State Transitions */}
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`relative w-full py-4 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-500 overflow-hidden flex items-center justify-center gap-2 focus:outline-none ${
                  status === 'success'
                    ? 'bg-emerald-600 text-white shadow-[0_6px_20px_rgba(5,150,105,0.2)]'
                    : 'bg-brand-bronze hover:bg-brand-dark text-white shadow-[0_6px_20px_rgba(90,70,55,0.2)]'
                }`}
              >
                <AnimatePresence mode="wait">
                  {status === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.contact.submitting}</span>
                    </motion.div>
                  )}

                  {status === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-100" />
                      <span>{lang === 'ar' ? 'تم الإرسال بنجاح!' : 'Proposal Submitted!'}</span>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'يرجى تعبئة الحقول المطلوبة' : 'Fill required fields'}</span>
                    </motion.div>
                  )}

                  {status === 'idle' && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {t.contact.submit}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Status Success Message */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-center text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/50 p-4 rounded-2xl"
                  >
                    {t.contact.success}
                  </motion.div>
                )}
              </AnimatePresence>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

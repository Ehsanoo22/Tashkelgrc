import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, UploadCloud, X, File, CheckCircle2, Download, Building2, PaintBucket, Hammer, Settings2, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateEstimate } from '../lib/pricingEngine';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDFTemplate from './shared/QuotePDFTemplate';

export default function ProjectEstimator({ t, lang }) {
  const isRtl = lang === 'ar';
  const ArrowNext = isRtl ? ArrowLeft : ArrowRight;
  const ArrowPrev = isRtl ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: '',
    location: '',
    buildingType: 'Commercial',
    estimatedArea: '',
    metricType: 'sqm',
    details: '',
    finish: 'Smooth',
    color: 'Standard Grey',
    structuralSupport: 'Steel Stud',
    installationRequired: 'Yes',
    engineeringRequired: 'Yes',
    files: [], // actual File objects
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    contactMethod: 'Email',
    contactLanguage: 'English'
  });

  const [isEstimating, setIsEstimating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [estimateResult, setEstimateResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const PROJECT_TYPES = [
    'Facade Cladding', 'Mashrabiya & Screens', 'Ornamental Relief', 
    'Cornices', 'Columns', 'Arches', 'Domes', 'Decorative Panels', 'Custom Project'
  ];

  const BUILDING_TYPES = ['Residential', 'Commercial', 'Mosque', 'Villa', 'Hotel', 'Government', 'Other'];
  const FINISHES = ['Smooth', 'Stone', 'Sand', 'Custom'];
  const COLORS = ['Standard Grey', 'White', 'Pigmented', 'Custom'];
  const STRUCTURAL = ['Steel Stud', 'Direct Fix', 'Custom'];

  const loadingMessages = [
    isRtl ? "جاري تحليل المشروع..." : "Analyzing project...",
    isRtl ? "جاري قراءة المخططات..." : "Reading uploaded drawings...",
    isRtl ? "جاري حساب كميات المواد..." : "Calculating material quantities...",
    isRtl ? "جاري تقدير تعقيد التصنيع..." : "Estimating fabrication complexity...",
    isRtl ? "جاري تقدير تكلفة القوالب..." : "Estimating mold cost...",
    isRtl ? "جاري حساب تكاليف التركيب..." : "Estimating installation...",
    isRtl ? "جاري إعداد التقدير النهائي..." : "Preparing professional estimate...",
    isRtl ? "جاري إنشاء ملف PDF..." : "Generating PDF...",
    isRtl ? "اللمسات الأخيرة..." : "Finalizing..."
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  // File Upload Logic (Local State)
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, files: [...prev.files, ...Array.from(e.target.files)] }));
    }
  };
  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // The Magic Estimate Button
  const handleGenerateEstimate = async () => {
    setIsEstimating(true);
    setLoadingPhase(0);
    
    // Simulate AI loading steps visually
    const totalDuration = 8000;
    const intervalTime = totalDuration / loadingMessages.length;
    
    let phase = 0;
    const timer = setInterval(() => {
      phase++;
      if (phase < loadingMessages.length) {
        setLoadingPhase(phase);
      } else {
        clearInterval(timer);
      }
    }, intervalTime);

    try {
      // 1. Upload files to Supabase Storage if any
      let uploadedFileUrls = [];
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { data, error } = await supabase.storage
            .from('lead_files')
            .upload(filePath, file);
            
          if (error) {
            console.error("Upload error:", error);
          } else {
            // Get public URL
            const { data: publicUrlData } = supabase.storage.from('lead_files').getPublicUrl(filePath);
            uploadedFileUrls.push({ name: file.name, url: publicUrlData.publicUrl });
          }
        }
      }

      // 2. Generate Estimate locally using pricingEngine
      const calculation = generateEstimate({
        projectType: formData.projectType,
        estimatedArea: Number(formData.estimatedArea),
        metricType: formData.metricType,
        finish: formData.finish,
        color: formData.color,
        structuralSupport: formData.structuralSupport,
        installationRequired: formData.installationRequired,
        engineeringRequired: formData.engineeringRequired
      });

      // Prepare final Quote Data for PDF
      const quoteDataForPDF = {
        id: `EST-${Date.now().toString().substring(7)}`,
        date: new Date().toLocaleDateString(),
        leadName: formData.name,
        leadEmail: formData.email,
        leadPhone: formData.phone,
        items: calculation.items,
        engineeringFee: calculation.engineeringFee,
        logisticsFee: calculation.logisticsFee,
        installationFee: calculation.installationFee,
        taxPercentage: calculation.taxPercentage,
        currency: calculation.currency
      };

      const grandTotal = calculation.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unitPrice)) + Number(item.moldFee), 0)
        + calculation.engineeringFee + calculation.logisticsFee + calculation.installationFee;

      // 3. Save to Supabase Leads table
      const { error: dbError } = await supabase.from('leads').insert([{
        project_type: formData.projectType,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        country: formData.country,
        estimated_dimensions: `${formData.estimatedArea} ${formData.metricType}. ${formData.details}`,
        status: 'New',
        estimated_value: grandTotal,
        source: 'Website AI Estimator',
        design_preferences: {
          buildingType: formData.buildingType,
          finish: formData.finish,
          color: formData.color,
          structuralSupport: formData.structuralSupport,
          installationRequired: formData.installationRequired,
          engineeringRequired: formData.engineeringRequired,
          contactMethod: formData.contactMethod
        },
        files: uploadedFileUrls,
        pricing_breakdown: calculation
      }]);

      if (dbError) console.error("Database save error:", dbError);

      // Give the animation time to finish before showing results
      setTimeout(() => {
        setEstimateResult({ quoteData: quoteDataForPDF, grandTotal });
        setIsEstimating(false);
        setStep(7); // Results step
      }, totalDuration - (phase * intervalTime));

    } catch (err) {
      console.error("Estimator error:", err);
      alert("Something went wrong calculating the estimate.");
      setIsEstimating(false);
    }
  };

  // Full Screen Loader
  if (isEstimating) {
    return (
      <div className="fixed inset-0 z-[99999] bg-stone-950 text-white flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-12"
        >
          <img src="/assets/logo_new.png" alt="Tashkel GFRC" className="w-40 md:w-56 brightness-0 invert drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]" />
        </motion.div>
        
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl font-light tracking-wide text-brand-warm text-center"
            >
              {loadingMessages[loadingPhase]}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <div className="w-64 md:w-96 h-1 bg-stone-800 rounded-full mt-12 overflow-hidden">
          <motion.div 
            className="h-full bg-brand-warm"
            initial={{ width: "0%" }}
            animate={{ width: `${((loadingPhase + 1) / loadingMessages.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  // --- Step Content Renderers ---
  
  const renderStep1 = () => (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-2">{isRtl ? 'ما هو نوع المشروع؟' : 'What is the project type?'}</h3>
      <p className="text-stone-500 mb-8">{isRtl ? 'اختر الفئة الرئيسية لمشروعك.' : 'Select the primary category for your architectural project.'}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PROJECT_TYPES.map(type => (
          <button
            key={type}
            onClick={() => { updateForm('projectType', type); setTimeout(handleNext, 300); }}
            className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-4
              ${formData.projectType === type 
                ? 'border-brand-dark bg-brand-dark text-white shadow-xl scale-[1.02]' 
                : 'border-stone-200 bg-white text-stone-700 hover:border-brand-warm hover:shadow-lg'}`}
          >
            <Building2 className={`w-6 h-6 ${formData.projectType === type ? 'text-brand-warm' : 'text-stone-400'}`} />
            <span className="font-semibold">{type}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-8">{isRtl ? 'تفاصيل المشروع' : 'Project Information'}</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="text" required value={formData.location} onChange={e => updateForm('location', e.target.value)} />
            <label>{isRtl ? 'موقع المشروع (المدينة، الدولة)' : 'Project Location (City, Country)'}</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-500 mb-2">{isRtl ? 'نوع المبنى' : 'Building Type'}</label>
            <select className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:border-brand-dark" value={formData.buildingType} onChange={e => updateForm('buildingType', e.target.value)}>
              {BUILDING_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="number" required value={formData.estimatedArea} onChange={e => updateForm('estimatedArea', e.target.value)} />
            <label>{isRtl ? 'المساحة/الكمية المقدرة' : 'Estimated Area / Quantity'}</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-500 mb-2">{isRtl ? 'وحدة القياس' : 'Metric'}</label>
            <select className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:border-brand-dark" value={formData.metricType} onChange={e => updateForm('metricType', e.target.value)}>
              <option value="sqm">Square Meters (sqm)</option>
              <option value="lm">Linear Meters (lm)</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>
        </div>

        <div className="input-group pt-4">
          <textarea rows="4" required value={formData.details} onChange={e => updateForm('details', e.target.value)} className="resize-none" />
          <label>{isRtl ? 'وصف المشروع الإضافي' : 'Additional Project Description'}</label>
        </div>
      </div>

      <div className="mt-auto pt-8 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">{isRtl ? 'رجوع' : 'Back'}</button>
        <button onClick={handleNext} disabled={!formData.estimatedArea} className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold hover:bg-brand-warm transition-colors disabled:opacity-50">
          {isRtl ? 'التالي' : 'Next'}
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-8">{isRtl ? 'تفضيلات التصميم والهندسة' : 'Design & Engineering Preferences'}</h3>
      
      <div className="space-y-8">
        {/* Finish & Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-4 uppercase tracking-wider">
              <PaintBucket size={16} /> {isRtl ? 'التشطيب المفضل' : 'Preferred Finish'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FINISHES.map(f => (
                <button key={f} onClick={() => updateForm('finish', f)} className={`p-3 rounded-lg border text-sm font-medium transition-colors ${formData.finish === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-stone-50 text-stone-600 hover:border-brand-warm'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-4 uppercase tracking-wider">
              <PaintBucket size={16} /> {isRtl ? 'اللون المفضل' : 'Preferred Color'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COLORS.map(c => (
                <button key={c} onClick={() => updateForm('color', c)} className={`p-3 rounded-lg border text-sm font-medium transition-colors ${formData.color === c ? 'bg-brand-dark text-white border-brand-dark' : 'bg-stone-50 text-stone-600 hover:border-brand-warm'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Structure & Installation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-100">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-4 uppercase tracking-wider">
              <Hammer size={16} /> {isRtl ? 'الدعم الإنشائي' : 'Structural Support'}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {STRUCTURAL.map(s => (
                <button key={s} onClick={() => updateForm('structuralSupport', s)} className={`p-3 rounded-lg border text-sm font-medium transition-colors ${formData.structuralSupport === s ? 'bg-brand-dark text-white border-brand-dark' : 'bg-stone-50 text-stone-600 hover:border-brand-warm'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-4 uppercase tracking-wider">
              <Settings2 size={16} /> {isRtl ? 'الخدمات الإضافية' : 'Additional Services'}
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-stone-50">
                <span className="text-sm font-medium text-stone-700">{isRtl ? 'التركيب مطلوب؟' : 'Installation Required?'}</span>
                <select className="bg-transparent font-bold text-brand-dark outline-none" value={formData.installationRequired} onChange={e => updateForm('installationRequired', e.target.value)}>
                  <option>Yes</option><option>No</option><option>Undecided</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-stone-50">
                <span className="text-sm font-medium text-stone-700">{isRtl ? 'المخططات التنفيذية مطلوبة؟' : 'Shop Drawings Required?'}</span>
                <select className="bg-transparent font-bold text-brand-dark outline-none" value={formData.engineeringRequired} onChange={e => updateForm('engineeringRequired', e.target.value)}>
                  <option>Yes</option><option>No</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">{isRtl ? 'رجوع' : 'Back'}</button>
        <button onClick={handleNext} className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold hover:bg-brand-warm transition-colors">{isRtl ? 'التالي' : 'Next'}</button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-2">{isRtl ? 'رفع المخططات (اختياري)' : 'Upload Project Files (Optional)'}</h3>
      <p className="text-stone-500 mb-8">{isRtl ? 'ارفع المخططات المعمارية، النماذج ثلاثية الأبعاد، أو الصور المرجعية.' : 'Upload architectural drawings (DWG/PDF), 3D models, or reference sketches.'}</p>
      
      <div 
        className="border-2 border-dashed border-stone-300 rounded-3xl p-10 text-center bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-16 h-16 mx-auto text-stone-400 group-hover:text-brand-warm transition-colors mb-4" />
        <p className="text-brand-dark font-medium text-lg mb-2">{isRtl ? 'انقر لتصفح الملفات' : 'Click to browse files'}</p>
        <p className="text-stone-400 text-sm">PDF, DWG, DXF, JPG, SKP, ZIP (Max 50MB)</p>
        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>

      {formData.files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-brand-dark">{isRtl ? 'الملفات المرفقة' : 'Attached Files'}:</h4>
          {formData.files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="text-brand-warm w-5 h-5" />
                <span className="text-sm font-medium truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                <span className="text-xs text-stone-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button onClick={() => removeFile(i)} className="text-stone-400 hover:text-red-500 transition-colors"><X size={18} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-8 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">{isRtl ? 'رجوع' : 'Back'}</button>
        <button onClick={handleNext} className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold hover:bg-brand-warm transition-colors">
          {formData.files.length > 0 ? (isRtl ? 'التالي' : 'Next') : (isRtl ? 'تخطي للخطوة التالية' : 'Skip & Continue')}
        </button>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-2">{isRtl ? 'معلومات التواصل' : 'Contact Information'}</h3>
      <p className="text-stone-500 mb-8">{isRtl ? 'لمن نرسل هذا التقدير؟' : 'Who should we send this estimate to?'}</p>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="text" required value={formData.name} onChange={e => updateForm('name', e.target.value)} />
            <label>{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
          </div>
          <div className="input-group">
            <input type="text" required value={formData.company} onChange={e => updateForm('company', e.target.value)} />
            <label>{isRtl ? 'الشركة (اختياري)' : 'Company (Optional)'}</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="email" required value={formData.email} onChange={e => updateForm('email', e.target.value)} />
            <label>{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
          </div>
          <div className="input-group">
            <input type="tel" required value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
            <label>{isRtl ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">{isRtl ? 'رجوع' : 'Back'}</button>
        <button 
          onClick={handleGenerateEstimate} 
          disabled={!formData.name || !formData.email}
          className="px-8 py-4 bg-brand-warm text-white rounded-full font-bold text-lg hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-brand-warm/30"
        >
          {isRtl ? 'توليد تقدير فوري' : 'Generate Instant Estimate'} <ArrowNext size={20} />
        </button>
      </div>
    </motion.div>
  );

  const renderStep7 = () => {
    if (!estimateResult) return null;
    
    return (
      <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full items-center text-center py-4">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-4xl font-bold text-brand-dark mb-4">
          {isRtl ? 'تم إنشاء تقدير مشروعك!' : 'Your Project Estimate is Ready!'}
        </h3>
        
        <div className="w-full max-w-lg bg-stone-50 border border-stone-200 rounded-3xl p-8 my-8 text-left shadow-sm">
          <p className="text-stone-500 text-sm font-semibold tracking-widest uppercase mb-2">Estimated Investment Range</p>
          <div className="flex items-end gap-2 mb-6">
            <h4 className="text-5xl font-bold text-brand-warm">
              ${(estimateResult.grandTotal * 0.9).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h4>
            <span className="text-2xl font-bold text-stone-400 mb-1"> - </span>
            <h4 className="text-5xl font-bold text-brand-warm">
              ${(estimateResult.grandTotal * 1.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h4>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-stone-200">
            <h5 className="font-bold text-brand-dark mb-4">Why choose Tashkel GFRC?</h5>
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-warm" /> Up to 80% lighter than traditional precast</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-warm" /> Custom Islamic and architectural detailing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-warm" /> Turnkey engineering & shop drawings</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-warm" /> Precision manufacturing in Damascus</li>
            </ul>
          </div>
          
          <p className="text-xs text-stone-400 mt-6 leading-relaxed">
            * This is an estimated quotation only and may change after a detailed engineering review of your exact shop drawings and structural requirements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
          <PDFDownloadLink
            document={<QuotePDFTemplate quoteData={estimateResult.quoteData} />}
            fileName={`Tashkel_Estimate_${estimateResult.quoteData.id}.pdf`}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-4 bg-brand-dark text-white rounded-full font-bold hover:bg-stone-800 transition-colors"
          >
            {({ loading }) => (
              <>{loading ? 'Preparing PDF...' : <><Download size={18} /> Download PDF</>}</>
            )}
          </PDFDownloadLink>
          
          <a href="https://wa.me/963944000000" target="_blank" rel="noreferrer" className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-brand-dark text-brand-dark rounded-full font-bold hover:bg-stone-50 transition-colors">
            Book Free Consultation
          </a>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-stone-100 relative min-h-screen flex items-center">
      <div className="max-w-5xl mx-auto px-4 md:px-8 w-full relative z-10">
        
        {step < 6 && (
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-brand-dark mb-4">
              {isRtl ? 'احصل على تقدير فوري لمشروعك' : 'Get an Instant Project Estimate'}
            </h2>
            <p className="text-stone-500 text-lg">
              {isRtl ? 'قم بتكوين مشروعك المعماري بدقائق.' : 'Configure your architectural project in minutes.'}
            </p>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-stone-200/50 border border-white min-h-[600px] flex flex-col relative overflow-hidden">
          
          {/* Top Progress Bar */}
          {step < 6 && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100">
              <motion.div 
                className="h-full bg-brand-warm" 
                initial={{ width: "20%" }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          <div className="flex-1 relative mt-4">
            <AnimatePresence mode="wait">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
              {step === 7 && renderStep7()}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </section>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, UploadCloud, X, File, CheckCircle2, Download, Building2, PaintBucket, Hammer, Settings2, FileText, ChevronDown, ChevronUp, AlertCircle, Clock, Calendar, Mail } from 'lucide-react';
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
    // Core
    projectType: '',
    location: '',
    buildingType: 'Commercial',
    estimatedArea: '',
    metricType: 'sqm',
    details: '',
    
    // Preferences
    finish: 'Smooth',
    color: 'Standard Grey',
    structuralSupport: 'Steel Stud',
    installationRequired: 'Yes',
    engineeringRequired: 'Yes',
    
    // New Advanced Parameters
    budgetRange: '',
    completionDate: '',
    isNewBuild: 'Yes',
    drawingsAvailable: 'No',
    panelThickness: '15mm',
    uniqueDesigns: '1',
    mouldsReused: 'Yes',
    waterproofing: 'No',
    fireResistance: 'No',
    acoustic: 'No',
    loadBearing: 'No',
    specialFinishes: '',
    referenceProject: '',
    priority: 'Normal',

    // Files & Contact
    files: [],
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    contactMethod: 'Email',
  });

  const [isEstimating, setIsEstimating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [estimateResult, setEstimateResult] = useState(null);
  const [pricingConfig, setPricingConfig] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchPricingConfig = async () => {
      const { data, error } = await supabase.from('pricing_config').select('*').eq('id', 1).single();
      if (!error && data) setPricingConfig(data);
    };
    fetchPricingConfig();
  }, []);
  
  const fileInputRef = useRef(null);

  const PROJECT_TYPES = [
    'Facade Cladding', 'Mashrabiya & Screens', 'Ornamental Relief', 
    'Cornices', 'Columns', 'Arches', 'Domes', 'Decorative Panels', 'Custom Project'
  ];

  const BUILDING_TYPES = ['Residential', 'Commercial', 'Mosque', 'Villa', 'Hotel', 'Government', 'Other'];
  const FINISHES = ['Smooth', 'Sand', 'Stone', 'Acid Wash', 'Custom'];
  const COLORS = ['Standard Grey', 'White', 'Pigmented', 'Custom'];
  const STRUCTURAL = ['Direct Fix', 'Steel Stud', 'Aluminium Frame', 'Custom Structure'];

  const loadingMessages = [
    isRtl ? "جاري تحليل المشروع..." : "Analyzing project parameters...",
    isRtl ? "جاري قراءة المخططات..." : "Evaluating architectural requirements...",
    isRtl ? "جاري حساب كميات المواد..." : "Calculating material volumes...",
    isRtl ? "جاري تقدير تعقيد التصنيع..." : "Estimating mould complexity & fabrication...",
    isRtl ? "جاري تقدير تكلفة القوالب..." : "Calculating structural engineering fees...",
    isRtl ? "جاري حساب تكاليف التركيب..." : "Estimating logistics & installation...",
    isRtl ? "جاري إعداد التقدير النهائي..." : "Applying final pricing configurations...",
    isRtl ? "جاري إنشاء ملف PDF..." : "Generating digital proposal...",
    isRtl ? "اللمسات الأخيرة..." : "Finalizing estimate..."
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));
  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, files: [...prev.files, ...Array.from(e.target.files)] }));
    }
  };
  const removeFile = (index) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleGenerateEstimate = async () => {
    setIsEstimating(true);
    setLoadingPhase(0);
    
    const totalDuration = 8000;
    const intervalTime = totalDuration / loadingMessages.length;
    let phase = 0;
    const timer = setInterval(() => {
      phase++;
      if (phase < loadingMessages.length) setLoadingPhase(phase);
      else clearInterval(timer);
    }, intervalTime);

    try {
      // 1. Upload files
      let uploadedFileUrls = [];
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('lead_files').upload(fileName, file);
          if (!error) {
            const { data: publicUrlData } = supabase.storage.from('lead_files').getPublicUrl(fileName);
            uploadedFileUrls.push({ name: file.name, url: publicUrlData.publicUrl });
          }
        }
      }

      // 2. Generate Estimate
      const calculation = generateEstimate(formData, pricingConfig);

      const quoteDataForPDF = {
        id: `EST-${Date.now().toString().substring(7).toUpperCase()}`,
        date: new Date().toLocaleDateString(),
        leadName: formData.name,
        leadEmail: formData.email,
        leadPhone: formData.phone,
        leadCompany: formData.company,
        items: calculation.items,
        costBreakdown: calculation.costBreakdown,
        engineeringFee: calculation.costBreakdown.engineeringFee,
        logisticsFee: calculation.costBreakdown.logisticsFee,
        installationFee: calculation.costBreakdown.installationFee,
        taxPercentage: calculation.taxPercentage,
        currency: calculation.currency,
        validityDays: calculation.validityDays
      };

      // 3. Save to Supabase (Leads)
      const { data: leadData, error: dbError } = await supabase.from('leads').insert([{
        project_type: formData.projectType,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        country: formData.country,
        estimated_dimensions: `${formData.estimatedArea} ${formData.metricType}.`,
        status: 'New',
        estimated_value: calculation.costBreakdown.grandTotal,
        source: 'Website Estimator V2',
        design_preferences: {
          location: formData.location,
          buildingType: formData.buildingType,
          details: formData.details,
          finish: formData.finish,
          color: formData.color,
          structuralSupport: formData.structuralSupport,
          installationRequired: formData.installationRequired,
          engineeringRequired: formData.engineeringRequired,
          budgetRange: formData.budgetRange,
          completionDate: formData.completionDate,
          isNewBuild: formData.isNewBuild,
          drawingsAvailable: formData.drawingsAvailable,
          uniqueDesigns: formData.uniqueDesigns,
          waterproofing: formData.waterproofing,
          fireResistance: formData.fireResistance,
          acoustic: formData.acoustic,
          loadBearing: formData.loadBearing,
          priority: formData.priority,
          contactMethod: formData.contactMethod
        },
        files: uploadedFileUrls,
        pricing_breakdown: calculation
      }]).select().single();

      if (dbError) console.error("Database save error:", dbError);
      
      const leadId = leadData ? leadData.id : null;

      // 4. Save to Quotations Table
      await supabase.from('quotations').insert([{
        quote_ref: quoteDataForPDF.id,
        lead_id: leadId,
        raw_config: formData,
        breakdown: calculation.costBreakdown,
        quote_data: quoteDataForPDF,
        status: 'Generated'
      }]);

      // 5. Log Activity
      await supabase.from('activity_logs').insert([{
        type: 'New Quote',
        description: `${formData.name} generated an estimate for ${formData.projectType} (${quoteDataForPDF.id}).`,
        metadata: { lead_id: leadId, value: calculation.costBreakdown.grandTotal }
      }]);

      // Estimate timeframes based on area
      const areaNum = Number(formData.estimatedArea) || 0;
      const mfgDays = Math.max(14, Math.ceil(areaNum / 10)); // assume 10 sqm per day min 14 days
      const instDays = formData.installationRequired === 'Yes' ? Math.max(7, Math.ceil(areaNum / 15)) : 0;

      setTimeout(() => {
        setEstimateResult({ 
          quoteData: quoteDataForPDF, 
          breakdown: calculation.costBreakdown,
          mfgDays,
          instDays
        });
        setIsEstimating(false);
        setStep(7);
      }, totalDuration - (phase * intervalTime));

    } catch (err) {
      console.error("Estimator error:", err);
      alert("Something went wrong calculating the estimate.");
      setIsEstimating(false);
    }
  };

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
            <motion.p key={loadingPhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xl md:text-2xl font-light tracking-wide text-brand-warm text-center">
              {loadingMessages[loadingPhase]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="w-64 md:w-96 h-1 bg-stone-800 rounded-full mt-12 overflow-hidden">
          <motion.div className="h-full bg-brand-warm" initial={{ width: "0%" }} animate={{ width: `${((loadingPhase + 1) / loadingMessages.length) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-2">{isRtl ? 'ما هو نوع المشروع؟' : 'What is the primary project type?'}</h3>
      <p className="text-stone-500 mb-8">{isRtl ? 'اختر الفئة الرئيسية.' : 'Select the main architectural element for this estimate.'}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PROJECT_TYPES.map(type => (
          <button key={type} onClick={() => { updateForm('projectType', type); setTimeout(handleNext, 300); }}
            className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-4
              ${formData.projectType === type ? 'border-brand-dark bg-brand-dark text-white shadow-xl scale-[1.02]' : 'border-stone-200 bg-white text-stone-700 hover:border-brand-warm hover:shadow-lg'}`}>
            <Building2 className={`w-6 h-6 ${formData.projectType === type ? 'text-brand-warm' : 'text-stone-400'}`} />
            <span className="font-semibold">{type}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-8">{isRtl ? 'تفاصيل المشروع' : 'Project Specifications'}</h3>
      <div className="space-y-6 overflow-y-auto pr-2 pb-20 custom-scrollbar max-h-[60vh]">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="number" required value={formData.estimatedArea} onChange={e => updateForm('estimatedArea', e.target.value)} />
            <label>{isRtl ? 'الكمية المقدرة' : 'Estimated Quantity / Area'} *</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-500 mb-2">Metric *</label>
            <select className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:border-brand-dark" value={formData.metricType} onChange={e => updateForm('metricType', e.target.value)}>
              <option value="sqm">Square Meters (sqm)</option><option value="lm">Linear Meters (lm)</option><option value="pieces">Pieces</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="text" required value={formData.location} onChange={e => updateForm('location', e.target.value)} />
            <label>{isRtl ? 'موقع المشروع (المدينة، الدولة)' : 'Project Location (City, Country)'} *</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-500 mb-2">Building Type</label>
            <select className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:border-brand-dark" value={formData.buildingType} onChange={e => updateForm('buildingType', e.target.value)}>
              {BUILDING_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Is this a new build?</label>
            <select className="w-full bg-white border border-stone-200 rounded-lg p-3" value={formData.isNewBuild} onChange={e => updateForm('isNewBuild', e.target.value)}>
              <option>Yes, New Build</option><option>No, Renovation/Restoration</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Project Priority</label>
            <select className="w-full bg-white border border-stone-200 rounded-lg p-3" value={formData.priority} onChange={e => updateForm('priority', e.target.value)}>
              <option>Normal</option><option>Urgent (Fast-track)</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <textarea rows="3" required value={formData.details} onChange={e => updateForm('details', e.target.value)} className="resize-none" />
          <label>{isRtl ? 'وصف إضافي للمشروع' : 'Brief Project Description'}</label>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent flex justify-between">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">Back</button>
        <button onClick={handleNext} disabled={!formData.estimatedArea || !formData.location} className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold hover:bg-brand-warm transition-colors disabled:opacity-50">Next</button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full relative">
      <h3 className="text-3xl font-bold mb-6">{isRtl ? 'التصميم والهندسة' : 'Design & Engineering Options'}</h3>
      <div className="space-y-8 overflow-y-auto pr-2 pb-24 custom-scrollbar max-h-[60vh]">
        
        {/* Core Aesthetics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-brand-dark mb-3 block">Preferred Finish</label>
            <div className="grid grid-cols-2 gap-2">
              {FINISHES.map(f => (
                <button key={f} onClick={() => updateForm('finish', f)} className={`p-2 rounded-lg border text-sm transition-colors ${formData.finish === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-stone-50 text-stone-600 hover:border-brand-warm'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-brand-dark mb-3 block">Preferred Color</label>
            <div className="grid grid-cols-2 gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => updateForm('color', c)} className={`p-2 rounded-lg border text-sm transition-colors ${formData.color === c ? 'bg-brand-dark text-white border-brand-dark' : 'bg-stone-50 text-stone-600 hover:border-brand-warm'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Structural & Manufacturing */}
        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-6">
          <h4 className="font-bold text-brand-dark flex items-center gap-2"><Hammer size={18}/> Structural & Moulds</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-stone-600 mb-2 block">Structural Backing</label>
              <select className="w-full bg-white border border-stone-200 rounded-lg p-3" value={formData.structuralSupport} onChange={e => updateForm('structuralSupport', e.target.value)}>
                {STRUCTURAL.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-stone-600 mb-2 block">Number of Unique Designs (Moulds)</label>
              <input type="number" min="1" className="w-full bg-white border border-stone-200 rounded-lg p-3" value={formData.uniqueDesigns} onChange={e => updateForm('uniqueDesigns', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'engineeringRequired', label: 'Shop Drawings?' },
            { key: 'installationRequired', label: 'Installation?' },
            { key: 'waterproofing', label: 'Waterproofing?' },
            { key: 'fireResistance', label: 'Fire Resistance?' }
          ].map(opt => (
            <div key={opt.key} className="p-4 border border-stone-200 rounded-xl flex items-center justify-between">
              <span className="text-sm font-medium">{opt.label}</span>
              <select className="bg-transparent font-bold text-brand-dark outline-none" value={formData[opt.key]} onChange={e => updateForm(opt.key, e.target.value)}>
                <option>Yes</option><option>No</option>
              </select>
            </div>
          ))}
        </div>

      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent flex justify-between">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">Back</button>
        <button onClick={handleNext} className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold hover:bg-brand-warm transition-colors">Next</button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-2">Upload Files & Drawings</h3>
      <p className="text-stone-500 mb-8">Providing DWG, PDF, or 3D models increases the accuracy of your estimate.</p>
      
      <div className="border-2 border-dashed border-stone-300 rounded-3xl p-10 text-center bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer group mb-6" onClick={() => fileInputRef.current?.click()}>
        <UploadCloud className="w-16 h-16 mx-auto text-stone-400 group-hover:text-brand-warm transition-colors mb-4" />
        <p className="text-brand-dark font-medium text-lg mb-2">Click to browse files</p>
        <p className="text-stone-400 text-sm">PDF, DWG, DXF, JPG, SKP, ZIP (Max 50MB)</p>
        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input type="checkbox" checked={formData.drawingsAvailable === 'Yes'} onChange={e => updateForm('drawingsAvailable', e.target.checked ? 'Yes' : 'No')} className="w-4 h-4 text-brand-dark rounded border-stone-300 focus:ring-brand-dark" />
          I already have ready-to-use Shop Drawings (reduces engineering fees)
        </label>
      </div>

      {formData.files.length > 0 && (
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {formData.files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl">
              <div className="flex items-center gap-3"><FileText className="text-brand-warm w-5 h-5" /><span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span></div>
              <button onClick={() => removeFile(i)} className="text-stone-400 hover:text-red-500"><X size={18} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-8 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">Back</button>
        <button onClick={handleNext} className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold hover:bg-brand-warm transition-colors">
          {formData.files.length > 0 ? 'Next' : 'Skip Upload'}
        </button>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <h3 className="text-3xl font-bold mb-2">Final Details</h3>
      <p className="text-stone-500 mb-8">Where should we send your detailed proposal?</p>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="text" required value={formData.name} onChange={e => updateForm('name', e.target.value)} />
            <label>Full Name *</label>
          </div>
          <div className="input-group">
            <input type="text" required value={formData.company} onChange={e => updateForm('company', e.target.value)} />
            <label>Company Name *</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input type="email" required value={formData.email} onChange={e => updateForm('email', e.target.value)} />
            <label>Email Address *</label>
          </div>
          <div className="input-group">
            <input type="tel" required value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
            <label>Phone Number *</label>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 flex justify-between items-center">
        <button onClick={handlePrev} className="px-6 py-3 font-semibold text-stone-500 hover:text-brand-dark transition-colors">Back</button>
        <button 
          onClick={handleGenerateEstimate} 
          disabled={!formData.name || !formData.email || !formData.company}
          className="px-8 py-4 bg-brand-warm text-white rounded-full font-bold text-lg hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-brand-warm/30"
        >
          Generate Proposal <ArrowNext size={20} />
        </button>
      </div>
    </motion.div>
  );

  const renderStep7 = () => {
    if (!estimateResult) return null;
    const { quoteData, breakdown, mfgDays, instDays } = estimateResult;
    
    return (
      <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full relative">
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
              <CheckCircle2 className="text-green-500 w-8 h-8" />
              Proposal Generated
            </h3>
            <p className="text-stone-500 font-medium tracking-wide mt-1">Ref: {quoteData.id}</p>
          </div>
          <div className="flex gap-3">
            <PDFDownloadLink
              document={<QuotePDFTemplate quoteData={quoteData} />}
              fileName={`Tashkel_Proposal_${quoteData.id}.pdf`}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-dark text-white rounded-lg font-bold hover:bg-stone-800 transition-colors text-sm shadow-md"
            >
              {({ loading }) => (<>{loading ? 'Preparing...' : <><Download size={16} /> Download PDF</>}</>)}
            </PDFDownloadLink>
            <a href="mailto:info@tashkelgfrc.com" className="flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-lg font-bold hover:bg-stone-50 transition-colors text-sm shadow-sm">
              <Mail size={16}/> Contact Sales
            </a>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          
          {/* Left Column: Investment & Animation */}
          <div className="space-y-4">
            {/* Main Investment Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm">
              <p className="text-stone-500 text-xs font-bold tracking-widest uppercase mb-1">Estimated Investment Range</p>
              <div className="flex items-end gap-2 mb-2">
                <h4 className="text-3xl font-bold text-brand-warm">${(breakdown.grandTotal * 0.9).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                <span className="text-xl font-bold text-stone-400 mb-1"> - </span>
                <h4 className="text-3xl font-bold text-brand-warm">${(breakdown.grandTotal * 1.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
              </div>
              <p className="text-[11px] text-stone-400 leading-tight italic">
                * Budgetary estimate only. Final quotation requires detailed engineering review.
              </p>
            </div>

            {/* Timeframes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center gap-3">
                <div className="bg-stone-50 p-2 rounded-lg"><Clock className="text-brand-dark w-5 h-5"/></div>
                <div><p className="text-[10px] text-stone-500 font-bold uppercase">Mfg. Time</p><p className="font-bold text-sm">{mfgDays} Days</p></div>
              </div>
              {instDays > 0 && (
                <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-stone-50 p-2 rounded-lg"><Calendar className="text-brand-dark w-5 h-5"/></div>
                  <div><p className="text-[10px] text-stone-500 font-bold uppercase">Install Time</p><p className="font-bold text-sm">{instDays} Days</p></div>
                </div>
              )}
            </div>

            {/* Eye-catching Confirmation Message */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-brand-dark text-white rounded-2xl p-5 text-center relative overflow-hidden shadow-lg"
            >
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-brand-warm/20 pointer-events-none"
              />
              <div className="relative z-10 flex flex-col items-center">
                <h4 className="text-lg font-bold mb-1">Request Received</h4>
                <p className="text-stone-300 text-xs leading-relaxed max-w-[90%]">
                  Our engineering team will review your project parameters and contact you shortly.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Breakdown */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white h-full flex flex-col">
            <div className="w-full flex items-center p-4 bg-stone-50 font-bold text-brand-dark text-sm border-b border-stone-200">
              Detailed Cost Breakdown
            </div>
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-2 text-xs text-stone-600">
                    <div className="flex justify-between"><p>Base Material Cost ({formData.estimatedArea} {formData.metricType})</p> <p className="font-medium">${breakdown.materialCost.toLocaleString()}</p></div>
                    {breakdown.finishAdjustment > 0 && <div className="flex justify-between text-stone-400"><p>+ Premium Finish ({formData.finish})</p> <p>${breakdown.finishAdjustment.toLocaleString()}</p></div>}
                    {breakdown.colorAdjustment > 0 && <div className="flex justify-between text-stone-400"><p>+ Custom Pigment ({formData.color})</p> <p>${breakdown.colorAdjustment.toLocaleString()}</p></div>}
                    {breakdown.structuralAdjustment > 0 && <div className="flex justify-between text-stone-400"><p>+ Backing System ({formData.structuralSupport})</p> <p>${breakdown.structuralAdjustment.toLocaleString()}</p></div>}
                    <div className="flex justify-between pt-2 border-t border-stone-100"><p>Mould Setup & Fabrication</p> <p className="font-medium">${breakdown.mouldFee.toLocaleString()}</p></div>
                    <div className="flex justify-between"><p>Engineering & 3D Modelling</p> <p className="font-medium">${breakdown.engineeringFee.toLocaleString()}</p></div>
                    <div className="flex justify-between"><p>Logistics & Delivery</p> <p className="font-medium">${breakdown.logisticsFee.toLocaleString()}</p></div>
                    <div className="flex justify-between"><p>Installation Services</p> <p className="font-medium">${breakdown.installationFee.toLocaleString()}</p></div>
                  </div>
          </div>
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
              Get an Instant Project Estimate
            </h2>
            <p className="text-stone-500 text-lg">Configure your architectural project in minutes.</p>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-stone-200/50 border border-white min-h-[650px] flex flex-col relative overflow-hidden">
          {step < 6 && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100">
              <motion.div className="h-full bg-brand-warm" initial={{ width: "20%" }} animate={{ width: `${(step / 5) * 100}%` }} transition={{ duration: 0.5 }} />
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

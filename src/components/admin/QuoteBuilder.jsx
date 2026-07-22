import React, { useState } from 'react';
import { X, Plus, Trash2, Download, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import QuotePDFTemplate from './QuotePDFTemplate';

export default function QuoteBuilder({ lead, onClose }) {
  const [items, setItems] = useState([
    {
      category: 'Flat Panel',
      length: '1.2', width: '2.4', depth: '20',
      metricType: 'm²',
      moldComplexity: 'Standard/Reusable',
      texture: 'Smooth',
      pigment: 'Standard Grey',
      structural: 'Steel Stud Frame',
      inserts: '4',
      moldFee: '500',
      unitPrice: '150',
      qty: '10'
    }
  ]);

  const [engineeringFee, setEngineeringFee] = useState('0');
  const [logisticsFee, setLogisticsFee] = useState('0');
  const [installationFee, setInstallationFee] = useState('0');

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleAddItem = () => {
    setItems([...items, {
      category: 'Flat Panel',
      length: '', width: '', depth: '',
      metricType: 'm²',
      moldComplexity: 'Standard/Reusable',
      texture: 'Smooth',
      pigment: 'Standard Grey',
      structural: 'Steel Stud Frame',
      inserts: '4',
      moldFee: '0',
      unitPrice: '0',
      qty: '1'
    }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const quoteData = {
    id: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    date: new Date().toLocaleDateString(),
    leadName: lead.full_name,
    leadEmail: lead.email,
    leadPhone: lead.phone,
    items,
    engineeringFee,
    logisticsFee,
    installationFee
  };

  const handleSendEmail = async () => {
    if (!lead.email) {
      alert("This lead does not have an email address.");
      return;
    }
    
    setIsSending(true);
    setSendSuccess(false);

    try {
      // 1. Generate PDF as Blob
      const doc = <QuotePDFTemplate quoteData={quoteData} />;
      const asPdf = pdf([]); // instantiate
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();

      // 2. Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; // remove data:application/pdf;base64,

        // 3. Send to API
        const response = await fetch('/api/sendQuote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadEmail: lead.email,
            pdfBase64: base64data,
            quoteData: { leadName: lead.full_name }
          })
        });

        if (response.ok) {
          setSendSuccess(true);
          setTimeout(() => setSendSuccess(false), 3000);
        } else {
          const err = await response.json();
          alert("Failed to send email: " + (err.error || response.statusText));
        }
        setIsSending(false);
      };
    } catch (error) {
      console.error(error);
      alert("Error generating PDF: " + error.message);
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-4xl bg-stone-50 h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Generate Quote</h2>
            <p className="text-sm text-stone-500">For: {lead.full_name} ({lead.email})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {items.map((item, index) => (
            <div key={index} className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm relative">
              <div className="absolute top-4 right-4">
                <button onClick={() => handleRemoveItem(index)} className="text-stone-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-bold text-stone-800 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                <span className="bg-brand-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                Line Item
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Section 1: Element Spec */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">1. Element Spec</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                    <select 
                      value={item.category} 
                      onChange={e => updateItem(index, 'category', e.target.value)}
                      className="w-full text-sm border-stone-300 rounded-lg focus:ring-brand-warm focus:border-brand-warm"
                    >
                      <option>Flat Panel</option>
                      <option>Cornice</option>
                      <option>Arch</option>
                      <option>Column</option>
                      <option>Planter</option>
                      <option>Custom 3D Form</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Dimensions (L x W x D)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="L (m)" value={item.length} onChange={e => updateItem(index, 'length', e.target.value)} className="w-1/3 text-xs border-stone-300 rounded-lg" />
                      <input type="number" placeholder="W (m)" value={item.width} onChange={e => updateItem(index, 'width', e.target.value)} className="w-1/3 text-xs border-stone-300 rounded-lg" />
                      <input type="number" placeholder="D (mm)" value={item.depth} onChange={e => updateItem(index, 'depth', e.target.value)} className="w-1/3 text-xs border-stone-300 rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Metric Type</label>
                    <select value={item.metricType} onChange={e => updateItem(index, 'metricType', e.target.value)} className="w-full text-sm border-stone-300 rounded-lg">
                      <option value="m²">Square Meters (m²)</option>
                      <option value="lm">Linear Meters (lm)</option>
                      <option value="pcs">Units / Pieces (pcs)</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Fabrication & Structure */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">2. Fabrication & Structure</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Mold Complexity</label>
                    <select value={item.moldComplexity} onChange={e => updateItem(index, 'moldComplexity', e.target.value)} className="w-full text-sm border-stone-300 rounded-lg">
                      <option>Standard/Reusable</option>
                      <option>Custom Flat/Simple</option>
                      <option>Complex CNC/Silicone</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-stone-700 mb-1">Texture</label>
                      <input type="text" value={item.texture} onChange={e => updateItem(index, 'texture', e.target.value)} className="w-full text-sm border-stone-300 rounded-lg" />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-stone-700 mb-1">Color/Pigment</label>
                      <input type="text" value={item.pigment} onChange={e => updateItem(index, 'pigment', e.target.value)} className="w-full text-sm border-stone-300 rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Structural Backing</label>
                    <select value={item.structural} onChange={e => updateItem(index, 'structural', e.target.value)} className="w-full text-sm border-stone-300 rounded-lg">
                      <option>Steel Stud Frame</option>
                      <option>L-bracket direct fix</option>
                      <option>Unframed (decorative)</option>
                    </select>
                  </div>
                </div>

                {/* Section 3: Financials */}
                <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">3. Financials</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Mold Setup Fee (Flat)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-400">$</span>
                      <input type="number" value={item.moldFee} onChange={e => updateItem(index, 'moldFee', e.target.value)} className="w-full pl-7 text-sm border-stone-300 rounded-lg" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-stone-700 mb-1">Unit Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-stone-400">$</span>
                        <input type="number" value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', e.target.value)} className="w-full pl-7 text-sm border-stone-300 rounded-lg" />
                      </div>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-stone-700 mb-1">Quantity ({item.metricType})</label>
                      <input type="number" value={item.qty} onChange={e => updateItem(index, 'qty', e.target.value)} className="w-full text-sm border-stone-300 rounded-lg" />
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-stone-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-500">Subtotal:</span>
                    <span className="font-bold text-brand-dark">
                      ${((Number(item.qty) * Number(item.unitPrice)) + Number(item.moldFee)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}

          <button 
            onClick={handleAddItem}
            className="w-full py-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:text-brand-dark hover:border-brand-dark hover:bg-stone-100 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" /> Add Another Line Item
          </button>

          {/* Global Project Additions */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-stone-800 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
              <span className="bg-stone-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">+</span>
              Global Project Additions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Engineering & Shop Drawings</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400">$</span>
                  <input type="number" value={engineeringFee} onChange={e => setEngineeringFee(e.target.value)} className="w-full pl-7 text-sm border-stone-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Logistics & Freight</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400">$</span>
                  <input type="number" value={logisticsFee} onChange={e => setLogisticsFee(e.target.value)} className="w-full pl-7 text-sm border-stone-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Installation (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400">$</span>
                  <input type="number" value={installationFee} onChange={e => setInstallationFee(e.target.value)} className="w-full pl-7 text-sm border-stone-300 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-6 py-4 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-stone-900">
              Total: ${ (
                items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unitPrice)) + Number(item.moldFee), 0) +
                Number(engineeringFee) + Number(logisticsFee) + Number(installationFee)
              ).toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
          <div className="flex gap-3">
            <PDFDownloadLink
              document={<QuotePDFTemplate quoteData={quoteData} />}
              fileName={`Tashkel_Quote_${quoteData.id}.pdf`}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              {({ loading }) => (
                <>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {loading ? 'Generating...' : 'Download PDF'}
                </>
              )}
            </PDFDownloadLink>
            
            <button
              onClick={handleSendEmail}
              disabled={isSending || sendSuccess}
              className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-black font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : sendSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSending ? 'Sending...' : sendSuccess ? 'Sent!' : 'Email to Client'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

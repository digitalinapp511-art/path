import React, { useState } from 'react';
import axios from 'axios';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  User, 
  ShieldCheck,
  Sparkles,
  BrainCircuit,
  Loader2
} from 'lucide-react';

interface Parameter {
  id: string;
  name: string;
  unit: string;
  normalLow: number;
  normalHigh: number;
  criticalLow: number;
  criticalHigh: number;
  value: string;
}

interface TechnicianEntryProps {
  order: any;
  onBack: () => void;
  onSubmitResults: (orderId: string, results: any[], notes?: string) => void;
}

export default function TechnicianEntry({ order, onBack, onSubmitResults }: TechnicianEntryProps) {
  // Clean empty parameters for CBC Test (ready for user entry)
  const [parameters, setParameters] = useState<Parameter[]>([
    { id: '1', name: 'Hemoglobin (Hb)', unit: 'g/dL', normalLow: 13.0, normalHigh: 17.0, criticalLow: 7.0, criticalHigh: 20.0, value: '' },
    { id: '2', name: 'Total Leukocyte Count (TLC / WBC)', unit: '/cumm', normalLow: 4000, normalHigh: 11000, criticalLow: 2000, criticalHigh: 30000, value: '' },
    { id: '3', name: 'Platelet Count', unit: '/cumm', normalLow: 150000, normalHigh: 450000, criticalLow: 25000, criticalHigh: 1000000, value: '' },
    { id: '4', name: 'R.B.C. Count', unit: 'mil/cumm', normalLow: 4.5, normalHigh: 5.5, criticalLow: 2.5, criticalHigh: 7.0, value: '' },
    { id: '5', name: 'Packed Cell Volume (PCV)', unit: '%', normalLow: 40, normalHigh: 50, criticalLow: 20, criticalHigh: 60, value: '' },
  ]);

  const [technicianNotes, setTechnicianNotes] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Auto-flagging logic
  const getFlag = (valStr: string, low: number, high: number, cLow: number, cHigh: number) => {
    const val = parseFloat(valStr);
    if (isNaN(val) || !valStr) return { label: 'PENDING', badge: 'bg-slate-100 text-slate-500 border-slate-200' };
    
    if (val <= cLow) return { label: 'CRITICAL LOW', badge: 'bg-red-500 text-white font-bold animate-pulse' };
    if (val >= cHigh) return { label: 'CRITICAL HIGH', badge: 'bg-red-500 text-white font-bold animate-pulse' };
    if (val < low) return { label: 'LOW', badge: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold' };
    if (val > high) return { label: 'HIGH', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' };
    return { label: 'NORMAL', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const handleValueChange = (id: string, newVal: string) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, value: newVal } : p));
  };

  // AI Diagnostic Analysis (Gemini Clinical Engine)
  const handleGenerateAiSummary = async () => {
    const filledParams = parameters.filter(p => p.value !== '');
    if (filledParams.length === 0) {
      alert('Please enter at least one parameter reading before requesting AI clinical impression!');
      return;
    }

    setAiLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/clinical-summary', {
        parameters: filledParams,
        patientInfo: order.patient,
        testName: order.tests
      });

      if (res.data && res.data.clinicalDraftNote) {
        setAiResult(res.data);
        setTechnicianNotes(res.data.clinicalDraftNote);
      }
    } catch (err) {
      alert('Could not generate AI note. Is backend running?');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitResults(order.id, parameters, technicianNotes);
    alert('Results submitted! Sent to Pathologist Queue for Verification.');
    onBack();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 p-3 rounded-xl text-white shadow-md shadow-purple-500/20">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-lg">Result Entry & Observations</h3>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                {order.barcode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Order: <span className="font-semibold text-slate-700">{order.id}</span> | Patient: <span className="font-semibold text-slate-700">{order.patient}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition border border-slate-200"
        >
          ← Back to Orders
        </button>
      </div>

      {/* Main Parameters Table */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-slate-800">{order.tests || 'Complete Blood Count (CBC)'}</h4>
            <p className="text-xs text-slate-400">Enter measured values from analyzer / microscope</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Auto Reference Range Validator Active</span>
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-5">Test Parameter</th>
              <th className="py-3 px-5 text-center">Measured Result</th>
              <th className="py-3 px-5 text-center">Unit</th>
              <th className="py-3 px-5 text-center">Biological Range</th>
              <th className="py-3 px-5 text-center">Clinical Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parameters.map((param) => {
              const flag = getFlag(param.value, param.normalLow, param.normalHigh, param.criticalLow, param.criticalHigh);
              return (
                <tr key={param.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-5 font-medium text-slate-800">
                    {param.name}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <input 
                      type="number" 
                      step="any"
                      placeholder="0.0"
                      value={param.value}
                      onChange={(e) => handleValueChange(param.id, e.target.value)}
                      className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono text-xs text-slate-500">
                    {param.unit}
                  </td>
                  <td className="py-3.5 px-5 text-center text-xs">
                    <span className="font-semibold text-slate-800">{param.normalLow} - {param.normalHigh}</span>
                    <span className="block text-[10px] text-slate-400">Critical: &lt;{param.criticalLow} or &gt;{param.criticalHigh}</span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs border ${flag.badge}`}>
                      {flag.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* AI CLINICAL INSIGHTS & REMARKS SECTION */}
        <div className="p-5 bg-slate-50/80 border-t border-slate-200 space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Pathologist Microscopic Impression & Clinical Note
              </span>
            </div>
            
            <button 
              type="button"
              onClick={handleGenerateAiSummary}
              disabled={aiLoading}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
            >
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-amber-300" />}
              <span>{aiLoading ? 'Analyzing Parameters...' : '✨ Auto-Draft via Gemini AI'}</span>
            </button>
          </div>

          {/* AI Impression Chips if generated */}
          {aiResult && aiResult.impressions && aiResult.impressions.length > 0 && (
            <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                Detected Clinical Anomalies (AI Assistant):
              </span>
              <ul className="text-xs text-purple-900 space-y-1">
                {aiResult.impressions.map((imp: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <textarea 
              rows={3}
              placeholder="e.g. Red blood cells show normocytic normochromic morphology. Platelets appear adequate on smear. Clinical correlation suggested..."
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed text-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button 
              type="button" 
              onClick={onBack}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-500/20 transition flex items-center space-x-2 cursor-pointer"
            >
              <span>Submit to Pathologist</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}

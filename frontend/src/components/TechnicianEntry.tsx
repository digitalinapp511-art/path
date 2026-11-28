import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { getParametersForOrder, type TestParameterDef } from '../utils/testParameters';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  Sparkles, 
  BrainCircuit, 
  Loader2,
  Wand2,
  RotateCcw
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
  category?: string;
}

interface TechnicianEntryProps {
  order: any;
  onBack: () => void;
  onSubmitResults: (orderId: string, results: any[], notes?: string) => void;
}

export default function TechnicianEntry({ order, onBack, onSubmitResults }: TechnicianEntryProps) {
  // Dynamically load parameters matching the order's prescribed test(s)
  const dynamicDefs: TestParameterDef[] = getParametersForOrder(order);

  // If order already has saved test results from DB, prefill them!
  const initialParams: Parameter[] = (order.testResults && Array.isArray(order.testResults) && order.testResults.length > 0)
    ? dynamicDefs.map(dp => {
        const found = order.testResults.find((r: any) => r.name === dp.name);
        return {
          id: dp.id,
          name: dp.name,
          unit: dp.unit,
          normalLow: dp.normalLow,
          normalHigh: dp.normalHigh,
          criticalLow: dp.criticalLow,
          criticalHigh: dp.criticalHigh,
          value: found ? String(found.value || '') : '',
          category: dp.category
        };
      })
    : dynamicDefs.map(dp => ({
        id: dp.id,
        name: dp.name,
        unit: dp.unit,
        normalLow: dp.normalLow,
        normalHigh: dp.normalHigh,
        criticalLow: dp.criticalLow,
        criticalHigh: dp.criticalHigh,
        value: '',
        category: dp.category
      }));

  const [parameters, setParameters] = useState<Parameter[]>(initialParams);
  const [technicianNotes, setTechnicianNotes] = useState(order.notes || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Auto-flagging logic supporting numeric, text, and qualitative tests
  const getFlag = (valStr: string, low: number, high: number, cLow: number, cHigh: number) => {
    if (!valStr || !valStr.trim()) {
      return { label: 'PENDING', badge: 'bg-slate-100 text-slate-500 border-slate-200' };
    }

    const lower = valStr.toLowerCase().trim();

    // Qualitative flags (Urine, Serology, Dengue)
    if (lower.includes('neg') || lower.includes('nil') || lower.includes('clear') || lower.includes('normal')) {
      return { label: 'NORMAL', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
    if (lower.includes('pos') || lower.includes('reactive') || lower.includes('present') || lower.includes('hazy')) {
      return { label: 'CRITICAL HIGH', badge: 'bg-rose-500 text-white font-bold animate-pulse' };
    }

    // Quantitative numerical flags
    const val = parseFloat(valStr);
    if (isNaN(val)) {
      return { label: 'RECORDED', badge: 'bg-blue-100 text-blue-800 border-blue-300' };
    }

    if (cLow > 0 && val <= cLow) return { label: 'CRITICAL LOW', badge: 'bg-red-500 text-white font-bold animate-pulse' };
    if (cHigh > 0 && val >= cHigh) return { label: 'CRITICAL HIGH', badge: 'bg-red-500 text-white font-bold animate-pulse' };
    if (low > 0 && val < low) return { label: 'LOW', badge: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold' };
    if (high > 0 && val > high) return { label: 'HIGH', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' };
    
    return { label: 'NORMAL', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const handleValueChange = (id: string, newVal: string) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, value: newVal } : p));
  };

  // ⚡ DEMO FAST-FILL: Pre-fill all parameters with standard normal values in 1 click
  const handleAutoFillNormal = () => {
    const filled = parameters.map(p => {
      const def = dynamicDefs.find(d => d.id === p.id);
      return { ...p, value: def ? def.normalDefault : 'Normal' };
    });
    setParameters(filled);
  };

  const handleClearValues = () => {
    setParameters(parameters.map(p => ({ ...p, value: '' })));
  };

  // AI Diagnostic Analysis (Gemini Clinical Engine)
  const handleGenerateAiSummary = async () => {
    const filledParams = parameters.filter(p => p.value !== '');
    if (filledParams.length === 0) {
      alert('Please enter or auto-fill at least one parameter reading before requesting AI clinical impression!');
      return;
    }

    setAiLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/clinical-summary`, {
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
    alert('Results submitted successfully! Sent to Pathologist Queue for Verification.');
    onBack();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 p-3 rounded-xl text-white shadow-md shadow-purple-500/20 shrink-0">
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

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={handleAutoFillNormal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Fast-fill standard normal reference values for demonstration"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>Auto-Fill Normal Values</span>
          </button>
          <button 
            type="button"
            onClick={handleClearValues}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition border border-slate-200"
            title="Clear all entered readings"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={onBack}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition border border-slate-200"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Parameters Table */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="font-bold text-sm text-slate-800">{order.tests || 'Complete Blood Count (CBC)'}</h4>
            <p className="text-xs text-slate-400">Measured values calibrated from analyzer / microscopy</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Auto Reference Range Validator Active</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Test Parameter</th>
                <th className="py-3 px-5 text-center">Measured Result</th>
                <th className="py-3 px-5 text-center">Unit</th>
                <th className="py-3 px-5 text-center">Biological Reference Range</th>
                <th className="py-3 px-5 text-center">Clinical Status</th>
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
                        type="text" 
                        placeholder="0.0 / Negative"
                        value={param.value}
                        onChange={(e) => handleValueChange(param.id, e.target.value)}
                        className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </td>
                    <td className="py-3.5 px-5 text-center font-mono text-xs text-slate-500">
                      {param.unit}
                    </td>
                    <td className="py-3.5 px-5 text-center text-xs">
                      {param.normalLow === 0 && param.normalHigh === 0 ? (
                        <span className="font-semibold text-slate-700">Negative / Nil</span>
                      ) : (
                        <span className="font-semibold text-slate-800">{param.normalLow} - {param.normalHigh}</span>
                      )}
                      {(param.criticalLow > 0 || param.criticalHigh > 0) && (
                        <span className="block text-[10px] text-slate-400">Critical: &lt;{param.criticalLow} or &gt;{param.criticalHigh}</span>
                      )}
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
        </div>

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
              placeholder="e.g. Biological parameters analyzed. Normocytic normochromic smear. No abnormal pathology detected. Clinical correlation advised..."
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

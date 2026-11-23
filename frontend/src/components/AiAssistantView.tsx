import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { 
  Sparkles, 
  BrainCircuit, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Loader2, 
  FileText, 
  Activity,
  HeartPulse,
  Stethoscope,
  RefreshCw
} from 'lucide-react';

interface AiAssistantViewProps {
  orders: any[];
}

export default function AiAssistantView({ orders }: AiAssistantViewProps) {
  // Manual / playground input values
  const [hb, setHb] = useState('7.8');
  const [wbc, setWbc] = useState('16500');
  const [platelets, setPlatelets] = useState('48000');
  const [pcv, setPcv] = useState('28.5');
  const [patientContext, setPatientContext] = useState('28-year-old female presenting with extreme lethargy, fever, and petechial rashes');

  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const runAiAnalysis = async (customParams?: any) => {
    setLoading(true);
    try {
      const paramsToSend = customParams || [
        { name: 'Hemoglobin (Hb)', value: hb },
        { name: 'Total Leukocyte Count (TLC / WBC)', value: wbc },
        { name: 'Platelet Count', value: platelets },
        { name: 'Packed Cell Volume (PCV)', value: pcv }
      ];

      const res = await axios.post(`${API_BASE_URL}/api/ai/clinical-summary`, {
        parameters: paramsToSend,
        patientInfo: patientContext,
        testName: 'Complete Blood Count (CBC)'
      });

      if (res.data) {
        setAiResponse(res.data);
      }
    } catch (err) {
      alert('Backend AI endpoint unreachable. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: 'anemia' | 'infection' | 'normal') => {
    if (preset === 'anemia') {
      setHb('6.8');
      setWbc('7200');
      setPlatelets('210000');
      setPcv('24.0');
      setPatientContext('34-year-old female with persistent fatigue and pallor');
    } else if (preset === 'infection') {
      setHb('13.2');
      setWbc('19500');
      setPlatelets('180000');
      setPcv('41.0');
      setPatientContext('42-year-old male with acute high-grade fever and productive cough');
    } else {
      setHb('14.5');
      setWbc('6800');
      setPlatelets('280000');
      setPcv('44.0');
      setPatientContext('30-year-old male, routine annual health checkup');
    }
    setAiResponse(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-purple-500/30 rounded-xl border border-purple-400/30">
              <Sparkles className="h-5 w-5 text-purple-300 animate-pulse" />
            </span>
            <h3 className="text-xl font-bold tracking-tight">Gemini AI Clinical Pathology Assistant</h3>
          </div>
          <p className="text-xs text-purple-200/80 max-w-xl">
            Automated medical anomaly detection, biological reference range validation, and pathologist microscopic impressions.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-purple-950/60 border border-purple-700/50 px-3.5 py-1.5 rounded-xl text-xs font-mono text-purple-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Engine: Active (Gemini Pathology v1.0)</span>
        </div>
      </div>

      {/* 2. Main Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Parameter Input Console (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2 text-slate-800">
              <HeartPulse className="h-4 w-4 text-purple-600" />
              <h4 className="font-bold text-sm">Diagnostic Parameters Input</h4>
            </div>
            <span className="text-[10px] text-slate-400">NABL CBC Protocol</span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Load Case Presets:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => loadPreset('anemia')}
                className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition cursor-pointer"
              >
                Severe Anemia
              </button>
              <button 
                type="button"
                onClick={() => loadPreset('infection')}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 transition cursor-pointer"
              >
                Acute Infection
              </button>
              <button 
                type="button"
                onClick={() => loadPreset('normal')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition cursor-pointer"
              >
                Normal Profile
              </button>
            </div>
          </div>

          {/* Parameter Inputs */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hemoglobin (Hb) <span className="text-slate-400 font-normal">g/dL</span>
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={hb}
                  onChange={(e) => setHb(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  TLC / WBC <span className="text-slate-400 font-normal">/cumm</span>
                </label>
                <input 
                  type="number" 
                  value={wbc}
                  onChange={(e) => setWbc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Platelets <span className="text-slate-400 font-normal">/cumm</span>
                </label>
                <input 
                  type="number" 
                  value={platelets}
                  onChange={(e) => setPlatelets(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PCV / Hematocrit <span className="text-slate-400 font-normal">%</span>
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={pcv}
                  onChange={(e) => setPcv(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Context / Patient Complaints
              </label>
              <textarea 
                rows={2}
                value={patientContext}
                onChange={(e) => setPatientContext(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 text-slate-800"
                placeholder="e.g. Fever for 4 days, suspected viral/dengue..."
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={() => runAiAnalysis()}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing Parameters...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Run AI Clinical Diagnostic Analysis</span>
              </>
            )}
          </button>

        </div>

        {/* Right Column: AI Analysis Output & Doctor Impression (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <BrainCircuit className="h-4 w-4 text-purple-600" />
                <h4 className="font-bold text-sm">Pathologist Clinical Interpretation</h4>
              </div>

              {aiResponse && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  aiResponse.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                  aiResponse.severity === 'ABNORMAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  ● {aiResponse.severity} CASE
                </span>
              )}
            </div>

            {!aiResponse ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <BrainCircuit className="h-12 w-12 mx-auto text-purple-200" />
                <p className="font-semibold text-slate-600 text-sm">AI Diagnostic Model Ready</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the button on the left or select a case preset to generate an automated medical summary and microscopic findings.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Detected Syndromes / Anomalies */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Detected Pathological Anomalies:
                  </h5>
                  <div className="space-y-1.5">
                    {aiResponse.impressions && aiResponse.impressions.length > 0 ? (
                      aiResponse.impressions.map((imp: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>All parameter values conform to standard biological reference intervals.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Report Microscopic Note */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Drafted Microscopic Impression for Official Report:
                  </h5>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 leading-relaxed">
                    {aiResponse.clinicalDraftNote}
                  </div>
                </div>

                {/* Recommended Confirmatory Actions */}
                <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>Pathologist Guidance:</span>
                  </div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    Review automated smear correlation before releasing the report. Critical results must be telephonically flagged to referring clinician.
                  </p>
                </div>

              </div>
            )}
          </div>

          <div className="border-t pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Standard: ISO 15189 / NABL Pathology Rules</span>
            <span>Gemini AI Engine</span>
          </div>

        </div>

      </div>

    </div>
  );
}

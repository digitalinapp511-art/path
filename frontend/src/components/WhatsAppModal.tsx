import React, { useState } from 'react';
import axios from 'axios';
import { 
  X, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  Smartphone,
  QrCode,
  ShieldCheck
} from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function WhatsAppModal({ isOpen, onClose, order }: WhatsAppModalProps) {
  const [sentStatus, setSentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const phone = order.phone || '9027685004';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const reportUrl = `https://citycarepathlab.com/reports/${order.id}`;
  
  const messageText = `Dear ${order.patient}, your verified diagnostic test report (${order.id}) from City Care Pathology is ready. Download authentic PDF report: ${reportUrl} - Thank you!`;

  const handleSendViaGateway = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/notifications/send-report', {
        orderId: order.id,
        patientName: order.patient,
        phone,
        downloadUrl: reportUrl
      });
      setSentStatus('DELIVERED');
    } catch (err) {
      setSentStatus('FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsAppWeb = () => {
    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">WhatsApp & SMS Report Delivery</h3>
              <p className="text-[11px] text-emerald-200">Patient: {order.patient}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body & Chat Preview */}
        <div className="p-5 space-y-4 bg-slate-50">
          
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-700">
              <Smartphone className="h-4 w-4 text-slate-400" />
              <span>Recipient Mobile:</span>
              <strong className="font-mono text-slate-900">+91 {phone}</strong>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Active WhatsApp
            </span>
          </div>

          {/* WhatsApp Chat Message Bubble Simulation */}
          <div className="bg-[#efeae2] p-4 rounded-xl border border-slate-300 shadow-inner relative">
            <div className="bg-white p-3.5 rounded-lg rounded-tl-none shadow-sm max-w-[90%] text-xs text-slate-800 space-y-2 relative border border-slate-200">
              <div className="flex items-center space-x-1.5 pb-1 border-b border-slate-100 text-emerald-700 font-bold text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>City Care Pathology & Diagnostics</span>
              </div>
              
              <p className="leading-relaxed">
                Dear <strong>{order.patient}</strong>,
              </p>
              <p className="text-slate-600">
                Your medical test results for Order <span className="font-mono font-bold text-blue-600">{order.id}</span> have been verified and signed by Dr. Rajesh Pathak (Chief Pathologist).
              </p>

              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] space-y-0.5 font-mono">
                <div>Tests: {order.tests || 'Complete Blood Count (CBC)'}</div>
                <div>Status: <span className="text-emerald-600 font-bold">● DIGITALLY VERIFIED</span></div>
              </div>

              <div className="pt-1 text-blue-600 font-semibold underline text-[11px] break-all">
                📥 Click to Download PDF: {reportUrl}
              </div>

              <span className="block text-right text-[9px] text-slate-400 font-mono">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
              </span>
            </div>
          </div>

          {/* Delivery Status Toast */}
          {sentStatus === 'DELIVERED' && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span><strong>Delivered Successfully!</strong> Notification dispatched to +91 {phone}.</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>

          <div className="flex space-x-2">
            <button 
              onClick={handleOpenWhatsAppWeb}
              className="flex items-center space-x-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open WA Web</span>
            </button>

            <button 
              onClick={handleSendViaGateway}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Sending...' : 'Auto-Dispatch'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

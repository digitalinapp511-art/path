import React, { useRef } from 'react';
import { X, Printer, Download, QrCode } from 'lucide-react';
import { getDepartmentForTest } from '../utils/testParameters';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function ReportModal({ isOpen, onClose, order }: ReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const isApproved = order.status === 'APPROVED' || order.status === 'COMPLETED';
  const deptInfo = getDepartmentForTest(order.tests || '');

  // Helper to interpret parameter flags
  const getFlagFromVal = (valStr: string, low: number, high: number) => {
    if (!valStr || !valStr.trim()) return 'PENDING';
    const lower = valStr.toLowerCase().trim();
    if (lower.includes('neg') || lower.includes('nil') || lower.includes('clear') || lower.includes('normal')) return 'NORMAL';
    if (lower.includes('pos') || lower.includes('reactive') || lower.includes('present')) return 'HIGH';

    const v = parseFloat(valStr);
    if (isNaN(v)) return 'RECORDED';
    if (low > 0 && v < low) return 'LOW';
    if (high > 0 && v > high) return 'HIGH';
    return 'NORMAL';
  };

  // Dynamic test results: If technician entered observations, use those exact values!
  // Otherwise empty array (NO dummy / fake numbers)
  const testResults: any[] = (order.testResults && order.testResults.length > 0)
    ? order.testResults.map((p: any) => ({
        parameter: p.name,
        observed: p.value ? p.value : 'Pending',
        unit: p.unit,
        normal: (p.normalLow === 0 && p.normalHigh === 0) ? 'Negative / Nil' : `${p.normalLow} - ${p.normalHigh}`,
        flag: p.value ? getFlagFromVal(p.value, p.normalLow, p.normalHigh) : 'PENDING'
      }))
    : [];

  const sampleTime = order.time ? `Today, ${order.time}` : 'Today, Recorded';
  const reportTime = isApproved ? 'Approved & Released' : 'Pending Verification';

  // 🖨️ Method 1: Print Dialog (Save as PDF)
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical_Report_${order.id}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 11px; line-height: 1.35; }
            .header-bar { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; }
            .lab-title { font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
            .lab-sub { font-size: 10px; color: #2563eb; font-weight: 600; margin: 2px 0; }
            .lab-contact { font-size: 9px; color: #64748b; margin: 0; }
            .demo-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; margin-bottom: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; font-size: 10px; }
            .demo-label { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .demo-val { font-weight: bold; color: #0f172a; }
            .test-header { background: #0f172a; color: white; padding: 5px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
            th { border-bottom: 2px solid #0f172a; padding: 5px 8px; text-align: left; font-size: 9px; text-transform: uppercase; color: #475569; }
            td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
            .high { color: #dc2626; font-weight: bold; }
            .low { color: #d97706; font-weight: bold; }
            .badge { padding: 1px 5px; border-radius: 3px; font-size: 8px; font-weight: bold; }
            .badge-high { background: #fee2e2; color: #991b1b; }
            .badge-low { background: #fef3c7; color: #92400e; }
            .sign-area { border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 15px; display: flex; justify-content: space-between; align-items: flex-end; }
            .stamp { border: 2px solid #059669; background: #ecfdf5; color: #065f46; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px; }
            .footer-note { font-size: 8px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1 class="lab-title">City Care Pathology & Diagnostics</h1>
              <p class="lab-sub">ISO 15189:2022 & NABL Accredited Medical Laboratory</p>
              <p class="lab-contact">Plot 14, Health City Complex, Medical Enclave, Central Delhi - 110001 | Phone: +91 11 2345 6789</p>
            </div>
            <div style="text-align: right;">
              <div style="border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 4px; font-size: 9px;">
                <strong>NABL Certificate</strong><br/>MC-4592/2026
              </div>
            </div>
          </div>

          <div class="demo-box">
            <div><span class="demo-label">Patient Name</span><span class="demo-val">${order.patient}</span></div>
            <div><span class="demo-label">UHID / ID</span><span class="demo-val">${order.uhid || 'UHID-PENDING'}</span></div>
            <div><span class="demo-label">Order ID</span><span class="demo-val">${order.id}</span></div>
            <div><span class="demo-label">Barcode</span><span class="demo-val">${order.barcode}</span></div>
            <div><span class="demo-label">Ref Doctor</span><span class="demo-val">${order.doctor || 'Self / Walk-in'}</span></div>
            <div><span class="demo-label">Sample Time</span><span class="demo-val">${sampleTime}</span></div>
            <div><span class="demo-label">Report Status</span><span class="demo-val">${reportTime}</span></div>
            <div><span class="demo-label">Sample Type</span><span class="demo-val">${order.vial || 'Whole Blood (EDTA)'}</span></div>
          </div>

          <div class="test-header">${deptInfo.department} — ${order.tests || 'COMPLETE BLOOD COUNT (CBC)'}</div>

          <table>
            <thead>
              <tr>
                <th>Test Parameter</th>
                <th style="text-align: center;">Observed Result</th>
                <th style="text-align: center;">Unit</th>
                <th style="text-align: center;">Reference Range</th>
                <th style="text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${testResults.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 25px; color: #64748b;">
                    <em>No laboratory observations entered yet. Results pending technician entry.</em>
                  </td>
                </tr>
              ` : testResults.map(r => `
                <tr>
                  <td><strong>${r.parameter}</strong></td>
                  <td style="text-align: center;" class="${r.flag === 'HIGH' ? 'high' : r.flag === 'LOW' ? 'low' : ''}"><strong>${r.observed}</strong></td>
                  <td style="text-align: center; color: #64748b;">${r.unit}</td>
                  <td style="text-align: center;">${r.normal}</td>
                  <td style="text-align: right;">
                    ${r.flag === 'HIGH' ? `<span class="badge badge-high">HIGH</span>` :
                      r.flag === 'LOW' ? `<span class="badge badge-low">LOW</span>` :
                      r.flag === 'NORMAL' ? `<span style="color:#059669; font-size:9px; font-weight:bold;">NORMAL</span>` :
                      `<span style="color:#94a3b8; font-size:9px;">PENDING</span>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; font-size: 10px; margin-bottom: 12px;">
            <strong>Clinical Note:</strong> ${order.notes || (isApproved ? 'All test observations reviewed and validated by pathologist. Clinical correlation suggested.' : 'Observations recorded. Awaiting final verification by Pathologist.')}
          </div>

          <div class="sign-area">
            <div>
              <div style="font-size: 9px; color: #64748b;">
                <strong>Authenticity ID:</strong> ${order.id}-AUTH-99<br/>
                Tamper-proof digital medical record.
              </div>
            </div>
            <div style="text-align: right;">
              ${isApproved ? `
                <div class="stamp">✓ DIGITALLY SIGNED & VERIFIED</div>
                <div style="font-weight: bold; font-size: 11px;">Dr. Rajesh Pathak</div>
                <div style="font-size: 9px; color: #64748b;">M.D. (Pathology), DNB (Reg: MCI-2012-48902)</div>
                <div style="font-size: 9px; color: #64748b;">Chief Consultant Pathologist</div>
              ` : `
                <div style="color: #ef4444; font-weight: bold; font-size: 10px;">⚠ PROVISIONAL REPORT - PENDING APPROVAL</div>
              `}
            </div>
          </div>

          <div class="footer-note">*** End of Medical Test Report *** | Computer generated authentic diagnostic report.</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // 💾 Method 2: Direct File Download
  const handleDownloadDirectFile = () => {
    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Medical_Report_${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; max-width: 800px; margin: auto; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 16px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: left; }
            th { background: #f1f5f9; border-bottom: 2px solid #0f172a; font-size: 9px; text-transform: uppercase; }
            .sign { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0; text-transform:uppercase; font-size:20px;">City Care Pathology & Diagnostics</h1>
            <p style="margin:3px 0; color:#2563eb; font-weight:bold; font-size:11px;">ISO 15189:2022 & NABL Accredited Laboratory</p>
            <p style="margin:0; font-size:10px; color:#64748b;">Plot 14, Health City Complex, Central Delhi | Phone: +91 11 2345 6789</p>
          </div>
          <div class="box">
            <strong>Patient:</strong> ${order.patient} | <strong>UHID:</strong> ${order.uhid || 'UHID-PENDING'} | <strong>Order ID:</strong> ${order.id} | <strong>Barcode:</strong> ${order.barcode}
          </div>
          <h3 style="background:#0f172a; color:white; padding:5px 10px; border-radius:4px; font-size:11px; margin:0;">HEMATOLOGY — ${order.tests || 'COMPLETE BLOOD COUNT (CBC)'}</h3>
          <table>
            <thead>
              <tr><th>Test Parameter</th><th>Observed Value</th><th>Unit</th><th>Reference Range</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${testResults.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">
                    <em>No laboratory observations entered yet. Results pending.</em>
                  </td>
                </tr>
              ` : testResults.map(r => `
                <tr>
                  <td><strong>${r.parameter}</strong></td>
                  <td><strong>${r.observed}</strong></td>
                  <td>${r.unit}</td>
                  <td>${r.normal}</td>
                  <td>${r.flag}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="sign">
            ${isApproved ? `
              <p style="margin:0; font-weight:bold; font-size:12px;">Dr. Rajesh Pathak</p>
              <p style="margin:0; font-size:10px; color:#64748b;">M.D. (Pathology) | Chief Consultant Pathologist</p>
              <p style="margin:3px 0; color:#059669; font-weight:bold; font-size:10px;">✓ DIGITALLY SIGNED & VERIFIED</p>
            ` : `
              <p style="margin:0; font-weight:bold; font-size:11px; color:#ef4444;">⚠ PROVISIONAL DRAFT - PENDING APPROVAL</p>
            `}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = typeof order.patient === 'string' ? order.patient.split(' ')[0] : 'Report';
    a.download = `Medical_Report_${order.id}_${cleanName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`File downloaded: Medical_Report_${order.id}.html`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      {/* 
        FIXED VIEWPORT CONTAINER:
        h-[92vh] aur max-w-3xl ensures poora modal screen ke andar hi rehta hai 
      */}
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full h-[92vh] flex flex-col overflow-hidden border border-slate-700">
        
        {/* 1. STICKY TOP TOOLBAR (ALWAYS VISIBLE AT TOP) */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs sm:text-sm">Medical Report Viewer</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
              isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isApproved ? '● VERIFIED' : '⚠ PENDING'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Direct Download Button */}
            <button 
              onClick={handleDownloadDirectFile}
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            {/* Print / Save as PDF Button */}
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. DOCUMENT VIEWER CANVAS (FITS SCREEN WITH SMOOTH INNER SCROLL) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 flex justify-center items-start">
          
          {/* 3. A4 COMPACT MEDICAL SHEET */}
          <div ref={printRef} className="bg-white text-slate-800 shadow-2xl rounded-lg p-6 sm:p-8 w-full max-w-[680px] font-sans relative border border-slate-200">
            
            {/* Watermark for Unapproved Draft */}
            {!isApproved && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none">
                <span className="text-6xl font-black text-rose-900 transform -rotate-45 tracking-widest border-8 border-rose-900 p-6 rounded-2xl">
                  PROVISIONAL DRAFT
                </span>
              </div>
            )}

            {/* A. LABORATORY LETTERHEAD */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                    City Care Pathology & Diagnostics
                  </h1>
                  <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mt-0.5">
                    ISO 15189:2022 & NABL Accredited Medical Laboratory
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 max-w-sm">
                    Plot 14, Health City Complex, Medical Enclave, Central Delhi - 110001
                    <br />Phone: +91 11 2345 6789 | Email: reports@citypathlab.com
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block border border-slate-300 rounded p-1.5 bg-slate-50 text-center">
                    <span className="block text-[8px] font-bold uppercase text-slate-500">NABL Certificate</span>
                    <span className="font-mono text-[10px] font-bold text-slate-800">MC-4592/2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* B. PATIENT & SAMPLE DEMOGRAPHICS */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-4 text-[10px] sm:text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">Patient Name</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{order.patient}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">UHID / Patient ID</span>
                  <span className="font-mono font-bold text-blue-600">{order.uhid || 'UHID-PENDING'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">Order ID</span>
                  <span className="font-mono font-bold text-slate-800">{order.id}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">Barcode</span>
                  <span className="font-mono font-bold text-purple-700">{order.barcode}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">Referring Doctor</span>
                  <span className="font-semibold text-slate-800">{order.doctor || 'Self / Walk-in'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">Sample Time</span>
                  <span className="font-semibold text-slate-700">{sampleTime}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">Report Status</span>
                  <span className="font-semibold text-slate-700">{reportTime}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold uppercase text-[9px]">Primary Sample</span>
                  <span className="font-semibold text-purple-700">{order.vial || 'Whole Blood (EDTA)'}</span>
                </div>
              </div>
            </div>

            {/* C. TEST TITLE */}
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>{deptInfo.department} — {order.tests || 'COMPLETE BLOOD COUNT (CBC)'}</span>
              <span className="text-[9px] text-slate-300 font-normal">{deptInfo.method}</span>
            </div>

            {/* D. PARAMETERS TABLE */}
            <table className="w-full text-left text-[11px] mb-4">
              <thead className="border-b-2 border-slate-300 text-[9px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-1.5">Test Parameter</th>
                  <th className="py-1.5 text-center">Observed Result</th>
                  <th className="py-1.5 text-center">Unit</th>
                  <th className="py-1.5 text-center">Reference Range</th>
                  <th className="py-1.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <p className="font-semibold text-slate-600 text-xs">No Observations Recorded Yet</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Please enter laboratory readings in the Technician Entry tab.</p>
                    </td>
                  </tr>
                ) : (
                  testResults.map((row, idx) => (
                    <tr key={idx} className={row.flag !== 'NORMAL' && row.flag !== 'PENDING' ? 'bg-amber-50/50' : ''}>
                      <td className="py-1.5 font-semibold text-slate-800">{row.parameter}</td>
                      <td className="py-1.5 text-center font-bold">
                        <span className={
                          row.flag === 'HIGH' ? 'text-rose-600 font-black' :
                          row.flag === 'LOW' ? 'text-amber-600 font-black' :
                          row.flag === 'NORMAL' ? 'text-emerald-700 font-bold' : 'text-slate-400'
                        }>
                          {row.observed}
                        </span>
                      </td>
                      <td className="py-1.5 text-center text-slate-500 font-mono text-[10px]">{row.unit}</td>
                      <td className="py-1.5 text-center text-slate-600 text-[10px] font-medium">{row.normal}</td>
                      <td className="py-1.5 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          row.flag === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                          row.flag === 'LOW' ? 'bg-amber-100 text-amber-700' :
                          row.flag === 'NORMAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {row.flag}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* E. CLINICAL NOTE */}
            <div className="border border-slate-200 rounded p-2.5 bg-slate-50 text-[10px] mb-4">
              <span className="font-bold text-slate-800 block">Clinical Findings:</span>
              <p className="text-slate-600 mt-0.5">
                {order.notes || (isApproved ? 'All test observations reviewed and verified by pathologist. Clinical correlation suggested.' : 'Sample processed. Observations awaiting pathologist verification.')}
              </p>
            </div>

            {/* F. SIGNATURE & QR CODE */}
            <div className="border-t border-slate-200 pt-3 flex justify-between items-end">
              <div className="flex items-center space-x-2">
                <div className="p-1 border border-slate-300 rounded bg-white shadow-sm">
                  <QrCode className="h-10 w-10 text-slate-900" />
                </div>
                <div className="text-[9px] text-slate-500">
                  <span className="font-bold text-slate-700 block">Scan to Verify</span>
                  ID: <span className="font-mono font-bold text-slate-900">{order.id}-AUTH-99</span>
                </div>
              </div>

              <div className="text-right">
                {isApproved ? (
                  <div className="space-y-0.5">
                    <div className="inline-block border border-emerald-600 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold">
                      ✓ DIGITALLY SIGNED & VERIFIED
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Dr. Rajesh Pathak</h4>
                    <p className="text-[9px] text-slate-500">M.D. (Pathology), DNB (Reg: MCI-2012-48902)</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Chief Consultant Pathologist</p>
                  </div>
                ) : (
                  <div className="space-y-0.5 opacity-60">
                    <div className="h-8 border-b border-dashed border-slate-400 w-36 inline-block"></div>
                    <h4 className="font-bold text-[10px] text-slate-700">Awaiting Pathologist Signature</h4>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[8px] text-slate-400">
              *** End of Report *** | Computer generated authentic diagnostic report.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

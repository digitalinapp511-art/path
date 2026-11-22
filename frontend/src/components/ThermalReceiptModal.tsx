import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function ThermalReceiptModal({ isOpen, onClose, order }: ThermalReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=420,height=600');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${order.id}</title>
          <style>
            @page { size: 80mm auto; margin: 3mm; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 74mm; 
              margin: 0 auto; 
              padding: 5px; 
              font-size: 11px; 
              line-height: 1.3;
              color: #000;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .double-divider { border-top: 2px solid #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; font-size: 11px; }
            .item-table th { border-bottom: 1px dashed #000; padding: 2px 0; text-align: left; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="bold" style="font-size: 14px;">CITY CARE PATHOLOGY</div>
            <div style="font-size: 10px;">ISO 15189 & NABL ACCREDITED LAB</div>
            <div style="font-size: 9px;">Central Delhi | Ph: +91 11 2345 6789</div>
            <div style="font-size: 9px;">GSTIN: 07AAAAA0000A1Z5</div>
          </div>

          <div class="divider"></div>
          <div class="text-center bold" style="font-size: 12px;">TAX INVOICE / RECEIPT</div>
          <div class="divider"></div>

          <table>
            <tr><td><strong>Bill No:</strong> ${order.id}</td><td class="text-right"><strong>Date:</strong> Today</td></tr>
            <tr><td><strong>UHID:</strong> ${order.uhid || 'UHID-8921'}</td><td class="text-right"><strong>Time:</strong> ${order.time || '10:30 AM'}</td></tr>
            <tr><td colspan="2"><strong>Patient:</strong> ${order.patient}</td></tr>
            <tr><td colspan="2"><strong>Phone:</strong> ${order.phone || '9027685004'}</td></tr>
            <tr><td colspan="2"><strong>Ref By:</strong> ${order.doctor || 'Self / Walk-in'}</td></tr>
          </table>

          <div class="divider"></div>

          <table class="item-table">
            <thead>
              <tr><th>Test Description</th><th class="text-right">Amount (₹)</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.tests || 'Complete Blood Count (CBC)'}</td>
                <td class="text-right">${order.totalAmount || 350}.00</td>
              </tr>
            </tbody>
          </table>

          <div class="divider"></div>

          <table>
            <tr><td>Subtotal:</td><td class="text-right">₹${order.totalAmount || 350}.00</td></tr>
            <tr><td>Discount:</td><td class="text-right">₹0.00</td></tr>
            <tr class="bold" style="font-size: 13px;">
              <td>TOTAL PAID:</td>
              <td class="text-right">₹${order.totalAmount || 350}.00</td>
            </tr>
            <tr><td>Payment Mode:</td><td class="text-right bold">UPI / CASH</td></tr>
            <tr><td>Balance Due:</td><td class="text-right">₹0.00</td></tr>
          </table>

          <div class="divider"></div>

          <div class="text-center" style="font-size: 10px; margin-top: 6px;">
            <div class="bold">PAID & VERIFIED</div>
            <div>Sample Barcode: ${order.barcode}</div>
            <div style="margin-top: 4px; font-size: 8px;">Reports available online within 4 hours.</div>
            <div style="font-size: 8px;">*** Thank you! Stay Healthy ***</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Thermal Billing Receipt</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
              PAID
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 80mm Slip Preview */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div ref={receiptRef} className="bg-white p-5 rounded-lg shadow-sm w-full font-mono text-xs text-slate-800 border border-slate-300 space-y-3">
            
            <div className="text-center border-b border-dashed border-slate-300 pb-2">
              <h3 className="font-bold text-sm text-slate-900 uppercase">City Care Pathology</h3>
              <p className="text-[10px] text-slate-500">ISO 15189 & NABL Accredited</p>
              <p className="text-[9px] text-slate-400">Plot 14, Health City, Central Delhi</p>
              <p className="text-[9px] text-slate-500 font-semibold mt-0.5">GSTIN: 07AAAAA0000A1Z5</p>
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt #:</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UHID:</span>
                <span className="font-bold text-blue-600">{order.uhid || 'UHID-8921'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold">{order.patient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span>{order.phone || '9027685004'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ref Doctor:</span>
                <span className="font-semibold">{order.doctor || 'Self / Walk-in'}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase pb-1">
                <span>Test Item</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between text-xs py-0.5">
                <span>{order.tests || 'Complete Blood Count (CBC)'}</span>
                <span className="font-bold">₹{order.totalAmount || 350}.00</span>
              </div>
            </div>

            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{order.totalAmount || 350}.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Paid:</span>
                <span className="text-emerald-600">₹{order.totalAmount || 350}.00</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Mode:</span>
                <span className="font-bold text-slate-700">UPI / Cash</span>
              </div>
            </div>

            <div className="text-center pt-1 text-[10px] text-slate-500 space-y-1">
              <div className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3" />
                <span>PAYMENT CONFIRMED</span>
              </div>
              <p className="text-[9px]">Sample Barcode: {order.barcode}</p>
              <p className="text-[8px] text-slate-400">Reports ready in 4-6 hours. Download via SMS link.</p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Thermal Slip</span>
          </button>
        </div>

      </div>
    </div>
  );
}

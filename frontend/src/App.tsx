import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Users, 
  FlaskConical, 
  QrCode, 
  FileCheck, 
  CreditCard, 
  Settings, 
  PlusCircle, 
  Search, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Stethoscope, 
  Printer, 
  Check, 
  FileText,
  Inbox,
  AlertTriangle,
  Trash2,
  Package,
  MessageSquare,
  Shield,
  LogOut,
  UserCheck
} from 'lucide-react';

import NewPatientModal from './components/NewPatientModal';
import TechnicianEntry from './components/TechnicianEntry';
import ReportModal from './components/ReportModal';
import InventoryView from './components/InventoryView';
import DoctorCommissionView from './components/DoctorCommissionView';
import ThermalReceiptModal from './components/ThermalReceiptModal';
import LoginModal, { STAFF_ACCOUNTS, type StaffUser } from './components/LoginModal';
import WhatsAppModal from './components/WhatsAppModal';
import AiAssistantView from './components/AiAssistantView';
import { Sparkles } from 'lucide-react';
import { API_BASE_URL } from './apiConfig';

export default function App() {
  const [currentUser, setCurrentUser] = useState<StaffUser>(STAFF_ACCOUNTS[3]); // Default Lab Admin
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderForEntry, setSelectedOrderForEntry] = useState<any>(null);
  const [selectedOrderForReport, setSelectedOrderForReport] = useState<any>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [selectedOrderForWhatsApp, setSelectedOrderForWhatsApp] = useState<any>(null);

  // 100% Clean Empty Orders State (Real-time data from Cloud Database or Registration)
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch real orders from Cloud DB on load
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      if (res.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.log('Backend not connected yet, using local state.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePatientRegistered = async (newOrder: any) => {
    // Optimistically prepend, then fetch full DB state to ensure 100% sync
    setOrders(prev => [newOrder, ...prev]);
    await fetchOrders();
  };

  const handleResultsSubmitted = async (orderId: string, results: any[], notes?: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/results`, { results, notes });
      await fetchOrders();
    } catch (err) {
      // local fallback if offline
      setOrders(orders.map(o => o.id === orderId ? { 
        ...o, 
        status: 'PENDING_APPROVAL', 
        testResults: results,
        notes: notes || o.notes,
        badge: 'bg-amber-50 text-amber-700 border-amber-200' 
      } : o));
    }
    setSelectedOrderForEntry(null);
  };

  const handleResetDatabase = async () => {
    if (window.confirm("⚠️ SECURITY AUDIT CONFIRMATION: Are you sure you want to delete all test patients, orders and reports? This will wipe the Neon Cloud Database and reset inventory.")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/orders/clean-all`, {
          headers: {
            'X-Admin-Key': 'PLMS_SECURE_ADMIN_MASTER_2026'
          }
        });
        setOrders([]);
        alert("✅ All records successfully cleaned and inventory reset to initial state!");
        await fetchOrders();
      } catch (err: any) {
        const msg = err.response?.data?.error || err.message || 'Failed to wipe database';
        alert(`Security Error: ${msg}`);
      }
    }
  };

  const handleApproveReport = async (orderId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/approve`);
      await fetchOrders();
      alert('Report APPROVED & Digitally Signed by Pathologist!');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      alert(`Approval error: ${msg}`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'APPROVED', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' } : o));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shadow-xl shrink-0">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white">PLMS SaaS</h1>
              <p className="text-xs text-blue-400 font-medium">Digital Pathology v1.0</p>
            </div>
          </div>

          <nav className="p-3 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'patients', label: 'Patients & Orders', icon: Users },
              { id: 'samples', label: 'Sample & Barcodes', icon: QrCode },
              { id: 'technician', label: 'Technician Entry', icon: FlaskConical },
              { id: 'pathologist', label: 'Doctor Approval', icon: FileCheck },
              { id: 'ai-assistant', label: 'AI Clinical Assistant', icon: Sparkles },
              { id: 'inventory', label: 'Reagents & Stock', icon: Package },
              { id: 'doctors', label: 'Doctor Incentives', icon: Stethoscope },
              { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
              { id: 'settings', label: 'Lab Settings', icon: Settings },
            ]
              .filter(item => currentUser.allowedTabs.includes(item.id))
              .map((item) => {
              const Icon = item.icon;
              const isActive = (activeTab === item.id) && !selectedOrderForEntry;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedOrderForEntry(null);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-slate-400" />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">City Care Pathology</p>
              <p className="text-[10px] text-emerald-400 font-medium">● Cloud DB Live</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {selectedOrderForEntry ? 'Result Entry' : (
                activeTab === 'dashboard' ? 'Overview Dashboard' :
                activeTab === 'patients' ? 'Patient Management' :
                activeTab === 'samples' ? 'Sample Collection & Barcoding' :
                activeTab === 'technician' ? 'Technician Worklist' :
                activeTab === 'pathologist' ? 'Pathologist Approval Queue' :
                activeTab === 'ai-assistant' ? 'Gemini AI Clinical Pathology Assistant' :
                activeTab === 'inventory' ? 'Reagents & Stock Inventory' :
                activeTab === 'doctors' ? 'Doctor Referral & Commission Tracker' :
                activeTab === 'billing' ? 'Billing Counter & Receipts' : 'Lab Configuration'
              )}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Branch: Central Lab
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search UHID / Phone / Barcode..." 
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-slate-50"
              />
            </div>
            
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Staff Role Switcher */}
            <div 
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center space-x-3 pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition"
              title="Click to Switch Staff Role (RBAC)"
            >
              <div className={`h-9 w-9 rounded-full ${currentUser.color} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                {currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${currentUser.badge}`}>
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-[10px] text-blue-600 font-semibold flex items-center space-x-0.5">
                  <span>Switch Role</span>
                  <span>▾</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {selectedOrderForEntry ? (
            <TechnicianEntry 
              order={selectedOrderForEntry}
              onBack={() => setSelectedOrderForEntry(null)}
              onSubmitResults={handleResultsSubmitted}
            />
          ) : (
            <>
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Daily Operations</h3>
                      <p className="text-xs text-slate-500">Manage patient queue, sample collection and test verifications</p>
                    </div>
                    <div className="flex space-x-3">
                      {orders.length > 0 && (
                        <button 
                          onClick={handleResetDatabase}
                          title="Wipe all test records to start empty"
                          className="flex items-center space-x-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear All Data</span>
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveTab('samples')}
                        className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition cursor-pointer"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Quick Barcode Station</span>
                      </button>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>New Patient Registration</span>
                      </button>
                    </div>
                  </div>

                  {/* DYNAMIC KPI STATS CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[
                      { title: "Today's Registrations", value: orders.length.toString(), change: "Registered patients", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                      { title: "Samples in Queue", value: orders.filter(o => o.status === 'SAMPLE_COLLECTED').length.toString(), change: "Pending processing", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                      { title: "Awaiting Doctor Approval", value: orders.filter(o => o.status === 'PENDING_APPROVAL').length.toString(), change: "Review required", icon: Stethoscope, color: "text-rose-600", bg: "bg-rose-50" },
                      { title: "Reports Completed", value: orders.filter(o => o.status === 'APPROVED' || o.status === 'COMPLETED').length.toString(), change: "100% verified", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-500">{card.title}</p>
                            <h4 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">{card.change}</p>
                          </div>
                          <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ACTIVE ORDERS TABLE */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Recent Test Orders</h4>
                        <p className="text-xs text-slate-400">Real-time status of incoming lab orders</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        {orders.length} Active Orders
                      </span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <Inbox className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600 text-sm">No Patients Registered Yet</p>
                        <p className="text-xs text-slate-400 mt-0.5">Click "New Patient Registration" button above to add your first patient.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Order ID</th>
                            <th className="py-3 px-4">Patient Name</th>
                            <th className="py-3 px-4">Tests Ordered</th>
                            <th className="py-3 px-4">Barcode</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-4 font-medium text-slate-800">{row.id}</td>
                              <td className="py-3 px-4 font-medium text-slate-700">{row.patient}</td>
                              <td className="py-3 px-4 text-slate-600">{row.tests}</td>
                              <td className="py-3 px-4 font-mono text-xs text-blue-600 font-semibold">{row.barcode}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${row.badge}`}>
                                  {row.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 flex items-center space-x-2">
                                <button 
                                  onClick={() => setSelectedOrderForEntry(row)}
                                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition cursor-pointer"
                                >
                                  Enter Results
                                </button>
                                <button 
                                  onClick={() => setSelectedOrderForReport(row)}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition cursor-pointer flex items-center space-x-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  <span>PDF</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* TAB 2: PATIENTS & ORDERS */}
              {activeTab === 'patients' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Registered Patients Directory</h3>
                      <p className="text-xs text-slate-500">Search patients by UHID, Name or Phone Number</p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Register New Patient</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {orders.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <Inbox className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600 text-sm">No Patients in Directory</p>
                        <p className="text-xs text-slate-400 mt-0.5">Register a patient to see their records here.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b">
                          <tr>
                            <th className="py-3 px-4">UHID</th>
                            <th className="py-3 px-4">Patient Name</th>
                            <th className="py-3 px-4">Phone</th>
                            <th className="py-3 px-4">Latest Test Order</th>
                            <th className="py-3 px-4">Billing</th>
                            <th className="py-3 px-4">Report</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono font-bold text-blue-600">{p.uhid}</td>
                              <td className="py-3 px-4 font-semibold text-slate-800">{p.patient}</td>
                              <td className="py-3 px-4 text-slate-500">{p.phone}</td>
                              <td className="py-3 px-4 text-slate-600">{p.tests}</td>
                              <td className="py-3 px-4 font-bold text-slate-700">₹{p.totalAmount}</td>
                              <td className="py-3 px-4">
                                <button 
                                  onClick={() => setSelectedOrderForReport(p)}
                                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>View Report</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SAMPLE & BARCODES */}
              {activeTab === 'samples' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Sample Collection & Phlebotomy Counter</h3>
                    <p className="text-xs text-slate-500">Collect blood/urine samples and print vial barcode stickers</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400">
                      <QrCode className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600 text-sm">No Samples Pending</p>
                      <p className="text-xs text-slate-400 mt-0.5">Orders will appear here automatically when booked.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orders.map((order, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                              {order.barcode}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{order.patient}</h4>
                            <p className="text-xs text-slate-500">{order.tests}</p>
                            <p className="text-[11px] font-semibold text-slate-700">Vial Required: <span className="text-purple-600">{order.vial || 'Purple (EDTA)'}</span></p>
                          </div>
                          <button 
                            onClick={() => alert(`Printing Barcode Thermal Sticker for ${order.barcode}`)}
                            className="flex items-center space-x-1.5 bg-slate-900 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                            <span>Print Sticker</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TECHNICIAN ENTRY LIST */}
              {activeTab === 'technician' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Technician Result Entry Queue</h3>
                    <p className="text-xs text-slate-500">Select an order below to enter laboratory observations & machine readings</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {orders.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <FlaskConical className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600 text-sm">No Orders Awaiting Results</p>
                        <p className="text-xs text-slate-400 mt-0.5">Book a test order to start entering laboratory observations.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b">
                          <tr>
                            <th className="py-3 px-4">Barcode</th>
                            <th className="py-3 px-4">Patient</th>
                            <th className="py-3 px-4">Test Assigned</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map((o, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono font-bold text-purple-600">{o.barcode}</td>
                              <td className="py-3 px-4 font-semibold text-slate-800">{o.patient}</td>
                              <td className="py-3 px-4 text-slate-600">{o.tests}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${o.badge}`}>
                                  {o.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <button 
                                  onClick={() => setSelectedOrderForEntry(o)}
                                  className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-purple-700 transition cursor-pointer"
                                >
                                  Enter Observations →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: PATHOLOGIST APPROVAL */}
              {activeTab === 'pathologist' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Pathologist Verification & Digital Signature</h3>
                    <p className="text-xs text-slate-500">SOP Rule: No report can be released without Pathologist verification</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400">
                      <FileCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600 text-sm">No Reports Awaiting Verification</p>
                      <p className="text-xs text-slate-400 mt-0.5">Approved and pending reports will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {orders.map((o, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-800 text-sm">{o.patient}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${o.badge}`}>
                                {o.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">Tests: {o.tests} | Barcode: <span className="font-mono text-blue-600">{o.barcode}</span></p>
                          </div>

                          <div className="flex items-center space-x-2.5">
                            {o.status === 'APPROVED' || o.status === 'COMPLETED' ? (
                              <>
                                <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
                                  <Check className="h-4 w-4" />
                                  <span>Digitally Signed</span>
                                </span>
                                <button 
                                  onClick={() => setSelectedOrderForWhatsApp(o)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition cursor-pointer flex items-center space-x-1.5"
                                  title="Dispatch WhatsApp / SMS to patient"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>WhatsApp / SMS</span>
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleApproveReport(o.id)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center space-x-1.5"
                              >
                                <FileCheck className="h-4 w-4" />
                                <span>Approve & Sign Report</span>
                              </button>
                            )}
                            <button 
                              onClick={() => setSelectedOrderForReport(o)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center space-x-1.5"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Preview Official PDF</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5.5: AI CLINICAL ASSISTANT */}
              {activeTab === 'ai-assistant' && (
                <AiAssistantView orders={orders} />
              )}

              {/* TAB 6: INVENTORY & REAGENTS */}
              {activeTab === 'inventory' && (
                <InventoryView />
              )}

              {/* TAB 7: DOCTOR COMMISSIONS */}
              {activeTab === 'doctors' && (
                <DoctorCommissionView />
              )}

              {/* TAB 8: BILLING & INVOICES */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Billing Counter & Payments</h3>
                    <p className="text-xs text-slate-500">Track total revenue, collections, doctor commissions and print thermal receipts</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-medium">Total Billed</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-medium">Cash / UPI Collected</p>
                      <h4 className="text-2xl font-bold text-emerald-600 mt-1">₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-medium">Doctor Incentives Owed</p>
                      <h4 className="text-2xl font-bold text-purple-600 mt-1">₹{orders.reduce((sum, o) => sum + (o.doctorCommission || 0), 0)}</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-medium">Pending Dues</p>
                      <h4 className="text-2xl font-bold text-slate-400 mt-1">₹0.00</h4>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {orders.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <CreditCard className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600 text-sm">No Invoices Generated Yet</p>
                        <p className="text-xs text-slate-400 mt-0.5">Billing receipts will show up here as patients register.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b">
                          <tr>
                            <th className="py-3 px-4">Invoice #</th>
                            <th className="py-3 px-4">Patient</th>
                            <th className="py-3 px-4">Ref Doctor</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Mode</th>
                            <th className="py-3 px-4 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map((o, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono font-bold text-slate-700">{o.id}</td>
                              <td className="py-3 px-4 font-medium text-slate-800">{o.patient}</td>
                              <td className="py-3 px-4 text-xs">
                                <span className="font-semibold text-slate-700">{o.doctor || 'Self / Walk-in'}</span>
                                {o.doctorCommission > 0 && (
                                  <span className="block text-[10px] text-purple-600 font-medium">Inc: ₹{o.doctorCommission}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-bold text-emerald-600">₹{o.totalAmount}</td>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-500">UPI / Cash</td>
                              <td className="py-3 px-4 text-right">
                                <button 
                                  onClick={() => setSelectedOrderForReceipt(o)} 
                                  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer inline-flex items-center space-x-1"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  <span>Print Slip</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: LAB SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-base font-bold text-slate-800 border-b pb-3">Laboratory Profile & Multi-Tenant Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Legal Name</label>
                        <input type="text" defaultValue="City Care Pathology & Diagnostics" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">License / NABL Registration</label>
                          <input type="text" defaultValue="NABL-LAB-2026-908" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Central Phone</label>
                          <input type="text" defaultValue="+91 9876543210" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Header Letterhead Note</label>
                        <textarea defaultValue="ISO 15189 Certified Medical Laboratory. All tests verified by MD Pathologist." className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" rows={2} />
                      </div>
                      <button onClick={() => alert('Settings Saved Successfully!')} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition cursor-pointer">
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* DANGER ZONE: RESET ALL DATA */}
                  <div className="bg-rose-50/70 p-6 rounded-xl border border-rose-200 shadow-sm space-y-3">
                    <div className="flex items-center space-x-2 text-rose-700">
                      <AlertTriangle className="h-5 w-5" />
                      <h4 className="font-bold text-sm">Danger Zone: Data Wipe & Clean State</h4>
                    </div>
                    <p className="text-xs text-rose-600 leading-relaxed">
                      Wipe all test patients, barcode samples, test results, and medical reports from Neon Cloud Database and frontend state to start 100% empty from scratch.
                    </p>
                    <button 
                      onClick={handleResetDatabase}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clean & Empty All Database Records</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* NEW PATIENT MODAL POPUP */}
      <NewPatientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientRegistered={handlePatientRegistered}
      />

      {/* OFFICIAL MEDICAL REPORT MODAL (PDF PREVIEW & DOWNLOAD) */}
      <ReportModal 
        isOpen={!!selectedOrderForReport}
        onClose={() => setSelectedOrderForReport(null)}
        order={selectedOrderForReport}
      />

      {/* THERMAL BILLING RECEIPT MODAL (80mm SLIP) */}
      <ThermalReceiptModal 
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        order={selectedOrderForReceipt}
      />

      {/* ROLE-BASED LOGIN & STAFF SWITCHER MODAL */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(staff) => {
          setCurrentUser(staff);
          if (!staff.allowedTabs.includes(activeTab)) {
            setActiveTab(staff.allowedTabs[0] || 'dashboard');
          }
        }}
      />

      {/* WHATSAPP & SMS DISPATCH MODAL */}
      <WhatsAppModal 
        isOpen={!!selectedOrderForWhatsApp}
        onClose={() => setSelectedOrderForWhatsApp(null)}
        order={selectedOrderForWhatsApp}
      />

    </div>
  );
}

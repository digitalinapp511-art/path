import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  FlaskConical, 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2, 
  Mail, 
  Key, 
  FileCheck,
  Activity,
  CreditCard,
  Package,
  Sparkles,
  QrCode,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { StaffUser, mapRoleToStaffConfig, STAFF_ACCOUNTS } from './LoginModal';

interface StaffManagementViewProps {
  currentUser: StaffUser;
  onOpenRegisterModal: () => void;
  onSelectUser: (user: StaffUser) => void;
}

export default function StaffManagementView({ 
  currentUser, 
  onOpenRegisterModal,
  onSelectUser 
}: StaffManagementViewProps) {
  const [staffList, setStaffList] = useState<StaffUser[]>(STAFF_ACCOUNTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/staff`);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          const mapped = users.map((u: any) => 
            mapRoleToStaffConfig(u.role, u.name, u.email, u.id, u.signatureUrl)
          );
          setStaffList(mapped);
        }
      }
    } catch (e) {
      console.log('Error fetching staff accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  const doctors = staffList.filter(s => s.role === 'PATHOLOGIST');
  const techs = staffList.filter(s => s.role === 'TECHNICIAN');
  const receptionists = staffList.filter(s => s.role === 'RECEPTIONIST');
  const admins = staffList.filter(s => s.role === 'LAB_ADMIN' || s.role === 'SUPER_ADMIN');

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Clinical Governance & Role-Based Access Control</span>
          </div>
          <h2 className="text-xl font-bold">Staff Directory & User Management</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Doctors (Pathologists), Lab Technicians, Receptionists, aur Admins ke accounts yahan manage hote hain. Har role ko uske medical duties ke mutabik strict access permissions milti hain.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchStaff}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            title="Refresh Staff List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-600/30 transition flex items-center space-x-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Register New Staff / Doctor</span>
          </button>
        </div>
      </div>

      {/* Role Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Doctors / Pathologists</p>
            <h3 className="text-xl font-bold text-slate-900">{doctors.length}</h3>
            <p className="text-[10px] text-emerald-600 font-medium">Verify & Sign Reports</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Lab Technicians</p>
            <h3 className="text-xl font-bold text-slate-900">{techs.length}</h3>
            <p className="text-[10px] text-purple-600 font-medium">Test Readings & Analyzer</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Reception Executives</p>
            <h3 className="text-xl font-bold text-slate-900">{receptionists.length}</h3>
            <p className="text-[10px] text-blue-600 font-medium">Registration & Invoices</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Lab Administrators</p>
            <h3 className="text-xl font-bold text-slate-900">{admins.length}</h3>
            <p className="text-[10px] text-slate-600 font-medium">Full Lab Management</p>
          </div>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Staff Members Directory</h3>
            <p className="text-xs text-slate-500">Neon PostgreSQL Cloud Database me saved verified staff accounts</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">
            Total Staff: {staffList.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Official Email / Login ID</th>
                <th className="px-5 py-3.5">Digital Signature / Reg</th>
                <th className="px-5 py-3.5">Access Permissions</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((staff) => {
                const Icon = staff.icon || Users;
                const isCurrent = currentUser.id === staff.id;

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`h-9 w-9 rounded-xl ${staff.color || 'bg-slate-800'} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{staff.name}</p>
                          <p className="text-[11px] text-slate-500">{staff.title}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${staff.badge || 'bg-slate-100 text-slate-700'}`}>
                        {staff.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-600">
                      {staff.email}
                    </td>

                    <td className="px-5 py-4">
                      {staff.signatureUrl ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{staff.signatureUrl}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A (Standard Role)</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {staff.allowedTabs.map(tab => (
                          <span key={tab} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {tab}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isCurrent ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Current Session</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            localStorage.setItem('plms_current_user', JSON.stringify(staff));
                            onSelectUser(staff);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-slate-700 font-semibold text-xs transition cursor-pointer"
                        >
                          Switch Role →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Access Matrix (Educational / Client Explanation) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-800">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-sm">Clinical Governance: Medical Access Matrix</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold">
              <Stethoscope className="h-4 w-4" />
              <span>Doctor / Pathologist Role</span>
            </div>
            <p className="text-slate-600">
              NABH guidelines ke mutabik doctor ko test results ki clinical accuracy verify karni hoti hai. AI diagnosis approve karna aur digital signature ke sath patient report issue karna doctor ka sole right hai.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700">
              ✓ Approval & Sign-Off &bull; AI Assistant &bull; Diagnostic Reports
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2">
            <div className="flex items-center space-x-2 text-purple-800 font-bold">
              <FlaskConical className="h-4 w-4" />
              <span>Lab Technician Role</span>
            </div>
            <p className="text-slate-600">
              Technician samples ko receive karta hai, analyzer par run karta hai, machine readings aur qualitative results (Negative/Positive) enter karta hai, aur reagent inventory manage karta hai.
            </p>
            <div className="text-[11px] font-semibold text-purple-700">
              ✓ Sample Collection &bull; Result Entry &bull; Reagents Stock
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
            <div className="flex items-center space-x-2 text-blue-800 font-bold">
              <Users className="h-4 w-4" />
              <span>Receptionist Role</span>
            </div>
            <p className="text-slate-600">
              Front desk executive naye patient ka registration karta hai, barcode slip print karta hai, payment collect karta hai, thermal receipt issue karta hai, aur patient ko WhatsApp par report send karta hai.
            </p>
            <div className="text-[11px] font-semibold text-blue-700">
              ✓ Patient Registration &bull; Billing &bull; WhatsApp Delivery
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

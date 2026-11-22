import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  FlaskConical, 
  Stethoscope, 
  Users, 
  Building2,
  X,
  Lock
} from 'lucide-react';

export interface StaffUser {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'LAB_ADMIN' | 'PATHOLOGIST' | 'TECHNICIAN' | 'RECEPTIONIST';
  email: string;
  title: string;
  color: string;
  badge: string;
  icon: any;
  allowedTabs: string[];
}

export const STAFF_ACCOUNTS: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Dr. Rajesh Pathak',
    role: 'PATHOLOGIST',
    email: 'pathologist@citypathlab.com',
    title: 'M.D. (Pathology) | Chief Consultant',
    color: 'bg-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Stethoscope,
    allowedTabs: ['dashboard', 'pathologist', 'reports', 'ai-assistant']
  },
  {
    id: 'staff-2',
    name: 'Sunil Verma',
    role: 'TECHNICIAN',
    email: 'tech@citypathlab.com',
    title: 'Senior Lab Analyst (Hematology/Biochem)',
    color: 'bg-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: FlaskConical,
    allowedTabs: ['dashboard', 'samples', 'technician', 'inventory', 'ai-assistant']
  },
  {
    id: 'staff-3',
    name: 'Pooja Sharma',
    role: 'RECEPTIONIST',
    email: 'reception@citypathlab.com',
    title: 'Front Desk & Billing Executive',
    color: 'bg-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Users,
    allowedTabs: ['dashboard', 'patients', 'samples', 'billing', 'ai-assistant']
  },
  {
    id: 'staff-4',
    name: 'Admin Manager',
    role: 'LAB_ADMIN',
    email: 'admin@citypathlab.com',
    title: 'Laboratory Director / General Manager',
    color: 'bg-slate-900',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Building2,
    allowedTabs: ['dashboard', 'patients', 'samples', 'technician', 'pathologist', 'inventory', 'doctors', 'billing', 'settings', 'ai-assistant']
  }
];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffUser;
  onSelectUser: (user: StaffUser) => void;
}

export default function LoginModal({ isOpen, onClose, currentUser, onSelectUser }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-400">Select active staff account to switch roles & permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Staff Cards List */}
        <div className="p-6 space-y-3 bg-slate-50 max-h-[75vh] overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Available Staff Profiles</p>
          
          {STAFF_ACCOUNTS.map((staff) => {
            const Icon = staff.icon;
            const isSelected = currentUser.id === staff.id;

            return (
              <div 
                key={staff.id}
                onClick={() => {
                  onSelectUser(staff);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between bg-white shadow-sm hover:shadow ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-3 rounded-xl text-white ${staff.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{staff.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${staff.badge}`}>
                        {staff.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{staff.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{staff.email}</p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="flex items-center space-x-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 group-hover:text-slate-600">
                    Switch →
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>SOP Standard: Medical access strictly gated by role</span>
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

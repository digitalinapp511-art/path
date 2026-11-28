import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  FlaskConical, 
  Stethoscope, 
  Users, 
  Building2,
  X,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

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
  signatureUrl?: string;
}

export function mapRoleToStaffConfig(
  role: string, 
  name: string, 
  email: string, 
  id: string, 
  signatureUrl?: string | null, 
  customTitle?: string
): StaffUser {
  switch (role) {
    case 'PATHOLOGIST':
      return {
        id,
        name,
        role: 'PATHOLOGIST',
        email,
        title: customTitle || 'M.D. (Pathology) | Chief Consultant',
        color: 'bg-emerald-600',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Stethoscope,
        allowedTabs: ['dashboard', 'pathologist', 'reports', 'ai-assistant'],
        signatureUrl: signatureUrl || undefined
      };
    case 'TECHNICIAN':
      return {
        id,
        name,
        role: 'TECHNICIAN',
        email,
        title: customTitle || 'Senior Lab Analyst (Hematology/Biochem)',
        color: 'bg-purple-600',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: FlaskConical,
        allowedTabs: ['dashboard', 'samples', 'technician', 'inventory', 'ai-assistant']
      };
    case 'RECEPTIONIST':
      return {
        id,
        name,
        role: 'RECEPTIONIST',
        email,
        title: customTitle || 'Front Desk & Billing Executive',
        color: 'bg-blue-600',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Users,
        allowedTabs: ['dashboard', 'patients', 'samples', 'billing', 'ai-assistant']
      };
    case 'LAB_ADMIN':
    case 'SUPER_ADMIN':
    default:
      return {
        id,
        name,
        role: 'LAB_ADMIN',
        email,
        title: customTitle || 'Laboratory Director / General Manager',
        color: 'bg-slate-900',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
        icon: Building2,
        allowedTabs: ['dashboard', 'patients', 'samples', 'technician', 'pathologist', 'inventory', 'doctors', 'billing', 'staff', 'settings', 'ai-assistant']
      };
  }
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
    allowedTabs: ['dashboard', 'pathologist', 'reports', 'ai-assistant'],
    signatureUrl: 'DR_PATHAK_MD'
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
    allowedTabs: ['dashboard', 'patients', 'samples', 'technician', 'pathologist', 'inventory', 'doctors', 'billing', 'staff', 'settings', 'ai-assistant']
  }
];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffUser | null;
  onSelectUser: (user: StaffUser) => void;
  initialTab?: 'switch' | 'login' | 'register';
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSelectUser, 
  initialTab = 'switch' 
}: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'switch' | 'login' | 'register'>(initialTab);
  const [staffList, setStaffList] = useState<StaffUser[]>(STAFF_ACCOUNTS);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'PATHOLOGIST' | 'TECHNICIAN' | 'RECEPTIONIST' | 'LAB_ADMIN'>('PATHOLOGIST');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regSignature, setRegSignature] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchLiveStaff();
    }
  }, [isOpen, initialTab]);

  const fetchLiveStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/staff`);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          const mapped = users.map((u: any) => mapRoleToStaffConfig(u.role, u.name, u.email, u.id, u.signatureUrl));
          setStaffList(mapped);
        }
      }
    } catch (e) {
      console.log('Using default staff list');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Login failed. Please check your credentials.');
        setIsLoggingIn(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('plms_auth_token', data.token);
      }

      const mapped = mapRoleToStaffConfig(
        data.user.role, 
        data.user.name, 
        data.user.email, 
        data.user.id, 
        data.user.signatureUrl
      );
      
      localStorage.setItem('plms_current_user', JSON.stringify(mapped));
      onSelectUser(mapped);
      onClose();
    } catch (err) {
      setLoginError('Cannot connect to server. Check your network connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickCredential = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please fill all mandatory fields (Name, Email, Password).');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }

    setIsRegistering(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
          title: regTitle.trim() || undefined,
          signatureUrl: regSignature.trim() || (regRole === 'PATHOLOGIST' ? `DR_${regName.replace(/\s+/g, '_').toUpperCase()}` : undefined)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegError(data.error || 'Failed to create staff account.');
        setIsRegistering(false);
        return;
      }

      setRegSuccess(`Account for ${regName} created successfully! Logging you in...`);
      
      if (data.token) {
        localStorage.setItem('plms_auth_token', data.token);
      }

      const mapped = mapRoleToStaffConfig(
        data.user.role,
        data.user.name,
        data.user.email,
        data.user.id,
        data.user.signatureUrl,
        regTitle
      );

      localStorage.setItem('plms_current_user', JSON.stringify(mapped));

      // Refresh staff list
      await fetchLiveStaff();

      setTimeout(() => {
        onSelectUser(mapped);
        onClose();
      }, 1000);

    } catch (err) {
      setRegError('Server connection error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-md">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center space-x-2">
                <span>PLMS Laboratory Access Portal</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded-full font-semibold">
                  RBAC Secured
                </span>
              </h3>
              <p className="text-xs text-slate-400">Doctor (Pathologist), Technician, Receptionist & Admin Login</p>
            </div>
          </div>
          {currentUser && (
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'switch'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>⚡ 1-Click Quick Demo</span>
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Staff Login</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="h-4 w-4 text-emerald-600" />
            <span>➕ New Account</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-slate-50 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: QUICK SWITCH (DEMO FRIENDLY) */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Select Staff Account to Login
                </p>
                {isLoadingStaff && (
                  <span className="text-[10px] text-blue-600 flex items-center space-x-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Syncing DB...</span>
                  </span>
                )}
              </div>

              {staffList.map((staff) => {
                const Icon = staff.icon || Users;
                const isSelected = currentUser?.id === staff.id;

                return (
                  <div 
                    key={staff.id}
                    onClick={() => {
                      localStorage.setItem('plms_current_user', JSON.stringify(staff));
                      onSelectUser(staff);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between bg-white shadow-sm hover:shadow-md ${
                      isSelected 
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20' 
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`p-3 rounded-xl text-white ${staff.color || 'bg-slate-800'} shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">{staff.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${staff.badge || 'bg-slate-100 text-slate-700'}`}>
                            {staff.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{staff.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{staff.email}</p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center space-x-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50/60 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition">
                        Login →
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('register')}
                  className="w-full py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>+ Create New Doctor, Technician or Receptionist Account</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STAFF LOGIN (EMAIL + PASSWORD) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center pb-1">
                <h4 className="text-sm font-bold text-slate-800">Secure Staff Sign-In</h4>
                <p className="text-xs text-slate-500">Sign in with your official laboratory staff credentials</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address / Username
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. pathologist@citypathlab.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Credentials Quick Fill */}
              <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200">
                <p className="text-[11px] font-bold text-slate-600 mb-2">⚡ 1-Click Fill Default Passwords (Demo):</p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickCredential('pathologist@citypathlab.com', 'path@123')}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 text-left font-medium text-slate-700 hover:text-emerald-700 transition"
                  >
                    🩺 <span className="font-bold">Doctor:</span> path@123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCredential('tech@citypathlab.com', 'tech@123')}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-purple-400 text-left font-medium text-slate-700 hover:text-purple-700 transition"
                  >
                    🧪 <span className="font-bold">Tech:</span> tech@123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCredential('reception@citypathlab.com', 'rec@123')}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 text-left font-medium text-slate-700 hover:text-blue-700 transition"
                  >
                    📋 <span className="font-bold">Reception:</span> rec@123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCredential('admin@citypathlab.com', 'admin@123')}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-400 text-left font-medium text-slate-700 hover:text-slate-900 transition"
                  >
                    🛡️ <span className="font-bold">Admin:</span> admin@123
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Sign In to Laboratory Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center pb-1">
                <h4 className="text-sm font-bold text-slate-800">Register New Staff Account</h4>
                <p className="text-xs text-slate-500">Create a secure login for Doctor, Technician, Receptionist or Admin</p>
              </div>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Staff Role & Clinical Access Level *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PATHOLOGIST', label: 'Doctor (Pathologist)', desc: 'Signs reports & clinical AI', icon: Stethoscope, color: 'text-emerald-600 border-emerald-200 bg-emerald-50/40' },
                    { id: 'TECHNICIAN', label: 'Lab Technician', desc: 'Analyzers, test readings & stock', icon: FlaskConical, color: 'text-purple-600 border-purple-200 bg-purple-50/40' },
                    { id: 'RECEPTIONIST', label: 'Receptionist', desc: 'Patient register & billing', icon: Users, color: 'text-blue-600 border-blue-200 bg-blue-50/40' },
                    { id: 'LAB_ADMIN', label: 'Lab Administrator', desc: 'Full control & configurations', icon: Building2, color: 'text-slate-800 border-slate-300 bg-slate-100/50' }
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = regRole === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          setRegRole(r.id as any);
                          if (r.id === 'PATHOLOGIST' && !regTitle) setRegTitle('M.D. (Pathology)');
                          if (r.id === 'TECHNICIAN' && !regTitle) setRegTitle('Senior Lab Technician (DMLT)');
                          if (r.id === 'RECEPTIONIST' && !regTitle) setRegTitle('Billing & Reception Executive');
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition text-left ${
                          isSelected 
                            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-4 w-4 ${r.color.split(' ')[0]}`} />
                          <span className="text-xs font-bold text-slate-800">{r.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={regRole === 'PATHOLOGIST' ? 'e.g. Dr. Manish Sharma' : 'e.g. Ramesh Kumar'}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Degree
                  </label>
                  <input
                    type="text"
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder={regRole === 'PATHOLOGIST' ? 'MBBS, MD (Pathology)' : 'DMLT / B.Sc MLT'}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="doctor@citypathlab.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Pathologist Digital Signature Code */}
              {regRole === 'PATHOLOGIST' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Doctor Digital Signature Code (Appears on Official PDF Reports)
                  </label>
                  <input
                    type="text"
                    value={regSignature}
                    onChange={(e) => setRegSignature(e.target.value)}
                    placeholder="e.g. DR_MANISH_MD_REG_87654"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    This digital ID will automatically brand signed reports with QR verification.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Registering Account in Database...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account & Sign In Directly</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>SOP Standard: Medical access strictly gated by role</span>
          </span>
          {currentUser && (
            <button 
              onClick={onClose} 
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  UserCheck,
  FlaskConical,
  Stethoscope,
  Users,
  Building2,
  Syringe,
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
  Sparkles,
  BadgeCheck,
  Clock,
  Phone,
  Briefcase
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import {
  mapEmployeeToUser,
  setAuthSession,
  type StaffUser,
  type AttendanceStatus
} from '../utils/auth';

export type { StaffUser };

const DEMO_PASSWORDS: Record<string, string> = {
  'pathologist@citypathlab.com': 'path@123',
  'tech@citypathlab.com': 'tech@123',
  'reception@citypathlab.com': 'rec@123',
  'admin@citypathlab.com': 'admin@123'
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffUser | null;
  onSelectUser: (user: StaffUser) => void;
  onEmployeeCreated?: () => void;
  initialTab?: 'switch' | 'login' | 'register' | 'profile';
}

export default function LoginModal({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onEmployeeCreated,
  initialTab = 'switch'
}: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'switch' | 'login' | 'register' | 'profile'>(initialTab);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Switch prompt state
  const [pendingSwitchUser, setPendingSwitchUser] = useState<StaffUser | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'PATHOLOGIST' | 'TECHNICIAN' | 'RECEPTIONIST' | 'PHLEBOTOMIST' | 'LAB_ADMIN'>('TECHNICIAN');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTitle, setRegTitle] = useState('Senior Lab Analyst (DMLT)');
  const [regDepartment, setRegDepartment] = useState('Hematology & Biochemistry Lab');
  const [regPhone, setRegPhone] = useState('');
  const [regShift, setRegShift] = useState('Morning (08:00 AM - 04:00 PM)');
  const [regSalary, setRegSalary] = useState('32000');
  const [regSignature, setRegSignature] = useState('');
  const [switchAfterCreate, setSwitchAfterCreate] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // My Profile & Change Password States
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const isCallerAdmin = currentUser?.role === 'LAB_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLoginError('');
      setRegError('');
      setRegSuccess('');
      setProfileMsg('');
      setProfileErr('');
      setPendingSwitchUser(null);
      setSwitchPassword('');
      fetchLiveStaff();
    }
  }, [isOpen, initialTab]);

  const fetchLiveStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees`);
      if (Array.isArray(res.data)) {
        setStaffList(res.data.map((u: any) => mapEmployeeToUser(u)));
      }
    } catch (e) {
      console.log('Could not load employees list:', e);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const authenticateAndSwitch = async (emailVal: string, passwordVal: string) => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: emailVal.trim(),
        password: passwordVal
      });
      const data = res.data;
      if (!data.success || !data.token || !data.user) {
        setLoginError(data.error || 'Authentication failed.');
        return;
      }
      const mapped = mapEmployeeToUser(data.user);
      setAuthSession(data.token, mapped);
      onSelectUser(mapped);
      onClose();
    } catch (err: any) {
      setLoginError(err?.response?.data?.error || 'Authentication failed. Verify email & password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticateAndSwitch(loginEmail, loginPassword);
  };

  const handleRolePreset = (role: 'PATHOLOGIST' | 'TECHNICIAN' | 'RECEPTIONIST' | 'PHLEBOTOMIST' | 'LAB_ADMIN') => {
    setRegRole(role);
    if (role === 'PATHOLOGIST') {
      setRegTitle('MBBS, MD (Pathology)');
      setRegDepartment('Pathology & Reporting');
      setRegSalary('120000');
    } else if (role === 'TECHNICIAN') {
      setRegTitle('Senior Lab Analyst (DMLT)');
      setRegDepartment('Hematology & Biochemistry Lab');
      setRegSalary('32000');
    } else if (role === 'RECEPTIONIST') {
      setRegTitle('Front Desk & Billing Executive');
      setRegDepartment('Front Desk & Billing');
      setRegSalary('22000');
    } else if (role === 'PHLEBOTOMIST') {
      setRegTitle('Certified Phlebotomist');
      setRegDepartment('Sample Collection & Home Visit');
      setRegSalary('20000');
    } else {
      setRegTitle('Laboratory Director / HR Manager');
      setRegDepartment('Administration & HR');
      setRegSalary('75000');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please fill Full Name, Email, and Password.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }

    setIsRegistering(true);
    try {
      const endpoint = isCallerAdmin ? `${API_BASE_URL}/api/employees` : `${API_BASE_URL}/api/auth/register-staff`;
      const res = await axios.post(endpoint, {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        designation: regTitle.trim(),
        department: regDepartment.trim(),
        phone: regPhone.trim() || '+91 98000 00000',
        shift: regShift,
        salary: parseFloat(regSalary) || 25000,
        signatureUrl:
          regRole === 'PATHOLOGIST'
            ? regSignature.trim() || `DR_${regName.trim().replace(/\s+/g, '_').toUpperCase()}`
            : undefined
      });

      const data = res.data;
      if (!data.success || !data.user) {
        setRegError(data.error || 'Failed to register employee.');
        return;
      }

      const mapped = mapEmployeeToUser(data.user, regTitle);
      setRegSuccess(`Employee ${data.user.name} (${data.user.empCode}) created successfully!`);

      // Clear form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegPhone('');
      setRegSignature('');

      await fetchLiveStaff();
      if (onEmployeeCreated) onEmployeeCreated();

      if ((!isCallerAdmin || switchAfterCreate) && data.token) {
        setAuthSession(data.token, mapped);
        setTimeout(() => {
          onSelectUser(mapped);
          onClose();
        }, 800);
      } else {
        setTimeout(() => {
          onClose();
        }, 900);
      }
    } catch (err: any) {
      setRegError(err?.response?.data?.error || 'Server error creating employee.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAttendanceChange = async (attendanceStatus: AttendanceStatus) => {
    if (!currentUser) return;
    setIsUpdatingProfile(true);
    setProfileErr('');
    setProfileMsg('');
    try {
      const res = await axios.put(`${API_BASE_URL}/api/employees/${currentUser.id}/attendance`, {
        attendanceStatus
      });
      if (res.data?.user) {
        const updated = mapEmployeeToUser(res.data.user);
        localStorage.setItem('plms_current_user', JSON.stringify(updated));
        onSelectUser(updated);
        setProfileMsg(`Duty status updated to ${attendanceStatus.replace('_', ' ')}`);
      }
    } catch (err: any) {
      setProfileErr(err?.response?.data?.error || 'Could not update duty status');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSelfPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileErr('');
    setProfileMsg('');
    if (newPwd.length < 4) {
      setProfileErr('New password must be at least 4 characters long.');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/employees/${currentUser.id}/reset-password`, {
        currentPassword: currentPwd,
        newPassword: newPwd
      });
      setProfileMsg(res.data?.message || 'Password updated successfully!');
      setCurrentPwd('');
      setNewPwd('');
    } catch (err: any) {
      setProfileErr(err?.response?.data?.error || 'Failed to update password.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-md">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center space-x-2">
                <span>Employee Auth &amp; Access Portal</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-semibold">
                  HMAC-SHA256 Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400">Authenticate, register new employees, or manage your shift &amp; password</p>
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
            className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'switch'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Switch Employee</span>
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-emerald-600" />
            <span>+ Add Employee</span>
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>My ID &amp; Security</span>
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-slate-50 max-h-[75vh] overflow-y-auto">

          {/* TAB 1: AUTHENTICATED EMPLOYEE SWITCH */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verified Lab Employees (Click to Authenticate)
                </p>
                {isLoadingStaff && (
                  <span className="text-[10px] text-blue-600 flex items-center space-x-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading...</span>
                  </span>
                )}
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {staffList.map((staff) => {
                const Icon = staff.icon || Users;
                const isSelected = currentUser?.id === staff.id;
                const isSuspended = staff.isActive === false;
                const demoPwd = DEMO_PASSWORDS[staff.email];
                const isPromptOpen = pendingSwitchUser?.id === staff.id;

                return (
                  <div
                    key={staff.id}
                    className={`p-3.5 rounded-xl border transition bg-white shadow-sm ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : isSuspended
                        ? 'border-rose-200 bg-rose-50/30 opacity-75'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl text-white shrink-0 ${staff.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5">
                            {staff.empCode && (
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {staff.empCode}
                              </span>
                            )}
                            <h4 className="font-bold text-slate-900 text-sm truncate">{staff.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${staff.badge}`}>
                              {staff.role}
                            </span>
                            {isSuspended && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                SUSPENDED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{staff.designation || staff.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{staff.email}</p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center space-x-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      ) : isSuspended ? (
                        <span className="text-[11px] font-bold text-rose-600 shrink-0">Blocked</span>
                      ) : (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {demoPwd && (
                            <button
                              type="button"
                              disabled={isLoggingIn}
                              onClick={() => authenticateAndSwitch(staff.email, demoPwd)}
                              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                              title={`Authenticate using demo password (${demoPwd})`}
                            >
                              ⚡ Demo Auth
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPendingSwitchUser(isPromptOpen ? null : staff);
                              setSwitchPassword('');
                              setLoginError('');
                            }}
                            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            Password →
                          </button>
                        </div>
                      )}
                    </div>

                    {isPromptOpen && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          authenticateAndSwitch(staff.email, switchPassword);
                        }}
                        className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2"
                      >
                        <input
                          type="password"
                          required
                          autoFocus
                          value={switchPassword}
                          onChange={(e) => setSwitchPassword(e.target.value)}
                          placeholder={`Enter password for ${staff.name}...`}
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isLoggingIn}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          {isLoggingIn ? 'Verifying...' : 'Verify & Switch'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CREDENTIAL LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center pb-1">
                <h4 className="text-sm font-bold text-slate-800">Sign In with Employee Credentials</h4>
                <p className="text-xs text-slate-500">Strict server-side PBKDF2 &amp; HMAC authentication</p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Email *</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter employee password"
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

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                <p className="text-[11px] font-bold text-slate-600 mb-2">⚡ Fill Demo Credentials:</p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {Object.entries(DEMO_PASSWORDS).map(([em, pwd]) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setLoginEmail(em);
                        setLoginPassword(pwd);
                        setLoginError('');
                      }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 text-left font-medium text-slate-700 cursor-pointer truncate"
                    >
                      <span className="font-bold">{em.split('@')[0]}:</span> {pwd}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Authenticate &amp; Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: ADD / REGISTER NEW EMPLOYEE */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Add New Employee to Directory</h4>
                <p className="text-xs text-slate-500">Creates login credentials, RBAC permissions, and HR profile</p>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role &amp; Access Level *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'PATHOLOGIST', label: 'Doctor', icon: Stethoscope, color: 'text-emerald-600' },
                    { id: 'TECHNICIAN', label: 'Lab Tech', icon: FlaskConical, color: 'text-purple-600' },
                    { id: 'RECEPTIONIST', label: 'Receptionist', icon: Users, color: 'text-blue-600' },
                    { id: 'PHLEBOTOMIST', label: 'Phlebotomist', icon: Syringe, color: 'text-amber-600' },
                    ...(isCallerAdmin ? [{ id: 'LAB_ADMIN', label: 'Lab Admin / HR', icon: Building2, color: 'text-slate-800' }] : [])
                  ].map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRolePreset(r.id as any)}
                        className={`p-2 rounded-xl border text-left transition flex items-center space-x-2 cursor-pointer ${
                          regRole === r.id
                            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${r.color}`} />
                        <span className="text-xs font-bold text-slate-800">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Amit Verma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Shift</label>
                  <select
                    value={regShift}
                    onChange={(e) => setRegShift(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>Morning (08:00 AM - 04:00 PM)</option>
                    <option>Evening (02:00 PM - 10:00 PM)</option>
                    <option>Night (10:00 PM - 06:00 AM)</option>
                    <option>Full Day (09:00 AM - 06:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={regSalary}
                    onChange={(e) => setRegSalary(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Email *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="amit@citypathlab.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 chars"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {regRole === 'PATHOLOGIST' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Digital Signature Code</label>
                  <input
                    type="text"
                    value={regSignature}
                    onChange={(e) => setRegSignature(e.target.value)}
                    placeholder="e.g. DR_AMIT_MD_REG_87654"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {isCallerAdmin && (
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={switchAfterCreate}
                    onChange={(e) => setSwitchAfterCreate(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>Log out of Admin and sign in immediately as this new employee</span>
                </label>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Employee to Database...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>{isCallerAdmin && !switchAfterCreate ? 'Save Employee to Directory' : 'Create Account & Sign In'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 4: MY EMPLOYEE ID CARD & PASSWORD */}
          {activeTab === 'profile' && currentUser && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-12 w-12 rounded-2xl ${currentUser.color} text-white flex items-center justify-center font-bold text-base shadow`}>
                      {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900">{currentUser.name}</h4>
                        {currentUser.empCode && (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {currentUser.empCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{currentUser.designation || currentUser.title}</p>
                      <p className="text-[11px] font-mono text-slate-400">{currentUser.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${currentUser.badge}`}>
                    {currentUser.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    <span>{currentUser.department || 'Pathology Lab'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{currentUser.shift || 'Morning Shift'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{currentUser.phone || '+91 —'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-semibold text-emerald-700">Authenticated Session</span>
                  </div>
                </div>

                {/* Duty / Attendance Quick Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">My Shift Attendance Status:</p>
                  <div className="flex gap-2">
                    {(['ON_DUTY', 'ON_LEAVE', 'OFF_SHIFT'] as AttendanceStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={isUpdatingProfile}
                        onClick={() => handleAttendanceChange(st)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                          currentUser.attendanceStatus === st
                            ? st === 'ON_DUTY'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : st === 'ON_LEAVE'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-slate-700 text-white border-slate-700'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {profileMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{profileMsg}</span>
                </div>
              )}

              {profileErr && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileErr}</span>
                </div>
              )}

              {/* Change Own Password */}
              <form onSubmit={handleSelfPasswordReset} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h5 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                  <span>Change My Account Password</span>
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {!isCallerAdmin && (
                    <input
                      type="password"
                      required
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      placeholder="Current password"
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                  <input
                    type="password"
                    required
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="New password (min 4 chars)"
                    className={`px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      isCallerAdmin ? 'col-span-2' : ''
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  {isUpdatingProfile ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Authenticated RBAC Enforcement Active</span>
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

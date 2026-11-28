import React, { useState } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  FlaskConical,
  Stethoscope,
  Users,
  Building2,
  Syringe,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  Phone,
  Clock,
  Briefcase
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import {
  mapEmployeeToUser,
  setAuthSession,
  type StaffUser
} from '../utils/auth';

interface EmployeeAuthScreenProps {
  onAuthenticated: (user: StaffUser) => void;
  sessionNotice?: string;
}

const DEMO_ACCOUNTS = [
  {
    label: 'Lab Admin / HR Manager',
    name: 'Admin Manager',
    email: 'admin@citypathlab.com',
    pass: 'admin@123',
    role: 'LAB_ADMIN',
    desc: 'Employee Management, Payroll, Settings & Full Lab',
    icon: Building2,
    accent: 'border-slate-300 bg-slate-800/60 hover:bg-slate-800 text-white'
  },
  {
    label: 'Doctor / Pathologist',
    name: 'Dr. Rajesh Pathak',
    email: 'pathologist@citypathlab.com',
    pass: 'path@123',
    role: 'PATHOLOGIST',
    desc: 'Verify Reports, AI Diagnosis & Digital Sign-Off',
    icon: Stethoscope,
    accent: 'border-emerald-500/30 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-100'
  },
  {
    label: 'Lab Technician',
    name: 'Sunil Verma',
    email: 'tech@citypathlab.com',
    pass: 'tech@123',
    role: 'TECHNICIAN',
    desc: 'Sample Processing, Test Results Entry & Reagents',
    icon: FlaskConical,
    accent: 'border-purple-500/30 bg-purple-950/50 hover:bg-purple-900/60 text-purple-100'
  },
  {
    label: 'Receptionist',
    name: 'Pooja Sharma',
    email: 'reception@citypathlab.com',
    pass: 'rec@123',
    role: 'RECEPTIONIST',
    desc: 'Patient Registration, Barcodes, Billing & WhatsApp',
    icon: Users,
    accent: 'border-blue-500/30 bg-blue-950/50 hover:bg-blue-900/60 text-blue-100'
  }
];

export default function EmployeeAuthScreen({
  onAuthenticated,
  sessionNotice
}: EmployeeAuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(sessionNotice || '');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'PATHOLOGIST' | 'TECHNICIAN' | 'RECEPTIONIST' | 'PHLEBOTOMIST'>('TECHNICIAN');
  const [regDesignation, setRegDesignation] = useState('Senior Lab Analyst (DMLT)');
  const [regDepartment, setRegDepartment] = useState('Hematology & Biochemistry Lab');
  const [regPhone, setRegPhone] = useState('');
  const [regShift, setRegShift] = useState('Morning (08:00 AM - 04:00 PM)');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSignature, setRegSignature] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: loginEmail.trim(),
        password: loginPass
      });

      const data = res.data;
      if (!data.success || !data.token || !data.user) {
        setLoginError(data.error || 'Authentication failed.');
        return;
      }

      const mappedUser = mapEmployeeToUser(data.user);
      setAuthSession(data.token, mappedUser);
      onAuthenticated(mappedUser);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Unable to authenticate with server. Please check credentials.';
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleDemoQuickSignIn = async (demoEmail: string, demoPass: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    await performLogin(demoEmail, demoPass);
  };

  const handleRolePreset = (role: 'PATHOLOGIST' | 'TECHNICIAN' | 'RECEPTIONIST' | 'PHLEBOTOMIST') => {
    setRegRole(role);
    if (role === 'PATHOLOGIST') {
      setRegDesignation('MBBS, MD (Pathology)');
      setRegDepartment('Pathology & Reporting');
    } else if (role === 'TECHNICIAN') {
      setRegDesignation('Senior Lab Analyst (DMLT)');
      setRegDepartment('Hematology & Biochemistry Lab');
    } else if (role === 'RECEPTIONIST') {
      setRegDesignation('Front Desk & Billing Executive');
      setRegDepartment('Front Desk & Billing');
    } else {
      setRegDesignation('Certified Phlebotomist');
      setRegDepartment('Sample Collection & Home Visit');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please fill Full Name, Email Address, and Password.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register-staff`, {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        designation: regDesignation.trim(),
        department: regDepartment.trim(),
        phone: regPhone.trim() || '+91 98000 00000',
        shift: regShift,
        signatureUrl:
          regRole === 'PATHOLOGIST'
            ? regSignature.trim() || `DR_${regName.trim().replace(/\s+/g, '_').toUpperCase()}`
            : undefined
      });

      const data = res.data;
      if (!data.success || !data.token || !data.user) {
        setRegError(data.error || 'Registration failed.');
        return;
      }

      setRegSuccess(`Employee account verified & created (${data.user.empCode})! Signing you in...`);
      const mapped = mapEmployeeToUser(data.user, regDesignation.trim());
      setAuthSession(data.token, mapped);
      setTimeout(() => {
        onAuthenticated(mapped);
      }, 700);
    } catch (err: any) {
      setRegError(err?.response?.data?.error || 'Could not register employee account.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800">
        
        {/* LEFT PANEL: BRANDING, SECURITY & DEMO CREDENTIALS */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-7 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <FlaskConical className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">City Care Pathology</h1>
                <p className="text-xs text-blue-300 font-medium">Employee Management &amp; LIMS Auth Portal</p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Authenticated Employee Access Required</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Patient data, reports, and HR records are protected by HMAC-SHA256 cryptographic tokens, PBKDF2 password verification, and strict Role-Based Access Control (RBAC).
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ⚡ 1-Click Authenticated Demo Sign-In
              </p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={isLoggingIn}
                      onClick={() => handleDemoQuickSignIn(acc.email, acc.pass)}
                      className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between group ${acc.accent}`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-bold truncate">{acc.name}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-mono">
                              {acc.role}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-75 truncate">{acc.desc}</p>
                          <p className="text-[10px] font-mono opacity-60 mt-0.5">
                            {acc.email} &bull; {acc.pass}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold opacity-80 group-hover:translate-x-0.5 transition shrink-0 ml-2">
                        Login →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>● Neon Cloud PostgreSQL</span>
            <span>● Audit Trail Active</span>
          </div>
        </div>

        {/* RIGHT PANEL: LOGIN & NEW EMPLOYEE REGISTRATION */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50 flex flex-col justify-center">
          <div className="flex border border-slate-200 bg-white rounded-xl p-1 mb-6 shadow-sm">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <KeyRound className="h-4 w-4" />
              <span>Employee Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Employee Account</span>
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sign In to Your Employee Workspace</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your verified employee email and password to authenticate.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Employee Email ID *
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@citypathlab.com"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your employee password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating Employee...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Authenticate &amp; Open Dashboard</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-2">
                Note: Suspended or deactivated employee accounts are automatically blocked from logging in.
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Register New Employee Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Onboard a Doctor, Technician, Receptionist, or Phlebotomist with HR profile &amp; login credentials.
                </p>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Employee Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PATHOLOGIST', label: 'Doctor (Pathologist)', icon: Stethoscope, color: 'text-emerald-600' },
                    { id: 'TECHNICIAN', label: 'Lab Technician', icon: FlaskConical, color: 'text-purple-600' },
                    { id: 'RECEPTIONIST', label: 'Receptionist', icon: Users, color: 'text-blue-600' },
                    { id: 'PHLEBOTOMIST', label: 'Phlebotomist', icon: Syringe, color: 'text-amber-600' }
                  ].map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRolePreset(r.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 cursor-pointer ${
                          regRole === r.id
                            ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${r.color}`} />
                        <span className="text-xs font-bold text-slate-800">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Kavita Joshi"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Qualification</label>
                  <div className="relative">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Shift</label>
                  <div className="relative">
                    <Clock className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={regShift}
                      onChange={(e) => setRegShift(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option>Morning (08:00 AM - 04:00 PM)</option>
                      <option>Evening (02:00 PM - 10:00 PM)</option>
                      <option>Night (10:00 PM - 06:00 AM)</option>
                      <option>Full Day (09:00 AM - 06:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="employee@citypathlab.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      placeholder="Min 4 characters"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white pr-8 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Doctor Digital Signature Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={regSignature}
                    onChange={(e) => setRegSignature(e.target.value)}
                    placeholder="e.g. DR_KAVITA_MD_REG_1122"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Verified Employee Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Register Employee &amp; Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

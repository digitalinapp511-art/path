import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Users,
  Stethoscope,
  FlaskConical,
  Building2,
  Syringe,
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  XCircle,
  Search,
  Edit3,
  KeyRound,
  Trash2,
  RefreshCw,
  Clock,
  Phone,
  IndianRupee,
  History,
  ShieldAlert,
  X,
  AlertCircle,
  Ban,
  Power
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import {
  mapEmployeeToUser,
  type StaffUser,
  type AttendanceStatus
} from '../utils/auth';

interface AuditLogEntry {
  id: string;
  userId?: string;
  employeeName: string;
  email: string;
  role?: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface EmployeeManagementViewProps {
  currentUser: StaffUser;
  onOpenRegisterModal: () => void;
  refreshTrigger?: number;
}

export default function EmployeeManagementView({
  currentUser,
  onOpenRegisterModal,
  refreshTrigger = 0
}: EmployeeManagementViewProps) {
  const [subTab, setSubTab] = useState<'directory' | 'audit' | 'matrix'>('directory');
  const [employees, setEmployees] = useState<StaffUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit Employee Modal State
  const [editingEmployee, setEditingEmployee] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'TECHNICIAN',
    designation: '',
    department: '',
    phone: '',
    shift: '',
    salary: '25000',
    joiningDate: '',
    attendanceStatus: 'ON_DUTY' as AttendanceStatus,
    signatureUrl: '',
    isActive: true
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Reset Password Modal State
  const [resetTarget, setResetTarget] = useState<StaffUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResettingPwd, setIsResettingPwd] = useState(false);

  const isAdmin = currentUser.role === 'LAB_ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees`);
      if (Array.isArray(res.data)) {
        setEmployees(res.data.map((u: any) => mapEmployeeToUser(u)));
      }
    } catch (e: any) {
      showFeedback('error', e?.response?.data?.error || 'Failed to load employee records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees/audit-logs`);
      if (Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (e) {
      console.log('Audit log load note:', e);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAuditLogs();
  }, [currentUser.id, refreshTrigger]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (roleFilter !== 'ALL' && emp.role !== roleFilter) return false;
      if (statusFilter === 'ACTIVE' && emp.isActive === false) return false;
      if (statusFilter === 'SUSPENDED' && emp.isActive !== false) return false;
      if (statusFilter === 'ON_DUTY' && emp.attendanceStatus !== 'ON_DUTY') return false;
      if (statusFilter === 'ON_LEAVE' && emp.attendanceStatus !== 'ON_LEAVE') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          (emp.empCode || '').toLowerCase().includes(q) ||
          (emp.department || '').toLowerCase().includes(q) ||
          (emp.phone || '').toLowerCase().includes(q) ||
          (emp.designation || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, roleFilter, statusFilter, searchQuery]);

  // Metrics
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.isActive !== false).length;
  const suspendedCount = employees.length - activeCount;
  const onDutyCount = employees.filter((e) => e.attendanceStatus === 'ON_DUTY' && e.isActive !== false).length;
  const monthlyPayroll = employees
    .filter((e) => e.isActive !== false)
    .reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

  const openEditModal = (emp: StaffUser) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name,
      role: emp.role,
      designation: emp.designation || emp.title || '',
      department: emp.department || '',
      phone: emp.phone || '',
      shift: emp.shift || 'Morning (08:00 AM - 04:00 PM)',
      salary: String(emp.salary ?? 25000),
      joiningDate: emp.joiningDate || '',
      attendanceStatus: emp.attendanceStatus || 'ON_DUTY',
      signatureUrl: emp.signatureUrl || '',
      isActive: emp.isActive !== false
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setIsSavingEdit(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/employees/${editingEmployee.id}`, {
        name: editForm.name.trim(),
        role: editForm.role,
        designation: editForm.designation.trim(),
        department: editForm.department.trim(),
        phone: editForm.phone.trim(),
        shift: editForm.shift,
        salary: parseFloat(editForm.salary) || 0,
        joiningDate: editForm.joiningDate,
        attendanceStatus: editForm.attendanceStatus,
        signatureUrl: editForm.role === 'PATHOLOGIST' ? editForm.signatureUrl.trim() : null,
        isActive: editForm.isActive
      });

      if (res.data?.success) {
        showFeedback('success', `Updated HR & access profile for ${editForm.name}`);
        setEditingEmployee(null);
        await fetchEmployees();
        await fetchAuditLogs();
      }
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.error || 'Failed to update employee');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActiveStatus = async (emp: StaffUser) => {
    const nextActive = emp.isActive === false;
    const actionWord = nextActive ? 'ACTIVATE' : 'SUSPEND';
    if (!window.confirm(`${actionWord} authentication access for ${emp.name} (${emp.empCode})?`)) {
      return;
    }

    try {
      const res = await axios.put(`${API_BASE_URL}/api/employees/${emp.id}`, {
        isActive: nextActive
      });
      if (res.data?.success) {
        showFeedback(
          'success',
          nextActive
            ? `${emp.name}'s account has been ACTIVATED.`
            : `${emp.name}'s account has been SUSPENDED (login blocked).`
        );
        await fetchEmployees();
        await fetchAuditLogs();
      }
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.error || 'Failed to update employee status');
    }
  };

  const handleQuickAttendanceChange = async (emp: StaffUser, nextStatus: AttendanceStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/employees/${emp.id}/attendance`, {
        attendanceStatus: nextStatus
      });
      showFeedback('success', `${emp.name} marked as ${nextStatus.replace('_', ' ')}`);
      await fetchEmployees();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.error || 'Failed to update attendance');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    if (newPasswordInput.length < 4) {
      showFeedback('error', 'Password must be at least 4 characters long');
      return;
    }
    setIsResettingPwd(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/employees/${resetTarget.id}/reset-password`, {
        newPassword: newPasswordInput
      });
      showFeedback('success', res.data?.message || `Password reset for ${resetTarget.name}`);
      setResetTarget(null);
      setNewPasswordInput('');
      await fetchAuditLogs();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.error || 'Password reset failed');
    } finally {
      setIsResettingPwd(false);
    }
  };

  const handleDeleteEmployee = async (emp: StaffUser) => {
    if (
      !window.confirm(
        `⚠️ Permanently delete employee ${emp.name} (${emp.empCode})? Their login access will be permanently removed.`
      )
    ) {
      return;
    }
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/employees/${emp.id}`);
      showFeedback('success', res.data?.message || `Deleted ${emp.name}`);
      await fetchEmployees();
      await fetchAuditLogs();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.error || 'Failed to delete employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Employee Management, HR &amp; Access Control
            </span>
          </div>
          <h2 className="text-xl font-bold">Employee Directory, Payroll &amp; Auth Governance</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Manage all lab doctors, technicians, receptionists, and phlebotomists. Control active login access, work shifts, attendance, payroll, password resets, and security audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => {
              fetchEmployees();
              fetchAuditLogs();
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {isAdmin && (
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-600/30 transition flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Add New Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Employees</p>
            <h3 className="text-xl font-bold text-slate-900">
              {loading && employees.length === 0 ? '...' : totalCount}
            </h3>
            <p className="text-[10px] text-blue-600 font-medium">Registered Staff Profiles</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Authenticated &amp; Active</p>
            <h3 className="text-xl font-bold text-slate-900">
              {loading && employees.length === 0 ? '...' : activeCount}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              {suspendedCount > 0 ? (
                <span className="text-rose-600 font-bold">{suspendedCount} Suspended</span>
              ) : (
                'All accounts authorized'
              )}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">On Duty Today</p>
            <h3 className="text-xl font-bold text-slate-900">
              {loading && employees.length === 0 ? '...' : onDutyCount}
            </h3>
            <p className="text-[10px] text-purple-600 font-medium">Active Shift Coverage</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Monthly Payroll</p>
            <h3 className="text-xl font-bold text-slate-900">
              {loading && employees.length === 0 ? '...' : `₹${monthlyPayroll.toLocaleString('en-IN')}`}
            </h3>
            <p className="text-[10px] text-amber-700 font-medium">Active Staff Compensation</p>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
            subTab === 'directory'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Employee Directory &amp; HR ({employees.length})</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              setSubTab('audit');
              fetchAuditLogs();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              subTab === 'audit'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Auth &amp; Security Audit Logs ({auditLogs.length})</span>
          </button>
        )}

        <button
          onClick={() => setSubTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
            subTab === 'matrix'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>RBAC Access Matrix</span>
        </button>
      </div>

      {/* SUB-TAB 1: DIRECTORY & HR */}
      {subTab === 'directory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search & Filter Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Emp ID (EMP-1001), Email, Phone..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Roles</option>
                <option value="PATHOLOGIST">Doctors (Pathologist)</option>
                <option value="TECHNICIAN">Lab Technicians</option>
                <option value="RECEPTIONIST">Receptionists</option>
                <option value="PHLEBOTOMIST">Phlebotomists</option>
                <option value="LAB_ADMIN">Lab Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Account Status</option>
                <option value="ACTIVE">Active Login Only</option>
                <option value="SUSPENDED">Suspended Login Only</option>
                <option value="ON_DUTY">Shift: On Duty</option>
                <option value="ON_LEAVE">Shift: On Leave</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading && employees.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500 flex flex-col items-center space-y-2">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <span>Syncing verified employee directory from Neon Cloud Database...</span>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No matching employee records found.
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const Icon = emp.icon || Users;
                const isSelf = currentUser.id === emp.id;
                const isActive = emp.isActive !== false;

                return (
                  <div
                    key={emp.id}
                    className={`p-4 hover:bg-slate-50/80 transition space-y-3 ${
                      !isActive ? 'bg-rose-50/30 opacity-85' : ''
                    }`}
                  >
                    {/* Top Row: Identity + Role + Auth Badge + Actions */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-xl ${emp.color} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {emp.empCode || 'EMP'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                            {isSelf && (
                              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                YOU
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${emp.badge}`}>
                              {emp.role}
                            </span>
                            {isActive ? (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Authorized</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="h-3 w-3" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {emp.designation || emp.title}
                            {emp.signatureUrl && (
                              <span className="ml-2 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Sign: {emp.signatureUrl}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right Controls: Duty Dropdown + Admin Actions */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <select
                          value={emp.attendanceStatus || 'ON_DUTY'}
                          disabled={!isAdmin && !isSelf}
                          onChange={(e) =>
                            handleQuickAttendanceChange(emp, e.target.value as AttendanceStatus)
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-none ${
                            emp.attendanceStatus === 'ON_DUTY'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : emp.attendanceStatus === 'ON_LEAVE'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="ON_DUTY">ON DUTY</option>
                          <option value="ON_LEAVE">ON LEAVE</option>
                          <option value="OFF_SHIFT">OFF SHIFT</option>
                        </select>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(emp)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition cursor-pointer"
                              title="Edit Employee HR & Role"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setResetTarget(emp);
                                setNewPasswordInput('');
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition cursor-pointer"
                              title="Reset Employee Password"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>

                            {!isSelf && (
                              <>
                                <button
                                  onClick={() => handleToggleActiveStatus(emp)}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    isActive
                                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  }`}
                                  title={isActive ? 'Suspend Login Access' : 'Restore Login Access'}
                                >
                                  {isActive ? <Ban className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                                </button>

                                <button
                                  onClick={() => handleDeleteEmployee(emp)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                                  title="Delete Employee Account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom HR Metadata Grid (Fits Zero Overflow) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] bg-slate-50/60 p-2.5 rounded-lg">
                      <div>
                        <span className="text-slate-400 font-semibold block">Email &amp; Phone</span>
                        <span className="font-mono text-slate-700 break-all">{emp.email}</span>
                        <span className="text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{emp.phone || '—'}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Department &amp; Shift</span>
                        <span className="text-slate-800 font-medium block">{emp.department || 'General Lab'}</span>
                        <span className="text-slate-500">{emp.shift || 'Morning Shift'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Compensation &amp; Joined</span>
                        <span className="font-bold text-slate-800 block">
                          ₹{(Number(emp.salary) || 0).toLocaleString('en-IN')}/mo
                        </span>
                        <span className="text-slate-500">Joined: {emp.joiningDate || '2026-01-01'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Authentication Activity</span>
                        <span className="text-slate-600 block">
                          {emp.lastLoginAt
                            ? `Last: ${new Date(emp.lastLoginAt).toLocaleString()}`
                            : 'No sign-in recorded yet'}
                        </span>
                        {emp.lastLoginIp && (
                          <span className="font-mono text-[10px] text-slate-400">IP: {emp.lastLoginIp}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUTH & SECURITY AUDIT LOGS */}
      {subTab === 'audit' && isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Employee Authentication &amp; HR Audit Logs</h3>
              <p className="text-xs text-slate-500">
                Real-time cryptographic record of sign-ins, failed passwords, account creations, and status changes
              </p>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer shrink-0"
            >
              Refresh Logs
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No authentication events recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.action === 'LOGIN_SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : log.action === 'LOGIN_FAILED' || log.action === 'ACCOUNT_DELETED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : log.action === 'ACCOUNT_CREATED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-800">{log.employeeName}</span>
                      <span className="text-[11px] font-mono text-slate-500">({log.email})</span>
                      {log.role && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {log.role}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-slate-500 shrink-0">
                    <p>{new Date(log.timestamp).toLocaleString()}</p>
                    <p className="font-mono text-[10px] text-slate-400">IP: {log.ipAddress}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RBAC PERMISSIONS MATRIX */}
      {subTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-800">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-sm">Enterprise Role-Based Access Control (RBAC) Matrix</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                <Stethoscope className="h-4 w-4" />
                <span>Doctor / Pathologist</span>
              </div>
              <p className="text-slate-600">
                Clinical verification, Gemini AI diagnostics, and cryptographic digital sign-off on patient reports.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700">
                ✓ Approve Reports &bull; AI Review &bull; PDF Sign-off
              </div>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2">
              <div className="flex items-center space-x-2 text-purple-800 font-bold">
                <FlaskConical className="h-4 w-4" />
                <span>Lab Technician</span>
              </div>
              <p className="text-slate-600">
                Sample intake, analyzer result entry (CBC/LFT/KFT/Lipid/Urine), and reagent inventory stock management.
              </p>
              <div className="text-[11px] font-semibold text-purple-700">
                ✓ Samples &bull; Result Entry &bull; Reagents Stock
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex items-center space-x-2 text-blue-800 font-bold">
                <Users className="h-4 w-4" />
                <span>Receptionist</span>
              </div>
              <p className="text-slate-600">
                Front-desk patient registration, sample barcode printing, billing counter invoices, and WhatsApp delivery.
              </p>
              <div className="text-[11px] font-semibold text-blue-700">
                ✓ Registration &bull; Billing &bull; WhatsApp Alerts
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-300 bg-slate-100/50 space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <Building2 className="h-4 w-4" />
                <span>Lab Admin / HR</span>
              </div>
              <p className="text-slate-600">
                Full system governance: onboarding, role updates, salary/shifts, password resets, account suspension &amp; audit logs.
              </p>
              <div className="text-[11px] font-semibold text-slate-800">
                ✓ Full HR Control &bull; Audit Logs &bull; All Modules
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Edit Employee HR &amp; Access Profile</h4>
                <p className="text-[11px] text-slate-400">
                  {editingEmployee.empCode} &bull; {editingEmployee.email}
                </p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PATHOLOGIST">PATHOLOGIST (Doctor)</option>
                    <option value="TECHNICIAN">TECHNICIAN (Lab Tech)</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="PHLEBOTOMIST">PHLEBOTOMIST</option>
                    <option value="LAB_ADMIN">LAB_ADMIN (Admin / HR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Timing</label>
                  <select
                    value={editForm.shift}
                    onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option>Morning (08:00 AM - 04:00 PM)</option>
                    <option>Morning (09:00 AM - 05:00 PM)</option>
                    <option>Morning (07:30 AM - 03:30 PM)</option>
                    <option>Evening (02:00 PM - 10:00 PM)</option>
                    <option>Night (10:00 PM - 06:00 AM)</option>
                    <option>Full Day (09:00 AM - 06:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary (₹/mo)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={editForm.joiningDate}
                    onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance</label>
                  <select
                    value={editForm.attendanceStatus}
                    onChange={(e) =>
                      setEditForm({ ...editForm, attendanceStatus: e.target.value as AttendanceStatus })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="ON_DUTY">ON DUTY</option>
                    <option value="ON_LEAVE">ON LEAVE</option>
                    <option value="OFF_SHIFT">OFF SHIFT</option>
                  </select>
                </div>
              </div>

              {editForm.role === 'PATHOLOGIST' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Digital Signature Code</label>
                  <input
                    type="text"
                    value={editForm.signatureUrl}
                    onChange={(e) => setEditForm({ ...editForm, signatureUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              )}

              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="font-semibold text-slate-700">
                  Account Active (Uncheck to immediately block login access)
                </span>
              </label>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Employee Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetTarget && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center space-x-2">
                <KeyRound className="h-4 w-4 text-amber-400" />
                <span>Reset Employee Password</span>
              </h4>
              <button
                onClick={() => setResetTarget(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">{resetTarget.name}</p>
                <p className="text-[11px] font-mono text-slate-500">{resetTarget.email}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password (Min 4 chars) *</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPwd}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isResettingPwd ? 'Updating...' : 'Confirm Password Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

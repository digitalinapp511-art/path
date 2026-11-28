import axios from 'axios';
import {
  Stethoscope,
  FlaskConical,
  Users,
  Building2,
  Syringe,
  type LucideIcon
} from 'lucide-react';

export const AUTH_TOKEN_KEY = 'plms_auth_token';
export const AUTH_USER_KEY = 'plms_current_user';

export type EmployeeRole =
  | 'SUPER_ADMIN'
  | 'LAB_ADMIN'
  | 'PATHOLOGIST'
  | 'TECHNICIAN'
  | 'RECEPTIONIST'
  | 'PHLEBOTOMIST';

export type AttendanceStatus = 'ON_DUTY' | 'ON_LEAVE' | 'OFF_SHIFT';

export interface StaffUser {
  id: string;
  name: string;
  role: EmployeeRole;
  email: string;
  title: string;
  color: string;
  badge: string;
  icon: LucideIcon;
  allowedTabs: string[];
  signatureUrl?: string | null;
  isActive?: boolean;
  empCode?: string;
  phone?: string;
  department?: string;
  designation?: string;
  shift?: string;
  joiningDate?: string;
  salary?: number;
  attendanceStatus?: AttendanceStatus;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  createdAt?: string;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setAuthSession(token: string, user: StaffUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getRoleTheme(role: string): {
  title: string;
  color: string;
  badge: string;
  icon: LucideIcon;
  allowedTabs: string[];
  label: string;
} {
  switch (role) {
    case 'PATHOLOGIST':
      return {
        label: 'Doctor / Pathologist',
        title: 'M.D. (Pathology) | Chief Consultant',
        color: 'bg-emerald-600',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Stethoscope,
        allowedTabs: ['dashboard', 'pathologist', 'ai-assistant']
      };
    case 'TECHNICIAN':
      return {
        label: 'Lab Technician',
        title: 'Senior Lab Analyst (Hematology/Biochem)',
        color: 'bg-purple-600',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: FlaskConical,
        allowedTabs: ['dashboard', 'samples', 'technician', 'inventory', 'ai-assistant']
      };
    case 'RECEPTIONIST':
      return {
        label: 'Receptionist',
        title: 'Front Desk & Billing Executive',
        color: 'bg-blue-600',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Users,
        allowedTabs: ['dashboard', 'patients', 'samples', 'billing', 'ai-assistant']
      };
    case 'PHLEBOTOMIST':
      return {
        label: 'Phlebotomist',
        title: 'Sample Collection Specialist',
        color: 'bg-amber-600',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Syringe,
        allowedTabs: ['dashboard', 'patients', 'samples', 'ai-assistant']
      };
    case 'LAB_ADMIN':
    case 'SUPER_ADMIN':
    default:
      return {
        label: role === 'SUPER_ADMIN' ? 'Super Admin' : 'Lab Admin / HR',
        title: 'Laboratory Director / HR Manager',
        color: 'bg-slate-900',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
        icon: Building2,
        allowedTabs: [
          'dashboard',
          'patients',
          'samples',
          'technician',
          'pathologist',
          'inventory',
          'doctors',
          'billing',
          'staff',
          'settings',
          'ai-assistant'
        ]
      };
  }
}

export function mapEmployeeToUser(emp: any, customTitle?: string): StaffUser {
  const theme = getRoleTheme(emp.role);
  return {
    id: emp.id,
    name: emp.name,
    role: emp.role,
    email: emp.email,
    title: emp.designation || customTitle || theme.title,
    color: theme.color,
    badge: theme.badge,
    icon: theme.icon,
    allowedTabs: theme.allowedTabs,
    signatureUrl: emp.signatureUrl || null,
    isActive: emp.isActive !== undefined ? emp.isActive : true,
    empCode: emp.empCode,
    phone: emp.phone,
    department: emp.department,
    designation: emp.designation || customTitle || theme.title,
    shift: emp.shift,
    joiningDate: emp.joiningDate,
    salary: emp.salary,
    attendanceStatus: emp.attendanceStatus || 'ON_DUTY',
    lastLoginAt: emp.lastLoginAt || null,
    lastLoginIp: emp.lastLoginIp || null,
    createdAt: emp.createdAt
  };
}

// Configure global Axios interceptors once
let interceptorsInitialized = false;
export function initAuthInterceptors() {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

  axios.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const reqUrl: string = error?.config?.url || '';
      const isAuthEndpoint = reqUrl.includes('/api/auth/login') || reqUrl.includes('/api/auth/register-staff');
      if (!isAuthEndpoint && (status === 401 || (status === 403 && error?.response?.data?.error?.includes('suspended')))) {
        clearAuthSession();
        window.dispatchEvent(new CustomEvent('plms:auth-expired', {
          detail: error?.response?.data?.error || 'Your employee session expired or access was revoked.'
        }));
      }
      return Promise.reject(error);
    }
  );
}

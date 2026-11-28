import fs from 'fs';
import path from 'path';

export type AttendanceStatus = 'ON_DUTY' | 'ON_LEAVE' | 'OFF_SHIFT';

export interface EmployeeHRProfile {
  userId: string;
  empCode: string;
  phone: string;
  department: string;
  designation: string;
  shift: string;
  joiningDate: string;
  salary: number;
  attendanceStatus: AttendanceStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  updatedAt: string;
}

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'ACCOUNT_CREATED'
  | 'PROFILE_UPDATED'
  | 'STATUS_CHANGED'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_DELETED';

export interface AuthAuditLog {
  id: string;
  userId?: string;
  employeeName: string;
  email: string;
  role?: string;
  action: AuditAction;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface EmployeeMetaStore {
  profiles: Record<string, EmployeeHRProfile>;
  auditLogs: AuthAuditLog[];
  nextEmpSeq: number;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const META_FILE = path.join(DATA_DIR, 'employees_meta.json');

const ROLE_DEFAULTS: Record<string, { department: string; designation: string; shift: string; salary: number }> = {
  PATHOLOGIST: {
    department: 'Pathology & Reporting',
    designation: 'M.D. (Pathology) | Consultant',
    shift: 'Morning (09:00 AM - 05:00 PM)',
    salary: 125000
  },
  TECHNICIAN: {
    department: 'Hematology & Biochemistry Lab',
    designation: 'Senior Lab Analyst (DMLT)',
    shift: 'Morning (07:30 AM - 03:30 PM)',
    salary: 32000
  },
  RECEPTIONIST: {
    department: 'Front Desk & Billing',
    designation: 'Patient Care & Billing Executive',
    shift: 'Morning (08:00 AM - 04:00 PM)',
    salary: 22000
  },
  PHLEBOTOMIST: {
    department: 'Sample Collection & Home Visit',
    designation: 'Certified Phlebotomist',
    shift: 'Morning (07:00 AM - 03:00 PM)',
    salary: 20000
  },
  LAB_ADMIN: {
    department: 'Administration & HR',
    designation: 'Laboratory Director / Manager',
    shift: 'Full Day (09:00 AM - 06:00 PM)',
    salary: 75000
  },
  SUPER_ADMIN: {
    department: 'Corporate Administration',
    designation: 'System Super Administrator',
    shift: 'Full Day (09:00 AM - 06:00 PM)',
    salary: 95000
  }
};

class EmployeeMetaService {
  private store: EmployeeMetaStore = {
    profiles: {},
    auditLogs: [],
    nextEmpSeq: 1001
  };

  constructor() {
    this.ensureDataDir();
    this.loadFromFile();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(META_FILE)) {
        const raw = fs.readFileSync(META_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.store = {
          profiles: parsed.profiles || {},
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
          nextEmpSeq: typeof parsed.nextEmpSeq === 'number' ? parsed.nextEmpSeq : 1001
        };
      }
    } catch (e) {
      console.warn('Employee meta load note, initializing clean store:', e);
    }
  }

  private saveToFile() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(META_FILE, JSON.stringify(this.store, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save employee meta:', e);
    }
  }

  public getOrCreateProfile(user: { id: string; role: string; email: string; createdAt?: Date }): EmployeeHRProfile {
    const existing = this.store.profiles[user.id];
    if (existing) {
      return existing;
    }

    const defaults = ROLE_DEFAULTS[user.role] || ROLE_DEFAULTS.RECEPTIONIST;
    const empCode = `EMP-${this.store.nextEmpSeq++}`;
    const joiningDate = (user.createdAt ? new Date(user.createdAt) : new Date()).toISOString().split('T')[0];

    // Friendly defaults for seeded accounts
    let phone = '+91 98100 00000';
    if (user.email.includes('pathologist')) phone = '+91 98111 22334';
    else if (user.email.includes('tech')) phone = '+91 98222 33445';
    else if (user.email.includes('reception')) phone = '+91 98333 44556';
    else if (user.email.includes('admin')) phone = '+91 98999 88776';

    const profile: EmployeeHRProfile = {
      userId: user.id,
      empCode,
      phone,
      department: defaults.department,
      designation: defaults.designation,
      shift: defaults.shift,
      joiningDate,
      salary: defaults.salary,
      attendanceStatus: 'ON_DUTY',
      updatedAt: new Date().toISOString()
    };

    this.store.profiles[user.id] = profile;
    this.saveToFile();
    return profile;
  }

  public upsertProfile(
    user: { id: string; role: string; email: string; createdAt?: Date },
    updates: Partial<Omit<EmployeeHRProfile, 'userId' | 'empCode'>>
  ): EmployeeHRProfile {
    const current = this.getOrCreateProfile(user);
    const updated: EmployeeHRProfile = {
      ...current,
      ...updates,
      userId: user.id,
      empCode: current.empCode,
      updatedAt: new Date().toISOString()
    };
    this.store.profiles[user.id] = updated;
    this.saveToFile();
    return updated;
  }

  public deleteProfile(userId: string) {
    if (this.store.profiles[userId]) {
      delete this.store.profiles[userId];
      this.saveToFile();
    }
  }

  public recordAudit(entry: Omit<AuthAuditLog, 'id' | 'timestamp'>): AuthAuditLog {
    const log: AuthAuditLog = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.store.auditLogs.unshift(log);
    if (this.store.auditLogs.length > 200) {
      this.store.auditLogs = this.store.auditLogs.slice(0, 200);
    }
    this.saveToFile();
    return log;
  }

  public getAuditLogs(limit = 50): AuthAuditLog[] {
    return this.store.auditLogs.slice(0, limit);
  }
}

export const employeeMetaService = new EmployeeMetaService();

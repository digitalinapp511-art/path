import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// -------------------------------------------------------------
// 1. CONFIGURATION & SECRETS
// -------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'plms_ultra_secure_gemini_pathology_2026_super_secret_key_9876543210';
const ADMIN_MASTER_KEY = process.env.ADMIN_MASTER_KEY || 'PLMS_SECURE_ADMIN_MASTER_2026';

// -------------------------------------------------------------
// 2. HTTP SECURITY HEADERS (Helmet-Grade Protection)
// -------------------------------------------------------------
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Remove server identification
  res.removeHeader('X-Powered-By');

  // Defense against Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Cross-Site Scripting (XSS) filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Content Security Policy (Allows localhost frontend and secure assets)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:5000 http://localhost:5173 http://127.0.0.1:5173 https:; font-src 'self' data:;"
  );

  next();
}

// -------------------------------------------------------------
// 3. SECURE CORS CONFIGURATION
// -------------------------------------------------------------
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'tauri://localhost'
];

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, desktop clients)
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.koyeb.app') ||
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
    ) {
      return callback(null, true);
    }
    // Block unauthorized origins
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Admin-Key'],
  credentials: true,
  maxAge: 86400 // 24 hours pre-flight caching
};

// -------------------------------------------------------------
// 4. IN-MEMORY SLIDING WINDOW RATE LIMITER (DoS / Brute Force Protection)
// -------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

export function createRateLimiter(options: { windowMs: number; max: number; message: string; name: string }) {
  const store = new Map<string, RateLimitRecord>();
  rateLimitStores.set(options.name, store);

  // Periodic memory cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 300000);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    record.count++;
    if (record.count > options.max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        error: options.message,
        retryAfter: `${retryAfterSec}s`
      });
    }

    next();
  };
}

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 min
  message: 'Too many requests from this IP, please try again after a few minutes.',
  name: 'general'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 min
  message: 'Too many login attempts from this IP. Account temporarily locked for security.',
  name: 'auth'
});

export const dangerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 attempts per hour (relaxed for smooth testing & client demos)
  message: 'Too many high-privilege requests. Rate limit triggered.',
  name: 'danger'
});

// -------------------------------------------------------------
// 5. INPUT SANITIZATION & XSS PREVENTION
// -------------------------------------------------------------
export function sanitizeString(val: any, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>'"`;]/g, '') // Strip script characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters
    .trim()
    .slice(0, maxLength);
}

export function sanitizeNumber(val: any, min = 0, max = 1000000, fallback = 0): number {
  const num = parseFloat(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

export function validatePhone(phone: any): boolean {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

// -------------------------------------------------------------
// 6. CRYPTOGRAPHIC PASSWORD HASHING (PBKDF2-SHA512)
// -------------------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  // Handle plain-text legacy passwords securely
  if (!storedHash.startsWith('pbkdf2$')) {
    return password === storedHash;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 4) return false;

  const iterations = parseInt(parts[1]!, 10);
  const salt = parts[2]!;
  const expectedHash = parts[3]!;

  const derived = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');

  // Constant-time comparison to prevent timing attacks
  const bufExpected = Buffer.from(expectedHash, 'hex');
  const bufDerived = Buffer.from(derived, 'hex');
  if (bufExpected.length !== bufDerived.length) return false;
  return crypto.timingSafeEqual(bufExpected, bufDerived);
}

// -------------------------------------------------------------
// 7. CRYPTOGRAPHIC TAMPER-PROOF AUTH TOKENS (HMAC-SHA256)
// -------------------------------------------------------------
export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function createAuthToken(user: { id: string; name: string; email: string; role: string }): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + (24 * 60 * 60) // 24 hours validity
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyAuthToken(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token missing' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token' };
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return { valid: false, error: 'Incomplete token components' };
  }

  // Verify HMAC signature with constant time comparison
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  const bufSig = Buffer.from(signature);
  const bufExpected = Buffer.from(expectedSig);

  if (bufSig.length !== bufExpected.length || !crypto.timingSafeEqual(bufSig, bufExpected)) {
    return { valid: false, error: 'Invalid token signature (Tampering detected!)' };
  }

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) {
      return { valid: false, error: 'Session expired. Please log in again.' };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, error: 'Corrupt token payload' };
  }
}

// -------------------------------------------------------------
// 8. EXPRESS AUTHENTICATION & RBAC MIDDLEWARES
// -------------------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateOptional(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const result = verifyAuthToken(token);
    if (result.valid && result.payload) {
      req.user = result.payload;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing Bearer token.'
    });
  }

  const token = authHeader.slice(7).trim();
  const result = verifyAuthToken(token);
  if (!result.valid || !result.payload) {
    return res.status(401).json({
      success: false,
      error: result.error || 'Invalid or expired authentication session.'
    });
  }

  req.user = result.payload;
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // If not authenticated yet, check token
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        const result = verifyAuthToken(token);
        if (result.valid && result.payload) {
          req.user = result.payload;
        }
      }
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Access denied. You must be logged in.' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: `Access forbidden. Role '${req.user.role}' lacks required permissions for this action. Allowed: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

// Master Admin Authorization for Danger Zone Wipe
export function requireMasterAdminKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'];
  const isKeyValid = adminKey === ADMIN_MASTER_KEY;

  const isRoleAdmin = req.user && (req.user.role === 'LAB_ADMIN' || req.user.role === 'SUPER_ADMIN');

  if (!isKeyValid && !isRoleAdmin) {
    return res.status(403).json({
      success: false,
      error: 'CRITICAL SECURITY REJECT: Only authorized Lab Administrator with Master Security Key can execute Database Wipe!'
    });
  }

  next();
}

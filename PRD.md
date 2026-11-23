# Product Requirements Document (PRD)
## Project: Pathology Lab Management System (PLMS) SaaS
**Client / Brand**: Digital In App / City Care Pathology Lab
**Standard**: NABL / ISO 15189:2022 Medical Diagnostic Laboratory SOP

### 1. Security Architecture Requirements
- **SEC-01**: Comprehensive HTTP Security Headers (Equivalent to Helmet: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- **SEC-02**: Restricted CORS Policy (Whitelisted origins: localhost:5173, localhost:3000, 127.0.0.1:5173, Electron/Tauri protocols; credentials enabled).
- **SEC-03**: Multi-Tier Rate Limiting & Anti-Brute-Force (General API, Strict Auth Login, Dangerous Operations).
- **SEC-04**: Cryptographic Password Hashing (PBKDF2-SHA512 with 100,000 iterations & unique cryptographic salt).
- **SEC-05**: Tamper-Proof Cryptographic Auth Tokens (HMAC-SHA256 signature with constant-time verification against timing attacks).
- **SEC-06**: Strict Role-Based Access Control (RBAC) Middleware on all protected medical endpoints (Pathologist, Technician, Receptionist, Lab Admin).
- **SEC-07**: Danger Zone Protection (`DELETE /api/orders/clean-all` locked behind Admin Authorization + Secret Key confirmation).
- **SEC-08**: Input Validation & XSS Sanitization (Sanitizing strings, phone number validation, numeric ranges, escaping HTML tags).

### 2. Zero-Temporary Data / Persistent Storage Requirements
- **DATA-01**: Order Metadata & Prescribed Tests Persistence (All prescribed tests saved and retrieved across page reloads and reboots).
- **DATA-02**: Technician Observed Readings Persistence (Observations for Hb, WBC, Platelets, PCV, etc. saved permanently to database/disk store).
- **DATA-03**: Pathologist Approvals & Digital Signatures (Permanent audit trail of who approved and timestamp).
- **DATA-04**: Reagent & Inventory Auto-Deductions (Real-time audit log and stock deduction persisted in store).
- **DATA-05**: Referring Doctor Incentives & Commission Tracking (Persisted on PostgreSQL and synced).

### 3. Frontend & UI/UX Requirements
- **UI-01**: Dedicated AI Clinical Assistant tab in sidebar for pathology diagnostic review.
- **UI-02**: Full 7-category diagnostic test catalog (38+ tests) with real-time price calculator.
- **UI-03**: No visual overlap; responsive grid/flex layouts across desktop and tablet viewports.
- **UI-04**: Real-time sync with backend (re-fetching after every mutation: register, enter observations, approve).
- **UI-05**: Multi-Role Switcher with clear visual badges.

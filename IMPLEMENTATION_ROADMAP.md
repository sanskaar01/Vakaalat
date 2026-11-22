# VAKAALAT (वकालत) — Implementation Roadmap

This roadmap breaks the Vakaalat build into 8 sequential, verifiable phases. Each phase builds cleanly on the previous one and concludes with explicit acceptance criteria.

---

## Phase 1: Foundation & Design System
- **Dependencies:** None (greenfield initialization).
- **Tasks:**
  1. Initialize monorepo/workspace structure (`frontend/` with Vite + React + TypeScript + Tailwind CSS; `backend/` with Node.js + Express + TypeScript).
  2. Configure PostgreSQL connection, migration tooling, and environment validation (Zod).
  3. Implement `DESIGN_SYSTEM.md` tokens in Tailwind config and CSS variables (`--navy-950`, `--teal-950`, `--ivory-50`, `--brass-400`, `--champagne-200`, semantic tokens, dark/light theme support).
  4. Configure Google Fonts (`Cormorant Garamond`, `Plus Jakarta Sans`, `Noto Sans Devanagari`, `JetBrains Mono`).
  5. Build the `वकालत / VAKAALAT` SVG logo component (monochromatic, shirorekha-integrated geometric scale, light/dark variants).
  6. Build core reusable UI primitives (`Button`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `Modal`, `Tabs`, `Toast`, `EmptyState`, `Skeleton`) and layout shells (`PublicNavbar`, `WorkspaceSidebar`).
  7. Build public static/informational routes: `/`, `/how-it-works`, `/practice-areas`, `/about`.
- **Expected Outcomes:** Working dev environment, database migrations initialized, complete reusable UI component library, and responsive public editorial pages.
- **Acceptance Criteria:**
  - Design tokens and typography render accurately in both dark and light modes with WCAG AA contrast.
  - Public landing page and informational routes pass responsive checks at `375px`, `768px`, and `1280px`.
  - Backend health check (`GET /api/v1/health`) connects to PostgreSQL and returns `200 OK`.

---

## Phase 2: Authentication & User Roles
- **Dependencies:** Phase 1.
- **Tasks:**
  1. Create database migrations for `users`, `client_profiles`, `lawyer_profiles`, `refresh_tokens`, and `audit_logs`.
  2. Implement `modules/auth` (`register`, `login`, `refresh`, `logout`, `me`) with `argon2`/`bcrypt` hashing, JWT access tokens, and HttpOnly refresh cookies.
  3. Implement `authenticateJWT` and `requireRole('client' | 'lawyer' | 'admin')` middleware.
  4. Build `/login` and `/register` (role-aware registration for Client vs. Lawyer) and frontend `AuthProvider` + `ProtectedRoute`.
  5. Build `/client/settings` and `/lawyer/settings` (profile basics & password update).
- **Expected Outcomes:** Secure, role-isolated authentication flow for Clients and Lawyers.
- **Acceptance Criteria:**
  - Unauthenticated requests to `/api/v1/client/*` or `/api/v1/lawyer/*` return `401`.
  - Cross-role access (e.g., Client accessing `/lawyer/dashboard` or `/api/v1/lawyer/*`) is blocked with `403` / redirect.
  - Refresh token rotation works seamlessly across page reloads.

---

## Phase 3: Client Experience & Legal Intake
- **Dependencies:** Phase 2.
- **Tasks:**
  1. Create migrations for `practice_areas`, `legal_intakes`, `intake_messages`, and `case_summaries`.
  2. Seed canonical Indian `practice_areas` (Consumer Disputes, Property & Real Estate, Family & Matrimonial, Labour & Employment, Criminal Defense, Civil & Contract, Cyber Fraud, Cheque Bounce / NI Act).
  3. Build `/client/dashboard`, `/client/enquiries`, and `/client/enquiries/new` with explicit privacy consent capture.
  4. Build `/client/enquiries/:id/intake` UI (natural-language message thread, extracted facts panel, manual edit capability).
  5. Implement backend `modules/intakes` CRUD with strict ownership checks (`client_id === currentClient`).
- **Expected Outcomes:** Clients can create, view, and manage private legal enquiries end-to-end (pre-AI).
- **Acceptance Criteria:**
  - Clients cannot start an intake without accepting the privacy & non-legal-advice notice.
  - Client A cannot read or mutate Client B's `legal_intakes` or `intake_messages` (`403/404`).
  - Enquiries persist cleanly in PostgreSQL with unique `VK-YYYY-XXXX` reference codes.

---

## Phase 4: AI-Assisted Legal Understanding (Gemini)
- **Dependencies:** Phase 3.
- **Tasks:**
  1. Implement `modules/ai` using `@google/genai` (or official Gemini SDK) with server-side `GEMINI_API_KEY`.
  2. Author structured system prompts enforcing neutral tone, no legal advice, no outcome guarantees, and Hindi/English comprehension.
  3. Implement Zod schemas for `analyzeIntakeTurn` and `generateCaseSummary` responses, constraining suggested practice areas to seeded DB slugs.
  4. Build fallback handling when Gemini is unavailable, slow, or returns invalid JSON.
  5. Wire `POST /intakes/:id/messages` (AI follow-up turn) and `POST /intakes/:id/summarize` + `PATCH /intakes/:id/summary` (client fact editing).
  6. Build `/client/enquiries/:id/summary` with explicit `AIInsightBadge` disclaimers.
- **Expected Outcomes:** Guided conversational intake that produces structured, client-editable case summaries and practice-area suggestions.
- **Acceptance Criteria:**
  - Malformed Gemini responses never crash the API and gracefully fall back to manual practice-area selection.
  - AI output is clearly labeled *"AI-Assisted Summary — Not Legal Advice"* in the UI.
  - Client edits to `client_edited_summary` are preserved separately from raw AI output.

---

## Phase 5: Lawyer Discovery & Profiles
- **Dependencies:** Phase 2, Phase 3 (Practice Areas).
- **Tasks:**
  1. Create migrations for `lawyer_practice_areas` and `matching_records`.
  2. Create clearly labeled **Kanpur, Uttar Pradesh fictional seed lawyer profiles** (covering diverse practice areas, languages, chambers in Civil Lines / Swaroop Nagar / Kakadeo / Kidwai Nagar, and verified status).
  3. Implement `GET /api/v1/lawyers` with deterministic filtering (practice area, city, language, mode, experience, `verifiedOnly`).
  4. Implement `GET /api/v1/intakes/:id/matches` persisting `matching_records` based on confirmed/suggested practice areas and city.
  5. Build public `/lawyers` discovery page, `/lawyers/:id` profile page, and in-workspace `/client/enquiries/:id/lawyers` with side-by-side comparison (up to 3 lawyers).
- **Expected Outcomes:** Fast, trustworthy lawyer discovery backed by real database filters and factual credentials.
- **Acceptance Criteria:**
  - Only lawyers with `verification_status = 'verified'` display the `Bar Verified` badge; unverified lawyers are excluded from default verified discovery.
  - Filters combine accurately without N+1 queries.
  - Seed profiles are clearly marked as demo/seed data in seed scripts and never fabricate live ratings.

---

## Phase 6: Lawyer Workspace & Verification Flow
- **Dependencies:** Phase 2, Phase 5.
- **Tasks:**
  1. Create migration for `lawyer_credentials`.
  2. Build `/lawyer/dashboard`, `/lawyer/profile`, `/lawyer/practice-areas`, and `/lawyer/credentials` (Bar Council enrollment number, state bar, document upload).
  3. Implement secure file upload handling for credential proofs (type/size validation, private storage).
  4. Implement `modules/admin` verification endpoints (`GET /admin/credentials`, `PATCH /admin/credentials/:id/verify`) with `audit_logs` recording.
- **Expected Outcomes:** Complete dedicated workspace for lawyers to onboard, manage practice preferences, and undergo credential verification.
- **Acceptance Criteria:**
  - A newly registered lawyer starts as `unverified`, transitions to `pending` upon credential submission, and becomes `verified` **only** after admin approval.
  - Every verification approval/rejection writes an immutable entry to `audit_logs`.

---

## Phase 7: Consultation Scheduling & Availability Engine
- **Dependencies:** Phase 5, Phase 6.
- **Tasks:**
  1. Create migrations for `lawyer_availability`, `consultations` (including partial unique index on active slots), and `notifications`.
  2. Build `/lawyer/availability` (weekly recurring hours + date overrides/blocks).
  3. Implement deterministic slot generator (`GET /lawyers/:id/slots?date=YYYY-MM-DD`).
  4. Implement atomic booking (`POST /consultations`), lawyer response (`PATCH /consultations/:id/respond`), and cancellation rules (`PATCH /consultations/:id/cancel`).
  5. Build `/client/lawyers/:id` slot picker & booking modal (with `share_case_summary` consent toggle), `/client/consultations`, `/lawyer/requests`, and `/lawyer/consultations`.
  6. Implement in-app `notifications` bell and unread counter.
- **Expected Outcomes:** End-to-end, race-condition-safe consultation scheduling between clients and verified lawyers.
- **Acceptance Criteria:**
  - Concurrent booking attempts for the same lawyer + date + time slot result in one success (`201`) and one `409 Conflict`.
  - Lawyers can view a client's case summary **only** when `share_case_summary === true` on a linked consultation.
  - Declining or cancelling a consultation immediately frees the slot for future bookings.

---

## Phase 8: Security, Testing & Production Readiness
- **Dependencies:** Phases 1–7.
- **Tasks:**
  1. Security hardening: Helmet headers, strict CORS, rate limiting on auth and AI endpoints, input sanitization, and verification of zero leaked secrets/stack traces.
  2. Write automated backend integration tests covering auth/RBAC, intake ownership, Gemini fallback, availability slot math, and concurrent double-booking prevention.
  3. Write frontend component and E2E smoke tests (Client problem-to-booking journey; Lawyer credential-to-accept journey).
  4. Accessibility audit (keyboard navigation, ARIA labels, contrast) and performance pass (bundle splitting, DB indexes).
  5. Prepare production deployment configuration (Dockerfiles / `.env.example` / build & migration scripts).
- **Expected Outcomes:** Verified, tested, production-ready Vakaalat MVP ready for Kanpur pilot launch.
- **Acceptance Criteria:**
  - All automated backend and E2E tests pass cleanly.
  - Zero critical/high security vulnerabilities in dependency audit.
  - Complete `.env.example` and database seed/migration runbook verified on a clean database.

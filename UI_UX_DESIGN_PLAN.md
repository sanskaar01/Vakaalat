# VAKAALAT (वकालत) — UI/UX Design Plan

## 1. Information Architecture & Sitemap

Vakaalat enforces a strict boundary between **Public Discovery** and **Authenticated Workspaces** (Client vs. Lawyer).

```text
Vakaalat Platform
├── Public Website (Unauthenticated)
│   ├── /                         Landing Page (Dual-entry: Client & Lawyer)
│   ├── /how-it-works             How Vakaalat Works (4-step process + AI transparency)
│   ├── /practice-areas           Practice Areas Directory (Kanpur-relevant Indian law)
│   ├── /lawyers                  Lawyer Discovery & Filters
│   ├── /lawyers/:id              Individual Lawyer Public Profile
│   ├── /about                    About Vakaalat, Mission & Privacy Commitment
│   ├── /login                    Sign In (Role-aware redirect)
│   └── /register                 Create Account (Client or Lawyer onboarding path)
│
├── Client Workspace (/client/* — Role: CLIENT)
│   ├── /client/dashboard         Client Overview (Active Enquiries & Upcoming Consultations)
│   ├── /client/enquiries/new     Start a Legal Enquiry (Problem Prompt & Consent)
│   ├── /client/enquiries/:id/intake   Conversational Legal Intake (Gemini-assisted Q&A)
│   ├── /client/enquiries/:id/summary  Case Summary & Suggested Practice Areas
│   ├── /client/enquiries/:id/lawyers  Matched Lawyer Recommendations & Comparison
│   ├── /client/lawyers/:id       Lawyer Profile + Live Slot Selection (in-workspace)
│   ├── /client/consultations     My Consultations (Upcoming, Pending, Past)
│   ├── /client/enquiries         My Legal Enquiries (All drafts & submitted cases)
│   └── /client/settings          Account & Privacy Settings
│
└── Lawyer Workspace (/lawyer/* — Role: LAWYER)
    ├── /lawyer/dashboard         Lawyer Overview (Requests, Upcoming Schedule, Profile Status)
    ├── /lawyer/profile           Professional Profile Editor
    ├── /lawyer/credentials       Bar Council Credential Submission & Verification Status
    ├── /lawyer/practice-areas    Practice Area, Languages & Consultation Preferences
    ├── /lawyer/availability      Weekly Availability & Date Override Manager
    ├── /lawyer/requests          Incoming Consultation Requests (Accept / Decline)
    ├── /lawyer/consultations     Upcoming Consultations & Consultation History
    └── /lawyer/settings          Account & Notification Settings
```

---

## 2. Navigation Architecture

### 2.1 Public Top Navigation
- **Left:** `वकालत / VAKAALAT` wordmark (links to `/`).
- **Center:** `How It Works`, `Practice Areas`, `Find a Lawyer`, `About`.
- **Right:** `For Lawyers` (ghost/outline link to `/register?role=lawyer`), `Sign In` (primary champagne pill), or `Go to Workspace` if already authenticated.
- **Mobile (`< 768px`):** Clean hamburger drawer with primary CTAs pinned at the bottom.

### 2.2 Authenticated Workspace Navigation
- **Layout:** `248px` fixed left sidebar (`--navy-900`) + `64px` top utility bar (breadcrumb/page title, notification bell, user avatar menu with theme toggle & sign out).
- **Client Sidebar:** `Dashboard`, `Start Legal Enquiry`, `My Legal Enquiries`, `Find a Lawyer`, `My Consultations`, `Account & Privacy`.
- **Lawyer Sidebar:** `Dashboard`, `Consultation Requests` (with live pending count badge), `Upcoming & History`, `Availability`, `Practice Areas`, `Profile & Credentials`, `Account Settings`.
- **Role Isolation:** A Client cannot access `/lawyer/*` routes; a Lawyer cannot access `/client/*` routes.

---

## 3. Core User Journeys

### Journey A: Client — Problem to Consultation Booking
1. **Entry:** Client lands on `/` and selects **"I Need Legal Help"** (or navigates directly to *"Tell us what happened"*).
2. **Enquiry Initialization:** If unauthenticated, client can preview how intake works or sign up/in seamlessly to save their private enquiry. Explicit privacy/consent notice explains what is stored and who sees it.
3. **Conversational Intake:** Client writes their story in plain English or Hindi. Gemini asks 2–4 targeted clarifying questions (dates, city/jurisdiction, parties involved, documents available).
4. **Structured Understanding:** Client reviews the **Neutral Case Summary** (editable by the client for factual accuracy) and **Suggested Practice Areas** (with a clear *"AI-assisted suggestion, not legal advice"* label).
5. **Discovery & Comparison:** Vakaalat displays verified Kanpur lawyers matching the practice area, with filters for language, experience, consultation mode, and fee range.
6. **Slot Selection & Booking:** Client opens a lawyer's profile, selects a backend-verified available date/time slot, chooses consultation mode (In-Person / Video / Phone), and submits a **Consultation Request**.
7. **Tracking:** Client tracks status (`Pending Lawyer Confirmation` → `Confirmed`) under **My Consultations**.

### Journey B: Lawyer — Onboarding to Consultation Fulfillment
1. **Registration:** Advocate registers via **"I'm a Lawyer"** (`/register?role=lawyer`).
2. **Profile & Credentials:** Lawyer completes qualifications (LL.B./LL.M.), Bar Council enrollment number, state bar (e.g., Bar Council of Uttar Pradesh), Kanpur court/chamber locality, and uploads credential proof.
3. **Verification Gate:** Profile displays `Pending Verification` in the Lawyer Workspace. It is **not** marked verified publicly until approved.
4. **Practice & Availability Setup:** Lawyer selects practice areas, languages (`Hindi`, `English`, `Urdu`), consultation fee/duration, and sets weekly recurring hours + blocked dates.
5. **Request Handling:** When a client requests a slot, lawyer reviews the client's shared case summary (only after client consent), then clicks **Accept** (confirming the booking) or **Decline** (with an optional polite reason/reschedule note).

---

## 4. Screen-by-Screen Specifications

### 4.1 Public-Facing Screens

1. **Landing Page (`/`)**
   - **Hero Section:** Editorial dark navy/teal canvas. Centered `वकालत` wordmark above a split dual-audience focal section (inspired by the clarity of the concept mockup, **without** courthouse pillars or Lady Justice statues):
     - Left: *"Need Legal Clarity?"* — *"Tell us what happened. We'll help you understand what comes next."* → Primary CTA: **Start a Legal Enquiry**.
     - Right: *"Are You a Practicing Advocate?"* — *"Join Vakaalat's verified Kanpur network and manage consultations professionally."* → Secondary CTA: **Join as a Lawyer**.
   - **Below the Fold:** 4-step visual workflow (`Describe → Understand → Discover → Consult`), Kanpur Practice Areas preview, Trust & Privacy Architecture section (explaining AI boundaries & Bar verification), and clean footer.

2. **How Vakaalat Works (`/how-it-works`)**
   - Step-by-step breakdown of the intake-to-consultation journey, explicitly clarifying what Gemini AI does (structuring facts, suggesting practice areas) vs. what only a verified advocate does (legal advice, representation).

3. **Practice Areas (`/practice-areas`)**
   - Clean, scannable grid of core Indian practice areas relevant to Kanpur citizens (Consumer Disputes, Property & Real Estate, Family & Matrimonial, Labour & Employment, Criminal Defense & Bail, Civil & Contract Disputes, Cyber & Financial Fraud, Cheque Bounce / NI Act). Each card links to filtered lawyer discovery.

4. **Lawyer Discovery (`/lawyers`)**
   - Left filter panel (collapsible on mobile): Practice Area, City (`Kanpur` default), Language, Consultation Mode, Experience range, Verified Only toggle.
   - Main list: Factual `LawyerCard`s showing initials/photo, `Bar Verified` badge (only if verified), primary practice areas, years of experience, languages, chamber area (e.g., Civil Lines / Swaroop Nagar, Kanpur), and next available slot.

5. **Individual Lawyer Profile (`/lawyers/:id`)**
   - Header with verified status, Bar enrollment year, qualifications, languages, and Kanpur chamber locality.
   - Bio & practice focus, consultation modes & transparent fee, and an interactive **Available Slots** preview prompting sign-in/enquiry attachment to book.

6. **About Vakaalat (`/about`)**
   - Mission (*"Justice, made accessible"*), Kanpur pilot context, data privacy principles, and Bar Council compliance posture.

7. **Login & Registration (`/login`, `/register`)**
   - Split-panel layout: Left editorial brand statement; Right clean form with role selector (`Client` / `Lawyer`) on registration, inline validation, and password visibility toggle.

### 4.2 Client Workspace Screens

1. **Client Dashboard (`/client/dashboard`)**
   - Warm greeting (*"Welcome, Anjali"*), primary action card (**Start a New Legal Enquiry**), secondary cards (**Browse Verified Lawyers**, **My Consultations**).
   - **Your Legal Enquiries:** Real list of user's enquiries with status (`Draft`, `Intake Complete`, `Matched`), practice area tag, and last updated date (no fake view counts).
   - **Upcoming Consultations:** Next confirmed/pending consultation with date, time, lawyer name, and mode.

2. **Start a Legal Enquiry (`/client/enquiries/new`)**
   - Prompts: *"Tell us what happened. We'll help you understand what comes next."*
   - Plain-language textarea + optional city/location selector (`Kanpur` pre-selected) + explicit privacy consent checkbox (*"I understand Vakaalat structures my enquiry for consultation matching and does not provide legal advice."*).

3. **Conversational Legal Intake (`/client/enquiries/:id/intake`)**
   - Split or focused centered layout: Left/Top shows the evolving **Structured Facts** (Timeline, Parties, Key Issue); Main area shows the calm, non-chatty Q&A thread where Gemini asks targeted follow-up questions with quick-reply chips where helpful (e.g., *"Yes, I have the receipt / agreement"*, *"Not sure"*).
   - Clear **"Generate Case Summary"** action once sufficient context is gathered (or user chooses to proceed).

4. **Case Summary & Suggested Practice Areas (`/client/enquiries/:id/summary`)**
   - Neutral, plain-language summary card (with **Edit Facts** capability so the client owns the truth of their record).
   - `AIInsightBadge` clearly marking suggested practice areas (e.g., *Consumer Protection — High relevance*, *Civil Contract — Possible*) and any **Open Clarifications**.
   - Primary CTA: **View Matching Lawyers in Kanpur**.

5. **Lawyer Recommendations (`/client/enquiries/:id/lawyers`)**
   - Shows verified lawyers filtered by the confirmed practice area(s), with side-by-side comparison (up to 3 lawyers) on experience, languages, consultation fee, and earliest available slot.

6. **Consultation Scheduling (`/client/lawyers/:id` & Booking Modal)**
   - Interactive date picker + backend-locked time slots (`10:00 AM`, `11:30 AM`, etc.).
   - Choice of whether to share the structured **Case Summary** with the lawyer upon request submission (consent-based disclosure).

7. **My Consultations (`/client/consultations`)** & **My Legal Enquiries (`/client/enquiries`)**
   - Tabbed views (`Upcoming`, `Pending`, `Completed / Cancelled`) with clear reschedule/cancel rules.

8. **Account & Privacy Settings (`/client/settings`)**
   - Profile details, password change, consent preferences, and ability to delete draft enquiries.

### 4.3 Lawyer Workspace Screens

1. **Lawyer Dashboard (`/lawyer/dashboard`)**
   - Verification banner if `pending` or `unverified` (guiding directly to **Submit Credentials**).
   - Clean KPI row: `Pending Requests`, `Confirmed This Week`, `Completed Consultations` (strictly real DB counts).
   - **Incoming Consultation Requests** queue with client initials, practice area, requested slot, and **Review Summary / Respond** button.

2. **Professional Profile (`/lawyer/profile`)**
   - Edit bio, headline, qualifications (`LL.B.`, `B.A. LL.B.`, `LL.M.`), years of experience, chamber address (Kanpur), and profile photo.

3. **Credential Submission (`/lawyer/credentials`)**
   - Submit Bar Council Enrollment Number, State Bar Council, Enrollment Year, and upload Bar ID / Certificate. Displays live status (`Not Submitted`, `Under Review`, `Verified`, `Action Required` with reviewer note).

4. **Practice Area & Preferences (`/lawyer/practice-areas`)**
   - Multi-select practice areas, spoken languages, consultation modes (`In-Person`, `Video`, `Phone`), consultation duration (`30 min`, `45 min`), and consultation fee.

5. **Availability Management (`/lawyer/availability`)**
   - Weekly recurring schedule builder (Mon–Sun time blocks) + **Date Overrides / Leave** calendar to block specific dates (e.g., court appearances or holidays).

6. **Consultation Requests (`/lawyer/requests`)** & **Consultations (`/lawyer/consultations`)**
   - View client-consented Case Summary before accepting.
   - One-click **Accept** (locks slot & notifies client) or **Decline** (with structured reason, frees slot).
   - Upcoming schedule & historical log with notes.

7. **Account Settings (`/lawyer/settings`)**
   - Notification preferences, password/security, and availability pause toggle.

---

## 5. Responsive Behavior & Design Rationale

- **Mobile-First Intake:** Citizens often seek legal help from their phones. The intake screen stacks the Q&A thread cleanly on mobile with a collapsible **"View Extracted Facts"** drawer.
- **Refinement Over Concept Mockup:** While preserving the concept's strong dark/champagne aesthetic, clear dual-role landing entry, and sidebar-driven Client/Lawyer workspaces, this plan removes courthouse/statue clichés, replaces "File a Complaint" with "Start a Legal Enquiry", removes ungrounded view counts/urgency badges, and enforces strict backend-controlled verification and booking states.

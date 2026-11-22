# VAKAALAT (वकालत) — Project Context & Product Vision

> **Repository Status (Verified):** Inspection of `/Users/sanskar/Desktop/Vakaalat` confirmed an empty greenfield workspace. No existing frontend, backend, database schema, or dependencies exist yet. All five planning documents establish the baseline blueprint prior to Phase 1 implementation.

---

## 1. Product Vision

**Vakaalat (वकालत)** is a modern Indian LegalTech platform designed to make legal assistance and lawyer discovery accessible, structured, and trustworthy for ordinary citizens.

### The Core Problem
Ordinary citizens in India face structural barriers when seeking legal help:
1. **Legal illiteracy & ambiguity:** People rarely know which area of law applies to their situation (e.g., Consumer Protection vs. Civil Contract vs. Cyber Crime).
2. **Lawyer discovery friction:** Identifying a qualified, relevant advocate for a specific issue relies heavily on word-of-mouth or opaque directories.
3. **Trust deficit:** Verifying credentials, experience, and specialization is difficult for a layperson.
4. **Intimidating language:** Legal terminology alienates first-time help seekers.
5. **Privacy hesitation:** Citizens hesitate to share sensitive personal or family matters without clear disclosure boundaries.
6. **Scheduling friction:** Coordinating an initial consultation is often manual, slow, and uncertain.

### The Vakaalat Solution
A citizen describes their situation in plain, everyday language. Vakaalat uses guided, AI-assisted intake to structure the facts, produce a neutral summary, identify potentially relevant practice areas, surface verified lawyers suited to the matter, and enable straightforward consultation scheduling.

### Geographical Launch Strategy
- **Phase 1 Focus:** **Kanpur, Uttar Pradesh, India** (using clearly labeled fictional seed lawyer profiles for initial demonstration and validation).
- **Expansion Architecture:** City, district court, and state-level data models designed from day one to expand across Uttar Pradesh and other Indian cities without schema rewrites.

---

## 2. Core Positioning & Messaging

### What Vakaalat IS
- A **legal-access platform** combining intelligent legal intake, structured problem understanding, verified lawyer discovery, and consultation management.
- A **two-sided professional marketplace** with distinct, purpose-built experiences for **Clients** (help-seekers) and **Lawyers** (legal professionals).

### What Vakaalat IS NOT
- **Not** a generic lawyer directory or classifieds listing.
- **Not** a law firm website.
- **Not** an autonomous AI legal advisor or chatbot that gives legal advice, cites guaranteed outcomes, or replaces an advocate.
- **Not** a court e-filing portal (users submit *legal enquiries* for consultation, not formal court complaints).
- **Not** a generic appointment-booking widget.

### Brand Messaging Pillars
- *"Your Voice. Your Rights."*
- *"Justice, made accessible."*
- *"Start with the problem. Find the right legal professional."*
- **Intake Invitation:** *"Tell us what happened. We'll help you understand what comes next."*

---

## 3. Target Users & Roles

### A. Client (Help Seeker)
An individual or small business owner facing a legal issue who needs clarity and access to the right advocate.
- **Capabilities:** Account creation, natural-language problem intake, guided follow-up Q&A, neutral case summary review, practice area discovery, lawyer search/comparison, slot browsing, consultation booking, case & consultation tracking, and privacy controls.

### B. Lawyer (Legal Professional)
A practicing advocate offering consultations through Vakaalat.
- **Capabilities:** Dedicated professional onboarding, Bar Council credential submission for verification, practice area & language management, consultation preferences (mode, duration, fee transparency), availability management, incoming request review (accept/decline), upcoming consultation schedule, and consultation history.
- **Workspace Principle:** The lawyer experience is a **dedicated professional workspace**, not a lightly modified client dashboard.

### C. Platform Verification / Admin (Operational Role — Internal)
Required to uphold the core rule: *"Verified status, only after actual verification."*
- **Capabilities:** Review submitted lawyer credentials (Bar Council enrollment number, state bar, supporting documents) and approve/reject verification status before a lawyer is marked `Verified` publicly.

---

## 4. Core Product Workflow

```text
PROBLEM → INTAKE → UNDERSTANDING → CLASSIFICATION → LAWYER DISCOVERY → PROFILE → CONSULTATION BOOKING
```

1. **Problem:** User lands on Vakaalat and clicks *"I Need Legal Help"* / *"Start a Legal Enquiry"*.
2. **Intake:** User describes what happened in natural language; the interface guides them through clarifying questions.
3. **Understanding (Gemini AI):** AI extracts timeline, key parties, missing facts, and generates a neutral, plain-language **Case Summary** (never acting as a lawyer or predicting outcomes).
4. **Classification:** AI suggests 1–3 potentially relevant **Practice Areas** (e.g., Consumer Disputes, Property & Real Estate, Labour & Employment, Family Law, Criminal Defense) with confidence/uncertainty notes.
5. **Lawyer Discovery:** Backend queries verified/active lawyers matching practice area, city (Kanpur), languages, experience, and real availability.
6. **Profile:** Client inspects qualifications, Bar enrollment verification badge, languages, consultation modes, and real open time slots.
7. **Consultation Booking:** Client selects a backend-verified slot and submits a consultation request; lawyer accepts/declines; backend manages state transitions and notifications.

---

## 5. Brand Identity Summary

- **Brand Name:** VAKAALAT
- **Hindi Wordmark:** वकालत
- **Logo Concept:** Monochromatic, thin geometric `वकालत` wordmark with a subtle, symmetrical weighing-scale motif integrated into the *shirorekha* (top horizontal bar) / letterform. Works cleanly in both light and dark themes.
- **Visual Tone:** Editorial, authoritative, calm, contemporary Indian LegalTech. Deep midnight navy and dark forest teal foundations paired with warm ivory, muted stone, and restrained antique brass/champagne accents.
- **Explicitly Avoided:** Oversized Lady Justice statues, courthouse pillars/gavels, purple AI gradients, 3D logos, excessive glassmorphism, fake statistics (e.g., fabricated view counts), and placeholder UI.

---

## 6. Assumptions & Open Business Decisions

Because this is a greenfield build, the following items are documented as **open decisions** for stakeholder confirmation rather than invented business rules:

| # | Topic | Current Assumption for Blueprint | Decision Needed |
|---|---|---|---|
| 1 | **Consultation Payments** | Consultation scheduling supports fee display and booking state (`requested → confirmed → completed`), without live payment gateway integration in MVP. | Confirm whether MVP requires Razorpay/UPI collection at booking or pay-at-consultation / post-MVP integration. |
| 2 | **Bar Council of India (BCI) Compliance** | Under BCI Rule 36, advocates cannot solicit or advertise. Profiles present factual credentials (qualifications, enrollment year, practice areas, languages) without promotional claims, star ratings, or ranked "top" badges. | Legal/compliance review of profile copy, "verified" badge wording, and discovery sort order. |
| 3 | **Unverified Lawyer Visibility** | Newly registered lawyers can build their profile and submit credentials, but **only verified lawyers** appear in public Client discovery. | Confirm whether unverified lawyers are completely hidden from search or shown without a badge during pilot. |
| 4 | **Bilingual Support (Hindi / English)** | Typography supports Devanagari (`वकालत` + Hindi intake input), while primary UI chrome is English in Phase 1 with i18n-ready structure. | Confirm whether full Hindi UI translation is required for Kanpur launch or Phase 2+. |
| 5 | **Consultation Modes** | Support `In-Person (Kanpur Chamber)`, `Video Call`, and `Phone Call` as selectable lawyer preferences. | Confirm whether Vakaalat hosts WebRTC video or relies on external/generated meeting links in MVP. |
| 6 | **Admin Verification Tooling** | Minimal internal admin endpoints/CLI or protected `/admin/verifications` route for approving lawyer credentials. | Confirm whether a dedicated Admin UI screen is needed in MVP or API/CLI-backed review suffices initially. |

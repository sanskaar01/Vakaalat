# Vakaalat — System Architecture & Topology

> *"Deterministic state transitions, strictly guarded privacy boundaries, and an intelligent translation layer."*

---

## 1. High-Level Architectural Topology

Vakaalat divides the legal discovery lifecycle into three distinct, non-permeable security tiers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TIER 1: CITIZEN SOVEREIGN DOMAIN                    │
│                                                                             │
│   • Conversational Intake Engine (Bilingual Vernacular / Hinglish)          │
│   • Fact Provenance Tracker (USER_STATED vs AI_UNDERSTOOD)                  │
│   • Instant Citizen Fact Confirmation Gate                                  │
│   • Sovereign Identity Storage (private.citizen_profiles, private.cases)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TIER 2: THE PRIVACY REDACTION BOUNDARY                │
│                                                                             │
│   • Rule-Based Regex Scrubbers (Aadhaar, PAN, Phone, Email, Postal Codes)   │
│   • Named Entity Recognition (NER) Redaction (Names, Companies, Landlords)  │
│   • Relative Anonymization (e.g. "Employer X", "Landlord Y", "South Delhi") │
│   • Generalized Help Plea Generation (shared.help_pleas)                    │
│   • Citizen Pre-Review: "What advocates will see vs What is hidden"        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TIER 3: ADVOCATE DISCOVERY DOMAIN                    │
│                                                                             │
│   • Zero-PII Merit Feed (Niche, Jurisdiction, Timeline, Financial Relief)   │
│   • Practice Niche Indexing (~75 Subcategories across 21 Legal Areas)       │
│   • Expression of Interest FSM (Advocate reviews merit -> Expresses Interest)│
│   • Consented Disclosure Gateway (Citizen unlocks contact details)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fact Provenance & Verification

A core flaw of naive AI implementations is treating synthesized model assumptions as ground truth. In Vakaalat, every extracted claim in a citizen's story is tagged with an immutable **Provenance Status**:

```typescript
export type FactProvenance = 
  | 'USER_STATED'      // Directly spoken or written by the citizen
  | 'AI_UNDERSTOOD'    // Inferred or categorized by the intake model
  | 'USER_CONFIRMED'   // Explicitly reviewed, validated, or edited by the citizen
  | 'USER_CORRECTED';  // Corrected by the citizen after AI misunderstanding
```

### The Fast Understanding Protocol
When a citizen enters a narrative:
1. **Immediate Structural Parsing:** The intake engine parses the story into:
   - What the citizen stated happened (Key Facts).
   - What the legal nature appears to be (Category & Niche).
   - What crucial information is still missing (Missing Crucial Data).
2. **Citizen Confirmation Step:** Before any plea is generated, the citizen is presented with a clear summary:
   - *"Here is what you told us. Is this accurate?"*
   - Only confirmed facts advance to the decision engine.

---

## 3. The 3-Tier Redaction Pipeline

To ensure absolute compliance with the *Digital Personal Data Protection Act (DPDP) 2023*, citizen narratives never leak raw identifying data to the advocate discovery pool:

```
RAW CITIZEN INPUT:
"My name is Ramesh Kumar, living at Flat 402, Sunshine Apts, Saket, New Delhi.
 My landlord Vijay Sharma has withheld my Rs. 75,000 security deposit since Nov 2025.
 Call me on 9811XXXXXX."
                          │
                          ▼
            [Pass 1: Pattern Redaction]
            (Strip Phone Numbers, Emails, Bank Details, Identification Numbers)
                          │
                          ▼
            [Pass 2: Entity Masking]
            (Names transformed to generic roles: [Tenant], [Landlord], [Employer])
                          │
                          ▼
            [Pass 3: Geographic Generalization]
            (Exact addresses generalized to Court Jurisdiction: "South Delhi District")
                          │
                          ▼
SANITIZED GENERALIZED PLEA (What Advocates See):
Category: Tenancy & Rent Dispute
Jurisdiction: South Delhi District, NCT of Delhi
Timeline: November 2025 – Present
Disputed Amount: INR 75,000 (Security Deposit)
Core Issue: Landlord withholding security deposit without written deduction notice.
Legal Ask: Formal Legal Notice recovery and pre-litigation conciliation.
```

---

## 4. Finite State Machines (FSM)

All platform operations are governed by deterministic finite state machines, preventing unauthorized jumps or illegal transitions:

### Case Lifecycle FSM
```
DRAFT ──► INTAKE_PENDING ──► FACT_CONFIRMED ──► PLEA_GENERATED ──► PLEA_CONSENTED
                                                                         │
                                                                         ▼
CLOSED ◄── CONSULTATION_COMPLETE ◄── ADVOCATE_CONNECTED ◄── PLEA_BROADCAST
```

### Advocate Interest & Disclosure FSM
```
PLEA_VIEWED ──► INTEREST_EXPRESSED ──► CITIZEN_REVIEWING ──► CITIZEN_ACCEPTED
                                                     │              │
                                                     ▼              ▼
                                              CITIZEN_DECLINED   DISCLOSURE_UNLOCKED
```

No database query executed by an advocate can bypass the `DISCLOSURE_UNLOCKED` state. If a citizen declines interest or does not grant consent, private contact information remains cryptographically and structurally inaccessible.

---

## 5. Technology Foundation

Vakaalat is built on a modern, ultra-reliable 2026 full-stack architecture:

- **Frontend & Full-Stack Core:** Svelte 5 (Runes) + SvelteKit.
  - Zero virtual-DOM overhead, high responsiveness on mobile devices across 2G/3G/4G/5G Indian mobile networks.
  - Native server-driven routes eliminating client-side API credential leakage.
- **Styling & Design Tokens:** Tailwind CSS 4 + Semantic CSS Custom Properties.
  - Grounded in judicial ink, warm archival paper, brass balance tones, and clear alert indicators.
- **Deterministic Data Layer:** Drizzle ORM.
  - Complete end-to-end type safety across citizen records, state transitions, and audit logs.
- **Embedded & Cloud Persistence:** Dual-mode architecture supporting embedded PGlite for localized deterministic testing and PostgreSQL for production scale.
- **Verification Engine:** Biome for high-speed AST linting and formatting.

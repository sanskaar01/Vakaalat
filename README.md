<div align="center">

# वकालत • VAKAALAT
### *Aapki Baat Se, Aapke Haq Tak.*
**The Sovereign Legal Intake & Consented Professional Connection Platform for India**

<br />

[![Status: Active Development](https://img.shields.io/badge/Status-Active_Stealth_Development-1c1917.svg?style=flat-square)](#why-this-repository-is-private)
[![Jurisdiction: Republic of India](https://img.shields.io/badge/Jurisdiction-Republic_of_India-b45309.svg?style=flat-square)](#legal--regulatory-foundations)
[![Architecture: Sovereign Intake](https://img.shields.io/badge/Architecture-3--Layer_Sovereign_Intake-15803d.svg?style=flat-square)](#the-three-layer-architecture)
[![DPDP Act: Compliant by Design](https://img.shields.io/badge/Privacy-DPDP_2023_Compliant-047857.svg?style=flat-square)](#the-redaction-boundary)

<br />

> *"You shouldn't have to know the law to know where to begin."*

</div>

---

## ⚖️ A Founder's Note: Why Vakaalat Exists

In India, when an ordinary person encounters a legal storm—an arbitrary eviction, an unpaid salary, a cyber financial fraud, a matrimonial dispute, or an FIR—the first barrier is not the courtroom. 

**The first barrier is articulation.**

The citizen does not speak in sections of the *Bharatiya Nyaya Sanhita (BNS)* or procedural rules of the *Civil Procedure Code (CPC)*. They speak in panic, in Hindi, in Hinglish, in colloquial everyday grief:
- *"Bank se phone aaya aur saara balance chala gaya, police bolti hai cyber cell jao..."*
- *"Owner ne bina notice deposit rakh liya aur saman bahar fek diya..."*
- *"Company ne 4 mahine ki salary roki hui hai..."*

Today, such a person faces a binary trap:
1. **The Cold Directory:** Listing websites with 50,000 phone numbers where vulnerable citizens are cold-called by predatory intermediaries or bombarded with spam.
2. **The Reckless "AI Lawyer":** Chatbots that hallucinate legal verdicts, confidently tell citizens that "Section X was violated," and give dangerous advice without context or local court reality.

**Vakaalat is built on a different human conviction.**

Vakaalat is not a law firm. Vakaalat is not an autonomous artificial intelligence judge. Vakaalat does not give legal verdicts.

Instead, **Vakaalat is the bridge between raw human distress and the formal legal system.** It listens to citizens in everyday language, organizes messy facts into structured chronologies, redacts personal identifying information into a *Generalized Help Plea*, and allows verified advocates to express interest without citizen data ever being exposed until explicit, informed consent is granted.

---

## 🏛️ System Thesis: The Three-Layer Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │            CITIZEN IN DISTRESS               │
                       │  "Mere landlord ne deposit vapas nahi kiya"   │
                       └──────────────────────┬───────────────────────┘
                                              │ (Natural Language Intake)
                                              ▼
    LAYER 1: UNDERSTANDING     ┌──────────────────────────────────────────────┐
    (Sovereign Private Zone)   │       SOVEREIGN FACT STRUCTURING             │
                               │  - Provenance: USER_STATED vs AI_UNDERSTOOD  │
                               │  - Citizen edits and confirms ground truth   │
                               │  - Instant Official Resource Routing         │
                               └──────────────────────┬───────────────────────┘
                                                      │ (Explicit Confirmation)
                                                      ▼
    LAYER 2: REDACTION         ┌──────────────────────────────────────────────┐
    (The Zero-Knowledge Gate)  │         3-TIER PRIVACY DE-IDENTIFICATION     │
                               │  - Names, numbers, addresses redacted        │
                               │  - Sanitized into "Generalized Help Plea"    │
                               │  - Citizen previews: "Here's what is shared" │
                               └──────────────────────┬───────────────────────┘
                                                      │ (Citizen Grants Consent)
                                                      ▼
    LAYER 3: DISCOVERY         ┌──────────────────────────────────────────────┐
    (Professional Space)       │            VERIFIED ADVOCATE MATCH           │
                               │  - Matched strictly on Practice Niche & Court│
                               │  - Advocates evaluate merit, not identity    │
                               │  - Consented Consultation Gateway            │
                               └──────────────────────────────────────────────┘
```

1. **Intake with Empathy, Grounded in Provenance:**
   Citizens describe their issue freely. The platform helps separate *what the user explicitly stated* from *what the system inferred*. No AI inference is treated as fact until the citizen reviews and verifies it.

2. **The Generalized Help Plea:**
   Before any advocate or third party sees an inquiry, personal identifying data (names, mobile numbers, Aadhaar numbers, exact addresses, employer specifics) is stripped through a deterministic three-layer redaction pipeline. Advocates see only the legal merits: *Dispute Category, Relevant Jurisdiction, Timeline, and Specific Legal Ask.*

3. **Sovereign Consent Control:**
   Citizens hold the encryption keys to their identity. An advocate can only view contact credentials after expressing interest, verifying their Bar Council credentials, and receiving unambiguous citizen authorization.

---

## 🧭 Design Philosophy: Dignity, Craft & Restraint

Most digital products treat legal interfaces like generic enterprise SaaS or colorful consumer toys.

Vakaalat is designed with the gravity and quiet authority of the Indian legal institution:
* **The Palette:** Deep Legal Ink (`#0c0a09`), Warm Judicial Paper (`#fafaf9`), Balance Brass (`#b45309`), and Terracotta Urgency (`#991b1b`).
* **The Typography:** The classical gravitas of *Instrument Serif* paired with modern utilitarian *Inter*, and native *Tiro Devanagari Hindi* for authentic vernacular script.
* **The Living Scale:** A handcrafted interactive balance scale rooted in GSAP physics that dynamically responds to the user's role—demonstrating that law is not an administrative queue, but a pursuit of equilibrium.
* **Emotional Safety:** Calming layouts, clear step indicators, and immediate hotlines for emergencies (Cyber Crime `1930`, NALSA Tele-Law `15100`, National Consumer Helpline `1915`) displayed openly without commercial gates.

---

## 📁 Repository Overview

This public repository serves as the **Public Architectural Charter, Intellectual Provenance, and Design Blueprint** for Vakaalat:

```
Vakaalat/
├── README.md                      ← Master architectural overview & founder manifesto
├── docs/
│   ├── VISION.md                  ← Deep dive: The broken intake loop and the citizen journey
│   ├── ARCHITECTURE.md            ← The 3-layer system topology, state machines & data models
│   ├── DESIGN_PHILOSOPHY.md       ← Visual identity, Devanagari typography, and UX principles
│   ├── LEGAL_FOUNDATION.md        ← Compliance with Advocates Act 1961, BCI rules & DPDP 2023
│   └── ROADMAP.md                 ← Phased implementation horizons & platform milestones
└── LICENSE                        ← Proprietary Architectural Charter
```

---

## 🛡️ Why Core Implementation is Maintained Privately

> ### 📢 A Note on Code Visibility & Production Staging
>
> You will find our architectural specifications, domain taxonomies, and design standards published here in full transparency. However, the production application code, proprietary decision engines, statutory cross-reference graph, and production databases are maintained in our private development repository ([`sanskaar01/VakaalatPrivate`](https://github.com/sanskaar01/VakaalatPrivate)).
>
> **This is intentional.**
>
> We are not building a weekend portfolio hackathon app. We are building mission-critical public infrastructure for legal discovery across a nation of 1.4 billion people. The platform handles sensitive citizen grievances, real-time procedural rules across 25 High Courts, and strict compliance barriers under the *Digital Personal Data Protection Act (2023)* and the *Bar Council of India Rules*.
>
> Because we expect Vakaalat to fundamentally redefine how legal intake happens in India and make national impact, our core algorithmic matching engines, anti-scraping protections, and internal test suites remain under confidential staging until our controlled pilot rollout is complete.
>
> This repository stands as public, immutable proof of design authorship, architectural ownership, and foundational philosophy.

---

## 🇮🇳 Legal & Regulatory Foundations

Vakaalat strictly honors the statutory traditions of the Indian Bar:
- **No Solicitation or Advertising:** Vakaalat does not rank lawyers based on ad spend, promote featured listings, or facilitate commercial bidding in violation of *Rule 36, Chapter II, Part VI of the Bar Council of India Rules*.
- **No Unauthorized Practice of Law:** Vakaalat does not generate legal pleadings, advise on trial strategies, or pronounce statutory outcomes.
- **Data Minimization:** Built from day one to exceed the requirements of the *Digital Personal Data Protection Act, 2023 (DPDP Act)*.
- **The New Criminal Laws:** Grounded in the contemporary statutory frameworks of the *Bharatiya Nyaya Sanhita (BNS) 2023*, *Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023*, and *Bharatiya Sakshya Adhiniyam (BSA) 2023*.

---

## 📬 Contact & Inquiries

For institutional partnerships, legal scholarship dialogue, or research queries:
- **Founder & Architect:** Sanskar ([@sanskaar01](https://github.com/sanskaar01))
- **Initiative:** Vakaalat (*वकालत*)
- **Mission:** *Making legal clarity accessible to every citizen, with dignity, privacy, and precision.*

---

<div align="center">
<sub>Built with purpose in New Delhi, India • All architectural designs and trademarks © 2026 Vakaalat.</sub>
</div>

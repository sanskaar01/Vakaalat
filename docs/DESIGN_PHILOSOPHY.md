# Vakaalat — Design Philosophy & Aesthetics

> *"The design of a legal system must never feel like an ad dashboard. It must feel like an institution of quiet dignity, clarity, and trust."*

---

## 1. The Visual Manifesto

Legal stress is inherently noisy, confusing, and overwhelming. The physical world of the Indian court system—stamp papers, red ribbons, black robes, heavy wooden benches, and Devanagari notices—carries a solemn weight.

When legal-tech platforms mimic Silicon Valley consumer apps with neon purple gradients or gamified animations, they insult the gravity of the user's situation. Conversely, when they look like dated 1990s government portals, they induce dread and confusion.

Vakaalat establishes a third way: **Institutional Reverence with Contemporary Precision.**

```
+-------------------------------------------------------------------------+
|                                                                         |
|   INSTRUMENT SERIF         TIRO DEVANAGARI HINDI          INTER SANS    |
|   (Judicial Gravitas)      (Mother-Tongue Clarity)        (Data Scale)  |
|                                                                         |
|   "वकालत"                  "आपकी बात से, आपके हक तक"      "Section 318" |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

## 2. The Color System: "Court, Paper, & Ink"

Our palette draws directly from the physical materials of justice:

| Token Name | Hex Code | Meaning & Cultural Origin |
|---|---|---|
| **Legal Ink** | `#0c0a09` | The deep, permanent black ink of signed court affidavits and orders. |
| **Warm Judicial Paper** | `#fafaf9` | The cream, non-glare tone of archival court parchment and stamp papers. |
| **Balance Brass** | `#b45309` | The aged metallic gold of courtroom balance scales and Ashok Chakra emblems. |
| **Terracotta Urgency** | `#991b1b` | Red ribbon wax seals; used strictly for statutory deadlines and emergencies. |
| **Sage Verification** | `#15803d` | The quiet, calming green of confirmed facts and verified Bar credentials. |

---

## 3. The Interactive Weighing Scale (`WeighingScale.svelte`)

At the visual core of Vakaalat is an interactive vector balance scale powered by GSAP physics:

```
                  ┌───────┐
                  │   ▲   │  Fulcrum (Institutional Neutrality)
                  └───┬───┘
          ┌───────────┴───────────┐
          │      BALANCE BEAM     │
          │                       │
      ┌───┴───┐               ┌───┴───┐
      │  PAN  │               │  PAN  │
      │   A   │               │   B   │
      └───────┘               └───────┘
    [Citizen Voice]        [Advocate Counsel]
```

### Physical Behavior
- When the user selects **"I Need Legal Help"**, the left pan gently tips downward under the gravitational weight of human articulation.
- When the user selects **"I am an Advocate"**, the right pan calibrates downward, signifying professional diligence and structured analysis.
- When resting in equilibrium, the scale communicates that law is not an administrative queue, but a continuous pursuit of balance.

---

## 4. Fact Provenance Badges

To avoid deceptive AI certainty, the interface visibly displays the source of every piece of data:

- `STATED` (Slate/Paper): Extracted directly from user statements.
- `UNDERSTOOD` (Warm Brass): Proposed by the intake engine.
- `CONFIRMED` (Sage Green): Explicitly approved by the citizen.
- `REDACTED` (Muted Ink): Information shielded for citizen privacy.

Citizens and advocates immediately grasp who authored what, establishing transparent trust without guesswork.

---

## 5. Emotional Safety & Public Utility

Vakaalat views citizen guidance as a public service, not a paywalled commodity:

- **Emergency First-Response:** Direct hotlines are never hidden behind a paywall or login screen:
  - Cyber Financial Fraud: `1930`
  - NALSA Tele-Law (Free Legal Aid): `15100`
  - National Consumer Helpline: `1915`
- **Zero Advertising Banners:** No flashing discount codes, sponsored advocate banners, or intrusive lead-capture popups.
- **Language Inclusivity:** Hindi, English, and Hinglish vernacular phrases are treated as first-class input modes.

# VAKAALAT (वकालत) — Design System

## 1. Brand Identity & Logo Specification

### Primary Wordmark
- **Primary Mark:** Devanagari wordmark **वकालत** paired with tracked uppercase Latin sub-wordmark **VAKAALAT** (`letter-spacing: 0.24em`).
- **Integrated Motif:** A thin, geometric, symmetrical weighing-scale motif embedded into the *shirorekha* (top horizontal bar) above the `क` / `ल` axis, using a uniform `1.5px–2px` stroke weight.
- **Color Treatment:** Strictly monochromatic (`--color-ivory-100` on dark surfaces; `--color-navy-950` on light surfaces).
- **Clearspace & Sizing:**
  - Minimum clearspace: `1x` height of the Latin `V` around all sides.
  - Minimum digital width: `96px` (header wordmark); `32px` for compact favicon/monogram (`व` + shirorekha scale).
- **Prohibited Treatments:** No 3D extrusions, no drop shadows, no multi-stop gradients, no gavels, no courthouse pillars, and no standalone oversized Lady Justice illustrations.

---

## 2. Color System & Semantic Tokens

The palette pairs two complementary deep dark tones (**Midnight Navy** and **Dark Forest Teal**) with **Warm Ivory**, **Muted Stone**, and restrained **Antique Brass / Champagne** accents.

### 2.1 Core Palette Tokens

| Token | Hex | Usage |
|---|---|---|
| `--navy-950` | `#09111E` | Primary dark canvas, public hero & dark workspace background |
| `--navy-900` | `#0F1A2B` | Elevated dark surfaces, sidebar, primary cards in dark mode |
| `--navy-800` | `#18273E` | Subtle borders, hover surfaces, secondary dark containers |
| `--teal-950` | `#0B2220` | Secondary dark editorial band / lawyer workspace accent surface |
| `--teal-900` | `#11322F` | Active navigation highlights, subtle teal-tinted containers |
| `--ivory-50` | `#FAF8F4` | Primary light-theme canvas (high-readability intake & forms) |
| `--ivory-100` | `#F3EFE6` | Light-theme secondary surface, soft warm cards |
| `--stone-200` | `#E3DDD0` | Light-theme borders, dividers |
| `--stone-500` | `#8C867A` | Muted metadata, captions, placeholder text |
| `--ink-900` | `#141B24` | Primary text on light surfaces |
| `--ink-600` | `#4A5565` | Secondary body text on light surfaces |
| `--brass-400` | `#C8A96A` | Restrained antique brass accent (keylinks, active borders, focus rings) |
| `--champagne-200` | `#E7D8B9` | High-emphasis primary CTA fill on dark surfaces (with `--navy-950` text) |

### 2.2 Semantic Status Tokens

| Semantic Role | Dark Mode Surface / Text | Light Mode Surface / Text | Meaning |
|---|---|---|---|
| **Verified / Success** | `#122F28` / `#5FD1A5` | `#E8F5EF` / `#136B49` | Bar credential verified, consultation confirmed |
| **Pending / Warning** | `#2E2412` / `#E5B85C` | `#FDF5E6` / `#8A5A00` | Verification pending, awaiting lawyer response |
| **Danger / Declined** | `#32161A` / `#F08A92` | `#FDECEC` / `#A62632` | Slot cancelled, request declined, validation error |
| **Info / AI Draft** | `#13253B` / `#8BB8F0` | `#EDF3FB` / `#1E4E8C` | AI-generated draft summary (requires user review) |

> **Contrast Rule:** All body text and interactive controls must meet **WCAG 2.1 AA** (`≥ 4.5:1` for normal text, `≥ 3:1` for large text and UI borders).

### 2.3 Theme Strategy
- **Public Editorial & Hero / Workspace Chrome:** Dark-first foundation (`--navy-950` / `--teal-950`) communicating authority, calm, and confidentiality.
- **Long-Form Reading & Legal Intake Option:** Supports seamless **Light Mode** (`--ivory-50` canvas with `--ink-900` text) via CSS custom properties (`[data-theme="light"]` / `[data-theme="dark"]`), allowing users to switch or defaulting long-form reading views to comfortable contrast.

---

## 3. Typography System

### 3.1 Font Families
- **Display / Editorial Headings:** `'Cormorant Garamond', Georgia, serif` — authoritative, timeless editorial presence for hero statements and section titles.
- **UI & Body Sans:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` — clean, legible geometry for dashboards, forms, and case summaries.
- **Devanagari:** `'Noto Sans Devanagari', sans-serif` — crisp rendering for `वकालत` and Hindi natural-language intake.
- **Monospace (Case & Reference IDs):** `'JetBrains Mono', monospace` — tabular alignment for case IDs (`VK-2026-0142`), enrollment numbers, and timestamps.

### 3.2 Type Scale

| Token | Size / Line Height | Weight | Usage |
|---|---|---|---|
| `--text-display-xl` | `48px / 56px` (desktop), `34px / 42px` (mobile) | `600` (Serif) | Landing hero headlines |
| `--text-display-lg` | `36px / 44px` | `600` (Serif) | Page headers, section titles |
| `--text-h2` | `24px / 32px` | `600` (Sans) | Workspace screen titles |
| `--text-h3` | `18px / 26px` | `600` (Sans) | Card headers, modal titles |
| `--text-body-lg` | `16px / 26px` | `400` (Sans) | Intake descriptions, case summaries |
| `--text-body` | `14px / 22px` | `400` (Sans) | Standard UI copy, tables, inputs |
| `--text-caption` | `12px / 18px` | `500` (Sans) | Metadata, helper text, timestamps |
| `--text-overline` | `11px / 16px` | `600` (Sans, `0.08em` tracking) | Section eyebrows, category labels |

---

## 4. Spacing, Layout, Radii & Elevation

### 4.1 Spacing Scale (`4px` base unit)
`4px (1)`, `8px (2)`, `12px (3)`, `16px (4)`, `20px (5)`, `24px (6)`, `32px (8)`, `40px (10)`, `48px (12)`, `64px (16)`, `96px (24)`.

### 4.2 Grid & Breakpoints
- **Max Container Width:** `1280px` (public pages); `1440px` (authenticated workspace).
- **Breakpoints:** `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`.
- **Workspace Layout:** Fixed `248px` left sidebar on desktop (`≥ 1024px`), collapsible drawer on tablet/mobile.

### 4.3 Border Radii (Restrained & Consistent)
- `--radius-sm: 4px` — Badges, tags, small checkboxes.
- `--radius-md: 8px` — Inputs, buttons, dropdowns, table rows.
- `--radius-lg: 12px` — Cards, modals, intake panels.
- `--radius-pill: 9999px` — Reserved strictly for primary hero CTAs and status dots (avoid overusing pill shapes on cards).

### 4.4 Shadows & Borders
- Prefer **1px hairline borders** (`1px solid var(--border-subtle)`) over heavy drop shadows.
- `--shadow-sm`: `0 1px 2px rgba(9, 17, 30, 0.16)` (buttons, small popovers).
- `--shadow-md`: `0 8px 24px rgba(9, 17, 30, 0.28)` (modals, command/filter drawers).

---

## 5. Core Reusable Component Library

All components will live under `frontend/src/components/ui/` and consume design tokens exclusively.

1. **Buttons (`Button`)**
   - `primary`: Champagne fill (`--champagne-200`) with Navy ink on dark; Navy fill with Ivory text on light.
   - `secondary`: `1px` border (`--brass-400` or `--border-default`), transparent fill.
   - `ghost`: Text-only with subtle hover tint.
   - `danger`: Semantic red outline/fill for cancel/withdraw actions.
   - States: `default`, `hover`, `focus-visible` (`2px solid --brass-400` offset), `disabled`, `loading` (inline spinner, preserves width).

2. **Form Inputs (`Input`, `Textarea`, `Select`, `DateSlotPicker`)**
   - Clear top label, optional helper text, inline error message below with `aria-describedby`.
   - `Textarea` supports auto-grow for natural-language legal intake.

3. **Navigation (`PublicNavbar`, `WorkspaceSidebar`, `MobileNavDrawer`)**
   - Strictly separate public header (links + `For Lawyers` + `Sign In`) from authenticated sidebar (`Dashboard`, role-specific links, `Account & Privacy`).

4. **Cards (`Card`, `LawyerCard`, `CaseSummaryCard`, `SlotCard`)**
   - Consistent `20px–24px` internal padding, clear visual hierarchy: Overline → Title → Metadata → Primary Action.
   - No fake counters or ungrounded urgency labels.

5. **Badges (`Badge`, `VerifiedBadge`)**
   - `VerifiedBadge`: Rendered **only** when `verificationStatus === 'verified'`. Displays shield/check icon + `"Bar Verified"`.
   - `AIInsightBadge`: Explicitly labels AI-generated summaries/practice-area suggestions as `"AI-Assisted Summary — Not Legal Advice"`.

6. **Modals & Drawers (`Modal`, `SlideOverDrawer`)**
   - Focus-trapped, `Esc` to close, backdrop blur restrained (`4px`). Used for slot confirmation, credential upload preview, and cancellation confirmations.

7. **Tables (`DataTable`)**
   - Clean horizontal hairlines, tabular numbers, sticky header on scroll, responsive card fallback on mobile (`< 768px`).

8. **Tabs & Dropdowns (`Tabs`, `DropdownMenu`)**
   - Underline-style tabs for workspace views (`Upcoming`, `Pending`, `History`) with `2px` `--brass-400` active indicator.

9. **Notifications & Feedback (`Toast`, `NotificationBell`, `EmptyState`, `Skeleton`)**
   - **Empty States:** Thoughtful, domain-specific copy + single clear CTA (e.g., *"No legal enquiries yet. Describe what happened to get started."*).
   - **Loading States:** Content-matched skeleton blocks for lawyer cards and intake summaries; explicit status indicator during Gemini analysis (*"Structuring your account..."*).

---

## 6. Motion & Accessibility Rules
- **Motion:** Subtle, functional transitions (`150ms–200ms cubic-bezier(0.16, 1, 0.3, 1)`). Respect `prefers-reduced-motion: reduce`.
- **Accessibility:** Full keyboard navigation, semantic landmarks (`<header>`, `<nav>`, `<main>`), `aria-live="polite"` for AI intake responses and toast notifications.

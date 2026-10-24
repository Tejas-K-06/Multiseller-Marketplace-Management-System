# Design System — Multi-Seller Marketplace Management System

This file defines how the frontend **looks and feels**. It is the source of truth for every UI decision. It says nothing about which content appears on which page (that is in `HLD.md`, `LLD.md` and `API_DESIGN.md`). When a situation is not covered here, choose the most restrained option that fits section 1 and flag it in the pull request.

**For Codex / any agent:** read sections 1–4 before writing UI code, and run the checklist in section 15 before calling a screen done.

---

## 1. Character and principles

Buyers trust this site with payments and sellers trust it with their stock. It must read as **clear, precise and trustworthy**, not as a flashy shopping app.

1. **Restraint is the brand.** Three colour families, one serif, small corner radii, almost no shadows. If a visual device only decorates, remove it.
2. **Precision over friendliness.** Tight radii, hairline borders, aligned figures and consistent control heights.
3. **Colour means something.** Strong colour is for primary actions, selection and status. Large surfaces stay white or near-white.
4. **Shape before hue.** State is shown with fill, outline, ring, icon and position, never with a new colour. The UI must be fully understandable in greyscale.
5. **Calm and orderly.** Legible, uncluttered, easy on a phone.

---

## 2. Frontend stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | React + Vite (JavaScript), `react-router-dom` | Function components and hooks only. |
| Styling | **Plain CSS with CSS variables** | No Tailwind, no shadcn/ui, no component library (project rule: keep dependencies minimal). All tokens live in `src/styles/tokens.css`. |
| Icons | `lucide-react` | The only extra UI dependency. See section 9. |
| Fonts | IBM Plex Sans, IBM Plex Mono, Newsreader | Self-hosted through `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`, `@fontsource/newsreader` (bundled by Vite). Never load fonts from a CDN. |
| Interactive widgets | Native HTML | `<dialog>` for dialogs, `<details>` for collapsibles, `<button>`/`<a>`/`<input>` for the rest. Keep native keyboard behaviour; do not break it with custom wrappers. |

Allowed dependencies for the frontend: `react`, `react-dom`, `react-router-dom`, `lucide-react`, and the three `@fontsource` font packages. Nothing else.

---

## 3. The three-colour rule

Every screen uses exactly three colour families:

1. **White** — surfaces.
2. **Dark blue** — `blue-900` / `blue-950`, plus the `slate` scale for text and rules (slate reads as a paler navy, not a fourth colour).
3. **Cyan** — `cyan-700` / `cyan-800` and light tints, as the single accent.

No green, amber, red, purple, orange or any other hue appears anywhere: not in status badges, alerts, charts, illustrations or hover states.

**One exception: form validation red.** `red-700` (`#B91C1C`), the `--destructive` token, is used **only** for inline form validation: the error message under a field and that field's border. Never for buttons, badges, alerts, banners, icons elsewhere, or any non-validation state. A failed payment, a cancelled order or a server error is **not** validation and uses the neutral treatments in section 5.

---

## 4. Colour tokens

### 4.1 Palette

| Role | Name | Hex | Token |
|---|---|---|---|
| Surface (cards, header, tables) | White | `#FFFFFF` | `--card` |
| Page ground | Slate 50 | `#F8FAFC` | `--background` |
| Subtle fill | Slate 100 | `#F1F5F9` | `--subtle` |
| Border | Slate 200 | `#E2E8F0` | `--border` |
| Input border | Slate 300 | `#CBD5E1` | `--input` |
| Tertiary text (lightest allowed on white) | Slate 500 | `#64748B` | `--text-muted` |
| Secondary text | Slate 600 | `#475569` | `--text-secondary` |
| Strong secondary text | Slate 700 | `#334155` | `--text-strong` |
| Body text / deep navy | Blue 950 | `#172554` | `--foreground`, `--navy` |
| Primary | Blue 900 | `#1E3A8A` | `--primary` |
| Accent | Cyan 700 | `#0E7490` | `--brand` |
| Accent text on tint | Cyan 800 | `#155E75` | `--brand-strong` |
| Accent dashed border | Cyan 600 | `#0891B2` | `--brand-dashed` |
| Accent tint border | Cyan 200 | `#A5F3FC` | `--brand-border` |
| Accent tint fill / hover fill | Cyan 50 | `#ECFEFF` | `--brand-subtle`, `--hover` |
| Validation error | Red 700 | `#B91C1C` | `--destructive` (form validation only) |

### 4.2 `src/styles/tokens.css`

```css
:root {
  /* colour */
  --background: #F8FAFC;
  --card: #FFFFFF;
  --subtle: #F1F5F9;
  --border: #E2E8F0;
  --input: #CBD5E1;
  --text-muted: #64748B;
  --text-secondary: #475569;
  --text-strong: #334155;
  --foreground: #172554;
  --navy: #172554;
  --primary: #1E3A8A;
  --primary-foreground: #FFFFFF;
  --brand: #0E7490;
  --brand-strong: #155E75;
  --brand-dashed: #0891B2;
  --brand-border: #A5F3FC;
  --brand-subtle: #ECFEFF;
  --hover: #ECFEFF;
  --destructive: #B91C1C;
  --disabled-text: #64748B;
  --focus-ring: rgba(14, 116, 144, 0.18);
  --overlay: rgba(23, 37, 84, 0.4);  /* dialog backdrop */

  /* shape */
  --radius-sm: 4px;   /* badges, inputs */
  --radius-md: 6px;   /* buttons, cards, rows */
  --radius-lg: 8px;   /* dialogs, menus */
  --shadow-float: 0 12px 28px rgba(23, 37, 84, 0.14); /* floating layers only */

  /* spacing: 4px grid */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-16: 64px;

  /* fonts */
  --font-sans: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-serif: "Newsreader", Georgia, "Times New Roman", serif;
}

html { font-size: 100%; }  /* 16px root; every size below is in rem */
body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font: 400 0.875rem/1.55 var(--font-sans);
}
:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
```

Fonts are imported once in `src/main.jsx`:
`import '@fontsource/ibm-plex-sans/400.css'` (also 500, 600), `@fontsource/ibm-plex-mono/400.css` (also 500), `@fontsource/newsreader/500.css`.

### 4.3 Usage rules

- **Page ground** is `--background`. **Cards, tables, panels, header bar** are `--card`. Never put white cards on a white page without the slate-50 ground between.
- **Primary buttons, selected chips, active step dots, primary badges:** `--primary` fill, `--primary-foreground` text.
- **Accent (`--brand`)** is used only for: active navigation indicator, focus rings, links, the current step in a progress sequence, selected list rows (ring plus `--brand-subtle` fill), and notice tags. Never for large fills or body text blocks.
- **Footer** uses `--navy` with white / slate-300 text.
- **Text:** body `--foreground`; secondary `--text-secondary`; captions and metadata `--text-muted`. Do not introduce other greys.
- Raw hex values are allowed **only** inside `tokens.css`. Everywhere else use `var(--token)`.
- **No gradients**, no decorative background images, no tinted section washes beyond slate-50 and cyan-50.

### 4.4 Contrast

- All text meets **WCAG 2.1 AA** (4.5:1 normal, 3:1 large).
- White text is allowed on `--primary`, `--navy`, `--brand` and `--brand-strong` only. **Never** on cyan-600 or lighter.
- `--text-muted` (slate-500) is the lightest text colour allowed on white or slate-50. Slate-400 is for disabled states and decorative dividers only.

---

## 5. State and status language

With only two hues, state is carried by **shape**:

| State | Treatment |
|---|---|
| Complete / confirmed | Solid `--primary` fill, white text or check icon. |
| Current / in progress | White fill, 2px `--brand` ring; label in `--brand`, semibold. |
| Upcoming / not started | White fill, 1.5px `--input` outline; label in `--text-muted`. |
| Needs the user's action | Card border becomes `--brand`; a slim banner at the card top in `--brand-subtle` with `--brand-strong` text and an info icon. |
| Pending / awaiting someone else | White badge, **dashed** `--brand-dashed` border, `--brand-strong` text. |
| Unavailable / disabled | `--subtle` fill, `--input` border, `--disabled-text`; not focusable if not actionable. |
| Selected (list or chips) | Chips: solid `--primary`. List rows: `--brand-subtle` fill + inset 1px `--brand` ring + filled radio indicator. |
| Value not available | `--background` fill, dashed `--input` border, `--text-muted` text. |

**Every status also has a text label.** Colour or shape alone is never the only signal.

### 5.1 Marketplace status mapping

| Value (from the database) | Badge label | Treatment |
|---|---|---|
| Order `PLACED`, sub-order `PENDING` | Placed / Pending | Pending (dashed) |
| Sub-order `CONFIRMED` | Confirmed | Tint (`--brand-subtle` fill, `--brand-border`, `--brand-strong` text) |
| Sub-order `SHIPPED` | Shipped | Tint, with a truck icon |
| Order / sub-order `DELIVERED` | Delivered | Solid primary, check icon |
| `CANCELLED` | Cancelled | Outline: 1px `--input` border, `--text-secondary` text, x icon |
| Payment `PENDING` | Payment pending | Pending (dashed) |
| Payment `SUCCESS` | Paid | Solid primary, check icon |
| Payment `FAILED` | Payment failed | Outline: 1px `--text-strong` border, alert-circle icon; plus an Alert explaining the retry. **Not red.** |
| Payment `REFUNDED` | Refunded | Tint, undo icon |
| Seller `PENDING` / `APPROVED` / `REJECTED` | Pending approval / Approved / Rejected | Pending (dashed) / Solid primary / Outline |
| Product or offer `INACTIVE` | Inactive | Disabled style |
| Stock below 10 | Low stock: n left | Tint |
| Stock 0 | Out of stock | Disabled style; "Add to cart" disabled |
| Verified purchase review | Verified purchase | Tint, badge-check icon |

**Order progress** is a horizontal stepper: Placed → Confirmed → Shipped → Delivered. Circular dots (20–24px) joined by 2px connectors that turn `--primary` once the preceding step is complete. Checkout uses the same stepper for Address → Payment → Review.

**API errors** (server failed, out of stock at checkout, coupon expired) use the Alert component (`--brand-subtle`, info icon, clear wording). They are not red.

---

## 6. Typography

### 6.1 Families

| Family | Role | Rules |
|---|---|---|
| **Newsreader** (500) | Page titles, large display text | Never for UI labels, buttons, tables, forms, body text. Max one serif heading level per screen region. |
| **IBM Plex Sans** (400, 500, 600) | Everything else | 700 only for tiny tag text. |
| **IBM Plex Mono** (400, 500) | SKUs, order numbers, tracking numbers, coupon codes, prices, quantities, dates in tables | Only where digits or characters must align or be copied. Not for decorative labels. |

### 6.2 Scale

Base is a **16px root**; all sizes are in `rem`.

| Class | Size | Line height | Family / weight | Tracking | Use |
|---|---|---|---|---|---|
| `.display` | 3.5rem | 1.05 | Serif 500 | −0.022em | Home hero only |
| `.title-lg` | 2.25rem | 1.12 | Serif 500 | −0.015em | Page titles |
| `.title-md` | 1.625rem | 1.2 | Serif 500 | −0.01em | Sub-sections |
| `.heading` | 1.0625rem | 1.35 | Sans 600 | −0.01em | Card and panel titles |
| `.subheading` | 0.9375rem | 1.4 | Sans 600 | −0.006em | Row titles, product names in lists |
| `.body-lg` | 1.0625rem | 1.55 | Sans 400 | 0 | Lead paragraphs |
| `.body` | 0.875rem | 1.55 | Sans 400 | 0 | Default text and controls |
| `.small` | 0.8125rem | 1.5 | Sans 400/500 | 0 | Secondary and helper text |
| `.caption` | 0.75rem | 1.45 | Sans 400 | 0 | Metadata, footnotes |
| `.overline` | 0.6875rem | 1.3 | Sans 600, uppercase | 0.07em | Table headers and field-group labels only |

### 6.3 Rules

- Sentence case everywhere (headings, buttons, menus, labels). Uppercase only for `.overline`.
- Paragraph measure under ~75 characters (`max-width: 36rem`).
- `font-variant-numeric: tabular-nums` on every numeric column.
- Right-align numbers and currency in tables. Format money with `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`, giving **₹1,00,000** grouping. Put this in one helper, `src/utils/formatPrice.js`.
- Do not accent single words in headings with colour, italics or weight.

---

## 7. Layout, spacing and shape

### 7.1 Containers

- Content container: **max-width 80rem**, side padding **2rem** desktop, 1.25rem tablet, 1rem mobile.
- Two-column layouts (cart + summary, product detail + buy box, checkout + order summary): flexible main column + fixed side panel of **20–24rem**. The side panel stacks below main content under 1024px.
- Content is **left-aligned**. Centre only for empty states and single-action confirmation screens (for example "order placed").

### 7.2 Spacing (4px grid)

| Context | Value |
|---|---|
| Inside compact controls / chips | 8–12px horizontal |
| Card padding | 16px dense, 20px default, 24px feature |
| Gap between cards in a stack or grid | 12–16px |
| Gap between page regions | 24px |
| Home page section vertical padding | 64px |
| Page header padding | 24–28px top, 20–24px bottom |

### 7.3 Radius

| Element | Radius |
|---|---|
| Badges, tags, inputs | 4px (`--radius-sm`) |
| Buttons, cards, panels, list rows | 6px (`--radius-md`) |
| Dialogs, menus | 8px (`--radius-lg`) |
| Filter chips, status dots | fully rounded |

Never exceed 8px.

### 7.4 Borders and elevation

- Default separation is a **1px `--border`**. Dividers inside cards use `--subtle`.
- **No shadows on cards.** Shadows only on floating layers (dialogs, mobile menu panel, popovers): `--shadow-float`.
- No inner glows, no blurred glass.

### 7.5 Control sizes

| Size | Height | Use |
|---|---|---|
| sm | 32–36px | Row actions, table actions, filter chips |
| default | 40px | Forms, toolbar buttons |
| lg | 44–46px | Primary page actions (Place order, Add to cart on detail page) |

All touch targets are at least 40×40px.

---

## 8. Components (plain CSS classes)

Each component is one small CSS block (put them in `src/styles/components.css`, imported in `main.jsx`) and, where it has behaviour, one React component in `src/components/`.

| Component | Class / element | Style direction |
|---|---|---|
| **Header (main bar)** | `.site-header` | 68px, white, bottom border. Brand wordmark at left (text, IBM Plex Sans 600, navy), links at right. Links 14px sans 500 in `--text-strong`; the active link is `--primary`, 600, with a **2px `--brand` underline flush with the bar's bottom edge**. Links change by role (see `LLD.md`). One primary call to action (for example Login or Register) sits last as a filled primary button. |
| **Mobile menu** | `.nav-toggle` + `.nav-panel` | Under 768px the links collapse into a panel opened by an icon button (`aria-expanded`, `aria-controls`); panel uses `--shadow-float`, 8px radius. |
| **Footer** | `.site-footer` | `--navy`, white links, one row of text. No icon columns or social badges. |
| **Skip link** | `.skip-link` | First focusable element; visible on focus. |
| **Button — primary** | `.btn .btn-primary` | `--primary`, white, 600 weight, 6px radius. One per region. |
| **Button — secondary** | `.btn .btn-secondary` | White, 1px `--input` border, `--foreground` text. |
| **Button — ghost** | `.btn .btn-ghost` | No border; hover `--hover`. |
| **Button — destructive** (cancel order, remove) | `.btn .btn-secondary` + confirm dialog | Outline in navy text with a confirmation `<dialog>`. Never a filled red button. |
| **Links** | `a` | `--brand`, underline on hover only; `--brand-strong` on hover. |
| **Inputs / select / textarea** | `.field`, `.input` | 40px, white, 1px `--input`, 4px radius. Focus: `--brand` border + 3px `--focus-ring`. Label above, 13px 600. Helper text below in `.caption`. **Invalid:** border becomes `--destructive`; error message directly below in `.caption`, `color: var(--destructive)`, `role="alert"`. Show it after blur or submit, not while the user types for the first time. |
| **Checkbox / radio** | `input[type]` with `accent-color: var(--primary)` | Radios in selectable rows use the `--brand` ring indicator. |
| **Chips** | `.chip`, `.chip[aria-pressed="true"]` | Pill, 34px, white with `--input` border; selected = solid `--primary`. Used for category filters. |
| **Selectable rows** | `.select-row` | Full-width rows, 6px radius, 1px `--border`; selected = `--brand-subtle` fill + `--brand` ring. Used for address choice and payment method. |
| **Card / panel** | `.card` | White, 1px border, 6px radius, no shadow. Header row separated by a `--subtle` divider. |
| **Product card** | `.card.product-card` | Image area is a `--subtle` block with a lucide `Package` icon (no photos, see §10); title `.subheading`; store name `.caption`; price in mono; rating as text ("4.5 · 12 reviews"). No hover lift. |
| **Table** | `.table-wrap > table` | White container, 6px radius, border. Header row `--background` with `.overline` labels. Row height ≥ 52px, `--subtle` dividers, no zebra. Numbers right-aligned in mono. Under 768px rows become stacked cards with label/value pairs. |
| **Tabs** | `.tabs`, `.tab` | Underline tabs: active = `--primary` text, 600, 2px `--brand` underline; count badge solid primary when active, `--subtle` otherwise. |
| **Badge** | `.badge` + variant | 11px 600, 4px radius, 3–4px × 8px padding. Variants: `.badge-solid`, `.badge-outline`, `.badge-tint`, `.badge-pending` (dashed). Mapping in §5.1. |
| **Stepper** | `.stepper` | §5. Labels under dots, current label in `--brand`. |
| **Alert / message** | `.alert` (`Message` component) | `--brand-subtle` fill, `--brand-border`, info icon. No separate success / warning / error colour; wording and icon carry meaning. |
| **Dialog** | native `<dialog>` | 8px radius, `--shadow-float`, backdrop `--overlay`. Title `.heading`, never serif. |
| **Empty state** | `.empty` | Centred, one sentence, one action. No illustrations. |
| **Skeleton** | `.skeleton` | `--subtle` blocks matching the final layout; no shimmer. Use for loading lists and detail pages. |
| **Quantity input** | `.qty` | − / number / + buttons, 36px, mono digits. |

---

## 9. Iconography

- `lucide-react` only. Stroke width **1.75–2**; sizes **14px** (inline with 12–13px text), **16px** (default), **20px** (standalone buttons).
- Icons inherit `currentColor`, are never multi-coloured and never the only indicator of meaning.
- Icon-only buttons require an `aria-label`.
- **No emoji anywhere in the UI.**

---

## 10. Imagery

- This project has **no image upload**. Products, stores and people use a neutral `--subtle` block with a single lucide icon or initials. Do not use illustrations, stock photos or AI-generated images.
- If real photos are added later, they sit in 6px-radius frames with a 1px border and no tint or overlay.
- There is no logo file. The wordmark is text (IBM Plex Sans 600, navy).

---

## 11. Accessibility

- A **skip-to-content link** is the first focusable element.
- Visible focus on every interactive element: 2px outline with 2px offset (`:focus-visible` in `tokens.css`). Never remove outlines without a replacement.
- Full keyboard operation for the menu, tabs, steppers, selectable rows and dialogs.
- Semantic landmarks: `header`, `nav` with `aria-label`, `main`, `footer`. One `h1` per page.
- Every status and badge has a text equivalent (§5).
- Form fields have a visible `<label>`; errors use `role="alert"`.
- Respect `prefers-reduced-motion` (§12).

---

## 12. Motion

- Motion only as a **response to user action**: opening the mobile menu, opening a dialog, expanding a collapsible, switching tabs.
- Durations **120–200ms**, `ease-out` entering, `ease-in` leaving. Nothing over 250ms.
- Allowed properties: opacity, small translate, height for collapsibles.
- No page-load animations, scroll reveals, hover lift, parallax, animated gradients or shimmer.
- Under `prefers-reduced-motion: reduce`, remove transforms and keep only instant or opacity changes:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
}
```

---

## 13. Responsive behaviour

| Breakpoint | Behaviour |
|---|---|
| ≥ 1280px | Full layout; container capped at 1280px. |
| 1024–1279px | Same structure, tighter gutters; side panels narrow to 20rem. |
| 768–1023px | Side panels move below main content. Navigation collapses into the menu panel; the primary call to action stays visible in the bar. |
| < 768px | Single column. Tables become stacked row cards. Product grid becomes one or two columns. |

Touch targets ≥ 40px. No horizontal page scroll at any width; wide tables scroll inside their own container. Mobile has **medium priority** (it must work for browsing, cart and checkout, but desktop is designed first).

---

## 14. Decisions

| Question | Decision |
|---|---|
| Framework | Vite + React Router (JavaScript) |
| Styling | Plain CSS variables, no Tailwind or shadcn/ui |
| Validation red | `--destructive` for form validation only |
| Dark mode | Not required |
| Hindi / language switch | Not required |
| High-contrast toggle, text-size control | Not required |
| Brand assets | None; text wordmark |

---

## 15. Definition of done — visual checklist

- [ ] Only white, dark-blue/slate and cyan values are used; no hex codes outside `tokens.css`. The only exception is `--destructive` on inline form validation.
- [ ] No white text on anything lighter than cyan-700.
- [ ] Failed payments, cancelled orders and server errors are **not** red.
- [ ] Newsreader appears only in page and section titles.
- [ ] Mono is used only for SKUs, order and tracking numbers, coupon codes, prices, quantities and table dates.
- [ ] Sentence case everywhere except `.overline` labels.
- [ ] No card shadows; no radius above 8px; no gradients; no emoji.
- [ ] Every status has a text label and a shape difference, not just a colour difference.
- [ ] Money is formatted with the shared `formatPrice` helper (₹, Indian grouping).
- [ ] Keyboard-only walkthrough works and focus is always visible.
- [ ] Layout holds at 1280, 1024, 768 and 375px with no horizontal page scroll.
- [ ] Reduced-motion setting removes all transforms.
- [ ] Greyscale check: the screen is still fully understandable.

---

## 16. How this fits the frontend commits

No extra frontend commit is needed. The design is applied inside the planned commits so each student keeps exactly seven.

| Commit | Design work included |
|---|---|
| F1 | Already done with a basic `global.css`; replaced in F2. |
| F2 | Add `tokens.css` and `components.css`, install the font packages and `lucide-react`, restyle layout, Navbar, Footer, Login, Register (buttons, inputs, validation, alert, skip link). |
| F3 | Product card, chips, badges, skeletons, empty state, `formatPrice`. |
| F4 | Table / stacked cards, quantity input, tabs or cards for wishlists. |
| F5 | Stepper, selectable rows, status badges (§5.1), confirm dialog. |
| F6 | Seller and admin tables, forms, badges. |
| F7 | Fix any checklist items from §15 that real data exposes. |

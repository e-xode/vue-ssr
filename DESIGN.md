---
name: Vue SSR Starter Kit
description: A calm, bordered, single-accent Material Design 3 foundation that a fork can inherit and rebrand without undoing anything.
colors:
  signal-indigo: "#4f46e5"
  signal-indigo-hover: "#4338ca"
  signal-indigo-active: "#3730a3"
  signal-indigo-dark-theme: "#818cf8"
  paper-white: "#ffffff"
  paper-mist: "#fafafa"
  paper-fog: "#f5f5f5"
  hairline: "#e5e5e5"
  hairline-soft: "#f0f0f0"
  ink: "#171717"
  ink-muted: "#525252"
  ink-faint: "#a3a3a3"
  feedback-success: "#16a34a"
  feedback-warning: "#d97706"
  feedback-error: "#dc2626"
  night-background: "#0a0a0a"
  night-surface: "#171717"
  night-surface-raised: "#262626"
  night-hairline: "#404040"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0"
  code:
    fontFamily: "'IBM Plex Mono', ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.signal-indigo}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
  button-primary-hover:
    backgroundColor: "{colors.signal-indigo-hover}"
  button-primary-active:
    backgroundColor: "{colors.signal-indigo-active}"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  text-field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  chip:
    rounded: "{rounded.lg}"
  alert:
    rounded: "{rounded.lg}"
---

# Design System: Vue SSR Starter Kit

## 1. Overview

**Creative North Star: "The Quiet Foundation"**

This is a base a developer forks, not a brand to be admired. It is a clean, production-grade Material Design 3 system built on Vuetify 4: flat bordered surfaces, one indigo accent, generous whitespace on an 8px rhythm, and elevation that appears only when the user interacts. It should read as trustworthy, modern and developer-grade. The win condition is calm consistency, not visual spectacle; when in doubt, do less.

The system is deliberately the opposite of a showpiece. A forker must be able to rebrand it by changing tokens in one place, so every visual decision is a variable, and decoration is rare enough that removing it costs nothing.

**Key Characteristics:**
- Two quiet surfaces only: white and light gray, in both themes.
- One brand color, indigo, used as a function (action, link, focus), never as a wash.
- Borders over shadows: cards are flat and hairline-bordered at rest.
- Whitespace is the device; rhythm comes from the 8px scale, not ornament.
- Motion is `transform` and `opacity` only, short, and always self-guarded for reduced motion.

## 2. Colors

A restrained palette: one indigo, a neutral gray ramp, and a feedback trio that is reserved for status. There is no second expressive accent family. Values mirror `src/styles/variables.scss` and the light and dark themes in `src/plugins/vuetify.js`; the code wins if they ever disagree.

### Primary
- **Signal Indigo** (`#4f46e5`): the identity. Primary calls to action, links, active states, focus rings, the active tab indicator. Hover is `#4338ca`, pressed is `#3730a3`. In the dark theme it lightens to `#818cf8` for contrast.

### Neutral
- **Paper White** (`#ffffff`): the default content surface.
- **Paper Mist** (`#fafafa`): the page background and the alternating section surface.
- **Paper Fog** (`#f5f5f5`): inset panels and the surface-variant.
- **Hairline** (`#e5e5e5`): borders and dividers; `#f0f0f0` for the softer variant.
- **Ink** (`#171717`): primary text. **Ink Muted** (`#525252`): secondary text and the secondary action color. **Ink Faint** (`#a3a3a3`): disabled chrome.
- Night theme: background `#0a0a0a`, surface `#171717`, raised surface `#262626`, hairline `#404040`.

### Feedback
- **Success** (`#16a34a`), **Warning** (`#d97706`), **Error** (`#dc2626`): status only. Never decoration, never a hero accent. Informational status reuses indigo.

### Named Rules
**The One Accent Rule.** Indigo is rare on purpose. One primary call to action per view, plus links, focus and active states. A second competing accent in the same view is a defect.

**The Two Surfaces Rule.** A page is built from white and light gray. No third tinted surface, no gradient surface, no saturated section band. Sections are separated by a hairline or a soft shadow.

**The Feedback Stays Feedback Rule.** Green, amber and red appear only on status. Text on any colored surface meets WCAG AA (4.5:1 body, 3:1 large text and UI); verify tonal alerts in both themes.

## 3. Typography

**Display and body font:** Inter (weights 400, 500, 600, 700), with the system stack as fallback.
**Mono font:** IBM Plex Mono (weights 400, 500, 600).

**Character:** characterful but sober. Weight and size create hierarchy; there are no gradient texts and no display flourishes.

### Hierarchy
- **Display** (700, 3rem, 1.2, -0.02em): hero headlines only.
- **Headline** (600, 1.875rem, 1.35, -0.01em): page and section headings.
- **Title** (600, 1.25rem, 1.35): card titles and sub-sections.
- **Body** (400, 1rem, 1.55): running text; keep lines to a readable measure.
- **Label** (500, 0.875rem, 1.35): buttons, form labels, chips; caption is 0.75rem.
- **Code** (IBM Plex Mono, 0.875rem): code snippets, tokens and technical labels only; never decorative.

### Named Rules
**The Heading Order Rule.** Never skip heading levels; use Vuetify's `text-h1` to `text-body-2` classes consistently.

**The Mono Is Technical Rule.** IBM Plex Mono marks genuinely technical content for a developer audience. Using it as styling is a defect.

## 4. Layout

Mobile-first, built on an 8px base unit. Spacing is `4, 8, 16, 24, 32, 48` px; vertical section padding is `48`, `80` or `128` px. All spacing is a multiple of 4px and comes from a token, never an arbitrary value. Containers cap at `640, 768, 1024, 1280` px. Breakpoints are `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`, applied with the `respond-to()` mixin; design for the smallest screen first and add complexity as the viewport grows. The header is 64px tall.

### Named Rules
**The Whitespace Is The Device Rule.** Breathing room, not decoration, carries the rhythm. Add space before adding an element.

**The Sibling Consistency Rule.** Visual peers in the same grid or section are identical in hover, shadow, border and decoration.

## 5. Elevation & Depth

Flat at rest, lifted on interaction. Cards carry no elevation and a hairline border by default; depth appears only on hover, drawn from the soft shadow tokens (`0 1px 2px` at 4% up to `0 8px 24px` at 10% alpha). Shadows never exceed roughly 10% alpha.

### Named Rules
**The Borders Over Shadows Rule.** At rest, separation is a border. A shadow at rest is a defect; a shadow on hover is the intended signal.

**The Decorations Stay Inside Their Shape Rule.** An accent bar or border on a rounded card uses `overflow: hidden` and a pseudo-element. Never a raw `border-left` or `border-top` on an element with `border-radius`, and never a `::before` or `::after` offset outside the box; both push square corners past the radius.

## 6. Shapes

A single rounded language. The default is `12px` (`lg`) on buttons, cards, inputs, chips and alerts; `8px` for tight elements, `4px` for the smallest, `16px` for large panels. Corners are always real: borders and decorations respect the radius.

## 7. Components

### Buttons
- **Primary:** flat, indigo fill, white text, `12px` radius. Hover darkens toward `#4338ca`, pressed to `#3730a3`, using Vuetify's built-in state. No custom halo.
- **Secondary and supporting actions:** neutral gray, never indigo, so the single accent stays rare.
- **Focus:** a visible focus ring in indigo; never removed.

### Cards
- **Default:** white surface, `12px` radius, hairline border, no elevation, `24px` padding.
- **Canonical hover for a content card:** lift by 4px with a soft shadow (the `hover-lift` mixin), or tint the border from hairline to indigo. Pick one per block and apply it to every peer.
- **Icon inside a card:** reacts with its parent's hover. It never has its own separate effect.

### Inputs / Fields
- **Style:** outlined, comfortable density, `12px` radius, white background, hairline stroke.
- **Focus:** the stroke shifts to indigo with a visible ring.
- **Error and disabled:** error uses the error color with a text message and an icon (never color alone); disabled is muted with no pointer events.

### Chips and Alerts
- **Chip:** `12px` radius, neutral by default.
- **Alert:** tonal variant, `12px` radius; feedback colors only.

### Navigation and Lists
- **List and navigation rows:** hover is a subtle light-gray background tint, never a lift.
- **Active item:** indigo indicator.

### Motion
Animate `transform` and `opacity` only, at `150ms` (small controls), `300ms` (cards, dialogs) or `500ms` (page-level emphasis). Every animation carries its own `@media (prefers-reduced-motion: reduce)` guard because no global handler exists.

## 8. Do's and Don'ts

### Do:
- **Do** use tokens from `src/styles/variables.scss` and semantic Vuetify names (`color="primary"`); components never hold a raw hex.
- **Do** keep cards flat and bordered at rest, and let elevation appear on hover.
- **Do** apply the same hover to every peer in a grid.
- **Do** pair color with an icon or text; color is never the only signal.
- **Do** guard every animation with `prefers-reduced-motion`.
- **Do** verify any new surface in both the light and dark themes.
- **Do** use Vuetify components (`v-btn`, `v-card`, `v-dialog`) over custom HTML and customize them through props and tokens.

### Don't:
- **Don't** add a second accent color, a gradient surface, a gradient text, or a glow.
- **Don't** use feedback colors (green, amber, red) as decoration.
- **Don't** introduce a third tinted surface or a saturated section band.
- **Don't** put an offset `::before` or `::after`, or a raw one-sided border, on a rounded element.
- **Don't** hardcode colors, spacings or font sizes, and don't use `!important`.
- **Don't** reach for global effect classes (`.glass`, `.text-gradient-*`, `.animate-*`, `.skeleton`): none exists in this project. Build the effect from tokens in the component's own SCSS.
- **Don't** use icon-font classes (`mdi-*`); import named icons from `@mdi/js`.

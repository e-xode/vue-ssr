# Palette roles — functional vs feedback

The clean-minimal direction uses **one** brand color and keeps every other color in a strict functional role. There is no expressive accent family. Indigo is the identity; gray is the chrome; the feedback trio is reserved for status.

➜ See skill: design-scss — for the token names and where each is defined.
➜ See skill: vuetify-theming — for the live theme values (`src/plugins/vuetify.js`).

## Role map

| Family / token                            | Role        | Use for                                                            | Do NOT use for                              |
| ----------------------------------------- | ----------- | ----------------------------------------------------------------- | ------------------------------------------- |
| `primary` indigo `#4f46e5`                | Functional  | Primary CTAs, links, active states, focus rings, the one accent   | Large decorative washes, multiple-per-view  |
| `accent` (= indigo `#4f46e5`)             | Functional  | Alias of primary; same indigo                                     | A second competing color                    |
| `secondary` gray `#525252`                | Neutral     | Secondary actions, supporting buttons, chrome                     | Brand/identity moments                      |
| `success` green `#16a34a`                 | Feedback    | Confirmations, positive status                                    | Decoration, generic accents                 |
| `warning` amber `#d97706`                 | Feedback    | Caution states, degraded features                                 | Decoration, hero accents                    |
| `error` red `#dc2626`                     | Feedback    | Validation errors, destructive actions                            | Decoration                                  |
| `info` indigo `#4f46e5`                   | Feedback    | Informational status                                              | A separate brand color                      |
| gray ramp `$gray-50..900`                 | Neutral     | Text, borders (`outline` `#e5e5e5`), surfaces, disabled chrome    | Brand emphasis                              |

## Surfaces (two only)

- **White** `surface` `#ffffff` (`$white`) — default content surface.
- **Light gray** `background` `#fafafa` (`$gray-50`) / `surface-variant` `#f5f5f5` (`$gray-100`) — alternating section surface and inset panels.
- **Borders** use `outline` `#e5e5e5` (`$gray-200`) / `outline-variant` `#f0f0f0`. The hairline border, not a color band, separates surfaces.

No third tinted surface. No gradient surface. Section rhythm is white ↔ light gray, separated by a hairline or a soft token shadow (`$shadow-sm`/`$shadow-md`).

## Dark mode

The theme ships a dark variant (`colorsDark` in `src/plugins/vuetify.js`): primary lightens to `#818cf8`, surfaces invert to near-black (`#0a0a0a` / `#171717`). Roles are preserved — indigo stays the single brand color, feedback colors keep their meaning at higher-contrast values. Verify any new surface in **both** themes before delivery.

## Contrast rule

Any color that **carries text** (a chip with a label, a colored button, a status banner) must meet **WCAG AA**: 4.5:1 for body text, 3:1 for large text and UI components. Indigo `#4f46e5` with white text passes for buttons. Feedback tonal alerts (Vuetify default `variant: tonal`) must be checked for label contrast in both light and dark themes. Purely decorative color is exempt — but this kit has almost none by design.

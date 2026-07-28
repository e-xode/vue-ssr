# Color palette (single source of truth)

Real values live in `src/plugins/vuetify.js` as two separate objects, `colors` (light theme) and `colorsDark` (dark theme). This file mirrors them — if they ever diverge, `src/plugins/vuetify.js` wins.

The brand accent is **indigo**, the neutral chrome is **gray** — not blue/purple/cyan.

## Light theme (`colors`)

| Category            | Token                   | Hex     | Usage                          |
| -------------------- | ------------------------ | ------- | -------------------------------- |
| Primary (indigo)     | `primary`                | #4f46e5 | Buttons, links, active states    |
|                      | `primary-darken-1`       | #4338ca | Hover                             |
|                      | `primary-darken-2`       | #3730a3 | Active/pressed                    |
|                      | `primary-lighten-1`      | #818cf8 | Subtle backgrounds                 |
|                      | `primary-lighten-2`      | #c7d2fe | Very subtle backgrounds            |
| Secondary (neutral gray) | `secondary`           | #525252 | Secondary actions                  |
|                      | `secondary-darken-1`      | #404040 | Hover                              |
|                      | `secondary-lighten-1`     | #737373 | Subtle                             |
| Accent (indigo, = primary) | `accent`             | #4f46e5 | Highlights                          |
| Semantic             | `success`                | #16a34a | Success feedback                    |
|                      | `warning`                 | #d97706 | Warning feedback                    |
|                      | `error`                   | #dc2626 | Errors, destructive                 |
|                      | `info`                    | #4f46e5 | Informational (= primary)           |
| On-color             | `on-primary`              | #ffffff | Text/icons on a primary surface     |
| Surface              | `background`              | #fafafa | Page background                     |
|                      | `surface`                 | #ffffff | Cards, sheets                        |
|                      | `surface-variant`         | #f5f5f5 | Alternate surface fill               |
|                      | `on-surface-variant`      | #525252 | Text on `surface-variant`            |
|                      | `on-surface`              | #171717 | Text/icons on `surface`              |
|                      | `on-background`           | #171717 | Text/icons on `background`           |
|                      | `outline`                 | #e5e5e5 | Borders                              |
|                      | `outline-variant`         | #f0f0f0 | Subtle borders/dividers              |

## Dark theme (`colorsDark`)

The dark theme is **not** "light theme + surface swap" — every token, including brand and feedback colors, gets its own dark-appropriate value (generally lighter/desaturated for contrast against dark surfaces).

| Category            | Token                   | Hex     | Usage                          |
| -------------------- | ------------------------ | ------- | -------------------------------- |
| Primary (indigo, lighter) | `primary`            | #818cf8 | Buttons, links, active states    |
|                      | `primary-darken-1`       | #6366f1 | Hover                             |
|                      | `primary-darken-2`       | #4f46e5 | Active/pressed                    |
|                      | `primary-lighten-1`      | #a5b4fc | Subtle backgrounds                 |
|                      | `primary-lighten-2`      | #c7d2fe | Very subtle backgrounds            |
| Secondary (neutral gray, lighter) | `secondary`   | #a3a3a3 | Secondary actions                  |
|                      | `secondary-darken-1`      | #737373 | Hover                              |
|                      | `secondary-lighten-1`     | #d4d4d4 | Subtle                             |
| Accent (= primary)   | `accent`                  | #818cf8 | Highlights                          |
| Semantic             | `success`                 | #22c55e | Success feedback                    |
|                      | `warning`                 | #f59e0b | Warning feedback                    |
|                      | `error`                   | #f87171 | Errors, destructive                 |
|                      | `info`                    | #818cf8 | Informational (= primary)           |
| On-color             | `on-primary`              | #ffffff | Text/icons on a primary surface     |
| Surface              | `background`              | #0a0a0a | Page background                     |
|                      | `surface`                 | #171717 | Cards, sheets                        |
|                      | `surface-variant`         | #262626 | Alternate surface fill               |
|                      | `on-surface-variant`      | #a3a3a3 | Text on `surface-variant`            |
|                      | `on-surface`              | #fafafa | Text/icons on `surface`              |
|                      | `on-background`           | #fafafa | Text/icons on `background`           |
|                      | `outline`                 | #404040 | Borders                              |
|                      | `outline-variant`         | #262626 | Subtle borders/dividers              |

Use semantic names in components (`color="primary"`, `color="error"`) — never hardcode any of the hex values above outside `src/plugins/vuetify.js` and this file.

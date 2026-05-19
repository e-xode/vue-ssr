# Visual Hierarchy

Detailed guidance on establishing clear visual hierarchy in Vue SSR Starter Kit interfaces.

## Typography scale

Use Vuetify's built-in typography classes consistently:

| Class | Size | Weight | Use case |
| --- | --- | --- | --- |
| `text-h1` | 96px / 6rem | Light | Hero headlines (rare) |
| `text-h2` | 60px / 3.75rem | Light | Page titles |
| `text-h3` | 48px / 3rem | Regular | Section headers |
| `text-h4` | 34px / 2.125rem | Regular | Sub-section headers |
| `text-h5` | 24px / 1.5rem | Regular | Card titles |
| `text-h6` | 20px / 1.25rem | Medium | Dialog titles, list headers |
| `text-subtitle-1` | 16px / 1rem | Regular | Card subtitles |
| `text-subtitle-2` | 14px / 0.875rem | Medium | Meta information |
| `text-body-1` | 16px / 1rem | Regular | Primary body text |
| `text-body-2` | 14px / 0.875rem | Regular | Secondary body text |
| `text-caption` | 12px / 0.75rem | Regular | Timestamps, labels |
| `text-overline` | 10px / 0.625rem | Regular | Category labels |

Rules:
- Never skip heading levels (h1 → h3 without h2)
- Use `font-weight-bold` or `font-weight-medium` for emphasis within same size
- Body text minimum 16px for readability on all devices
- Line height: 1.5 for body text, 1.2 for headings

## Spacing rhythm

The 8px grid ensures consistent visual rhythm across all components.

### Intra-component spacing

Elements within a component use tight spacing:
- Icon to label: 4px (`$spacing-xs`)
- Input label to input: 8px (`$spacing-sm`)
- List item vertical padding: 8px (`$spacing-sm`)
- Button internal padding: 8px vertical, 16px horizontal

### Inter-component spacing

Components relate to each other with moderate spacing:
- Cards in a grid: 16px gap (`$spacing-md`)
- Form fields vertical spacing: 16px (`$spacing-md`)
- Related content groups: 24px (`$spacing-lg`)

### Section spacing

Major content divisions use generous spacing:
- Section to section: 32px-48px (`$spacing-xl` to `$spacing-2xl`)
- Page top padding: 32px (`$spacing-xl`)
- Hero to content: 48px-64px (`$spacing-2xl` to `$spacing-3xl`)

### Decision framework

When uncertain about spacing:
1. Is this within a component? → Use `$spacing-sm` or `$spacing-md`
2. Is this between related components? → Use `$spacing-md` or `$spacing-lg`
3. Is this a section break? → Use `$spacing-xl` or larger
4. Does it feel cramped? → Go one step up
5. Does it feel disconnected? → Go one step down

## Color weight

Saturated colors carry more visual weight than muted colors.

### Attention gradient

```
High attention: Saturated primary (#2563eb) → buttons, active links
↓
Medium attention: Secondary (#7c3aed) → supporting actions, badges
↓
Low attention: Muted neutrals (gray-400/500) → borders, secondary text
↓
Background: Very light tints → cards, containers, page background
```

### Application rules

- Only ONE primary-colored CTA per viewport area
- Secondary actions use outlined or text button variants
- Destructive actions use error color BUT require confirmation
- Information hierarchy: primary text (gray-900) → secondary (gray-600) → tertiary (gray-400)
- Dark mode inverts the scale but maintains the hierarchy

## Focal points

The primary action or information on each view must be immediately identifiable.

### CTA dominance

The call-to-action should be the most visually prominent interactive element:
- Largest button on screen
- Primary color fill (flat variant)
- Positioned in the natural reading flow endpoint
- Sufficient whitespace around it (minimum 16px clear space)

### Visual anchors

Each section needs exactly one focal point:
- A heading that establishes context
- A primary action that enables progress
- Supporting content that provides details

### Anti-patterns to avoid

- Multiple buttons competing with same visual weight
- Colored buttons scattered without hierarchy
- CTAs buried below the fold without visual cues
- Using primary color for non-actionable decoration

## Card composition

Cards follow a consistent internal structure:

```
┌──────────────────────────────────┐
│  [Optional: Image / Media]       │
│                                  │
│  Title (text-h5 or text-h6)     │
│  Subtitle (text-subtitle-1)     │
│                                  │
│  Body content (text-body-2)     │
│                                  │
│  ────────────────────────────── │
│  [Actions: right-aligned]        │
└──────────────────────────────────┘
```

Rules:
- Title always present and first text element
- Body text uses `text-body-2` for density
- Actions section separated by divider or spacing
- Actions right-aligned (primary action rightmost)
- Maximum 2-3 actions per card
- Card padding: 16px-24px (`$spacing-md` to `$spacing-lg`)

## Whitespace

Whitespace is an active design element, not leftover space.

### Principles

- Generous margins around focal elements increase their importance
- Tight spacing groups related items (Gestalt proximity)
- Consistent whitespace creates rhythm and predictability
- Empty space lets the eye rest and improves comprehension

### Application

- Never fill every pixel of a container
- Page margins: minimum 16px on mobile, 24px-48px on desktop
- Between unrelated card groups: minimum 32px
- Around hero content: generous (48px-64px)
- Dense lists acceptable IF row height is consistent

## Alignment

Visual alignment creates order and professionalism.

### Grid-based layouts

- Use CSS Grid or Vuetify's `v-row`/`v-col` for page layout
- Content within cards aligns to a consistent left edge
- Numbers and currencies right-align in tables
- Action buttons right-align in card footers and dialog actions

### Consistency rules

- All cards in a row: same height (use `v-col` fill-height or flex)
- Form labels: either all above inputs or all beside (never mix)
- Icon + text pairs: consistent icon width for alignment
- Navigation items: consistent padding and text alignment

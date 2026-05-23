# Responsive UX

Mobile-first responsive design methodology for the Vue SSR Starter Kit.

## Breakpoint semantics

| Token | Width    | Devices                     | Layout approach                |
| ----- | -------- | --------------------------- | ------------------------------ |
| xs    | < 640px  | Phones (portrait)           | Single column, stacked         |
| sm    | ≥ 640px  | Large phones, small tablets | Single column, wider           |
| md    | ≥ 768px  | Tablets                     | Two columns possible           |
| lg    | ≥ 1024px | Laptops, tablets landscape  | Multi-column, sidebar          |
| xl    | ≥ 1280px | Desktops                    | Full layout, max-width content |

### Vuetify grid usage

```html
<v-row>
  <v-col cols="12" md="6" lg="4">Content</v-col>
</v-row>
```

- Always start with `cols="12"` (full width on mobile)
- Add breakpoint props (`sm`, `md`, `lg`, `xl`) for wider screens
- Use `order` prop to reorder columns per breakpoint when needed

## Mobile-first design

### Methodology

1. Design the xs layout first — this is your base
2. Ask: "What can I ADD at each breakpoint?" (not "What do I remove on mobile?")
3. Each breakpoint unlocks more space for progressive enhancement
4. If content doesn't fit on mobile, reconsider its necessity

### Progressive enhancement by breakpoint

| Breakpoint | Enhancement                                          |
| ---------- | ---------------------------------------------------- |
| xs → sm    | Slightly wider spacing, two-column for short items   |
| sm → md    | Side-by-side layouts, tab navigation visible         |
| md → lg    | Sidebar navigation, three-column grids               |
| lg → xl    | Maximum content width, extra whitespace, data tables |

### Content width

- Body text: max 65-75 characters per line for readability
- Content area: max-width 1200px-1400px on xl screens
- Center content with auto margins on wide screens
- Full-bleed only for hero sections and backgrounds

## Navigation patterns

### Mobile (xs-sm)

- Hamburger icon triggers navigation drawer
- Drawer: full-height, overlays content
- Bottom navigation for 3-5 primary destinations (optional)
- Back button for deep navigation stacks

### Tablet (md)

- Rail navigation (icons only, expandable) OR top bar with essential items
- Secondary items in hamburger or overflow menu
- Tab bars for section-level navigation

### Desktop (lg-xl)

- Persistent sidebar navigation (if many destinations)
- Horizontal top bar with text labels for flat navigation
- Breadcrumbs for deep hierarchies
- Mega-menu for complex navigation trees

### Transitions between modes

- Use Vuetify's `v-navigation-drawer` with `rail` prop for collapse behavior
- `v-app-bar` density changes per breakpoint
- Use `useDisplay()` composable for programmatic breakpoint logic

## Touch vs pointer

### Touch-specific considerations

- Tap targets: minimum 44x44px (per accessibility requirements)
- Swipe gestures: use for drawer open/close, carousel navigation
- Long press: avoid as primary interaction (not discoverable)
- Double tap: avoid (conflicts with zoom on mobile)

### Pointer-specific enhancements

Gate hover effects behind media query:

```scss
@media (hover: hover) {
  .card {
    &:hover {
      transform: translateY(-4px);
    }
  }
}
```

- Tooltips: show on hover for desktop, on focus/long-press for mobile (or not at all)
- Hover previews: desktop enhancement only
- Right-click context menus: desktop only, provide alternative on mobile

### Hybrid devices

- Surface, iPad with keyboard: both touch and pointer
- Test with both input methods
- Never disable one input type — support both simultaneously

## Content priority

### Mobile content strategy

- Show primary content immediately, no scrolling needed for the key action
- Hide supplementary content behind "Show more" or tabs
- Collapse sidebar content into expandable sections
- Prioritize: action > context > details > related

### Progressive disclosure

| Content            | Mobile        | Tablet    | Desktop |
| ------------------ | ------------- | --------- | ------- |
| Primary action     | Visible       | Visible   | Visible |
| Essential context  | Visible       | Visible   | Visible |
| Supporting details | Collapsed/tab | Visible   | Visible |
| Related content    | Hidden/link   | Collapsed | Sidebar |
| Metadata           | Minimal       | Partial   | Full    |

### Techniques

- `v-expansion-panels` for collapsible sections on mobile
- Tabs (`v-tabs`) to organize parallel content in limited space
- "Read more" pattern for long text content
- `d-none d-md-block` utility classes for show/hide by breakpoint
- Lazy loading images below the fold

## Forms on mobile

### Layout

- Full-width inputs (`cols="12"`) on mobile
- Label above input (not beside) on narrow screens
- Group related fields visually (address, payment)
- One primary action button: full width on mobile

### Input types

- Use proper `type` attributes for mobile keyboards:
  - `type="email"` — email keyboard
  - `type="tel"` — phone keypad
  - `type="number"` — numeric keyboard
  - `inputmode="numeric"` — for codes (no spinners)
- `autocomplete` attributes for browser autofill

### Multi-step forms

- One section per screen on mobile (wizard pattern)
- Progress indicator (stepper) showing current position
- Persistent summary of previous steps
- Allow back navigation without data loss

### Validation

- Validate on blur (not on type — mobile typing is error-prone)
- Scroll to first error on form submit
- Keep error messages short on mobile (limited vertical space)
- Dismiss keyboard on submit to show any errors above

## Data tables

### Mobile strategy

- Card view on xs/sm: each row becomes a card with key-value pairs
- Simplified table on md: show essential columns only
- Full table on lg+: all columns visible

### Vuetify data table

- `mobile-breakpoint` prop controls switch to card view
- `headers` can be filtered per breakpoint using `useDisplay()`
- Horizontal scroll acceptable as fallback (with scroll indicator)
- Sticky first column for wide tables on tablet

### Best practices

- Show 3-5 most important fields on mobile cards
- Sort/filter controls: sheet or dialog on mobile, inline on desktop
- Pagination: prefer infinite scroll on mobile, paginated on desktop
- Row actions: swipe actions on mobile, icon buttons on desktop

## Typography responsiveness

### Size adjustments

- Headings: reduce by 1-2 steps on mobile (h1 desktop → h2 visual size on mobile)
- Body text: minimum 16px on all devices (prevents iOS zoom on focus)
- Line height: slightly increase on mobile (1.6 vs 1.5) for better readability
- Use Vuetify's responsive typography classes or CSS clamp()

### Clamp pattern

```scss
.hero-title {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

### Reading width

- On desktop: constrain text to 65-75ch with `max-width`
- On mobile: full width is fine (narrow viewport handles line length)
- Never let text run edge-to-edge — maintain minimum 16px horizontal padding

## Images and media

### Responsive images

- Use appropriate dimensions per breakpoint (avoid loading desktop images on mobile)
- Lazy load images below the fold (`loading="lazy"`)
- Provide width/height to prevent layout shift (or use aspect-ratio)
- Art direction: different crops for different breakpoints when needed

### Video and embedded media

- Full width on mobile with 16:9 aspect ratio
- Constrained width on desktop (max 800px for embedded video)
- Autoplay only on desktop and only if muted
- Provide poster image for slow connections

## Testing methodology

### Devices to test

- iPhone SE (375px) — smallest common phone
- iPhone 14/15 (390px) — standard phone
- iPad (768px) — tablet breakpoint
- iPad Pro (1024px) — large tablet / laptop
- 1440px — standard desktop
- 1920px+ — large monitor

### What to verify per breakpoint

1. Navigation: correct mode (drawer/bar/sidebar)?
2. Content: primary content visible without scroll?
3. Touch targets: all interactive elements ≥ 44px?
4. Typography: readable without zooming?
5. Forms: full-width inputs, proper keyboard types?
6. Images: appropriate size, no overflow?
7. Tables/data: card view on mobile, table on desktop?
8. Whitespace: not cramped on mobile, not empty on desktop?

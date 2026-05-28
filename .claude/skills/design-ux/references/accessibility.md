# Accessibility

WCAG 2.1 AA compliance guidelines for the Vue SSR Starter Kit.

## Color contrast

### Requirements

| Content type                       | Minimum ratio  | Example                  |
| ---------------------------------- | -------------- | ------------------------ |
| Normal text (< 18px)               | 4.5:1          | Body text on backgrounds |
| Large text (≥ 18px or ≥ 14px bold) | 3:1            | Headings                 |
| UI components and graphics         | 3:1            | Buttons, icons, borders  |
| Decorative elements                | No requirement | Dividers, shadows        |

### Application

- Test all color combinations against both light and dark mode backgrounds
- Primary indigo (#4f46e5, per `src/plugins/vuetify.js`) on white: ~6.7:1 — passes for normal and large text
- Use darker shade for small text if needed
- Error red must be distinguishable from primary blue (not just by hue)
- Never rely on color alone to convey information — pair with icon, text, or pattern

### Tools

- Use browser DevTools contrast checker
- Test with simulated color blindness (protanopia, deuteranopia, tritanopia)
- Vuetify's theme system handles most contrast automatically — verify custom overrides

## Focus management

### Visible focus rings

- Vuetify provides default focus styles for its components
- Custom interactive elements MUST have visible focus indicators
- Focus ring: 2px solid with sufficient contrast (typically primary color)
- Never use `outline: none` without a replacement focus style
- Focus-visible (keyboard only) preferred over permanent focus rings

### Focus order

- Tab order must follow visual reading order (top-left to bottom-right in LTR)
- Never use `tabindex > 0` — it disrupts natural order
- Use `tabindex="0"` to make non-interactive elements focusable when needed
- Use `tabindex="-1"` for programmatic focus (modals, error summaries)

### Focus trapping

- Modals and dialogs: trap focus within (Vuetify's v-dialog handles this)
- On dialog close: return focus to the triggering element
- Skip-to-content link as first focusable element on each page

### Roving tabindex

For composite widgets (toolbars, tab lists, menu bars):

- Only one item in the group is tabbable at a time
- Arrow keys navigate within the group
- Vuetify implements this for v-tabs, v-btn-toggle, etc.

## Aria attributes

### Labels

Every interactive element without visible text needs an accessible name:

```html
<v-btn icon :aria-label="t('a11y.closeDialog')">
  <v-icon>mdi-close</v-icon>
</v-btn>

<v-text-field :label="t('form.email')" :aria-describedby="emailHelpId" />
```

- Icon buttons: always provide `aria-label`
- Inputs: Vuetify uses `label` prop as accessible name
- Images: meaningful `alt` text or `role="presentation"` for decorative
- All aria text via `t()` for i18n compliance

### Live regions

Dynamic content updates need aria-live to announce changes:

| Scenario               | Attribute                                 | Priority         |
| ---------------------- | ----------------------------------------- | ---------------- |
| Form validation errors | `aria-live="assertive"`                   | Immediate        |
| Success notifications  | `aria-live="polite"`                      | Next opportunity |
| Loading status         | `aria-live="polite"`                      | Next opportunity |
| Timer/countdown        | `aria-live="off"` or `aria-atomic="true"` | Controlled       |

### Roles and states

- `role="alert"` — for error messages that need immediate attention
- `role="status"` — for status updates (loading complete, item count)
- `aria-expanded` — on toggle buttons controlling collapsible content
- `aria-selected` — on items in selection lists
- `aria-current="page"` — on the current navigation item
- `aria-busy="true"` — on regions being updated (with loading indicator)
- `aria-hidden="true"` — on decorative icons rendered alongside text

## Screen readers

### Screen-reader-only pattern

Use the auto-injected `visually-hidden` **mixin** for content visible only to screen readers. (The `.sr-only` utility class lives in the non-bundled `_utilities.scss` and renders nothing — use the mixin in a component SCSS instead. ➜ design-scss.)

Use for:

- Additional context that's visually obvious but not programmatically clear
- "Opens in new tab" warnings for external links
- Table header descriptions
- Form field instructions

Do NOT use for:

- Hiding content from sighted users that they should see
- Replacing proper aria attributes
- Duplicating visible text

### Meaningful content

- Link text must make sense out of context (not "click here" or "read more")
- Button text must describe the action ("Save profile" not just "Save" when ambiguous)
- Heading hierarchy must convey document structure
- Lists must be actual `<ul>`/`<ol>` for screen reader list navigation

### Images and media

- Informative images: descriptive alt text (what the image conveys, not what it is)
- Decorative images: `alt=""` or `role="presentation"`
- Complex images (charts, diagrams): long description via `aria-describedby`
- Icons paired with text: `aria-hidden="true"` on the icon

## Motion and animation

### prefers-reduced-motion

There is **no global reduced-motion handler** in this project. `_animations.scss` contains one, but the file is not bundled (➜ design-scss), so it never runs. Reduced motion is therefore a **per-component responsibility**:

- Every component that animates must add its own `@media (prefers-reduced-motion: reduce)` block setting `animation`/`transition` to `none`
- Do not assume motion is disabled for you — guard it explicitly
- Prefer animating only `transform` / `opacity`

### Additional considerations

- Don't convey information solely through animation (provide static alternative)
- Auto-playing animations: provide pause/stop controls
- Parallax scrolling: avoid or provide alternative for vestibular disorder sensitivity
- Flashing content: never flash more than 3 times per second

### Testing

- Enable "Reduce motion" in system preferences
- Verify all UI remains functional and informative without animation
- Confirm state changes are still visible (color/icon fallbacks)

## Touch targets

### Minimum sizes

- Interactive elements: minimum 44x44px tap target on mobile
- Spacing between adjacent targets: minimum 8px gap
- Small visual elements (icons, checkboxes): expand clickable area with padding
- Vuetify components generally meet this — verify custom interactive elements

### Implementation

- Use padding to expand touch targets without changing visual size
- `min-height: 44px` on list items and button containers
- Icon buttons: Vuetify's default size (40px) is borderline — use `size="44"` on mobile

## Semantic HTML

### Heading hierarchy

- Exactly one `<h1>` per page (page title)
- Headings descend logically: h1 → h2 → h3 (never skip levels)
- Section titles use appropriate heading level for nesting depth
- Vuetify components may use divs — override with `tag="h2"` prop or wrap

### Landmarks

- `<header>` — page header with navigation
- `<nav>` — primary and secondary navigation (use `aria-label` to distinguish)
- `<main>` — primary page content (one per page)
- `<aside>` — sidebar, related content
- `<footer>` — page footer
- Vuetify's `v-app-bar`, `v-navigation-drawer`, `v-main`, `v-footer` map to landmarks

### Lists

- Navigation menus: `<nav>` containing `<ul>` with `<li>` items
- Feature lists, option sets: proper `<ul>` or `<ol>`
- Description lists for key-value pairs: `<dl>`, `<dt>`, `<dd>`
- Never use list markup for layout purposes

## Forms

### Labels

- Every input must have an associated label (Vuetify's `label` prop handles this)
- Group related fields with `<fieldset>` and `<legend>`
- Required fields: indicate in label AND with `aria-required="true"`

### Error handling

- Error messages associated via `aria-describedby`
- Error summary at form top for multiple errors (focus this on submit)
- Inline errors appear below the relevant field
- Error state conveyed by color AND icon AND text (not color alone)

### Instructions

- Complex fields: provide help text linked via `aria-describedby`
- Format expectations: include in label or help text ("DD/MM/YYYY")
- Character limits: announce remaining characters via live region

## i18n accessibility

All accessibility text must use the `t()` translation function:

Structure in locale files:

```json
{
  "a11y": {
    "closeDialog": "Close dialog",
    "openMenu": "Open navigation menu",
    "loading": "Loading content",
    "skipToContent": "Skip to main content",
    "externalLink": "Opens in new tab"
  }
}
```

Rules:

- `aria-label` values: `t('a11y.closeDialog')`
- `alt` text: `t('images.profilePhoto')`
- Screen reader announcements: `t('a11y.itemAdded')`
- Never hardcode accessibility strings — they must be translatable

## Testing checklist

For every new component or view:

1. Keyboard navigation: can you reach and operate everything without a mouse?
2. Screen reader: does the content make sense read aloud in order?
3. Color contrast: do all text and UI elements meet ratio requirements?
4. Zoom: does the layout work at 200% zoom?
5. Reduced motion: is the UI fully functional without animations?
6. Touch targets: are all interactive elements ≥ 44x44px on mobile?
7. Focus indicators: can you always see where focus is?
8. Error states: are errors announced and described accessibly?

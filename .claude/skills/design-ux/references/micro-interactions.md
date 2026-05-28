# Micro-interactions

Detailed guidance on designing meaningful, restrained, and accessible micro-interactions.

> **Note on class-based effects.** The `.hover-lift`, `.hover-scale`, `.glow`, `.skeleton`, `.animate-*`, `.reveal`, and `.delay-*` classes referenced below live in `_utilities.scss` / `_animations.scss`, which are **not bundled** in this project — they render nothing as classes. Treat them as named patterns: reproduce the effect in a component SCSS using the live tokens/mixins (the `hover-lift` mixin, `transition` mixin, component-local keyframes). ➜ design-scss.

## Hover states

Every interactive element must respond to hover (on devices that support it).

### Available patterns

| Pattern     | Class          | Effect                              | Best for        |
| ----------- | -------------- | ----------------------------------- | --------------- |
| Lift        | `.hover-lift`  | translateY(-4px) + shadow increase  | Cards, panels   |
| Scale       | `.hover-scale` | scale(1.02-1.05)                    | Images, avatars |
| Color shift | Custom         | Background or text color transition | Buttons, links  |
| Glow        | `.glow`        | Subtle box-shadow glow              | Primary CTAs    |
| Underline   | Custom         | Border-bottom or text-decoration    | Text links      |

### Rules

- Hover feedback must be subtle — never jarring or distracting
- Use `@media (hover: hover)` to gate hover effects (no sticky hover on touch)
- Transition timing: `$transition-fast` (150ms) for color, `$transition-base` (300ms) for transforms
- Hover state must not shift layout (no margin/padding changes, use transform only)
- Cursor must indicate interactivity (`cursor: pointer` on clickable non-button elements)

## Transitions

### Timing tokens

| Token              | Duration | Easing      | Use case                        |
| ------------------ | -------- | ----------- | ------------------------------- |
| `$transition-fast` | 150ms    | ease-out    | Buttons, toggles, icon changes  |
| `$transition-base` | 300ms    | ease-in-out | Cards, panels, drawers          |
| `$transition-slow` | 500ms    | ease-in-out | Page transitions, reveals, hero |

### Easing guidelines

- **ease-out** — for elements entering (decelerate into view)
- **ease-in** — for elements leaving (accelerate out of view)
- **ease-in-out** — for elements changing state in place
- Never use `linear` for UI transitions (feels mechanical)

### What to transition

- `opacity` — appearing/disappearing
- `transform` — movement, scale, rotation
- `background-color` — state changes
- `box-shadow` — elevation changes
- `border-color` — focus/validation states

Avoid transitioning: `width`, `height`, `top`, `left` (use transforms instead for performance).

## Loading states

### Skeleton loaders

Use the `.skeleton` class for content placeholders while data loads:

- Match the approximate shape and size of final content
- Animate with the shimmer keyframe (built into project)
- Show skeleton immediately — no delay before showing loading state
- Replace skeleton with real content using `v-if`/`v-else`

### Progress indicators

| Type              | When to use                                          |
| ----------------- | ---------------------------------------------------- |
| Skeleton          | Initial page/section load (< 3 seconds expected)     |
| Circular progress | Button actions, form submissions                     |
| Linear progress   | File uploads, multi-step processes                   |
| Optimistic UI     | Quick actions where success is likely (toggle, like) |

### Loading UX rules

- Show loading state within 100ms of action
- If load completes < 300ms, avoid showing skeleton (use v-if with delay)
- Long operations (> 3s): show progress percentage or step indicator
- Never block the entire page — load sections independently
- Maintain layout stability (content shifts are disorienting)

## Success and error feedback

### Snackbars (v-snackbar)

Transient notifications for completed actions:

| Scenario | Color           | Duration | Position      |
| -------- | --------------- | -------- | ------------- |
| Success  | success (green) | 3000ms   | bottom-center |
| Error    | error (red)     | 5000ms   | bottom-center |
| Info     | info (blue)     | 4000ms   | bottom-center |
| Warning  | warning (amber) | 4000ms   | bottom-center |

Rules:

- Always include a close button for error snackbars
- Action text (e.g., "Undo") for reversible operations
- Stack multiple snackbars, don't replace

### Inline alerts (v-alert)

Persistent feedback that requires acknowledgment or relates to a specific section:

- Variant: `tonal` (project default)
- Place directly above or within the relevant section
- Include clear description of what happened and what to do
- Error alerts: pair with field-level validation messages

### Field validation

- Show validation on blur (not on every keystroke)
- Red border + error text below field
- Use `aria-describedby` linking error message to input
- Success state: green border (optional, only for critical fields)

## Button feedback

### State progression

```
Default → Hover → Active/Pressed → Loading → Success/Error → Default
```

| State   | Visual                                |
| ------- | ------------------------------------- |
| Default | Normal appearance                     |
| Hover   | Slight color shift or elevation       |
| Active  | Darker shade, slight scale-down       |
| Loading | Spinner replaces text, disabled state |
| Success | Brief green flash or check icon       |
| Error   | Brief red flash, return to default    |

### Disabled buttons

- Reduced opacity (0.5-0.6)
- `pointer-events: none`
- Gray/muted color regardless of original color
- Tooltip explaining why disabled (when contextually helpful)

## Page transitions

### Enter animations

Use entrance animations sparingly for page mounts and section reveals:

| Animation        | Class               | Duration | Use case                 |
| ---------------- | ------------------- | -------- | ------------------------ |
| Fade up          | `.animate-fade-up`  | 500ms    | Page content on mount    |
| Fade in          | `.animate-fade-in`  | 300ms    | Modals, overlays         |
| Scale in         | `.animate-scale-in` | 300ms    | Cards, popovers          |
| Slide left/right | `.animate-slide-*`  | 400ms    | Step wizards, carousels  |
| Reveal           | `.reveal`           | Custom   | Scroll-triggered content |

### Stagger pattern

For lists or card grids entering view, stagger the animation:

- Use `.delay-1` through `.delay-5` classes (100ms increments)
- Maximum stagger: 500ms total (5 items)
- Beyond 5 items: batch in groups or reduce individual delays

### Exit animations

- Keep exits faster than enters (reduce by ~30%)
- Fade out is usually sufficient (no need for complex exit animations)
- Modals: fade + slight scale-down on close

## Motion accessibility

Reduced motion is **not** handled globally (the `_animations.scss` reset is not bundled — ➜ design-scss):

- Each animated component must add its own `@media (prefers-reduced-motion: reduce)` guard
- Still provide state feedback through non-motion means (color, icon changes)
- Test with reduced motion enabled to ensure usability

## Interaction patterns

### Click outside to close

Modals, dropdowns, and popovers close on outside click:

- Vuetify handles this for its components
- Custom overlays: use `v-click-outside` directive

### Scroll behavior

- Smooth scroll for anchor links (`scroll-behavior: smooth`)
- Infinite scroll: show loading indicator at bottom, load threshold at 80%
- Sticky headers: add subtle shadow on scroll to indicate elevation
- Back to top: show button after scrolling > 1 viewport height

### Drag and drop

- Clear visual affordance (handle icon, cursor change)
- Ghost/preview of dragged item
- Drop zone highlighting
- Smooth reorder animation on release

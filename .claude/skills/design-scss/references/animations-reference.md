# Animations Reference

> All keyframes, utility classes, stagger delays, and reduced-motion handling from `src/styles/_animations.scss`.

## Keyframes inventory

| Keyframe | Effect | Duration context |
| --- | --- | --- |
| `fadeIn` | Opacity 0 → 1 | Subtle entrances |
| `fadeUp` | Opacity + translateY(24px → 0) | Content reveals |
| `fadeDown` | Opacity + translateY(-16px → 0) | Dropdown content |
| `scaleIn` | Opacity + scale(0.96 → 1) | Modal/dialog entrances |
| `reveal` | Opacity + translateY(32px) + blur(4px → 0) | Hero/feature reveals |
| `slideLeft` | Opacity + translateX(24px → 0) | Right-to-left entrance |
| `slideRight` | Opacity + translateX(-24px → 0) | Left-to-right entrance |
| `float` | translateY(0 → -8px → 0) | Continuous hover effect |
| `pulse` | Opacity 1 → 0.6 → 1 | Attention/loading |
| `shimmer` | Background-position sweep | Skeleton loading |
| `glow` | Box-shadow pulse via --glow-color | Highlight/focus |
| `rotate` | 0deg → 360deg | Spinners |

## Utility classes

Apply directly in templates. Each class runs its animation once (except infinite ones).

| Class | Keyframe | Duration | Behavior |
| --- | --- | --- | --- |
| `.animate-fade-in` | fadeIn | $transition-base (300ms) | One-shot |
| `.animate-fade-up` | fadeUp | $transition-slow (500ms) | One-shot |
| `.animate-fade-down` | fadeDown | $transition-slow (500ms) | One-shot |
| `.animate-scale-in` | scaleIn | $transition-base (300ms) | One-shot |
| `.animate-reveal` | reveal | 700ms | One-shot |
| `.animate-slide-left` | slideLeft | $transition-slow (500ms) | One-shot |
| `.animate-slide-right` | slideRight | $transition-slow (500ms) | One-shot |
| `.animate-float` | float | 3s | Infinite |
| `.animate-pulse` | pulse | 2s | Infinite |
| `.animate-shimmer` | shimmer | 1.5s | Infinite |
| `.animate-glow` | glow | 2s | Infinite |
| `.animate-rotate` | rotate | 1s | Infinite |

### Usage in templates

```html
<div class="animate-fade-up">Content appears from below</div>

<div class="animate-fade-up delay-2">Staggered content</div>

<div class="animate-float">Floating decoration</div>
```

## Stagger delays

Classes `.delay-1` through `.delay-8` add incremental `animation-delay` at 100ms intervals.

| Class | Delay |
| --- | --- |
| `.delay-1` | 100ms |
| `.delay-2` | 200ms |
| `.delay-3` | 300ms |
| `.delay-4` | 400ms |
| `.delay-5` | 500ms |
| `.delay-6` | 600ms |
| `.delay-7` | 700ms |
| `.delay-8` | 800ms |

### Stagger pattern

Use with lists or grids for cascading reveal:

```html
<div class="features-grid">
  <div class="animate-fade-up delay-1">Feature 1</div>
  <div class="animate-fade-up delay-2">Feature 2</div>
  <div class="animate-fade-up delay-3">Feature 3</div>
  <div class="animate-fade-up delay-4">Feature 4</div>
</div>
```

## Glow customization

The `glow` keyframe uses a CSS custom property `--glow-color`:

```html
<div class="animate-glow" style="--glow-color: rgba(34, 197, 94, 0.3)">
  Custom green glow
</div>
```

Default glow color: `rgba(99, 102, 241, 0.2)` (indigo).

## Reduced motion (accessibility)

The file includes a global `prefers-reduced-motion: reduce` media query that:

- Sets all `animation-duration` to `0.01ms`
- Sets all `animation-iteration-count` to `1`
- Sets all `transition-duration` to `0.01ms`

This applies to all elements (`*`, `*::before`, `*::after`). No action needed from developers — animations are automatically disabled for users who prefer reduced motion.

## Choosing the right animation

| Scenario | Recommended class |
| --- | --- |
| Page section entering viewport | `.animate-reveal` |
| Card or item appearing | `.animate-fade-up` |
| Modal/dialog opening | `.animate-scale-in` |
| Dropdown content | `.animate-fade-down` |
| Slide-in navigation | `.animate-slide-right` |
| Decorative floating element | `.animate-float` |
| Loading indicator | `.animate-pulse` or `.animate-rotate` |
| Skeleton placeholder | `.animate-shimmer` (via `.skeleton` class) |
| Call-to-action highlight | `.animate-glow` |

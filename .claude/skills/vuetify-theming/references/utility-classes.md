# Vuetify CSS utility classes

Vuetify provides utility classes similar to Tailwind but using the Material Design spacing scale.

## Display and flex

```
d-flex, d-inline-flex, d-block, d-inline-block, d-none
flex-row, flex-column, flex-wrap
justify-start, justify-center, justify-end, justify-space-between, justify-space-around
align-start, align-center, align-end, align-stretch
```

## Spacing (margin and padding)

Pattern: `{property}{direction}-{size}`

Properties: `m` (margin), `p` (padding)
Directions: `t` (top), `b` (bottom), `l` (left), `r` (right), `s` (start), `e` (end), `x` (horizontal), `y` (vertical), `a` (all)
Sizes: `0` through `16` (multiples of 4px), `auto`

```
ma-4    -> margin: 16px (all)
px-2    -> padding-left: 8px; padding-right: 8px
mt-6    -> margin-top: 24px
mb-0    -> margin-bottom: 0
```

## Typography

```
text-h1 through text-h6
text-subtitle-1, text-subtitle-2
text-body-1, text-body-2
text-caption, text-overline
font-weight-bold, font-weight-medium, font-weight-light
text-center, text-start, text-end
```

## Colors (text and background)

```
text-primary, text-error, text-success
bg-primary, bg-surface, bg-background
```

## Responsive display

```
d-none d-md-flex       -> hidden below md, flex from md up
d-flex d-md-none       -> flex below md, hidden from md up
```

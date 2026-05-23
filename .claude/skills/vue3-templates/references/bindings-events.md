# Class & Style Bindings, Event Handling

## Class bindings

### Object syntax — toggle by truthiness

```vue
<div :class="{ active: isActive, 'text-danger': hasError }"></div>
```

The key is the class name, the value its on/off condition. Quote class names with hyphens.

### Array syntax — list of class values

```vue
<div :class="[activeClass, errorClass]"></div>
```

### Combined

```vue
<div :class="[{ active: isActive }, errorClass]"></div>
```

A static `class` attribute and a bound `:class` merge automatically:

```vue
<div class="card" :class="{ 'card--open': isOpen }"></div>
```

➜ See skill: design-scss — for which class names/tokens to actually use; this skill only covers the binding mechanics.

## Style bindings

### Object syntax — camelCase or kebab-case

```vue
<div :style="{ color: activeColor, fontSize: size + 'px' }"></div>
<div :style="{ 'font-size': size + 'px' }"></div>
```

### Array of style objects — merged left to right

```vue
<div :style="[baseStyles, overrideStyles]"></div>
```

Vue auto-prefixes vendor properties. An array of values picks the last the browser supports:

```vue
<div :style="{ display: ['-webkit-box', 'flex'] }"></div>
```

Prefer scoped SCSS classes over inline `:style` for anything beyond dynamic one-off values.

## Event handling

### Inline vs method handlers

Inline — a short statement:

```vue
<button @click="count++">+1</button>
<button @click="open = !open">{{ t('common.toggle') }}</button>
```

Method — a named function (preferred once there is real logic):

```vue
<template>
  <button @click="onSave">{{ t('common.save') }}</button>
</template>

<script setup>
function onSave(event) {
  console.log(event.target);
}
</script>
```

A method handler receives the native event automatically. To pass both an argument and the event inline, use `$event` or an arrow function:

```vue
<button @click="remove(id, $event)">x</button>
<button @click="(e) => remove(id, e)">x</button>
```

### Event modifiers

| Modifier   | Effect                                               |
| ---------- | ---------------------------------------------------- |
| `.stop`    | `event.stopPropagation()`                            |
| `.prevent` | `event.preventDefault()`                             |
| `.self`    | Only fire if `event.target` is the element itself    |
| `.capture` | Listen in the capture phase                          |
| `.once`    | Fire at most once, then detach                       |
| `.passive` | Hint a non-blocking listener (mobile scroll perf)    |
| `.exact`   | Only when exactly the listed system keys are pressed |

```vue
<form @submit.prevent="onSubmit">...</form>
<a @click.stop.prevent="onClick"></a>
<div @scroll.passive="onScroll"></div>
```

Order matters — modifiers apply left to right. `@click.prevent.self` prevents default for the element and its children; `@click.self.prevent` only when the element itself is clicked.

### Key modifiers

Aliases for `keyup` / `keydown`:

```vue
<input @keyup.enter="submit" />
<input @keyup.esc="cancel" />
<input @keydown.page-down="next" />
```

Common: `.enter` `.tab` `.delete` `.esc` `.space` `.up` `.down` `.left` `.right`. Multi-word keys are kebab-cased (`page-down`).

### System modifier keys

`.ctrl` `.alt` `.shift` `.meta` require the key held during the event:

```vue
<input @keyup.alt.enter="clear" />
<div @click.ctrl="onCtrlClick"></div>
```

Pair with `.exact` to demand a precise combination:

```vue
<button @click.ctrl.exact="onCtrlOnly">A</button>
<button @click.exact="onPlain">A</button>
```

### Mouse button modifiers

```vue
<button @click.left="primary"></button>
<button @click.middle="aux"></button>
<button @click.right="context"></button>
```

➜ See skill: vuetify-components — Vuetify components emit their own events (`@update:model-value`, `@click:append`); those modifiers apply the same way.

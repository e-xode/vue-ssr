# Icon usage examples

## v-icon standalone

```vue
<v-icon :icon="mdiAccount" size="24" color="primary" />
<v-icon :icon="mdiEmail" size="small" />
<v-icon :icon="mdiLock" size="x-large" color="error" />
```

Sizes: `x-small`, `small`, `default`, `large`, `x-large`, or a number (px).

## v-btn with icons

```vue
<v-btn :prepend-icon="mdiPlus" color="primary">{{ t('actions.add') }}</v-btn>
<v-btn :append-icon="mdiChevronDown">{{ t('actions.menu') }}</v-btn>
<v-btn :icon="mdiDelete" variant="text" color="error" />
```

## v-text-field with icons

```vue
<v-text-field :prepend-inner-icon="mdiEmail" />
<v-text-field :append-inner-icon="mdiEye" @click:append-inner="toggle()" />
```

## v-list-item with icons

```vue
<v-list-item :prepend-icon="mdiHome" :title="t('nav.home')" />
```

## v-chip with icons

```vue
<v-chip :prepend-icon="mdiTag" size="small">Label</v-chip>
```

## v-tab with icons

```vue
<v-tab :prepend-icon="mdiAccount" value="profile">{{ t('tabs.profile') }}</v-tab>
```

# Icons

## @mdi/js

The project uses `@mdi/js` for tree-shakeable Material Design Icons. Each icon is an SVG path string imported individually, ensuring only used icons are bundled.

## Import pattern

```vue
<script setup>
import { mdiAccount, mdiEmail, mdiLock } from '@mdi/js'
</script>
```

Icons are SVG path strings (not CSS classes). They must be bound dynamically:

```vue
<v-icon :icon="mdiAccount" />
```

Never use string icon names like `"mdi-account"` — those require the full icon font.

## Usage in components

### v-icon standalone

```vue
<v-icon :icon="mdiAccount" size="24" color="primary" />
<v-icon :icon="mdiEmail" size="small" />
<v-icon :icon="mdiLock" size="x-large" color="error" />
```

Sizes: `x-small`, `small`, `default`, `large`, `x-large`, or number (px).

### v-btn with icons

```vue
<v-btn :prepend-icon="mdiPlus" color="primary">{{ t('actions.add') }}</v-btn>
<v-btn :append-icon="mdiChevronDown">{{ t('actions.menu') }}</v-btn>
<v-btn :icon="mdiDelete" variant="text" color="error" />
```

### v-text-field with icons

```vue
<v-text-field :prepend-inner-icon="mdiEmail" />
<v-text-field :append-inner-icon="mdiEye" @click:append-inner="toggle()" />
```

### v-list-item with icons

```vue
<v-list-item :prepend-icon="mdiHome" :title="t('nav.home')" />
```

### v-chip with icons

```vue
<v-chip :prepend-icon="mdiTag" size="small">Label</v-chip>
```

### v-tab with icons

```vue
<v-tab :prepend-icon="mdiAccount" value="profile">{{ t('tabs.profile') }}</v-tab>
```

## Common icons used in the project

| Icon | Import name | Usage |
| --- | --- | --- |
| Account/User | `mdiAccount` | Profile, user avatar |
| Email | `mdiEmail` | Email fields |
| Lock | `mdiLock` | Password fields |
| Eye | `mdiEye` | Show password |
| Eye off | `mdiEyeOff` | Hide password |
| Menu (hamburger) | `mdiMenu` | Mobile nav toggle |
| Close (X) | `mdiClose` | Dismiss, close dialog |
| Chevron down | `mdiChevronDown` | Dropdowns, expand |
| Chevron right | `mdiChevronRight` | Navigate forward |
| Search | `mdiMagnify` | Search fields |
| Delete/Trash | `mdiDelete` | Delete actions |
| Edit/Pencil | `mdiPencil` | Edit actions |
| Plus | `mdiPlus` | Add/create |
| Check | `mdiCheck` | Confirm, success |
| Alert | `mdiAlert` | Warnings |
| Information | `mdiInformation` | Info tooltips |
| Home | `mdiHome` | Home navigation |
| Settings/Cog | `mdiCog` | Settings |
| Logout | `mdiLogout` | Sign out |
| Bell | `mdiBell` | Notifications |
| Calendar | `mdiCalendar` | Date pickers |
| Upload | `mdiUpload` | File upload |
| Download | `mdiDownload` | File download |
| Copy | `mdiContentCopy` | Copy to clipboard |
| Dots vertical | `mdiDotsVertical` | More menu |
| Filter | `mdiFilter` | Filter actions |
| Sort | `mdiSort` | Sort actions |
| Refresh | `mdiRefresh` | Reload data |
| Arrow left | `mdiArrowLeft` | Back navigation |
| Tag | `mdiTag` | Tags, labels |

## Finding icons

Browse all available icons at: https://pictogrammers.com/library/mdi/

Search by concept (e.g. "user", "settings", "notification") to find the right icon name. The import name is always the camelCase version prefixed with `mdi`:
- Icon name: `account-circle` → Import: `mdiAccountCircle`
- Icon name: `file-document-outline` → Import: `mdiFileDocumentOutline`

## Icon aliases (from vuetify config)

The project registers the `mdi` iconset with aliases from `vuetify/iconsets/mdi-svg`:

```javascript
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
```

This provides built-in aliases for Vuetify internal icons (checkboxes, radio buttons, expansion panels, etc.) using SVG paths instead of font classes.

## Icon sizing guide

| Context | Recommended size |
| --- | --- |
| Button icon-only | default (24px) |
| Prepend/append in inputs | default |
| List item prepend | default |
| Navigation icons | default or 24 |
| Large decorative | x-large or 48-64px |
| Small inline indicators | small or x-small |
| Avatar icon | inherits avatar size |

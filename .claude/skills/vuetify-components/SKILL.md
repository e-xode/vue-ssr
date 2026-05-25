---
name: vuetify-components
description: "Vuetify 4 general display and feedback components for the Vue SSR Starter Kit: containers and content (v-card, v-list/v-list-item, v-chip, v-avatar), overlays and feedback (v-dialog with reusable confirm-dialog pattern, v-snackbar toasts, v-alert, v-tooltip), and loading indicators (v-progress-linear, v-progress-circular, v-skeleton-loader). Trigger on: building cards, lists, chips, avatars, dialogs/modals, snackbars, alerts, tooltips, progress, or skeleton loaders. Don't use for: form inputs (→ vuetify-forms), data tables/pagination (→ vuetify-data), app shell/navigation/tabs (→ vuetify-layout), component selection overview and defaults (→ vuetify-overview), theming (→ vuetify-theming), icons (→ vuetify-icons), Vue-level Teleport/Suspense/Transition (→ vue3-builtin-components)."
---

# Display and Feedback Components

## v-card

Container component for grouped content. Project defaults: `rounded="xl"`, `elevation="0"`, `border: true`.

### Structure

```vue
<v-card>
  <template #prepend>
    <v-icon :icon="mdiAccount" color="primary" />
  </template>
  <template #title>{{ t('card.title') }}</template>
  <template #subtitle>{{ t('card.subtitle') }}</template>
  <template #text>
    <p>{{ t('card.content') }}</p>
  </template>
  <template #actions>
    <v-spacer />
    <v-btn color="primary">{{ t('actions.save') }}</v-btn>
  </template>
</v-card>
```

### Key props

| Prop       | Type          | Description                     |
| ---------- | ------------- | ------------------------------- |
| `title`    | string        | Card title (or use #title slot) |
| `subtitle` | string        | Subtitle text                   |
| `text`     | string        | Body text                       |
| `color`    | string        | Background color                |
| `variant`  | string        | flat, elevated, tonal, outlined |
| `loading`  | boolean       | Shows progress bar at top       |
| `hover`    | boolean       | Elevation on hover              |
| `link`     | boolean       | Makes card clickable            |
| `to`       | string/object | Router link destination         |

### Card with image

```vue
<v-card>
  <v-img src="/path/to/image.jpg" height="200" cover />
  <template #title>{{ title }}</template>
  <template #text>{{ description }}</template>
</v-card>
```

## v-list + v-list-item

Navigation and action lists.

### Navigation list

```vue
<script setup>
import { mdiHome, mdiAccount, mdiCog } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { useLocalePath } from '@/composables/useLocalePath';

const { t } = useI18n();
const localePath = useLocalePath();

const navItems = [
  { icon: mdiHome, title: t('nav.home'), to: localePath('/') },
  { icon: mdiAccount, title: t('nav.profile'), to: localePath('/profile') },
  { icon: mdiCog, title: t('nav.settings'), to: localePath('/settings') },
];
</script>
<template>
  <v-list nav>
    <v-list-item
      v-for="item in navItems"
      :key="item.to"
      :prepend-icon="item.icon"
      :title="item.title"
      :to="item.to"
      rounded="lg"
    />
  </v-list>
</template>
```

### Action list with subtitles

```vue
<v-list lines="two">
  <v-list-item
    v-for="user in users"
    :key="user._id"
    :title="user.name"
    :subtitle="user.email"
  >
    <template #prepend>
      <v-avatar color="primary">
        <span>{{ user.name.charAt(0) }}</span>
      </v-avatar>
    </template>
    <template #append>
      <v-btn :icon="mdiChevronRight" variant="text" size="small" />
    </template>
  </v-list-item>
</v-list>
```

## v-chip

Tag/badge component. Project default: `rounded="lg"`.

### Variants

```vue
<v-chip color="primary">Default (tonal implied)</v-chip>
<v-chip color="success" variant="flat">Flat</v-chip>
<v-chip color="error" variant="outlined">Outlined</v-chip>
<v-chip closable @click:close="remove()">Closable</v-chip>
<v-chip size="small" :prepend-icon="mdiTag">With icon</v-chip>
```

### Status chip pattern

```vue
<script setup>
const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'error',
  draft: 'grey',
};
</script>
<template>
  <v-chip :color="statusColors[item.status]" size="small">
    {{ t(`status.${item.status}`) }}
  </v-chip>
</template>
```

## v-avatar

User avatar with image, icon, or initials.

```vue
<v-avatar size="40" color="primary">
  <v-img v-if="user.avatar" :src="user.avatar" />
  <span v-else>{{ user.name.charAt(0).toUpperCase() }}</span>
</v-avatar>
```

## v-dialog

Modal dialog overlay.

### Standard dialog pattern

```vue
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const dialog = ref(false);
</script>
<template>
  <v-btn color="primary" @click="dialog = true">
    {{ t('actions.open') }}
  </v-btn>

  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <template #title>{{ t('dialog.title') }}</template>
      <template #text>
        <p>{{ t('dialog.content') }}</p>
      </template>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">
          {{ t('actions.cancel') }}
        </v-btn>
        <v-btn color="primary" @click="confirm()">
          {{ t('actions.confirm') }}
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
```

### Key props

| Prop         | Type          | Description                        |
| ------------ | ------------- | ---------------------------------- |
| `v-model`    | boolean       | Show/hide                          |
| `max-width`  | number/string | Maximum dialog width               |
| `persistent` | boolean       | Cannot dismiss by clicking outside |
| `fullscreen` | boolean       | Full-screen dialog                 |
| `scrollable` | boolean       | Scrollable content area            |
| `transition` | string        | Open/close animation               |

### Confirm dialog pattern (reusable composable)

```vue
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiAlert } from '@mdi/js';

const { t } = useI18n();
const show = ref(false);
const resolvePromise = ref(null);
const title = ref('');
const message = ref('');
const confirmColor = ref('primary');

function open(options) {
  title.value = options.title;
  message.value = options.message;
  confirmColor.value = options.color || 'primary';
  show.value = true;
  return new Promise((resolve) => {
    resolvePromise.value = resolve;
  });
}

function confirm() {
  show.value = false;
  resolvePromise.value(true);
}

function cancel() {
  show.value = false;
  resolvePromise.value(false);
}

defineExpose({ open });
</script>
<template>
  <v-dialog v-model="show" max-width="400" persistent>
    <v-card>
      <template #prepend>
        <v-icon :icon="mdiAlert" :color="confirmColor" />
      </template>
      <template #title>{{ title }}</template>
      <template #text>{{ message }}</template>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel()">{{ t('actions.cancel') }}</v-btn>
        <v-btn :color="confirmColor" @click="confirm()">{{ t('actions.confirm') }}</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
```

Usage:

```vue
<script setup>
const confirmDialog = ref(null);

async function handleDelete() {
  const confirmed = await confirmDialog.value.open({
    title: t('confirm.deleteTitle'),
    message: t('confirm.deleteMessage'),
    color: 'error',
  });
  if (confirmed) await deleteItem();
}
</script>
<template>
  <ConfirmDialog ref="confirmDialog" />
</template>
```

## v-snackbar

Toast notification.

### Pattern with composable-like usage

```vue
<script setup>
import { ref } from 'vue';

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

function showNotification(text, color = 'success') {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}
</script>
<template>
  <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="4000" location="bottom end">
    {{ snackbarText }}
    <template #actions>
      <v-btn variant="text" @click="snackbar = false">
        {{ t('actions.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>
```

### Key props

| Prop         | Type    | Description                         |
| ------------ | ------- | ----------------------------------- |
| `v-model`    | boolean | Show/hide                           |
| `color`      | string  | Background color                    |
| `timeout`    | number  | Auto-dismiss (ms), -1 for permanent |
| `location`   | string  | Position (top, bottom + start/end)  |
| `multi-line` | boolean | Taller for longer text              |
| `vertical`   | boolean | Stack text and action               |

## v-alert

Inline messages. Project defaults: `rounded="lg"`, `variant="tonal"`.

### Variants

```vue
<v-alert type="success">{{ t('alerts.saved') }}</v-alert>
<v-alert type="info">{{ t('alerts.info') }}</v-alert>
<v-alert type="warning">{{ t('alerts.warning') }}</v-alert>
<v-alert type="error">{{ t('alerts.error') }}</v-alert>
```

### With title and closable

```vue
<v-alert type="warning" :title="t('alerts.warningTitle')" closable @click:close="dismissed = true">
  {{ t('alerts.warningMessage') }}
</v-alert>
```

### Key props

| Prop        | Type         | Description                           |
| ----------- | ------------ | ------------------------------------- |
| `type`      | string       | success, info, warning, error         |
| `variant`   | string       | tonal, flat, outlined, elevated, text |
| `title`     | string       | Alert title                           |
| `closable`  | boolean      | Show dismiss button                   |
| `icon`      | string/false | Custom icon or disable icon           |
| `prominent` | boolean      | Larger icon                           |
| `border`    | string       | top, end, bottom, start               |

## v-tooltip

Hover information.

```vue
<v-tooltip :text="t('tooltips.edit')">
  <template #activator="{ props }">
    <v-btn :icon="mdiPencil" v-bind="props" variant="text" />
  </template>
</v-tooltip>
```

Short form (Vuetify 4):

```vue
<v-btn :icon="mdiPencil" v-tooltip="t('tooltips.edit')" />
```

### Key props

| Prop          | Type   | Description                                    |
| ------------- | ------ | ---------------------------------------------- |
| `text`        | string | Tooltip content                                |
| `location`    | string | Position (default: bottom from project config) |
| `open-delay`  | number | Delay before showing (ms)                      |
| `close-delay` | number | Delay before hiding (ms)                       |

## v-progress-linear

Horizontal progress bar.

```vue
<v-progress-linear indeterminate color="primary" />

<v-progress-linear :model-value="progress" color="primary" height="6" rounded />
```

### In cards (loading state)

```vue
<v-card :loading="isLoading">
  <template #loader="{ isActive }">
    <v-progress-linear :active="isActive" indeterminate color="primary" height="3" />
  </template>
</v-card>
```

## v-progress-circular

Circular spinner.

```vue
<v-progress-circular indeterminate color="primary" />

<v-progress-circular :model-value="progress" :size="64" :width="6" color="primary">
  {{ progress }}%
</v-progress-circular>
```

### Overlay loading pattern

```vue
<v-overlay v-model="loading" contained class="d-flex align-center justify-center">
  <v-progress-circular indeterminate color="primary" size="64" />
</v-overlay>
```

## v-skeleton-loader

Placeholder while content loads.

### Type patterns

```vue
<v-skeleton-loader type="card" />
<v-skeleton-loader type="list-item-avatar-two-line" />
<v-skeleton-loader type="article" />
<v-skeleton-loader type="table-heading, table-row-divider@3, table-row" />
<v-skeleton-loader type="image, card-heading, text@2, actions" />
```

### Conditional loading pattern

```vue
<template>
  <v-skeleton-loader v-if="loading" type="card-heading, list-item@5" />
  <v-card v-else>
    <template #title>{{ data.title }}</template>
    <v-list>
      <v-list-item v-for="item in data.items" :key="item._id" :title="item.name" />
    </v-list>
  </v-card>
</template>
```

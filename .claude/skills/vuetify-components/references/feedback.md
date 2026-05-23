# Feedback Components

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

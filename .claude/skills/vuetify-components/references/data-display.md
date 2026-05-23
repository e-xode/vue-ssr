# Data Display Components

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

## v-data-table

Data grid with sorting, pagination, and custom rendering.

### Server-side pagination pattern

```vue
<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiPencil, mdiDelete } from '@mdi/js';
import { apiFetch } from '@/shared/apiFetch';

const { t } = useI18n();
const items = ref([]);
const totalItems = ref(0);
const loading = ref(false);
const options = ref({ page: 1, itemsPerPage: 10, sortBy: [] });

const headers = [
  { title: t('fields.name'), key: 'name', sortable: true },
  { title: t('fields.email'), key: 'email', sortable: true },
  { title: t('fields.status'), key: 'status', sortable: false },
  { title: t('fields.actions'), key: 'actions', sortable: false, align: 'end' },
];

async function fetchData() {
  loading.value = true;
  try {
    const { page, itemsPerPage, sortBy } = options.value;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(itemsPerPage),
      ...(sortBy.length && { sort: sortBy[0].key, order: sortBy[0].order }),
    });
    const res = await apiFetch(`/api/admin/users?${params}`);
    items.value = res.items;
    totalItems.value = res.total;
  } finally {
    loading.value = false;
  }
}

watch(options, fetchData, { deep: true, immediate: true });
</script>
<template>
  <v-data-table-server
    v-model:options="options"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="loading"
  >
    <template #item.status="{ item }">
      <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="small">
        {{ t(`status.${item.status}`) }}
      </v-chip>
    </template>
    <template #item.actions="{ item }">
      <v-btn :icon="mdiPencil" size="small" variant="text" @click="edit(item)" />
      <v-btn :icon="mdiDelete" size="small" variant="text" color="error" @click="remove(item)" />
    </template>
  </v-data-table-server>
</template>
```

### Key props

| Prop             | Type    | Description               |
| ---------------- | ------- | ------------------------- |
| `headers`        | array   | Column definitions        |
| `items`          | array   | Row data                  |
| `items-length`   | number  | Total items (server-side) |
| `loading`        | boolean | Show loading state        |
| `search`         | string  | Client-side filter        |
| `sort-by`        | array   | Sort configuration        |
| `items-per-page` | number  | Rows per page             |
| `hover`          | boolean | Highlight row on hover    |
| `show-select`    | boolean | Row selection checkboxes  |

### Header definition

```javascript
{
  title: 'Display Name',
  key: 'dataProperty',
  sortable: true,
  align: 'start',
  width: '200px'
}
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

## Pagination pattern

Used in admin views alongside data tables:

```vue
<script setup>
import { ref, computed } from 'vue';

const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
</script>
<template>
  <v-pagination v-model="page" :length="totalPages" rounded="lg" total-visible="7" />
</template>
```

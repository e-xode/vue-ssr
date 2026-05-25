---
name: vuetify-data
description: "Vuetify 4 data presentation for the Vue SSR Starter Kit: server-side paginated tables (v-data-table-server with headers/items/items-length, options watcher, custom item slots for chips and action buttons), client-side v-data-table, and standalone v-pagination. Trigger on: building a data table, server-side pagination, table headers/columns, custom cell rendering, or pagination controls. Don't use for: forms and inputs (→ vuetify-forms), cards/lists/chips/dialogs (→ vuetify-components), navigation/tabs (→ vuetify-layout), general component choice (→ vuetify-overview), the apiFetch call itself (→ vue-ssr-architecture), SCSS styling (→ design-scss)."
---

# Data Display Components

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

# Loading indicators

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

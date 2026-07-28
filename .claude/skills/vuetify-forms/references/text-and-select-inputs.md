# Text and select inputs

## v-text-field

The primary input component. Project defaults: `variant="outlined"`, `density="comfortable"`, `rounded="lg"`.

### Key props

| Prop                 | Type          | Description                          |
| --------------------- | ------------- | -------------------------------------- |
| `v-model`            | string/number | Two-way binding                          |
| `type`               | string        | text, password, email, number, tel        |
| `rules`              | array         | Validation rule functions                  |
| `label`              | string        | Floating label (use i18n `t()`)               |
| `placeholder`        | string        | Placeholder text                                |
| `clearable`          | boolean       | Show clear button                                 |
| `disabled`           | boolean       | Disable input                                       |
| `readonly`           | boolean       | Read-only state                                       |
| `append-inner-icon`  | string        | Icon inside the field (right)                          |
| `prepend-inner-icon` | string        | Icon inside the field (left)                             |
| `hint`               | string        | Helper text below field                                   |
| `persistent-hint`    | boolean       | Always show hint                                             |
| `error-messages`     | array         | Server-side error messages                                    |
| `counter`            | number        | Character counter                                                |
| `maxlength`          | number        | Max input length                                                   |

### Password field with toggle

```vue
<script setup>
import { ref } from 'vue';
import { mdiEye, mdiEyeOff } from '@mdi/js';

const password = ref('');
const showPassword = ref(false);
</script>
<template>
  <v-text-field
    v-model="password"
    :type="showPassword ? 'text' : 'password'"
    :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
    @click:append-inner="showPassword = !showPassword"
  />
</template>
```

## v-select

Dropdown selection. Same defaults as v-text-field.

### Key props

| Prop             | Type    | Description                          |
| ----------------- | ------- | --------------------------------------- |
| `items`          | array   | Options array (strings or objects)         |
| `item-title`     | string  | Property name for display text               |
| `item-value`     | string  | Property name for value                        |
| `multiple`       | boolean | Allow multiple selections                        |
| `chips`          | boolean | Show selected as chips                              |
| `closable-chips` | boolean | Chips can be removed                                  |
| `return-object`  | boolean | Return full object instead of value                     |
| `no-data-text`   | string  | Text when no items                                        |

### Example with objects

```vue
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const selectedRole = ref(null);
const roles = [
  { title: 'Admin', value: 'admin' },
  { title: 'Editor', value: 'editor' },
  { title: 'Viewer', value: 'viewer' },
];
</script>
<template>
  <v-select
    v-model="selectedRole"
    :items="roles"
    :label="t('fields.role')"
    item-title="title"
    item-value="value"
  />
</template>
```

### Multiple select with chips

```vue
<v-select
  v-model="selectedTags"
  :items="tags"
  multiple
  chips
  closable-chips
  :label="t('fields.tags')"
/>
```

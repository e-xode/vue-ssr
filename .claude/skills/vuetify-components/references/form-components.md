# Form Components

## v-text-field

The primary input component. Project defaults: `variant="outlined"`, `density="comfortable"`, `rounded="lg"`.

### Key props

| Prop                 | Type          | Description                        |
| -------------------- | ------------- | ---------------------------------- |
| `v-model`            | string/number | Two-way binding                    |
| `type`               | string        | text, password, email, number, tel |
| `rules`              | array         | Validation rule functions          |
| `label`              | string        | Floating label (use i18n `t()`)    |
| `placeholder`        | string        | Placeholder text                   |
| `clearable`          | boolean       | Show clear button                  |
| `disabled`           | boolean       | Disable input                      |
| `readonly`           | boolean       | Read-only state                    |
| `append-inner-icon`  | string        | Icon inside the field (right)      |
| `prepend-inner-icon` | string        | Icon inside the field (left)       |
| `hint`               | string        | Helper text below field            |
| `persistent-hint`    | boolean       | Always show hint                   |
| `error-messages`     | array         | Server-side error messages         |
| `counter`            | number        | Character counter                  |
| `maxlength`          | number        | Max input length                   |

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

| Prop             | Type    | Description                         |
| ---------------- | ------- | ----------------------------------- |
| `items`          | array   | Options array (strings or objects)  |
| `item-title`     | string  | Property name for display text      |
| `item-value`     | string  | Property name for value             |
| `multiple`       | boolean | Allow multiple selections           |
| `chips`          | boolean | Show selected as chips              |
| `closable-chips` | boolean | Chips can be removed                |
| `return-object`  | boolean | Return full object instead of value |
| `no-data-text`   | string  | Text when no items                  |

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

## v-switch

Toggle control. Project defaults: `color="primary"`, `inset: true`.

```vue
<v-switch v-model="isActive" :label="t('fields.active')" />
```

## v-checkbox

```vue
<v-checkbox
  v-model="accepted"
  :label="t('fields.acceptTerms')"
  :rules="[(v) => !!v || t('validation.required')]"
  color="primary"
/>
```

## v-radio-group

```vue
<v-radio-group v-model="preference" :label="t('fields.preference')">
  <v-radio :label="t('options.option1')" value="option1" />
  <v-radio :label="t('options.option2')" value="option2" />
  <v-radio :label="t('options.option3')" value="option3" />
</v-radio-group>
```

## v-form

The form wrapper that manages validation state.

### Methods

| Method              | Returns              | Description                            |
| ------------------- | -------------------- | -------------------------------------- |
| `validate()`        | `{ valid: boolean }` | Triggers all field rules               |
| `reset()`           | void                 | Resets all fields and validation       |
| `resetValidation()` | void                 | Clears errors without resetting values |

### Validation rules pattern

Rules are arrays of functions. Each function receives the field value and returns `true` (valid) or an error string:

```javascript
const rules = {
  required: (v) => !!v || t('validation.required'),
  email: (v) => /.+@.+\..+/.test(v) || t('validation.email'),
  minLength: (min) => (v) => (v && v.length >= min) || t('validation.minLength', { min }),
  maxLength: (max) => (v) => !v || v.length <= max || t('validation.maxLength', { max }),
  numeric: (v) => /^\d+$/.test(v) || t('validation.numeric'),
  phone: (v) => /^\+?[\d\s-]{10,}$/.test(v) || t('validation.phone'),
};
```

### Login form pattern

```vue
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiEmail, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';

const { t } = useI18n();
const form = ref(null);
const loading = ref(false);
const email = ref('');
const password = ref('');
const showPassword = ref(false);

const rules = {
  required: (v) => !!v || t('validation.required'),
  email: (v) => /.+@.+\..+/.test(v) || t('validation.email'),
};

async function submit() {
  const { valid } = await form.value.validate();
  if (!valid) return;
  loading.value = true;
  try {
    await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    });
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <v-form ref="form" @submit.prevent="submit">
    <v-text-field
      v-model="email"
      :prepend-inner-icon="mdiEmail"
      :label="t('fields.email')"
      :rules="[rules.required, rules.email]"
      type="email"
      autocomplete="email"
    />
    <v-text-field
      v-model="password"
      :prepend-inner-icon="mdiLock"
      :label="t('fields.password')"
      :rules="[rules.required]"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
      autocomplete="current-password"
      @click:append-inner="showPassword = !showPassword"
    />
    <v-btn type="submit" color="primary" block :loading="loading">
      {{ t('actions.login') }}
    </v-btn>
  </v-form>
</template>
```

### Search with filters pattern

```vue
<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiMagnify } from '@mdi/js';

const { t } = useI18n();
const search = ref('');
const statusFilter = ref(null);

const statuses = [
  { title: 'All', value: null },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
];

watch(
  [search, statusFilter],
  () => {
    fetchData();
  },
  { debounce: 300 }
);
</script>
<template>
  <v-row>
    <v-col cols="12" md="8">
      <v-text-field
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        :placeholder="t('actions.search')"
        clearable
        hide-details
      />
    </v-col>
    <v-col cols="12" md="4">
      <v-select v-model="statusFilter" :items="statuses" :label="t('fields.status')" hide-details />
    </v-col>
  </v-row>
</template>
```

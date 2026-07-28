---
name: vuetify-forms
description: "Vuetify 4 form building for the Vue SSR Starter Kit: form inputs (v-text-field, v-select, v-switch, v-checkbox, v-textarea, v-radio), the v-form wrapper with ref-based validation, validation rules (required/email/custom returning i18n keys), async submit with form.validate(), and project input defaults (outlined, comfortable density, rounded). Trigger on: building a form, adding inputs, validation rules, form submission, or input component props. Don't use for: data tables (→ vuetify-data), dialogs/snackbars/alerts (→ vuetify-components), navigation (→ vuetify-layout), general component choice (→ vuetify-overview), i18n key creation (→ translate), SCSS styling (→ design-scss)."
---

# Form Components

## Form pattern

```vue
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const form = ref(null);
const email = ref('');

const rules = {
  required: (v) => !!v || t('validation.required'),
  email: (v) => /.+@.+\..+/.test(v) || t('validation.email'),
};

async function submit() {
  const { valid } = await form.value.validate();
  if (!valid) return;
}
</script>
<template>
  <v-form ref="form" @submit.prevent="submit">
    <v-text-field v-model="email" :rules="[rules.required, rules.email]" />
    <v-btn type="submit" color="primary">{{ t('actions.submit') }}</v-btn>
  </v-form>
</template>
```

## Component selection

| Need                         | Component              | Project default                                    |
| ------------------------------ | ------------------------ | ------------------------------------------------------ |
| Free text entry               | `v-text-field`           | outlined, comfortable density, rounded lg                |
| Dropdown selection             | `v-select`                | same defaults as text-field                                |
| Boolean toggle                 | `v-switch`                 | primary color, inset                                        |
| Checkbox agreement              | `v-checkbox`               | —                                                              |
| Single choice from a list       | `v-radio-group` + `v-radio` | —                                                              |
| Form wrapper / validation state | `v-form`                    | ref-based, `validate()`/`reset()`/`resetValidation()`          |

## Hard rules

- **Validation rule functions return `true` or an i18n string** (`t('validation.required')`) — never a hardcoded English error string.
- **Always gate submit on `form.value.validate()`** — `const { valid } = await form.value.validate(); if (!valid) return;` before any side effect (API call, navigation).
- **Password show/hide uses `append-inner-icon` + `@click:append-inner`** to toggle the field `type`, not a separate button next to the field.

## Reference files

| Need                                                       | File                                       |
| ------------------------------------------------------------ | --------------------------------------------- |
| `v-text-field` and `v-select` full props + examples          | `references/text-and-select-inputs.md`         |
| `v-switch`, `v-checkbox`, `v-radio-group`                       | `references/toggle-inputs.md`                    |
| `v-form` methods, validation rules, login form, filtered search | `references/form-validation-patterns.md`         |

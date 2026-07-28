# Toggle inputs

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

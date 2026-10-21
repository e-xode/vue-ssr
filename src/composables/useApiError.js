import { useI18n } from 'vue-i18n';
import { ERROR_KEY_PREFIX, FALLBACK_ERROR_KEY } from '@/composables/apiErrorConstants';

function readErrorValue(value) {
  if (typeof value === 'string') return value;
  return value?.error ?? value?.message ?? null;
}

export function useApiError() {
  const { t, te } = useI18n();

  function isKnownErrorKey(value) {
    return typeof value === 'string' && value.startsWith(ERROR_KEY_PREFIX) && te(value);
  }

  function translateError(value, fallbackKey = FALLBACK_ERROR_KEY) {
    const candidate = readErrorValue(value);
    return t(isKnownErrorKey(candidate) ? candidate : fallbackKey);
  }

  return { translateError };
}

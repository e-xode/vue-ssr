import { useI18n } from 'vue-i18n';
import { EMPTY_VALUE, LOG_REASON_KEYS, LOG_SUMMARIES } from '@/composables/logSummaryConstants';

export function useLogSummary() {
  const { t } = useI18n();

  function reasonLabel(reason) {
    const key = Object.hasOwn(LOG_REASON_KEYS, reason) ? LOG_REASON_KEYS[reason] : null;
    return key ? t(`admin.logs.reason.${key}`) : (reason ?? EMPTY_VALUE);
  }

  function summarizeLog(log) {
    const summary = Object.hasOwn(LOG_SUMMARIES, log?.event) ? LOG_SUMMARIES[log.event] : null;
    if (!summary) {
      return t('admin.logs.summary.unknown', { event: log?.event ?? EMPTY_VALUE });
    }
    return t(`admin.logs.summary.${summary.key}`, summary.params(log?.meta, reasonLabel));
  }

  function hasDetails(log) {
    return !!(log?.meta && Object.keys(log.meta).length);
  }

  function formatDetails(log) {
    return JSON.stringify(log?.meta ?? {}, null, 2);
  }

  return { summarizeLog, hasDetails, formatDetails };
}

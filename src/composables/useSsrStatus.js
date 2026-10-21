import { getCurrentInstance, useSSRContext } from 'vue';
import { MIN_HTTP_STATUS, MAX_HTTP_STATUS } from '@/shared/clientConstants';

function resolveSsrContext(explicitContext) {
  if (explicitContext) return explicitContext;
  if (typeof window !== 'undefined' || !getCurrentInstance()) return null;
  return useSSRContext() ?? null;
}

export function useSsrStatus(explicitContext) {
  const ssrContext = resolveSsrContext(explicitContext);

  function setStatusCode(code) {
    const isHttpStatus =
      Number.isInteger(code) && code >= MIN_HTTP_STATUS && code <= MAX_HTTP_STATUS;
    if (!ssrContext || !isHttpStatus) return false;
    ssrContext.statusCode = code;
    return true;
  }

  return { setStatusCode };
}

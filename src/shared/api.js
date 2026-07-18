export async function apiFetch(url, options = {}) {
  const { timeout: timeoutMs = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
    const headers = isFormData
      ? { ...fetchOptions.headers }
      : { 'Content-Type': 'application/json', ...fetchOptions.headers };

    const response = await fetch(url, {
      credentials: 'include',
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('json') ? await response.json() : await response.text();

    if (!response.ok) {
      const error = data?.error || 'error.server';
      throw Object.assign(new Error(error), {
        status: response.status,
        error,
        data,
        isRateLimit: response.status === 429,
      });
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

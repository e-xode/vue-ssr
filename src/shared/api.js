export async function apiFetch(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
    const headers = isFormData
      ? { ...options.headers }
      : { 'Content-Type': 'application/json', ...options.headers }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
      signal: controller.signal
    })

    const contentType = response.headers.get('content-type')
    const data = contentType?.includes('json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const error = data?.error || 'error.server'
      throw Object.assign(new Error(error), {
        status: response.status,
        error,
        data,
        isRateLimit: response.status === 429
      })
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

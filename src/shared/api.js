async function safeJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function apiFetch(url, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = isFormData
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers
  })

  const data = await safeJson(response)

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
}

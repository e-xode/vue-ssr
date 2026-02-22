export async function apiFetch(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  const response = await fetch(url, defaultOptions)
  const data = await response.json()

  if (!response.ok) {
    throw Object.assign(new Error(data.error || 'error.server'), {
      status: response.status,
      data
    })
  }

  return data
}

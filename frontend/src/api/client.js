const API_BASE_PATH = '/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE_PATH}${path}`, {
      ...options,
      headers,
      body: options.body && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body
    })
  } catch {
    throw new Error('Unable to reach the marketplace server.')
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('The marketplace server returned an invalid response.')
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed')
  }

  return result.data
}

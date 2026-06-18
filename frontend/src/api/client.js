const BASE = '/api'

export async function apiRequest(method, path, body) {
  const options = { method, credentials: 'include', headers: {} }
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, options)
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* resposta sem corpo JSON */ }

  if (!res.ok) {
    const error = new Error(data?.error ?? `Erro ${res.status}`)
    error.status = res.status
    throw error
  }

  return data
}

export async function apiUpload(path, formData) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(data?.error ?? `Erro ${res.status}`)
    error.status = res.status
    throw error
  }
  return data
}

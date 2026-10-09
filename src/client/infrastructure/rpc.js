/** Same-origin transport for Host capability consumers. */
function unwrap(result) {
  if (result.ok) return result.value
  throw new Error(typeof result.error === 'string' ? result.error : 'Не удалось выполнить операцию с библиотекой.')
}

export async function call(endpoint, payload, options = {}) {
  const response = await fetch(`/mayori/characters/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: options.signal,
  })
  const result = await response.json().catch(() => ({ ok: false, error: `HTTP ${response.status}` }))
  if (!response.ok && result.ok !== false) throw new Error(`HTTP ${response.status}`)
  return unwrap(result)
}

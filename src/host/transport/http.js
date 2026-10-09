import { Buffer } from 'node:buffer'

const MAX_REQUEST_BYTES = 64 * 1024 * 1024

export function isLoopbackRequest(req) {
  const rawHost = req.headers.host
  const origin = req.headers.origin
  if (typeof rawHost !== 'string' || typeof origin !== 'string') return false
  let host
  try {
    host = new URL(`http://${rawHost}`).hostname.toLowerCase()
  } catch {
    return false
  }
  const loopback = host === 'localhost'
    || host.endsWith('.localhost')
    || host === '::1'
    || host === '[::1]'
    || /^127(?:\.\d{1,3}){3}$/.test(host)
  if (!loopback || (req.headers['sec-fetch-site'] !== undefined && req.headers['sec-fetch-site'] !== 'same-origin')) {
    return false
  }
  return origin === `http://${rawHost}` || origin === `https://${rawHost}`
}

/** Browser image loads have Fetch Metadata but normally omit Origin. */
export function isLoopbackAssetRequest(req) {
  if (req.headers.origin) return isLoopbackRequest(req)
  return req.headers['sec-fetch-site'] === 'same-origin' && isLoopbackRequest({ headers: {
    ...req.headers, origin: `http://${req.headers.host}`,
  } })
}

export async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_REQUEST_BYTES) throw new RangeError('Запрос импорта превышает лимит 64 МБ.')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

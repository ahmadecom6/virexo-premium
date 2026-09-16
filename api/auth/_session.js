import crypto from 'node:crypto'

const encode = (value) => Buffer.from(value).toString('base64url')
const decode = (value) => Buffer.from(value, 'base64url').toString('utf8')

const signingSecret = () => process.env.PORTAL_SESSION_SECRET || process.env.ADMIN_PASSWORD

const sign = (payload) => crypto.createHmac('sha256', signingSecret()).update(payload).digest('base64url')

export const createSessionToken = (email) => {
  const payload = encode(JSON.stringify({ email, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }))
  return `${payload}.${sign(payload)}`
}

export const readSessionToken = (token) => {
  if (!token || !signingSecret()) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expectedSignature = sign(payload)
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null
  try {
    const session = JSON.parse(decode(payload))
    return typeof session.email === 'string' && session.expiresAt > Date.now() ? session : null
  } catch {
    return null
  }
}

export const bearerToken = (request) => request.headers.authorization?.replace(/^Bearer\s+/i, '')

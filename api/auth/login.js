import { createSessionToken } from './_session.js'

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const configuredPassword = process.env.ADMIN_PASSWORD
  const { email, password } = request.body ?? {}
  if (!configuredEmail || !configuredPassword || !process.env.PORTAL_SESSION_SECRET) {
    return response.status(503).json({ error: 'Portal credentials are not configured. Contact Virexo support.' })
  }
  if (typeof email !== 'string' || typeof password !== 'string' || email.trim().toLowerCase() !== configuredEmail || password !== configuredPassword) {
    return response.status(401).json({ error: 'The email or password is incorrect.' })
  }
  return response.status(200).json({ token: createSessionToken(configuredEmail), email: configuredEmail })
}

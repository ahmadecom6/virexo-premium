import { bearerToken, readSessionToken } from './_session.js'

export default function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' })
  const session = readSessionToken(bearerToken(request))
  if (!session) return response.status(401).json({ error: 'Your session has expired.' })
  return response.status(200).json({ email: session.email })
}

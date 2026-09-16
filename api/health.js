import { aiConfigured } from './ai.js'

export default function handler(_request, response) {
  return response.status(200).json({
    status: 'ok',
    aiConfigured: aiConfigured(),
    portalConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.PORTAL_SESSION_SECRET),
    analyticsConfigured: Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  })
}
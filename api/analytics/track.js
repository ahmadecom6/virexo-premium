import { hasKv, pipeline, values } from './_kv.js'

const analyticsKey = 'virexo:analytics'

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!hasKv()) return response.status(503).json({ error: 'Live analytics storage is not configured.' })

  const { sessionId, page } = request.body ?? {}
  if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{12,80}$/.test(sessionId) || typeof page !== 'string' || !page.startsWith('/') || page.length > 120) {
    return response.status(400).json({ error: 'A valid anonymous session and page are required.' })
  }

  try {
    const now = Date.now()
    const minute = Math.floor(now / 60_000)
    const [newVisitor] = values(await pipeline([
      ['SET', `${analyticsKey}:visitor:${sessionId}`, '1', 'NX', 'EX', 2_592_000],
      ['ZADD', `${analyticsKey}:active`, now, sessionId],
      ['ZREMRANGEBYSCORE', `${analyticsKey}:active`, 0, now - 90_000],
      ['HINCRBY', `${analyticsKey}:totals`, 'pageViews', 1],
      ['HINCRBY', `${analyticsKey}:pages`, page, 1],
      ['HINCRBY', `${analyticsKey}:minutes`, minute, 1],
    ]))
    if (newVisitor === 'OK') await pipeline([['HINCRBY', `${analyticsKey}:totals`, 'totalVisits', 1]])
    return response.status(202).json({ accepted: true })
  } catch (error) {
    console.error('Analytics tracking failed:', error.message)
    return response.status(502).json({ error: 'Live analytics is temporarily unavailable.' })
  }
}

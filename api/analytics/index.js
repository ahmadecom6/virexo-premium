import { hasKv, pipeline, values } from './_kv.js'

const analyticsKey = 'virexo:analytics'

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' })
  if (!hasKv()) return response.status(503).json({ error: 'Live analytics storage is not configured.' })

  try {
    const now = Date.now()
    const minute = Math.floor(now / 60_000)
    const [activeVisitors, totals = {}, pages = {}, minutes = {}] = values(await pipeline([
      ['ZREMRANGEBYSCORE', `${analyticsKey}:active`, 0, now - 90_000],
      ['ZCARD', `${analyticsKey}:active`],
      ['HGETALL', `${analyticsKey}:totals`],
      ['HGETALL', `${analyticsKey}:pages`],
      ['HGETALL', `${analyticsKey}:minutes`],
    ])).slice(1)
    const activity = Array.from({ length: 12 }, (_value, index) => {
      const bucket = minute - 11 + index
      return { label: index === 11 ? 'Now' : `${11 - index}m`, value: Number(minutes[bucket] || 0) }
    })
    const sortedPages = Object.entries(pages).sort(([, countA], [, countB]) => Number(countB) - Number(countA)).slice(0, 5).map(([page, count]) => [page, Number(count)])
    return response.status(200).json({
      activeVisitors: Number(activeVisitors || 0),
      totalVisits: Number(totals.totalVisits || 0),
      pageViews: Number(totals.pageViews || 0),
      pages: sortedPages,
      activity,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Analytics read failed:', error.message)
    return response.status(502).json({ error: 'Live analytics is temporarily unavailable.' })
  }
}

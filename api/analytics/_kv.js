const kvUrl = process.env.KV_REST_API_URL
const kvToken = process.env.KV_REST_API_TOKEN

export const hasKv = () => Boolean(kvUrl && kvToken)

export const pipeline = async (commands) => {
  if (!hasKv()) throw new Error('Vercel KV is not configured.')
  const response = await fetch(`${kvUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!response.ok) throw new Error('Vercel KV request failed.')
  return response.json()
}

export const values = (results) => results.map((result) => result.result)

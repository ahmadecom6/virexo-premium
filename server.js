import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import multer from 'multer'
import { aiConfigured } from './api/ai.js'
import chatHandler from './api/chat.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const authTokens = new Map()
const analyticsFile = path.resolve('uploads', 'analytics.json')

const emptyAnalytics = () => ({ totalVisits: 0, pageViews: 0, sessions: {}, pages: {}, minuteViews: {} })
const loadAnalytics = () => {
  try {
    return { ...emptyAnalytics(), ...JSON.parse(fs.readFileSync(analyticsFile, 'utf8')) }
  } catch {
    return emptyAnalytics()
  }
}
let analytics = loadAnalytics()
const analyticsClients = new Set()
let persistTimer

const analyticsSnapshot = () => {
  const now = Date.now()
  const activeVisitors = Object.values(analytics.sessions).filter((lastSeen) => now - lastSeen < 90_000).length
  const currentMinute = Math.floor(now / 60_000)
  const activity = Array.from({ length: 12 }, (_value, index) => {
    const minute = currentMinute - 11 + index
    return { label: index === 11 ? 'Now' : `${11 - index}m`, value: analytics.minuteViews[minute] || 0 }
  })
  return {
    activeVisitors,
    totalVisits: analytics.totalVisits,
    pageViews: analytics.pageViews,
    pages: Object.entries(analytics.pages).sort(([, countA], [, countB]) => countB - countA).slice(0, 5),
    activity,
    updatedAt: new Date().toISOString(),
  }
}
const broadcastAnalytics = () => {
  const message = `data: ${JSON.stringify(analyticsSnapshot())}\n\n`
  analyticsClients.forEach((client) => client.write(message))
}
const saveAnalytics = () => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => fs.writeFileSync(analyticsFile, JSON.stringify(analytics)), 250)
}

if (!process.env.GEMINI_API_KEY) {
  console.warn('No Gemini API key is set. Add GEMINI_API_KEY to your .env file before using the AI assistant.')
}

app.use(express.json({ limit: '64kb' }))
app.disable('x-powered-by')
app.use((_request, response, next) => {
  response.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=(self)',
    'Cross-Origin-Opener-Policy': 'same-origin',
  })
  next()
})

const rateBuckets = new Map()
const rateLimit = (limit, windowMs) => (request, response, next) => {
  const key = `${request.ip}:${request.path}`
  const now = Date.now()
  const bucket = rateBuckets.get(key)
  if (!bucket || bucket.resetAt < now) { rateBuckets.set(key, { count: 1, resetAt: now + windowMs }); return next() }
  bucket.count += 1
  if (bucket.count > limit) return response.status(429).json({ error: 'Too many requests. Please wait and try again.' })
  next()
}

const applicationsDirectory = path.resolve('uploads', 'applications')
fs.mkdirSync(applicationsDirectory, { recursive: true })

app.get('/api/health', (_request, response) => response.json({
  status: 'ok',
  aiConfigured: aiConfigured(),
  portalConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.PORTAL_SESSION_SECRET),
  analyticsConfigured: Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
}))

app.post('/api/analytics/track', (request, response) => {
  const { sessionId, page } = request.body ?? {}
  if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{12,80}$/.test(sessionId) || typeof page !== 'string' || !page.startsWith('/') || page.length > 120) {
    return response.status(400).json({ error: 'A valid anonymous session and page are required.' })
  }
  const isNewVisitor = !analytics.sessions[sessionId]
  analytics.sessions[sessionId] = Date.now()
  analytics.pageViews += 1
  analytics.pages[page] = (analytics.pages[page] || 0) + 1
  const currentMinute = Math.floor(Date.now() / 60_000)
  analytics.minuteViews[currentMinute] = (analytics.minuteViews[currentMinute] || 0) + 1
  Object.keys(analytics.minuteViews).filter((minute) => Number(minute) < currentMinute - 60).forEach((minute) => delete analytics.minuteViews[minute])
  if (isNewVisitor) analytics.totalVisits += 1
  saveAnalytics()
  broadcastAnalytics()
  return response.status(202).json(analyticsSnapshot())
})

app.get('/api/analytics', (_request, response) => response.json(analyticsSnapshot()))

app.get('/api/analytics/stream', (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })
  response.write(`data: ${JSON.stringify(analyticsSnapshot())}\n\n`)
  analyticsClients.add(response)
  request.on('close', () => analyticsClients.delete(response))
})

const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const configuredAdminPassword = process.env.ADMIN_PASSWORD
const getBearerToken = (request) => request.headers.authorization?.replace(/^Bearer\s+/i, '')

app.post('/api/auth/login', rateLimit(8, 15 * 60 * 1000), (request, response) => {
  const { email, password } = request.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'Enter your email and password.' })
  }
  if (!configuredAdminEmail || !configuredAdminPassword) {
    return response.status(503).json({ error: 'Client portal access is not configured yet.' })
  }
  if (email.trim().toLowerCase() !== configuredAdminEmail || password !== configuredAdminPassword) {
    return response.status(401).json({ error: 'The email or password is incorrect.' })
  }
  const token = crypto.randomUUID()
  authTokens.set(token, { email: configuredAdminEmail, expiresAt: Date.now() + 8 * 60 * 60 * 1000 })
  return response.json({ token, email: configuredAdminEmail })
})

app.get('/api/auth/session', (request, response) => {
  const token = getBearerToken(request)
  const session = authTokens.get(token)
  if (!session || session.expiresAt < Date.now()) {
    authTokens.delete(token)
    return response.status(401).json({ error: 'Your session has expired.' })
  }
  return response.json({ email: session.email })
})

app.post('/api/auth/logout', (request, response) => {
  authTokens.delete(getBearerToken(request))
  return response.status(204).end()
})

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: applicationsDirectory,
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase()
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const acceptedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
    callback(null, acceptedTypes.has(file.mimetype))
  },
})

app.post('/api/applications', rateLimit(12, 60 * 60 * 1000), resumeUpload.single('resume'), (request, response) => {
  const { name, email, specialization, experience } = request.body
  if (![name, email, specialization, experience].every((value) => typeof value === 'string' && value.trim())) {
    return response.status(400).json({ error: 'Please complete every application field.' })
  }
  if (!request.file) {
    return response.status(400).json({ error: 'A PDF, DOC, or DOCX resume is required.' })
  }

  return response.status(201).json({ message: 'Application received.' })
})

app.post('/api/chat', chatHandler)

// Serve the production build and return the SPA shell on direct route refreshes.
const productionDirectory = path.resolve('dist')
if (fs.existsSync(productionDirectory)) {
  app.use(express.static(productionDirectory))
  app.get('/{*route}', (request, response, next) => {
    if (request.path.startsWith('/api/')) return next()
    return response.sendFile(path.join(productionDirectory, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`AI server is running at http://localhost:${port}`)
})

const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')

const taskRoutes = require('./routes/tasks')

const app = express()

// ── Middleware ──────────────────────────
app.use(helmet())           // Security headers
app.use(cors())             // Allow cross-origin requests
app.use(morgan('combined')) // Request logging
app.use(express.json())     // Parse JSON bodies

// ── Routes ─────────────────────────────
app.use('/api/tasks', taskRoutes)

// ── Health Check (used by Kubernetes) ──
app.get('/health', (req, res) => {
  res.status(200).json({
    status:  'healthy',
    version: process.env.APP_VERSION || 'v1',
    uptime:  process.uptime().toFixed(2) + 's',
    env:     process.env.NODE_ENV || 'development',
  })
})

// ── Root ────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name:    'FlowBoard API',
    version: process.env.APP_VERSION || 'v1',
    docs:    'GET /api/tasks | POST /api/tasks | PUT /api/tasks/:id | DELETE /api/tasks/:id',
  })
})

// ── 404 Handler ─────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Global Error Handler ─────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app

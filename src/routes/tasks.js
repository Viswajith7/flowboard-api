const express = require('express')
const store   = require('../store/taskStore')

const router = express.Router()

// ── GET /api/tasks ───────────────────────────────────
// Returns all tasks. Supports ?status=, ?tag=, ?priority= filters
router.get('/', (req, res) => {
  try {
    const { status, tag, priority } = req.query
    const tasks = store.getAll({ status, tag, priority })
    res.json({
      count: tasks.length,
      stats: store.stats(),
      tasks,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/tasks/stats ─────────────────────────────
// Returns task counts by status
router.get('/stats', (req, res) => {
  res.json(store.stats())
})

// ── GET /api/tasks/:id ───────────────────────────────
router.get('/:id', (req, res) => {
  const task = store.getById(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})

// ── POST /api/tasks ──────────────────────────────────
// Body: { title, tag?, status?, priority? }
router.post('/', (req, res) => {
  try {
    const task = store.create(req.body)
    res.status(201).json(task)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── PUT /api/tasks/:id ───────────────────────────────
// Partial update — send only the fields you want to change
router.put('/:id', (req, res) => {
  try {
    const task = store.update(req.params.id, req.body)
    if (!task) return res.status(404).json({ error: 'Task not found' })
    res.json(task)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── DELETE /api/tasks/:id ────────────────────────────
router.delete('/:id', (req, res) => {
  const deleted = store.remove(req.params.id)
  if (!deleted) return res.status(404).json({ error: 'Task not found' })
  res.status(200).json({ message: 'Task deleted successfully' })
})

module.exports = router

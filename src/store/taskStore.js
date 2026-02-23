const { v4: uuidv4 } = require('uuid')

// In-memory store (persists while server is running)
// In production you'd swap this for a real DB like PostgreSQL
let tasks = [
  {
    id:        uuidv4(),
    title:     'Set up Minikube cluster',
    tag:       'devops',
    status:    'done',
    priority:  'high',
    createdAt: new Date().toISOString(),
  },
  {
    id:        uuidv4(),
    title:     'Configure Argo Rollouts',
    tag:       'devops',
    status:    'in-progress',
    priority:  'high',
    createdAt: new Date().toISOString(),
  },
  {
    id:        uuidv4(),
    title:     'Write unit tests',
    tag:       'dev',
    status:    'in-progress',
    priority:  'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id:        uuidv4(),
    title:     'Set up SonarCloud quality gate',
    tag:       'quality',
    status:    'todo',
    priority:  'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id:        uuidv4(),
    title:     'Configure Grafana dashboards',
    tag:       'monitor',
    status:    'todo',
    priority:  'high',
    createdAt: new Date().toISOString(),
  },
]

const VALID_STATUSES   = ['todo', 'in-progress', 'done']
const VALID_PRIORITIES = ['low', 'medium', 'high']
const VALID_TAGS       = ['dev', 'devops', 'quality', 'monitor', 'design', 'other']

function getAll(filters = {}) {
  let result = [...tasks]
  if (filters.status)   result = result.filter(t => t.status === filters.status)
  if (filters.tag)      result = result.filter(t => t.tag    === filters.tag)
  if (filters.priority) result = result.filter(t => t.priority === filters.priority)
  return result
}

function getById(id) {
  return tasks.find(t => t.id === id) || null
}

function create({ title, tag = 'other', status = 'todo', priority = 'medium' }) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('title is required')
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`)
  }
  if (!VALID_TAGS.includes(tag)) {
    throw new Error(`tag must be one of: ${VALID_TAGS.join(', ')}`)
  }

  const task = {
    id:        uuidv4(),
    title:     title.trim(),
    tag,
    status,
    priority,
    createdAt: new Date().toISOString(),
  }
  tasks.push(task)
  return task
}

function update(id, fields) {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return null

  const allowed = ['title', 'tag', 'status', 'priority']
  const updates = {}

  for (const key of allowed) {
    if (fields[key] !== undefined) updates[key] = fields[key]
  }

  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  if (updates.priority && !VALID_PRIORITIES.includes(updates.priority)) {
    throw new Error(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`)
  }

  tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() }
  return tasks[idx]
}

function remove(id) {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return false
  tasks.splice(idx, 1)
  return true
}

function stats() {
  return {
    total:      tasks.length,
    done:       tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo:       tasks.filter(t => t.status === 'todo').length,
  }
}

module.exports = { getAll, getById, create, update, remove, stats }

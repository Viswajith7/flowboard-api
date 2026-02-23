const request = require('supertest')
const app     = require('../src/app')

describe('Health & Root', () => {
  test('GET /health returns healthy', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('healthy')
    expect(res.body).toHaveProperty('uptime')
    expect(res.body).toHaveProperty('version')
  })

  test('GET / returns API info', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('name', 'FlowBoard API')
  })

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/unknown-route')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/tasks', () => {
  test('returns task list with stats', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('tasks')
    expect(res.body).toHaveProperty('stats')
    expect(res.body).toHaveProperty('count')
    expect(Array.isArray(res.body.tasks)).toBe(true)
  })

  test('filters by status', async () => {
    const res = await request(app).get('/api/tasks?status=done')
    expect(res.status).toBe(200)
    res.body.tasks.forEach(t => expect(t.status).toBe('done'))
  })

  test('filters by tag', async () => {
    const res = await request(app).get('/api/tasks?tag=devops')
    expect(res.status).toBe(200)
    res.body.tasks.forEach(t => expect(t.tag).toBe('devops'))
  })
})

describe('GET /api/tasks/stats', () => {
  test('returns stat counts', async () => {
    const res = await request(app).get('/api/tasks/stats')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('done')
    expect(res.body).toHaveProperty('inProgress')
    expect(res.body).toHaveProperty('todo')
  })
})

describe('POST /api/tasks', () => {
  test('creates a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test task', tag: 'dev', priority: 'high' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Test task')
    expect(res.body.tag).toBe('dev')
    expect(res.body.status).toBe('todo')  // default
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
  })

  test('rejects missing title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ tag: 'dev' })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('rejects invalid status', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Bad task', status: 'invalid-status' })
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/tasks/:id', () => {
  let taskId

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task to update', tag: 'dev', priority: 'low' })
    taskId = res.body.id
  })

  test('updates task status', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'in-progress' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('in-progress')
  })

  test('updates task title', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Updated title' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Updated title')
  })

  test('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/tasks/non-existent-id')
      .send({ status: 'done' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/tasks/:id', () => {
  test('deletes a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task to delete', tag: 'other' })
    const id = created.body.id

    const del = await request(app).delete(`/api/tasks/${id}`)
    expect(del.status).toBe(200)

    const get = await request(app).get(`/api/tasks/${id}`)
    expect(get.status).toBe(404)
  })

  test('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/tasks/fake-id')
    expect(res.status).toBe(404)
  })
})

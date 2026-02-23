const app  = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║        FlowBoard API — Running       ║
  ╠══════════════════════════════════════╣
  ║  Port    : ${PORT}                      ║
  ║  Version : ${process.env.APP_VERSION || 'v1  '}                    ║
  ║  Env     : ${(process.env.NODE_ENV || 'development').padEnd(25)}║
  ╚══════════════════════════════════════╝
  `)
})

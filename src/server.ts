// src/server.ts
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import healthRoutes from './routes/healthRoutes' // 1. Importe a nova rota

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())

app.use(express.json())

app.use('/health', healthRoutes)
// Rotas aplicação
app.use('/api/users', userRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})

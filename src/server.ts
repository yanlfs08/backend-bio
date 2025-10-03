// src/server.ts
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import healthRoutes from './routes/healthRoutes'
import reagentRoutes from './routes/reagentRoutes'
import purchaseOrderRoutes from './routes/purchaseOrderRoutes' // 1. Importe

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())

app.use(express.json())

app.use('/health', healthRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reagents', reagentRoutes)
app.use('/api/orders', purchaseOrderRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})

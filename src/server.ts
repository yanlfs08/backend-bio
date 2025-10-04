// src/server.ts
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import healthRoutes from './routes/healthRoutes'
import reagentRoutes from './routes/reagentRoutes'
import purchaseOrderRoutes from './routes/purchaseOrderRoutes'
import lookupRoutes from './routes/lookupRoutes'
import manufacturerRoutes from './routes/manufacturerRoutes'
import reagentTypeRoutes from './routes/reagentTypeRoutes'
import inventoryRoutes from './routes/inventoryRoutes'
import { CronService } from './services/cronService'
import cronRoutes from './routes/cronRoutes'

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())

app.use(express.json())

app.use('/health', healthRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reagents', reagentRoutes)
app.use('/api/orders', purchaseOrderRoutes)
app.use('/api/lookups', lookupRoutes)
app.use('/api/manufacturers', manufacturerRoutes)
app.use('/api/types', reagentTypeRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/cron', cronRoutes)

const cronService = new CronService()
cronService.scheduleDailyExchangeRateFetch()

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})

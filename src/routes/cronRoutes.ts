// src/routes/cronRoutes.ts
import { Router } from 'express'
import { triggerExchangeRateFetch } from '../controllers/cronController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { checkRole } from '../middlewares/roleMiddleware'

const router = Router()

// Rota protegida para Admins forçarem a atualização
router.get('/trigger-exchange-rate', authMiddleware, checkRole(['admin']), triggerExchangeRateFetch)

export default router

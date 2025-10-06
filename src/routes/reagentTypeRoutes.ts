// src/routes/reagentTypeRoutes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { checkRole } from '../middlewares/roleMiddleware'
import {
  createReagentType,
  getAllReagentTypes,
  updateReagentType,
  deleteReagentType,
} from '../controllers/reagentTypeController'
import reagentSubtypeRoutes from './reagentSubtypeRoutes'

const router = Router()

// Rotas Públicas
router.post('/', createReagentType)
router.get('/', getAllReagentTypes)

// Rotas Protegidas
router.patch('/:id', authMiddleware, checkRole(['admin', 'manager']), updateReagentType)
router.delete('/:id', authMiddleware, checkRole(['admin', 'manager']), deleteReagentType)
router.use('/:typeId/subtypes', reagentSubtypeRoutes)

export default router

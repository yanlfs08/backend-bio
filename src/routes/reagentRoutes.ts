// src/routes/reagentRoutes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { checkRole } from '../middlewares/roleMiddleware'
import {
  createReagent,
  getAllReagents,
  getReagentById,
  updateReagent,
  deleteReagent,
} from '../controllers/reagentController'

const reagentRoutes = Router()

reagentRoutes.get('/', getAllReagents)
reagentRoutes.get('/:id', getReagentById)

// Criar, atualizar e deletar: apenas manager ou admin
reagentRoutes.post('/', authMiddleware, checkRole(['manager', 'admin']), createReagent)

reagentRoutes.patch('/:id', authMiddleware, checkRole(['manager', 'admin']), updateReagent)

reagentRoutes.delete('/:id', authMiddleware, checkRole(['manager', 'admin']), deleteReagent)

export default reagentRoutes

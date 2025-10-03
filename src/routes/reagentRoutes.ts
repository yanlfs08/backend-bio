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

// --- Rotas Protegidas ---

// Listar todos e buscar por ID: qualquer usuário logado pode fazer
reagentRoutes.get('/', authMiddleware, getAllReagents)
reagentRoutes.get('/:id', authMiddleware, getReagentById)

// Criar, atualizar e deletar: apenas manager ou admin
reagentRoutes.post('/', authMiddleware, checkRole(['manager', 'admin']), createReagent)

reagentRoutes.patch('/:id', authMiddleware, checkRole(['manager', 'admin']), updateReagent)

reagentRoutes.delete('/:id', authMiddleware, checkRole(['manager', 'admin']), deleteReagent)

export default reagentRoutes

// src/routes/reagentSubtypeRoutes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { checkRole } from '../middlewares/roleMiddleware'
import {
  createReagentSubtype,
  updateReagentSubtype,
  deleteReagentSubtype,
} from '../controllers/reagentSubtypeController'

// Usamos mergeParams: true para que esta rota possa acessar os parâmetros da rota pai (ex: :typeId)
const router = Router({ mergeParams: true })

// Rota pública para criar, como solicitado anteriormente
router.post('/', createReagentSubtype)

// Rotas protegidas para Admin/Manager
router.patch('/:subtypeId', authMiddleware, checkRole(['admin', 'manager']), updateReagentSubtype)
router.delete('/:subtypeId', authMiddleware, checkRole(['admin', 'manager']), deleteReagentSubtype)

export default router

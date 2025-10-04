// src/routes/manufacturerRoutes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { checkRole } from '../middlewares/roleMiddleware'
import {
  createManufacturer,
  getAllManufacturers,
  updateManufacturer,
  deleteManufacturer,
} from '../controllers/manufacturerController'

const router = Router()

// Rotas Públicas
router.post('/', createManufacturer)
router.get('/', getAllManufacturers)

// Rotas Protegidas para Admin/Manager
router.patch('/:id', authMiddleware, checkRole(['admin', 'manager']), updateManufacturer)
router.delete('/:id', authMiddleware, checkRole(['admin', 'manager']), deleteManufacturer)

export default router

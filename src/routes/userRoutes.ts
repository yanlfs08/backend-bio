// src/routes/userRoutes.ts
import { Router } from 'express'
import {
  loginController,
  createUserController,
  changePasswordController,
  forgotPasswordController,
  getAllUsersController,
  updateUserController,
} from '../controllers/userControllers'

import { authMiddleware } from '../middlewares/authMiddleware' // 1. Importar o middleware
import { checkRole } from '../middlewares/roleMiddleware'

const userRoutes = Router()

// --- Rotas Públicas ---
userRoutes.post('/login', loginController)
userRoutes.post('/', createUserController)
userRoutes.post('/forgot-password', forgotPasswordController)

// --- Rotas Protegidas ---
userRoutes.patch('/password', authMiddleware, changePasswordController)
userRoutes.get('/', authMiddleware, checkRole(['admin']), getAllUsersController)
userRoutes.patch('/:id', authMiddleware, checkRole(['admin']), updateUserController)

export default userRoutes

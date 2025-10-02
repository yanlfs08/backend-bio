// src/routes/userRoutes.ts
import { Router } from 'express'
import {
  loginController,
  createUserController,
  changePasswordController,
  forgotPasswordController,
} from '../controllers/userControllers'

import { authMiddleware } from '../middlewares/authMiddleware' // 1. Importar o middleware

const userRoutes = Router()

// --- Rotas Públicas ---
userRoutes.post('/login', loginController)
userRoutes.post('/', createUserController)
userRoutes.post('/forgot-password', forgotPasswordController)

// --- Rotas Protegidas ---
userRoutes.patch('/password', authMiddleware, changePasswordController)

export default userRoutes

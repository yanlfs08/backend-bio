// src/routes/healthRoutes.ts
import { Router } from 'express'
import { checkHealth } from '../controllers/healthController'

const healthRoutes = Router()

// Define o endpoint GET que aponta para o nosso controlador
healthRoutes.get('/', checkHealth)

export default healthRoutes

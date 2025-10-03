// src/routes/purchaseOrderRoutes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { softAuthMiddleware } from '../middlewares/softAuthMiddleware'
import { checkRole } from '../middlewares/roleMiddleware'
import { createOrder, getAllOrders, updateOrderItemStatus } from '../controllers/purchaseOrderController'

const purchaseOrderRoutes = Router()

// Rota pública (ou semi-pública) para criar um pedido
purchaseOrderRoutes.post('/', softAuthMiddleware, createOrder)

// Rota para listar todos os pedidos (requer login)
purchaseOrderRoutes.get('/', authMiddleware, getAllOrders)

// Rota para aprovar/rejeitar um item específico de um pedido (requer role de manager/admin)
purchaseOrderRoutes.patch('/items/:itemId', authMiddleware, checkRole(['manager', 'admin']), updateOrderItemStatus)

export default purchaseOrderRoutes

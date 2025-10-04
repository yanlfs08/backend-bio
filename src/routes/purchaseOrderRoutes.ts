// src/routes/purchaseOrderRoutes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { softAuthMiddleware } from '../middlewares/softAuthMiddleware'
import { checkRole } from '../middlewares/roleMiddleware'
import {
  createOrder,
  getAllOrders,
  updateOrderItemStatus,
  getItemsByStatus,
} from '../controllers/purchaseOrderController'

const purchaseOrderRoutes = Router()

purchaseOrderRoutes.post('/', softAuthMiddleware, createOrder)
purchaseOrderRoutes.get('/', authMiddleware, getAllOrders)
purchaseOrderRoutes.patch('/items/:itemId', authMiddleware, checkRole(['manager', 'admin']), updateOrderItemStatus)
purchaseOrderRoutes.get('/items', authMiddleware, getItemsByStatus)

export default purchaseOrderRoutes

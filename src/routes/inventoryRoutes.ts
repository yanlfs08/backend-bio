// src/routes/inventoryRoutes.ts
import { Router } from 'express'
import { receiveOrderItemController, withdrawStockController } from '../controllers/inventoryController'

const router = Router()

// Endpoint público para registrar o recebimento de um item
router.post('/receive/order-item/:itemId', receiveOrderItemController)
router.post('/withdraw', withdrawStockController)

export default router

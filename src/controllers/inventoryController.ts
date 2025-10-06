// src/controllers/inventoryController.ts
import { Request, Response } from 'express'
import { InventoryService } from '../services/inventoryService'
import { PurchaseOrderService } from '../services/purchaseOrderService'

const purchaseOrderService = new PurchaseOrderService()
const inventoryService = new InventoryService(purchaseOrderService)

export const receiveOrderItemController = async (req: Request, res: Response) => {
  const { itemId } = req.params
  const { quantity_received, expiration_date, storage_location_id } = req.body

  // Validação básica
  if (!quantity_received || !storage_location_id) {
    return res.status(400).json({ message: 'Quantidade recebida e local de armazenamento são obrigatórios.' })
  }

  try {
    const result = await inventoryService.receiveOrderItem(itemId, {
      quantity_received: Number(quantity_received),
      expiration_date,
      storage_location_id,
    })
    res.status(201).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const withdrawStockController = async (req: Request, res: Response) => {
  const { items, withdrawn_by_name, withdrawn_by_email } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'A retirada deve conter pelo menos um item.' })
  }
  if (!withdrawn_by_name || !withdrawn_by_email) {
    return res.status(400).json({ message: 'Nome e e-mail do solicitante são obrigatórios.' })
  }

  try {
    const result = await inventoryService.withdrawStock(req.body)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

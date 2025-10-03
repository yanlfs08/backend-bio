// src/controllers/purchaseOrderController.ts
import { Request, Response } from 'express'
import { PurchaseOrderService } from '../services/purchaseOrderService'

const purchaseOrderService = new PurchaseOrderService()

export const createOrder = async (req: Request, res: Response) => {
  const { items, requester_name, requester_email } = req.body
  const user = req.user // Vem do softAuthMiddleware (pode ser undefined)

  // Validação
  if (!user && (!requester_name || !requester_email)) {
    return res.status(400).json({ message: 'Nome e e-mail são obrigatórios para usuários não logados.' })
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'O pedido deve conter pelo menos um item.' })
  }

  try {
    const requester = user
      ? { userId: user.sub, name: user.name, email: user.email }
      : { name: requester_name, email: requester_email }

    const newOrder = await purchaseOrderService.create(items, requester)
    return res.status(201).json(newOrder)
  } catch (error) {
    console.error('Erro detalhado ao criar pedido:', error)
    return res.status(500).json({ message: 'Erro ao criar pedido.' })
  }
}

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await purchaseOrderService.findAll(req.user!)
    return res.status(200).json(orders)
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar pedidos.' })
  }
}

export const updateOrderItemStatus = async (req: Request, res: Response) => {
  const { itemId } = req.params
  const { status, notes } = req.body
  const approverId = req.user!.sub

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ message: "Status deve ser 'approved' ou 'rejected'." })
  }

  try {
    const updatedItem = await purchaseOrderService.updateItemStatus(itemId, approverId, status, notes)
    return res.status(200).json(updatedItem)
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar item do pedido.' })
  }
}

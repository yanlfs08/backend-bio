// src/services/purchaseOrderService.ts
import { prisma } from '../lib/prisma'
import { Prisma, PurchaseOrderStatus } from '@prisma/client'

// Tipos de dados
type AuthUser = { sub: string; roles: string[]; name: string; email: string }
type OrderItemCreateInput = Prisma.OrderItemUncheckedCreateInput
type PrismaTransactionClient = Omit<
  Prisma.PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export class PurchaseOrderService {
  /**
   * Cria um pedido e seus itens em uma única transação.
   */
  async create(items: any[], requester: { name?: string; email?: string; userId?: string }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          user_id: requester.userId,
          requester_name: requester.name,
          requester_email: requester.email,
          status: 'pending_approval',
        },
      })

      // Mapeia os dados do frontend para o formato esperado pelo Prisma
      const itemsToCreate = items.map((item) => ({
        reagent_id: item.reagent_id,
        quantity_requested: item.quantity_requested,
        price: item.price,
        currency: item.currency,
        justification: item.justification,
        purchase_order_id: order.id,
      }))

      await tx.orderItem.createMany({
        data: itemsToCreate,
      })

      return order
    })
  }

  /**
   * Lista os pedidos com base na role do usuário e em um filtro de status opcional.
   */
  async findAll(user: AuthUser, status?: PurchaseOrderStatus) {
    const isAdminOrManager = user.roles.includes('admin') || user.roles.includes('manager')

    const whereClause: Prisma.PurchaseOrderWhereInput = {}

    if (!isAdminOrManager) {
      whereClause.user_id = user.sub
    }
    if (status) {
      if (Array.isArray(status)) {
        whereClause.status = { in: status }
      } else {
        whereClause.status = status
      }
    }

    return prisma.purchaseOrder.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { name: true } },
        items: {
          include: {
            reagent: {
              select: { name: true, manufacturer: true },
            },
          },
        },
      },
    })
  }

  /**
   * Atualiza o status de um item (aprovação/rejeição) e recalcula o status do pedido pai.
   */
  async updateItemStatus(itemId: string, approverId: string, status: 'approved' | 'rejected', notes?: string) {
    return prisma.$transaction(async (tx) => {
      const updatedItem = await tx.orderItem.update({
        where: { id: itemId },
        data: {
          status: status === 'approved' ? 'pending_receipt' : 'rejected',
          approved_by_user_id: approverId,
          approved_at: new Date(),
          approver_notes: notes,
        },
      })

      await this._updateParentOrderStatus(updatedItem.purchase_order_id, tx)

      return updatedItem
    })
  }

  /**
   * Função auxiliar para recalcular e atualizar o status de um PurchaseOrder.
   * @param purchaseOrderId O ID do pedido pai a ser verificado.
   * @param tx O cliente de transação do Prisma.
   */
  async _updateParentOrderStatus(purchaseOrderId: string, tx: PrismaTransactionClient) {
    const allItemsInOrder = await tx.orderItem.findMany({
      where: { purchase_order_id: purchaseOrderId },
    })

    const totalItems = allItemsInOrder.length

    const receivedCount = allItemsInOrder.filter((i) => i.status === 'received').length
    const pendingReceiptCount = allItemsInOrder.filter((i) => i.status === 'pending_receipt').length
    const rejectedCount = allItemsInOrder.filter((i) => i.status === 'rejected').length

    let newOrderStatus: PurchaseOrderStatus

    if (receivedCount === totalItems) {
      newOrderStatus = 'completed'
    } else if (receivedCount > 0) {
      newOrderStatus = 'partially_received'
    } else if (pendingReceiptCount + rejectedCount === totalItems) {
      if (pendingReceiptCount === 0) {
        newOrderStatus = 'rejected'
      } else {
        newOrderStatus = 'fully_approved'
      }
    } else if (pendingReceiptCount + rejectedCount > 0) {
      newOrderStatus = 'partially_approved'
    } else {
      newOrderStatus = 'pending_approval'
    }

    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: newOrderStatus },
    })
  }
}

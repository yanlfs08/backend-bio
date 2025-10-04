// src/services/purchaseOrderService.ts
import { prisma } from '../lib/prisma'
import { Prisma, PurchaseOrderStatus, OrderItemStatus } from '@prisma/client'

// Definimos um tipo para o usuário que vem do token
type AuthUser = { sub: string; roles: string[]; name: string; email: string }
type OrderItemCreateInput = Prisma.OrderItemUncheckedCreateInput

export class PurchaseOrderService {
  // Cria um pedido e seus itens em uma única transação
  async create(items: any[], requester: { name?: string; email?: string; userId?: string }) {
    return prisma.$transaction(async (tx) => {
      // 1. Cria o cabeçalho do pedido
      const order = await tx.purchaseOrder.create({
        data: {
          user_id: requester.userId,
          requester_name: requester.name,
          requester_email: requester.email,
          status: 'pending_approval',
        },
      })

      // 2. Associa os itens ao pedido recém-criado
      const itemsToCreate = items.map((item) => ({
        reagent_id: item.reagent_id,
        quantity_requested: item.quantity_requested,
        price: item.price,
        currency: item.currency,
        justification: item.justification,
        purchase_order_id: order.id,
      }))

      // 3. Cria todos os itens
      await tx.orderItem.createMany({
        data: itemsToCreate,
      })

      return order
    })
  }

  // Lista os pedidos com base na role do usuário
  async findAll(user: AuthUser, status?: PurchaseOrderStatus) {
    // Adicione o parâmetro 'status'
    const isAdminOrManager = user.roles.includes('admin') || user.roles.includes('manager')

    // Constrói a cláusula 'where' dinamicamente
    const whereClause: Prisma.PurchaseOrderWhereInput = {}

    if (!isAdminOrManager) {
      whereClause.user_id = user.sub // Usuário normal só pode ver seus próprios pedidos
    }

    if (status) {
      whereClause.status = status // Adiciona o filtro de status se ele for fornecido
    }

    return prisma.purchaseOrder.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { name: true } },
        items: {
          // Inclui os itens e os detalhes do reagente de cada item
          include: {
            reagent: {
              select: { name: true, manufacturer: true },
            },
          },
        },
      },
    })
  }

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
      const purchaseOrderId = updatedItem.purchase_order_id
      const allItemsInOrder = await tx.orderItem.findMany({
        where: { purchase_order_id: purchaseOrderId },
      })

      let newOrderStatus: PurchaseOrderStatus
      const totalItems = allItemsInOrder.length
      const approvedCount = allItemsInOrder.filter((item) => item.status === 'pending_receipt').length
      const rejectedCount = allItemsInOrder.filter((item) => item.status === 'rejected').length
      const processedCount = approvedCount + rejectedCount
      if (processedCount === totalItems) {
        if (approvedCount === 0) {
          newOrderStatus = 'rejected'
        } else {
          newOrderStatus = 'fully_approved'
        }
      } else {
        newOrderStatus = 'partially_approved'
      }

      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: newOrderStatus },
      })

      return updatedItem
    })
  }
  async findItemsByStatus(user: AuthUser, status: OrderItemStatus) {
    const isAdminOrManager = user.roles.includes('admin') || user.roles.includes('manager')

    const whereClause: Prisma.OrderItemWhereInput = {
      status: status,
    }

    if (!isAdminOrManager) {
      // Usuário normal só pode ver itens de seus próprios pedidos
      whereClause.purchase_order = {
        user_id: user.sub,
      }
    }

    return prisma.orderItem.findMany({
      where: whereClause,
      include: {
        reagent: true, // Inclui detalhes completos do reagente
        purchase_order: {
          // Inclui detalhes de quem solicitou
          select: { requester_name: true, requester_email: true, user: { select: { name: true } } },
        },
      },
    })
  }
}

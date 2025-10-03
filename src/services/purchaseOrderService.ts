// src/services/purchaseOrderService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

// Definimos um tipo para o usuário que vem do token
type AuthUser = { sub: string; roles: string[]; name: string; email: string }
type OrderItemCreateInput = Prisma.OrderItemUncheckedCreateInput

export class PurchaseOrderService {
  // Cria um pedido e seus itens em uma única transação
  async create(
    items: Omit<OrderItemCreateInput, 'purchase_order_id'>[],
    requester: { name?: string; email?: string; userId?: string },
  ) {
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
        ...item,
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
  async findAll(user: AuthUser) {
    const isAdminOrManager = user.roles.includes('admin') || user.roles.includes('manager')

    if (isAdminOrManager) {
      // Admin/Manager veem todos os pedidos
      return prisma.purchaseOrder.findMany({
        orderBy: { created_at: 'desc' },
        include: { user: { select: { name: true } }, items: true }, // Inclui itens e nome do usuário
      })
    } else {
      // Usuário normal vê apenas seus próprios pedidos
      return prisma.purchaseOrder.findMany({
        where: { user_id: user.sub },
        orderBy: { created_at: 'desc' },
        include: { items: true },
      })
    }
  }

  // Atualiza o status de um item (aprovar/rejeitar)
  async updateItemStatus(itemId: string, approverId: string, status: 'approved' | 'rejected', notes?: string) {
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status: status === 'approved' ? 'pending_receipt' : 'rejected',
        approved_by_user_id: approverId,
        approved_at: new Date(),
        approver_notes: notes,
      },
    })

    // TODO: Adicionar lógica para atualizar o status do PurchaseOrder principal
    // (ex: para 'partially_approved' ou 'fully_approved')

    return updatedItem
  }
}

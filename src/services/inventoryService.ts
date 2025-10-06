// src/services/inventoryService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { PurchaseOrderService } from './purchaseOrderService'

// Tipos de dados
type ReceiveItemPayload = {
  quantity_received: number
  expiration_date?: string
  storage_location_id: string
}

export class InventoryService {
  private purchaseOrderService: PurchaseOrderService

  constructor(purchaseOrderService: PurchaseOrderService) {
    this.purchaseOrderService = purchaseOrderService
  }

  /**
   * Processa o recebimento de um item, criando um lote no inventário.
   */
  async receiveOrderItem(itemId: string, payload: ReceiveItemPayload) {
    const { quantity_received, expiration_date, storage_location_id } = payload

    return prisma.$transaction(async (tx) => {
      const originalItem = await tx.orderItem.findUnique({ where: { id: itemId } })

      if (!originalItem) throw new Error('Item do pedido não encontrado.')
      if (originalItem.status !== 'pending_receipt') throw new Error('Este item não está aguardando recebimento.')
      if (quantity_received > Number(originalItem.quantity_requested))
        throw new Error('A quantidade recebida não pode ser maior que a solicitada.')

      const isPartialReceipt = quantity_received < Number(originalItem.quantity_requested)
      let itemToReceive = originalItem

      if (isPartialReceipt) {
        const remainingQuantity = Number(originalItem.quantity_requested) - quantity_received
        await tx.orderItem.create({
          data: {
            ...originalItem,
            id: undefined,
            quantity_requested: remainingQuantity,
            status: 'pending_receipt',
          },
        })
        itemToReceive = await tx.orderItem.update({
          where: { id: itemId },
          data: { quantity_requested: quantity_received },
        })
      }

      const receivedItem = await tx.orderItem.update({
        where: { id: itemToReceive.id },
        data: {
          status: 'received',
          quantity_received: quantity_received,
          received_at: new Date(),
          received_storage_location_id: storage_location_id,
        },
      })

      const newLot = await tx.inventoryLot.create({
        data: {
          reagent_id: receivedItem.reagent_id,
          order_item_id: receivedItem.id,
          quantity: quantity_received,
          expiration_date: expiration_date ? new Date(expiration_date) : null,
          storage_location_id: storage_location_id,
        },
      })

      await this.purchaseOrderService._updateParentOrderStatus(receivedItem.purchase_order_id, tx as any)

      return { receivedItem, newLot }
    })
  }

  /**
   * Processa a retirada de múltiplos itens do estoque, usando a lógica FEFO.
   */
  async withdrawStock(payload: {
    withdrawn_by_name?: string
    withdrawn_by_email?: string
    items: { reagent_id: string; quantity: number }[]
  }) {
    const { withdrawn_by_name, withdrawn_by_email, items } = payload

    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        let quantityToWithdraw = new Prisma.Decimal(item.quantity)

        const availableLots = await tx.inventoryLot.findMany({
          where: {
            reagent_id: item.reagent_id,
            quantity: { gt: 0 },
          },
          orderBy: [{ expiration_date: { sort: 'asc', nulls: 'last' } }],
        })

        const totalStock = availableLots.reduce((sum, lot) => sum.add(lot.quantity), new Prisma.Decimal(0))
        if (totalStock.lessThan(quantityToWithdraw)) {
          throw new Error(
            `Estoque insuficiente para o reagente ID ${item.reagent_id}. Solicitado: ${quantityToWithdraw}, Disponível: ${totalStock}`,
          )
        }

        for (const lot of availableLots) {
          if (quantityToWithdraw.isZero()) break

          const quantityFromThisLot = Prisma.Decimal.min(quantityToWithdraw, lot.quantity)

          await tx.inventoryLot.update({
            where: { id: lot.id },
            data: {
              quantity: {
                decrement: quantityFromThisLot,
              },
            },
          })

          await tx.stockWithdrawal.create({
            data: {
              reagent_id: item.reagent_id,
              inventory_lot_id: lot.id,
              quantity: quantityFromThisLot,
              withdrawn_by_name,
              withdrawn_by_email,
            },
          })

          quantityToWithdraw = quantityToWithdraw.sub(quantityFromThisLot)
        }
      }
      return { message: 'Retirada de estoque processada com sucesso.' }
    })
  }
}

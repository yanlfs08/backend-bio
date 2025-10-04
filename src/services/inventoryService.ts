// src/services/inventoryService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

type ReceiveItemPayload = {
  quantity_received: number
  expiration_date?: string
  storage_location_id: string
}

export class InventoryService {
  /**
   * Processa o recebimento de um item de um pedido de compra, criando um lote no inventário.
   * Lida com recebimentos totais e parciais.
   */
  async receiveOrderItem(itemId: string, payload: ReceiveItemPayload) {
    const { quantity_received, expiration_date, storage_location_id } = payload

    return prisma.$transaction(async (tx) => {
      // 1. Encontra o item do pedido original e valida.
      const originalItem = await tx.orderItem.findUnique({
        where: { id: itemId },
      })

      if (!originalItem) {
        throw new Error('Item do pedido não encontrado.')
      }
      if (originalItem.status !== 'pending_receipt') {
        throw new Error('Este item não está aguardando recebimento.')
      }
      if (quantity_received > Number(originalItem.quantity_requested)) {
        throw new Error('A quantidade recebida não pode ser maior que a solicitada.')
      }

      const isPartialReceipt = quantity_received < Number(originalItem.quantity_requested)
      let itemToReceive = originalItem

      // 2. Lógica para recebimento parcial: cria um novo item para a quantidade pendente.
      if (isPartialReceipt) {
        const remainingQuantity = Number(originalItem.quantity_requested) - quantity_received

        // Cria um novo item "back-order" com a quantidade restante.
        await tx.orderItem.create({
          data: {
            ...originalItem,
            id: undefined, // Deixa o DB gerar um novo ID
            quantity_requested: remainingQuantity,
            status: 'pending_receipt',
          },
        })

        // Atualiza o item original para refletir a quantidade que está sendo recebida agora.
        itemToReceive = await tx.orderItem.update({
          where: { id: itemId },
          data: { quantity_requested: quantity_received },
        })
      }

      // 3. Atualiza o status do item que está sendo recebido para 'received'.
      const receivedItem = await tx.orderItem.update({
        where: { id: itemToReceive.id },
        data: {
          status: 'received',
          quantity_received: quantity_received,
          received_at: new Date(),
          received_storage_location_id: storage_location_id,
        },
      })

      // 4. Cria o lote no inventário físico.
      const newLot = await tx.inventoryLot.create({
        data: {
          reagent_id: receivedItem.reagent_id,
          order_item_id: receivedItem.id,
          quantity: quantity_received,
          expiration_date: expiration_date ? new Date(expiration_date) : null,
          storage_location_id: storage_location_id,
        },
      })

      // TODO: Atualizar o status do PurchaseOrder principal (ex: para 'partially_received' ou 'completed')

      return { receivedItem, newLot }
    })
  }

  async withdrawStock(payload: {
    withdrawn_by_name?: string
    withdrawn_by_email?: string
    items: { reagent_id: string; quantity: number }[]
  }) {
    const { withdrawn_by_name, withdrawn_by_email, items } = payload

    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        let quantityToWithdraw = new Prisma.Decimal(item.quantity)

        // 1. Busca todos os lotes disponíveis para o reagente, ordenados pela data de validade mais antiga (FEFO).
        // Lotes sem data de validade são usados por último.
        const availableLots = await tx.inventoryLot.findMany({
          where: {
            reagent_id: item.reagent_id,
            quantity: { gt: 0 }, // Apenas lotes com quantidade positiva
          },
          orderBy: [{ expiration_date: { sort: 'asc', nulls: 'last' } }],
        })

        // 2. Verifica se há estoque total suficiente.
        const totalStock = availableLots.reduce((sum, lot) => sum.add(lot.quantity), new Prisma.Decimal(0))
        if (totalStock.lessThan(quantityToWithdraw)) {
          throw new Error(
            `Estoque insuficiente para o reagente ID ${item.reagent_id}. Solicitado: ${quantityToWithdraw}, Disponível: ${totalStock}`,
          )
        }

        // 3. Itera sobre os lotes para dar baixa na quantidade.
        for (const lot of availableLots) {
          if (quantityToWithdraw.isZero()) break // Se já retiramos tudo, para o loop.

          const quantityFromThisLot = Prisma.Decimal.min(quantityToWithdraw, lot.quantity)

          // 4. Atualiza a quantidade do lote no inventário.
          await tx.inventoryLot.update({
            where: { id: lot.id },
            data: {
              quantity: {
                decrement: quantityFromThisLot,
              },
            },
          })

          // 5. Cria um registro de log da retirada, ligando ao lote específico.
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

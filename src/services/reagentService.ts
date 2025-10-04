// src/services/reagentService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class ReagentService {
  async create(data: Omit<Prisma.ReagentCreateInput, 'inventory_lots' | 'order_items' | 'stock_withdrawals'>) {
    const reagent = await prisma.reagent.create({ data })
    return reagent
  }

  async findAll() {
    const reagents = await prisma.reagent.findMany({
      include: {
        manufacturer: true,
        type: true,
        subtype: true,
        inventory_lots: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return reagents.map((reagent) => {
      const total_quantity = reagent.inventory_lots.reduce((sum, lot) => sum + Number(lot.quantity), 0)
      const { inventory_lots, ...reagentData } = reagent
      return { ...reagentData, total_quantity }
    })
  }

  async findOne(id: string) {
    const reagent = await prisma.reagent.findUnique({
      where: { id },
      include: {
        manufacturer: true,
        type: true,
        subtype: true,
        inventory_lots: true,
      },
    })
    if (!reagent) {
      throw new Error('Reagente não encontrado.')
    }

    const total_quantity = reagent.inventory_lots.reduce((sum, lot) => sum + Number(lot.quantity), 0)
    const { inventory_lots, ...reagentData } = reagent
    return { ...reagentData, inventory_lots, total_quantity }
  }

  async update(id: string, data: Prisma.ReagentUpdateInput) {
    const reagent = await prisma.reagent.update({ where: { id }, data })
    return reagent
  }

  async remove(id: string) {
    const reagent = await this.findOne(id)
    if (reagent && reagent.total_quantity > 0) {
      throw new Error('Não é possível deletar um reagente que possui lotes em estoque.')
    }
    await prisma.reagent.delete({ where: { id } })
  }
}

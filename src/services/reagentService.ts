// src/services/reagentService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class ReagentService {
  async create(data: Prisma.ReagentCreateInput) {
    const reagent = await prisma.reagent.create({ data })
    return reagent
  }

  async findAll() {
    return prisma.reagent.findMany()
  }

  async findOne(id: string) {
    const reagent = await prisma.reagent.findUnique({ where: { id } })
    if (!reagent) {
      throw new Error('Reagente não encontrado.')
    }
    return reagent
  }

  async update(id: string, data: Prisma.ReagentUpdateInput) {
    const reagent = await prisma.reagent.update({ where: { id }, data })
    return reagent
  }

  async remove(id: string) {
    await this.findOne(id) // Garante que o reagente existe antes de deletar
    await prisma.reagent.delete({ where: { id } })
  }
}

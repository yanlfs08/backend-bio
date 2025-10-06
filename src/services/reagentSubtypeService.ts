// src/services/reagentSubtypeService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class ReagentSubtypeService {
  async create(data: Prisma.ReagentSubtypeUncheckedCreateInput) {
    // Verifica se o tipo pai existe
    const parentType = await prisma.reagentType.findUnique({ where: { id: data.type_id } })
    if (!parentType) {
      throw new Error('O tipo pai especificado não existe.')
    }
    return prisma.reagentSubtype.create({ data })
  }

  async update(id: string, data: Prisma.ReagentSubtypeUpdateInput) {
    return prisma.reagentSubtype.update({ where: { id }, data })
  }

  async remove(id: string) {
    // Verifica se o subtipo está sendo usado por algum reagente
    const inUse = await prisma.reagent.count({ where: { subtype_id: id } })
    if (inUse > 0) {
      throw new Error('Não é possível deletar um subtipo que está em uso por reagentes.')
    }
    return prisma.reagentSubtype.delete({ where: { id } })
  }
}

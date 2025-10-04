// src/services/reagentTypeService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class ReagentTypeService {
  async create(data: Prisma.ReagentTypeCreateInput) {
    return prisma.reagentType.create({ data })
  }

  async findAll() {
    return prisma.reagentType.findMany({
      include: { subtypes: true }, // Inclui os subtipos aninhados
      orderBy: { name: 'asc' },
    })
  }

  async update(id: string, data: Prisma.ReagentTypeUpdateInput) {
    return prisma.reagentType.update({ where: { id }, data })
  }

  async remove(id: string) {
    // A deleção vai apagar em cascata os subtipos (definido no schema)
    return prisma.reagentType.delete({ where: { id } })
  }
}

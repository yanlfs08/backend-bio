// src/services/manufacturerService.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export class ManufacturerService {
  async create(data: Prisma.ManufacturerCreateInput) {
    return prisma.manufacturer.create({ data })
  }

  async findAll() {
    return prisma.manufacturer.findMany({ orderBy: { name: 'asc' } })
  }

  async findOne(id: string) {
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id } })
    if (!manufacturer) throw new Error('Fabricante não encontrado.')
    return manufacturer
  }

  async update(id: string, data: Prisma.ManufacturerUpdateInput) {
    await this.findOne(id)
    return prisma.manufacturer.update({ where: { id }, data })
  }

  async remove(id: string) {
    await this.findOne(id)
    // Adicionar verificação se o fabricante está em uso
    const inUse = await prisma.reagent.count({ where: { manufacturer_id: id } })
    if (inUse > 0) {
      throw new Error('Não é possível deletar um fabricante que está em uso por reagentes.')
    }
    return prisma.manufacturer.delete({ where: { id } })
  }
}

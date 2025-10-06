// src/controllers/reagentSubtypeController.ts
import { Request, Response } from 'express'
import { ReagentSubtypeService } from '../services/reagentSubtypeService'
import { Prisma } from '@prisma/client'

const service = new ReagentSubtypeService()

export const createReagentSubtype = async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params
    const { name } = req.body
    const newSubtype = await service.create({ name, type_id: typeId })
    res.status(201).json(newSubtype)
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Já existe um subtipo com este nome para este tipo.' })
    }
    res.status(400).json({ message: error.message || 'Erro ao criar subtipo.' })
  }
}

export const updateReagentSubtype = async (req: Request, res: Response) => {
  try {
    const { subtypeId } = req.params
    const updated = await service.update(subtypeId, req.body)
    res.json(updated)
  } catch (error: any) {
    res.status(404).json({ message: error.message })
  }
}

export const deleteReagentSubtype = async (req: Request, res: Response) => {
  try {
    const { subtypeId } = req.params
    await service.remove(subtypeId)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

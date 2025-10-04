// src/controllers/reagentTypeController.ts
import { Request, Response } from 'express'
import { ReagentTypeService } from '../services/reagentTypeService'
import { Prisma } from '@prisma/client'

const service = new ReagentTypeService()

export const createReagentType = async (req: Request, res: Response) => {
  try {
    const newType = await service.create(req.body)
    res.status(201).json(newType)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Já existe um tipo com este nome.' })
    }
    res.status(500).json({ message: 'Erro ao criar tipo.' })
  }
}

export const getAllReagentTypes = async (req: Request, res: Response) => {
  const types = await service.findAll()
  res.json(types)
}

export const updateReagentType = async (req: Request, res: Response) => {
  try {
    const updated = await service.update(req.params.id, req.body)
    res.json(updated)
  } catch (error: any) {
    res.status(404).json({ message: error.message })
  }
}

export const deleteReagentType = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

// src/controllers/manufacturerController.ts
import { Request, Response } from 'express'
import { ManufacturerService } from '../services/manufacturerService'
import { Prisma } from '@prisma/client'

const service = new ManufacturerService()

export const createManufacturer = async (req: Request, res: Response) => {
  try {
    const newManufacturer = await service.create(req.body)
    res.status(201).json(newManufacturer)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Já existe um fabricante com este nome.' })
    }
    res.status(500).json({ message: 'Erro ao criar fabricante.' })
  }
}

export const getAllManufacturers = async (req: Request, res: Response) => {
  const manufacturers = await service.findAll()
  res.json(manufacturers)
}

export const updateManufacturer = async (req: Request, res: Response) => {
  try {
    const updated = await service.update(req.params.id, req.body)
    res.json(updated)
  } catch (error: any) {
    res.status(404).json({ message: error.message })
  }
}

export const deleteManufacturer = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

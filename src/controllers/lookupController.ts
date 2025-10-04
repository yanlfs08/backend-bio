// src/controllers/lookupController.ts
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const getManufacturers = async (req: Request, res: Response) => {
  const manufacturers = await prisma.manufacturer.findMany({ orderBy: { name: 'asc' } })
  res.json(manufacturers)
}

export const getStorageLocations = async (req: Request, res: Response) => {
  const locations = await prisma.storageLocation.findMany({ orderBy: { name: 'asc' } })
  res.json(locations)
}

export const getReagentTypes = async (req: Request, res: Response) => {
  const types = await prisma.reagentType.findMany({
    orderBy: { name: 'asc' },
    include: {
      subtypes: {
        orderBy: { name: 'asc' },
      },
    },
  })
  res.json(types)
}

export const getLatestExchangeRate = async (req: Request, res: Response) => {
  try {
    const latestRate = await prisma.exchangeRate.findFirst({
      where: { from_currency: 'USD', to_currency: 'BRL' },
      orderBy: { rate_date: 'desc' },
    })
    if (!latestRate) {
      return res.status(404).json({ message: 'Nenhuma cotação de câmbio encontrada.' })
    }
    res.json(latestRate)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar cotação de câmbio.' })
  }
}

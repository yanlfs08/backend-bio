// src/controllers/reagentController.ts
import { Request, Response } from 'express'
import { ReagentService } from '../services/reagentService'

const reagentService = new ReagentService()

export const createReagent = async (req: Request, res: Response) => {
  try {
    const newReagent = await reagentService.create(req.body)
    return res.status(201).json(newReagent)
  } catch (error) {
    return res.status(400).json({ message: 'Erro ao criar reagente.' })
  }
}

export const getAllReagents = async (req: Request, res: Response) => {
  const reagents = await reagentService.findAll()
  return res.status(200).json(reagents)
}

export const getReagentById = async (req: Request, res: Response) => {
  try {
    const reagent = await reagentService.findOne(req.params.id)
    return res.status(200).json(reagent)
  } catch (error: any) {
    return res.status(404).json({ message: error.message })
  }
}

export const updateReagent = async (req: Request, res: Response) => {
  try {
    const updatedReagent = await reagentService.update(req.params.id, req.body)
    return res.status(200).json(updatedReagent)
  } catch (error: any) {
    return res.status(404).json({ message: error.message })
  }
}

export const deleteReagent = async (req: Request, res: Response) => {
  try {
    await reagentService.remove(req.params.id)
    return res.status(204).send()
  } catch (error: any) {
    return res.status(404).json({ message: error.message })
  }
}

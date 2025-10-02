// src/controllers/healthController.ts
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

export const checkHealth = async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`)

    const dbStatus = { status: 'ok', message: 'Database connection is healthy.' }

    const healthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details: {
        api: { status: 'ok', message: 'API is running.' },
        database: dbStatus,
      },
    }

    return res.status(200).json(healthCheckResponse)
  } catch (error: any) {
    console.error('Health check failed:', error)
    const dbStatus = { status: 'error', message: 'Database connection failed.', error: error.message }
    const healthCheckResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      details: {
        api: { status: 'ok', message: 'API is running.' },
        database: dbStatus,
      },
    }
    return res.status(503).json(healthCheckResponse)
  }
}

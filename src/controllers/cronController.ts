// src/controllers/cronController.ts
import { Request, Response } from 'express'
import { CronService } from '../services/cronService'

const cronService = new CronService()

export const triggerExchangeRateFetch = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Executando manualmente: buscando cotação do dólar...')
    const response = await fetch('https://economia.awesomeapi.com.br/USD-BRL/1')
    if (!response.ok) throw new Error(`Falha na API externa: ${response.statusText}`)

    const data = await response.json()
    const rate = parseFloat(data[0]?.bid)
    if (!rate) throw new Error('Não foi possível extrair a cotação.')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = await cronService.updateExchangeRateInDb(today, rate)

    res.status(200).json({ message: 'Cotação do dólar atualizada com sucesso!', data: result })
  } catch (error: any) {
    console.error('❌ Erro ao forçar a busca de cotação:', error.message)
    res.status(500).json({ message: 'Erro ao buscar cotação.', error: error.message })
  }
}

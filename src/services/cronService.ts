// src/services/cronService.ts
import cron from 'node-cron'
import { prisma } from '../lib/prisma'

export class CronService {
  // Função reutilizável para salvar a cotação (CORRIGIDA)
  async updateExchangeRateInDb(date: Date, rate: number) {
    return prisma.exchangeRate.upsert({
      where: {
        // --- CORREÇÃO APLICADA AQUI ---
        // Usamos o nome do campo gerado pelo Prisma para a chave única composta
        from_currency_to_currency_rate_date: {
          // -----------------------------
          from_currency: 'USD',
          to_currency: 'BRL',
          rate_date: date,
        },
      },
      update: { rate },
      create: {
        from_currency: 'USD',
        to_currency: 'BRL',
        rate_date: date,
        rate,
      },
    })
  }

  // O resto do arquivo continua o mesmo
  public scheduleDailyExchangeRateFetch() {
    cron.schedule(
      '0 2 * * *',
      async () => {
        console.log('🔄 Executando tarefa diária: buscando cotação do dólar...')
        try {
          const response = await fetch('https://economia.awesomeapi.com.br/USD-BRL/1')
          if (!response.ok) throw new Error(`Falha na API externa: ${response.statusText}`)

          const data = await response.json()
          const rate = parseFloat(data[0]?.ask)
          if (!rate) throw new Error('Não foi possível extrair a cotação.')

          const today = new Date()
          today.setHours(0, 0, 0, 0)

          await this.updateExchangeRateInDb(today, rate)

          console.log(`✅ Cotação do dólar atualizada com sucesso: ${rate}`)
        } catch (error: any) {
          console.error('❌ Erro ao executar a tarefa de cotação do dólar:', error.message)
        }
      },
      { timezone: 'America/Sao_Paulo' },
    )

    console.log('⏰ Tarefa de busca de cotação agendada para rodar diariamente às 02:00.')
  }
}

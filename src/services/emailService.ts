// src/services/emailService.ts
import nodemailer from 'nodemailer'

// Apenas exportamos a classe. A instância será criada no controlador.
export class EmailService {
  private transporter

  constructor() {
    // --- INÍCIO DO DEBUG ---
    console.log('--- Verificando Variáveis de Ambiente do E-mail ---')
    console.log('GMAIL_USER:', process.env.GMAIL_USER)
    console.log('GMAIL_APP_PASS:', process.env.GMAIL_APP_PASS)
    console.log('--------------------------------------------------')
    // --- FIM DO DEBUG ---
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    })
  }

  // O método continua igual
  async sendTemporaryPassword(to: string, tempPass: string): Promise<void> {
    const mailOptions = {
      from: `"Estoque Biocomp" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: 'Recuperação de Senha - Estoque Biocomp',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Olá,</p>
        <p>Você solicitou a recuperação da sua senha. Utilize a senha temporária abaixo para fazer login:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${tempPass}</p>
        <p><b>Importante:</b> Por segurança, recomendamos que você altere esta senha imediatamente após o login através da funcionalidade "Alterar Senha".</p>
        <p>Atenciosamente,<br>Equipe Estoque Biocomp</p>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log(`E-mail de recuperação enviado para ${to}`)
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${to}:`, error)
      throw new Error('Não foi possível enviar o e-mail de recuperação.')
    }
  }
}

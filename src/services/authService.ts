// src/services/authService.ts
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export class AuthService {
  async login(email: string, password: string): Promise<string> {
    // 1. Encontrar o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 2. Verificar se o usuário existe e se a conta está ativa
    if (!user || !user.is_active) {
      throw new Error('Credenciais inválidas ou conta inativa.')
    }

    // 3. Comparar a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas.')
    }

    // 4. Gerar o token JWT
    const token = jwt.sign(
      {
        sub: user.id, // 'subject' -> ID do usuário
        roles: user.roles,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '8h', // Token expira em 8 horas
      },
    )

    return token
  }
}

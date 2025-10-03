// src/services/authService.ts
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
export class AuthService {
  async login(email: string, password: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.is_active) {
      throw new Error('Credenciais inválidas ou conta inativa.')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas.')
    }

    const token = jwt.sign(
      {
        sub: user.id,
        roles: user.roles,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '8h', // Token expira em 8 horas
      },
    )

    return token
  }
}

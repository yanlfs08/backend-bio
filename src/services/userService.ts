// src/services/userService.ts
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { User } from '@prisma/client'
import crypto from 'crypto'
import { EmailService } from './emailService'

type UserCreateResponse = Omit<User, 'password_hash'>

export class UserService {
  private emailService: EmailService

  constructor(emailService: EmailService) {
    this.emailService = emailService
  }

  async create(
    userData: Omit<User, 'id' | 'roles' | 'is_active' | 'created_at' | 'updated_at'>,
  ): Promise<UserCreateResponse> {
    const { name, email, password_hash: password } = userData
    // 1. Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      throw new Error('E-mail já cadastrado.')
    }
    // 2. Fazer o hash da senha
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // 3. Criar o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
      },
    })
    // 4. Remover o hash da senha do objeto de retorno
    const { password_hash, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // 1. Encontrar o usuário pelo ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new Error('Usuário não encontrado.')
    }
    // 2. Verificar se a senha atual fornecida está correta
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta.')
    }
    // 3. Fazer o hash da nova senha
    const salt = await bcrypt.genSalt(10)
    const newHashedPassword = await bcrypt.hash(newPassword, salt)
    // 4. Atualizar a senha no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newHashedPassword,
      },
    })
  }
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      const tempPassword = crypto.randomBytes(6).toString('hex')
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(tempPassword, salt)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash: hashedPassword,
        },
      })

      // 4. Use a instância que foi injetada via construtor
      await this.emailService.sendTemporaryPassword(user.email, tempPassword)
    }
  }

  async getAll() {
    // Retorna todos os usuários, selecionando apenas campos seguros
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        is_active: true,
        created_at: true,
      },
    })
  }

  async updateUser(id: string, data: { roles?: string[]; is_active?: boolean }) {
    // Atualiza um usuário específico e retorna os dados atualizados
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        is_active: true,
      },
    })
  }
}

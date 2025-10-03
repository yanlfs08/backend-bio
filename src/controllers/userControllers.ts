// src/controllers/userController.ts
import { Request, Response } from 'express'
import { AuthService } from '../services/authService'
import { UserService } from '../services/userService'
import { EmailService } from '../services/emailService'

const emailService = new EmailService()
const userService = new UserService(emailService) // 3. Injete o emailService no userService
const authService = new AuthService()

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' })
  }

  try {
    const token = await authService.login(email, password)
    return res.status(200).json({ token })
  } catch (error: any) {
    // Retornamos 401 para qualquer erro de autenticação para segurança
    return res.status(401).json({ message: error.message })
  }
}

export const createUserController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' })
  }
  try {
    const newUser = await userService.create({ name, email, password_hash: password })
    return res.status(201).json(newUser)
  } catch (error: any) {
    if (error.message === 'E-mail já cadastrado.') {
      return res.status(409).json({ message: error.message })
    }
    // Para outros erros inesperados
    console.error('Erro ao criar usuário:', error)
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export const changePasswordController = async (req: Request, res: Response) => {
  // O ID do usuário vem do middleware de autenticação, não do corpo da requisição!
  const { sub: userId } = req.user
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias.' })
  }

  try {
    await userService.changePassword(userId, currentPassword, newPassword)
    return res.status(200).json({ message: 'Senha alterada com sucesso.' })
  } catch (error: any) {
    if (error.message === 'Senha atual incorreta.') {
      // 403 Forbidden é adequado aqui: o usuário está autenticado, mas não tem permissão para esta ação com os dados fornecidos.
      return res.status(403).json({ message: error.message })
    }

    console.error('Erro ao alterar senha:', error)
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'O e-mail é obrigatório.' })
  }

  try {
    await userService.forgotPassword(email)
    return res
      .status(200)
      .json({ message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' })
  } catch (error) {
    console.error('Erro no processo de esqueci minha senha:', error)
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAll()
    return res.status(200).json(users)
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export const updateUserController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { roles, is_active } = req.body

  try {
    const updatedUser = await userService.updateUser(id, { roles, is_active })
    return res.status(200).json(updatedUser)
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao atualizar usuário.' })
  }
}

// src/middlewares/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express'

export const checkRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!user || !user.roles) {
      return res.status(403).json({ message: 'Acesso negado: informações de usuário ausentes.' })
    }

    const hasRequiredRole = user.roles.some((role) => requiredRoles.includes(role))

    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Acesso negado: permissões insuficientes.' })
    }

    next()
  }
}

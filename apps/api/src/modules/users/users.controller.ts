import type { Request, Response } from 'express'
import { createUserSchema } from '@agridealer/contracts'
import { UsersService } from './users.service'
import { UserRepository } from './users.repository'
import { sendSuccess } from '../../shared/http/respond'

export const usersController = {
  async create(req: Request, res: Response) {
    const input = createUserSchema.parse(req.body)
    const service = new UsersService(new UserRepository({ tenantId: req.tenant.id }))
    const user = await service.createStaff(input)

    req.auditEntity = { type: 'User', id: user.id, after: { email: user.email, role: user.role } }

    sendSuccess(req, res, { id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 })
  },
}

import type { Request, Response } from 'express'
import { z } from 'zod'
import { createUserSchema, updateUserSchema, listUsersQuerySchema } from '@agridealer/contracts'
import { UsersService } from './users.service'
import { UserRepository } from './users.repository'
import type { IUser } from './users.model'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): UsersService {
  return new UsersService(new UserRepository({ tenantId: req.tenant.id }))
}

/** Never send passwordHash/mfaSecret over the wire — repository.list() already excludes passwordHash, this narrows every response to just what a staff list/detail needs. */
function toSafeUser(user: IUser) {
  return { id: user.id as string, name: user.name, email: user.email, role: user.role, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt }
}

export const usersController = {
  async create(req: Request, res: Response) {
    const input = createUserSchema.parse(req.body)
    const service = new UsersService(new UserRepository({ tenantId: req.tenant.id }))
    const user = await service.createStaff(input)

    req.auditEntity = { type: 'User', id: user.id, after: { email: user.email, role: user.role } }

    sendSuccess(req, res, toSafeUser(user), { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listUsersQuerySchema.parse(req.query)
    const users = await serviceFor(req).list(query)

    sendSuccess(req, res, users.map(toSafeUser))
  },

  async update(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const input = updateUserSchema.parse(req.body)
    const { before, after } = await serviceFor(req).update(id, req.user.userId, input)

    req.auditEntity = { type: 'User', id: after.id, before, after: { role: after.role, status: after.status } }

    sendSuccess(req, res, toSafeUser(after))
  },
}

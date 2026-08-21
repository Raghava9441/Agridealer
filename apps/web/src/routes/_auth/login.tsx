import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginForm } from '@/modules/auth/components/LoginForm'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ context }) => {
    const session = await context.auth.ensureSession()
    if (session) throw redirect({ to: '/dashboard' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect: redirectTo } = Route.useSearch()

  return <LoginForm onSuccess={() => navigate({ to: redirectTo ?? '/dashboard' })} />
}

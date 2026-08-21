import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Not yet implemented.</p>
    </div>
  )
}

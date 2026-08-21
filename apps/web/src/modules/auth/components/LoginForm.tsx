import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { login } from '@/store/slices/authSlice'
import { ApiError } from '@/core/http/apiClient'
import { useContent } from '@/cms/useContent'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const dispatch = useAppDispatch()
  const content = useContent()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (input) => {
    setFormError(null)
    try {
      await dispatch(login(input)).unwrap()
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'MFA_REQUIRED') {
        setFormError(content.get('auth.mfaNotImplemented'))
        return
      }
      setFormError(err instanceof ApiError ? err.message : content.get('auth.loginFailed'))
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-xl font-semibold">{content.get('auth.signInTitle')}</h1>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm">
          {content.get('auth.email')}
        </label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm">
          {content.get('auth.password')}
        </label>
        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      {formError && <p className="text-sm text-danger">{formError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? content.get('auth.signingIn') : content.get('auth.signIn')}
      </Button>
    </form>
  )
}

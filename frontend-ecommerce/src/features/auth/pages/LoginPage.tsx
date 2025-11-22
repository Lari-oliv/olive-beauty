import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useAuthStore } from '@/shared/stores'
import { useToastContext } from '@/shared/components/ToastProvider'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { checkAndExecutePendingAction } from '@/shared/utils/executePendingAction'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const { success, error: showError } = useToastContext()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [localError, setLocalError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      handlePostLogin()
    }
  }, [isAuthenticated, navigate])

  const handlePostLogin = async () => {
    // Check and execute pending action
    const redirectUrl = await checkAndExecutePendingAction(
      (message) => success(message),
      (message) => showError(message)
    )

    // Redirect to appropriate page
    if (redirectUrl) {
      // Use window.location for full URLs, navigate for routes
      if (redirectUrl.startsWith('http')) {
        window.location.href = redirectUrl
      } else {
        navigate({ to: redirectUrl as any })
      }
    } else {
      navigate({ to: '/' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    try {
      await login(formData)
      // handlePostLogin will be called by useEffect when isAuthenticated becomes true
    } catch (err) {
      setLocalError('Erro ao fazer login. Verifique suas credenciais.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear errors when user starts typing
    if (localError || error) {
      setLocalError(null)
      clearError()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta para continuar
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(error || localError) && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error || localError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


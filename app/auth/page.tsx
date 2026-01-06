'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  role: z.enum(['BUSINESS_FOOD', 'BUSINESS_ACCOMMODATION', 'GUIDE'], {
    required_error: 'Selecione o tipo de conta',
  }).optional(),
})

type AuthFormData = z.infer<typeof authSchema>

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login com credenciais usando POST (não passa dados na URL)
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl: '/dash',
        })

        if (result?.error) {
          toast.error('Credenciais inválidas')
          return
        }

        toast.success('Login realizado!')
        router.push('/dash')
        router.refresh()
      } else {
        // Validar role no cadastro
        if (!data.role) {
          toast.error('Selecione o tipo de conta')
          return
        }

        // Cadastro com role já definida
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          toast.error(result.error || 'Erro ao criar conta')
          return
        }

        toast.success('Conta criada com sucesso!')

        // Fazer login automático após criar conta
        const loginResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (!loginResult?.error) {
          router.push('/dash')
          router.refresh()
        } else {
          setIsLogin(true)
          reset()
        }
      }
    } catch (error) {
      toast.error('Erro ao conectar com servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? 'Entre com suas credenciais'
                : 'Cadastre-se para começar'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name - apenas no cadastro */}
            {!isLogin && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nome completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Seu nome"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Tipo de Conta - apenas no cadastro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Conta *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        value="BUSINESS_FOOD"
                        {...register('role')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">
                          Empresa Alimentícia
                        </p>
                        <p className="text-sm text-gray-600">
                          Restaurantes, bares, lanchonetes
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        value="BUSINESS_ACCOMMODATION"
                        {...register('role')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">
                          Empresa de Hospedagem
                        </p>
                        <p className="text-sm text-gray-600">
                          Hotéis, pousadas, hostels
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        value="GUIDE"
                        {...register('role')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">
                          Guia / Agência de Turismo
                        </p>
                        <p className="text-sm text-gray-600">
                          Guias de turismo e agências
                        </p>
                      </div>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 6 caracteres, 1 letra maiúscula e 1 caractere especial
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Carregando...'
                : isLogin
                  ? 'Entrar'
                  : 'Criar conta'}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin
                ? 'Não tem conta? Cadastre-se'
                : 'Já tem conta? Faça login'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          Plataforma de Gestão Turística
        </p>
      </div>
    </div>
  )
}


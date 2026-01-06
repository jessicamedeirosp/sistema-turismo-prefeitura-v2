import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Plataforma de Turismo',
  description: 'Acesse sua conta',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

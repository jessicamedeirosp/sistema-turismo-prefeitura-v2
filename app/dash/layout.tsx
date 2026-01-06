import type { Metadata } from 'next'
import DashLayoutWrapper from './DashLayoutWrapper'

export const metadata: Metadata = {
  title: 'Dashboard - Plataforma de Turismo',
  description: 'Painel administrativo',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashLayoutWrapper>{children}</DashLayoutWrapper>
}

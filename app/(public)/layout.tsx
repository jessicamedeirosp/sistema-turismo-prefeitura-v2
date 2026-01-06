import type { Metadata } from 'next'

import '../globals.css'
import PublicHeader from '@/components/PublicHeader'
import Footer from '../../components/Footer'
import ClientProvider from '@/components/ClientProvider'

export const metadata: Metadata = {
  title: 'Turismo - Descubra o Paraíso',
  description: 'Portal de turismo com informações sobre praias, hospedagem, gastronomia e eventos',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientProvider>
          <PublicHeader />
          {children}
          <Footer />
        </ClientProvider>
      </body>
    </html>
  )
}

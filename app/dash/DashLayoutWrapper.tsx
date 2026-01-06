'use client'

import SessionProvider from '@/components/SessionProvider'
import DashLayout from '@/components/DashLayout'

export default function DashLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <DashLayout>{children}</DashLayout>
    </SessionProvider>
  )
}

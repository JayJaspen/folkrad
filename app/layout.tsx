import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { AuthProvider } from '@/components/layout/AuthProvider'

export const metadata: Metadata = {
  title: 'Folkrådet - Demokratisk Dialog',
  description: 'En politiskt neutral tjänst för demokratisk dialog. Din röst, din åsikt.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-light-bg font-body">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}

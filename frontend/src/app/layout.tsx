import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConnectionStatus } from '@/components/ConnectionStatus'

export const metadata: Metadata = {
  title: 'Cadastro Integrantes Corporação',
  description: 'Sistema de cadastro de integrantes de corporação',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
          <ConnectionStatus />
        </AuthProvider>
      </body>
    </html>
  )
}

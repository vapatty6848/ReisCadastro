import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConnectionStatus } from '@/components/ConnectionStatus'

export const metadata: Metadata = {
  title: 'Gestão Corporação AReis',
  description: 'Sistema de gestão de integrantes - Corporação AReis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <ConnectionStatus />
        </AuthProvider>
      </body>
    </html>
  )
}

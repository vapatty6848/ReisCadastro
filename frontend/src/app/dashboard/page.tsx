'use client';

import { IntegranteForm } from '@/components/integrante/IntegranteForm';
import { IntegranteList } from '@/components/integrante/IntegranteList';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserPlus, Users, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lista' | 'cadastro'>('cadastro');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white bg-blue-900 shadow-lg">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg">
                <Users className="text-blue-900" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Corporação Admin</h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-blue-100">Bem-vindo,</p>
                <p className="text-sm font-bold">{user?.name}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-red-500 rounded-lg shadow-sm hover:bg-red-600"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'lista'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Users size={18} />
              Consultar Integrantes
            </button>
            <button
              onClick={() => setActiveTab('cadastro')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'cadastro'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <UserPlus size={18} />
              Novo Cadastro
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:p-8">
          {activeTab === 'lista' ? (
            <IntegranteList />
          ) : (
            <div>
              <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Novo Cadastro</h2>
                  <p className="text-sm text-gray-500">Preencha os dados abaixo para registrar um novo integrante.</p>
                </div>

                <div className="flex p-1 overflow-hidden border border-gray-200 shadow-sm bg-gray-50 rounded-xl">
                  <button
                    onClick={() => setActiveTab('lista')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 transition-all rounded-lg hover:bg-white hover:shadow-sm"
                    title="Pesquisar e gerenciar integrantes"
                  >
                    <Users size={16} /> Pesquisar / Editar / Deletar / Imprimir
                  </button>
                </div>
              </div>
              <IntegranteForm />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-white border-t border-gray-200">
        <div className="px-4 mx-auto text-xs text-center text-gray-500 max-w-7xl">
          &copy; {new Date().getFullYear()} Corporação Admin - Sistema de Gestão de Integrantes
        </div>
      </footer>
    </div>
  );
}

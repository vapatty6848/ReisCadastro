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
  const [activeTab, setActiveTab] = useState<'lista' | 'cadastro'>('lista');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg">
                <Users className="text-blue-900" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Corporação Admin</h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-blue-100">Bem-vindo,</p>
                <p className="text-sm font-bold">{user?.name}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {activeTab === 'lista' ? (
            <IntegranteList />
          ) : (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Novo Cadastro</h2>
                <button
                  onClick={() => setActiveTab('lista')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Voltar para a lista
                </button>
              </div>
              <IntegranteForm />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Corporação Admin - Sistema de Gestão de Integrantes
        </div>
      </footer>
    </div>
  );
}

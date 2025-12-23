'use client';

import { AlunoForm } from '@/components/aluno/AlunoForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Fanfarra Admin</h1>
        <div className="flex items-center gap-4">
          <span>Olá, {user?.name}</span>
          <button onClick={logout} className="bg-red-500 px-3 py-1 rounded text-sm">Sair</button>
        </div>
      </nav>

      <main className="p-8">
        <AlunoForm />
      </main>
    </div>
  );
}

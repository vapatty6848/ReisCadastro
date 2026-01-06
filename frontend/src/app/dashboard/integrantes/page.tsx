'use client';

import { IntegranteList } from '@/components/integrante/IntegranteList';
import Link from 'next/link';

export default function IntegrantesPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline text-sm"
        >
          &larr; Voltar ao Dashboard
        </Link>
        <Link
          href="/dashboard/integrantes/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Novo Cadastro
        </Link>
      </div>
      <IntegranteList />
    </div>
  );
}

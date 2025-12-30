'use client';

import { IntegranteForm } from '@/components/integrante/IntegranteForm';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { List } from 'lucide-react';

export default function VisualizarIntegrantePage() {
  const { id } = useParams();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Visualizar Integrante</h1>
        <Link
          href="/dashboard/integrantes"
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <List size={20} /> Voltar para Lista
        </Link>
      </div>
      <IntegranteForm id={id as string} readOnly={true} />
    </div>
  );
}

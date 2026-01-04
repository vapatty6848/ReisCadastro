import { IntegranteForm } from '@/components/integrante/IntegranteForm';
import Link from 'next/link';
import { List } from 'lucide-react';

export default function NovoIntegrantePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Novo Cadastro de Integrante</h1>
        <Link
          href="/dashboard/integrantes"
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
        >
          <List size={20} /> Editar/ Pesquisar/Imprimir ou Deletar
        </Link>
      </div>
      <IntegranteForm />
    </div>
  );
}

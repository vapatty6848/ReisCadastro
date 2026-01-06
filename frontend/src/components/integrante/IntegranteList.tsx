'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Edit, Trash2, Eye, Printer, FileDown } from 'lucide-react';
import Link from 'next/link';

export function IntegranteList() {
  const { token } = useAuth();
  const [integrantes, setIntegrantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nome: '',
    cpf: '',
    turma: '',
    tipoIntegrante: '',
    subtipoIntegrante: '',
    corporacao: '',
    tamanhoBota: '',
    tamanhoUniforme: '',
    patrimonio: '',
    instrumento: '',
    naoDevolvido: false
  });

  const fetchIntegrantes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.nome) params.append('nome', filters.nome);
      if (filters.cpf) params.append('cpf', filters.cpf);
      if (filters.turma) params.append('turma', filters.turma);
      if (filters.tipoIntegrante) params.append('tipoIntegrante', filters.tipoIntegrante);
      if (filters.subtipoIntegrante) params.append('subtipoIntegrante', filters.subtipoIntegrante);
      if (filters.corporacao) params.append('corporacao', filters.corporacao);
      if (filters.tamanhoBota) params.append('tamanhoBota', filters.tamanhoBota);
      if (filters.tamanhoUniforme) params.append('tamanhoUniforme', filters.tamanhoUniforme);
      if (filters.patrimonio) params.append('patrimonio', filters.patrimonio);
      if (filters.instrumento) params.append('instrumento', filters.instrumento);
      if (filters.naoDevolvido) params.append('naoDevolvido', 'true');

      const response = await api.get(`/api/integrantes?${params.toString()}`);
      setIntegrantes(response.data);
    } catch (error) {
      console.error('Erro ao buscar integrantes:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, token]); // Incluído filters e token

  useEffect(() => {
    if (token) fetchIntegrantes();
  }, [token, fetchIntegrantes]);

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o integrante ${nome}?`)) {
      try {
        await api.delete(`/api/integrantes/${id}`);
        alert('Integrante excluído com sucesso!');
        fetchIntegrantes();
      } catch (error) {
        alert('Erro ao excluir integrante.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (integrantes.length === 0) return;

    const isInstrumentSearch = filters.patrimonio || filters.instrumento || filters.naoDevolvido || filters.subtipoIntegrante === 'INSTRUMENTOS';

    let headers = ['Nome', 'Corporação', 'Tipo', 'Patrimônio', 'Tamanho Bota', 'Tamanho Roupa'];
    if (isInstrumentSearch) {
      headers = ['Nome', 'Patrimônio', 'Instrumento', 'Recebimento', 'Devolução'];
    }

    const rows = integrantes.map((i: any) => {
      if (isInstrumentSearch) {
        return [
          i.nome,
          i.patrimonio || '',
          i.instrumento || '',
          i.instrumentoRecebimento ? new Date(i.instrumentoRecebimento).toLocaleDateString('pt-BR') : '',
          i.instrumentoDevolucao ? new Date(i.instrumentoDevolucao).toLocaleDateString('pt-BR') : 'Não devolvido'
        ];
      }
      return [
        i.nome,
        i.corporacao?.nome || '',
        i.tipoIntegrante,
        i.patrimonio || '',
        i.tamanhoBota || '',
        i.tamanhoUniforme || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `integrantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Integrantes</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-green-700 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
          >
            <FileDown size={20} /> Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Printer size={20} /> Imprimir
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid items-end grid-cols-1 gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-xl md:grid-cols-3 lg:grid-cols-5 print:hidden">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={filters.nome}
            onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por nome..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">CPF</label>
          <input
            type="text"
            value={filters.cpf}
            onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por CPF..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Turma</label>
          <input
            type="text"
            value={filters.turma}
            onChange={(e) => setFilters({ ...filters, turma: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por turma..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={filters.tipoIntegrante}
            onChange={(e) => setFilters({ ...filters, tipoIntegrante: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Todos</option>
            <option value="CORPO_MUSICAL">Corpo Musical</option>
            <option value="LINHA_FRENTE">Linha de Frente</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Subtipo</label>
          <select
            value={filters.subtipoIntegrante}
            onChange={(e) => setFilters({ ...filters, subtipoIntegrante: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Todos</option>
            <option value="INSTRUMENTOS">Instrumentos</option>
            <option value="COMANDANTE_MOR">Comandante Mor</option>
            <option value="PAVILHAO_NACIONAL">Pavilhão Nacional</option>
            <option value="CORPO_COREOGRAFICO">Corpo Coreográfico</option>
            <option value="BALIZAS">Balizas</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Corporação</label>
          <input
            type="text"
            value={filters.corporacao}
            onChange={(e) => setFilters({ ...filters, corporacao: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por corporação..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Patrimônio</label>
          <input
            type="text"
            value={filters.patrimonio}
            onChange={(e) => setFilters({ ...filters, patrimonio: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por patrimônio..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Instrumento</label>
          <input
            type="text"
            value={filters.instrumento}
            onChange={(e) => setFilters({ ...filters, instrumento: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por instrumento..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Tam. Uniforme</label>
          <input
            type="text"
            value={filters.tamanhoUniforme}
            onChange={(e) => setFilters({ ...filters, tamanhoUniforme: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Tam. Uniforme..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Tam. Bota</label>
          <input
            type="text"
            value={filters.tamanhoBota}
            onChange={(e) => setFilters({ ...filters, tamanhoBota: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Tam. Bota..."
          />
        </div>
        <div className="flex items-center gap-2 pb-3">
          <input
            type="checkbox"
            id="naoDevolvido"
            checked={filters.naoDevolvido}
            onChange={(e) => setFilters({ ...filters, naoDevolvido: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="naoDevolvido" className="text-sm font-medium text-gray-700">Não Devolvidos</label>
        </div>

        <div className="flex justify-end gap-2 md:col-span-3 lg:col-span-5">
          <button
            onClick={() => {
              setFilters({
                nome: '',
                cpf: '',
                turma: '',
                tipoIntegrante: '',
                subtipoIntegrante: '',
                corporacao: '',
                tamanhoBota: '',
                tamanhoUniforme: '',
                patrimonio: '',
                instrumento: '',
                naoDevolvido: false
              });
              setTimeout(fetchIntegrantes, 0);
            }}
            className="px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Limpar
          </button>
          <button
            onClick={fetchIntegrantes}
            className="flex items-center justify-center gap-2 px-8 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Search size={20} /> Filtrar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl print:border-none print:shadow-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 print:bg-white">
              <th className="p-4 font-semibold text-gray-700">Nome do Integrante</th>
              {filters.naoDevolvido ? (
                <>
                  <th className="p-4 font-semibold text-gray-700">Patrimônio</th>
                  <th className="p-4 font-semibold text-gray-700">Data de Entrega</th>
                </>
              ) : (filters.patrimonio || filters.instrumento) ? (
                <>
                  <th className="p-4 font-semibold text-gray-700">Instrumento</th>
                  <th className="p-4 font-semibold text-gray-700">Patrimônio</th>
                  <th className="p-4 font-semibold text-gray-700">Recebimento</th>
                  <th className="p-4 font-semibold text-gray-700">Devolução</th>
                </>
              ) : (
                <>
                  <th className="p-4 font-semibold text-gray-700">Corporação</th>
                  <th className="p-4 font-semibold text-gray-700">Turma</th>
                  <th className="p-4 font-semibold text-gray-700">Tipo</th>
                  <th className="p-4 font-semibold text-gray-700">Patrimônio</th>
                </>
              )}
              <th className="p-4 font-semibold text-center text-gray-700 print:hidden">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Carregando...</td></tr>
            ) : integrantes.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Nenhum integrante encontrado.</td></tr>
            ) : (
              integrantes.map((integrante: any) => (
                <tr key={integrante.id} className="transition-colors border-b border-gray-50 hover:bg-gray-50 print:hover:bg-white">
                  <td className="p-4 font-medium text-gray-800">{integrante.nome}</td>

                  {filters.naoDevolvido ? (
                    <>
                      <td className="p-4 text-gray-600">{integrante.patrimonio || '-'}</td>
                      <td className="p-4 text-gray-600">{formatDate(integrante.instrumentoRecebimento) || '-'}</td>
                    </>
                  ) : (filters.patrimonio || filters.instrumento) ? (
                    <>
                      <td className="p-4 text-gray-600">{integrante.instrumento || '-'}</td>
                      <td className="p-4 text-gray-600">{integrante.patrimonio || '-'}</td>
                      <td className="p-4 text-gray-600">{formatDate(integrante.instrumentoRecebimento) || '-'}</td>
                      <td className="p-4 text-gray-600">
                        {integrante.instrumentoDevolucao
                          ? formatDate(integrante.instrumentoDevolucao)
                          : <span className="font-medium text-red-500">Não devolvido</span>}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-gray-600">{integrante.corporacao?.nome}</td>
                      <td className="p-4 text-gray-600">{integrante.turma}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs ${integrante.tipoIntegrante === 'CORPO_MUSICAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} print:p-0 print:text-black`}>
                          {integrante.tipoIntegrante.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{integrante.patrimonio || '-'}</td>
                    </>
                  )}

                  <td className="p-4 print:hidden">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/dashboard/integrantes/visualizar/${integrante.id}`}
                        className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/dashboard/integrantes/editar/${integrante.id}`}
                        className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(integrante.id, integrante.nome)}
                        className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

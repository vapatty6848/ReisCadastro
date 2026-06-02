'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, Building2, User } from 'lucide-react';

interface Integrante {
  id: string;
  nome: string;
  cin?: string;
  documento?: string;
  telefone: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  tipoIntegrante: string;
  subtipoIntegrante: string;
  corporacao: {
    nome: string;
  };
}

export function GroupedIntegranteList() {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState<Record<string, Integrante[]>>({});
  const [filter, setFilter] = useState({
    corporacao: '',
    tipoIntegrante: '',
    statusDevolucao: ''
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const params = new URLSearchParams();
          params.append('limit', '1000');
          if (filter.corporacao) params.append('corporacao', filter.corporacao);
          if (filter.tipoIntegrante) params.append('tipoIntegrante', filter.tipoIntegrante);
          if (filter.statusDevolucao) params.append('statusDevolucao', filter.statusDevolucao);

          const response = await api.get(`/api/integrantes?${params.toString()}`);
          const integrantes: Integrante[] = response.data.data;

          const groups = integrantes.reduce((acc: Record<string, Integrante[]>, item) => {
            const corpName = item.corporacao?.nome || 'Sem Corporação';
            if (!acc[corpName]) {
              acc[corpName] = [];
            }
            acc[corpName].push(item);
            return acc;
          }, {});

          setGroupedData(groups);
        } catch (error) {
          console.error('Erro ao buscar integrantes para o relatório:', error);
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }, filter.corporacao ? 500 : 0); // Debounce apenas se estiver digitando corporação

    return () => clearTimeout(delayDebounceFn);
  }, [filter]);

  const corpNames = Object.keys(groupedData).sort();

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Título visível apenas na impressão */}
      <div className="hidden print:block mb-4 border-b border-gray-800 pb-2">
        <h1 className="text-3xl font-bold text-center text-gray-900">Relatório de Integrantes por Corporação</h1>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-700">
          <p>Corporação AReis</p>
          <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 no-print">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-blue-600" />
            Relatório por Corporação
          </h2>
          <button
            onClick={() => {
              const originalTitle = document.title;
              document.title = 'Relatório por Corporação';
              window.print();
              document.title = originalTitle;
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-200"
          >
            Imprimir Relatório
          </button>
        </div>

        {/* Mini Filtros do Relatório */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qual Corporação?</label>
            <input
              type="text"
              placeholder="Digite o nome ou deixe vazio para todas..."
              value={filter.corporacao}
              onChange={(e) => setFilter({ ...filter, corporacao: e.target.value })}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              aria-label="Filtrar por corporação"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Tipo</label>
            <select
              value={filter.tipoIntegrante}
              onChange={(e) => setFilter({ ...filter, tipoIntegrante: e.target.value })}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos os Tipos</option>
              <option value="CORPO_MUSICAL">Corpo Musical</option>
              <option value="LINHA_FRENTE">Linha de Frente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Situação de Devolução</label>
            <select
              value={filter.statusDevolucao}
              onChange={(e) => setFilter({ ...filter, statusDevolucao: e.target.value })}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              aria-label="Situação de devolução"
            >
              <option value="">Todos (Ativos e Devolvidos)</option>
              <option value="NAO_DEVOLVIDO">Instrumentos Pendentes (Ativos)</option>
              <option value="DEVOLVIDO">Instrumentos Já Devolvidos</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-500 animate-pulse">Atualizando relatório...</p>
        </div>
      ) : corpNames.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Users size={48} className="mx-auto mb-4 text-gray-200" />
          <p>Nenhum integrante encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        corpNames.map((corp) => (
          <div key={corp} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden break-inside-avoid print:break-before-page print:border print:border-black print:mb-8">
            <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
                <Building2 size={20} />
                Corporação: {corp}
              </h3>
              <span className="bg-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                {groupedData[corp].length} {groupedData[corp].length === 1 ? 'Integrante' : 'Integrantes'}
              </span>
            </div>

            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 print:py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-[14px] print:font-normal">Nome</th>
                    <th className="px-6 py-3 print:py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-[14px] print:font-normal">CIN</th>
                    <th className="px-6 py-3 print:py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-[14px] print:font-normal">Telefone</th>
                    <th className="px-6 py-3 print:py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider print:hidden">Endereço</th>
                    <th className="px-6 py-3 print:py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider print:hidden">Tipo</th>
                    <th className="px-6 py-3 print:py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden print:table-cell print:text-[14px] print:font-normal">Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupedData[corp].sort((a, b) => a.nome.localeCompare(b.nome)).map((integrante) => (
                    <tr key={integrante.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-1.5 rounded-full text-blue-600 print:hidden">
                            <User size={14} />
                          </div>
                          <span className="font-medium text-gray-800 print:text-[14px] print:font-normal">{integrante.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 print:text-[14px]">
                        {integrante.cin || integrante.documento || ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 print:text-[14px]">
                        {integrante.telefone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 print:hidden">
                        {`${integrante.rua || ''}, ${integrante.numero || ''} - ${integrante.bairro || ''}`}
                      </td>
                      <td className="px-6 py-4 print:hidden">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${integrante.tipoIntegrante === 'CORPO_MUSICAL'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {integrante.tipoIntegrante.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden print:table-cell text-center">
                        <div className="w-4 h-4 border border-black mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print, nav, header, aside, button {
            display: none !important;
            height: 0 !important;
          }

          .shadow-sm, .rounded-xl {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin-bottom: 10px !important;
          }

          h2, h3 {
            margin-top: 0 !important;
            color: black !important;
          }

          table {
            font-size: 10px !important;
          }

          th, td {
            padding: 4px 8px !important;
          }

          td span {
            font-size: 10px !important;
            background: none !important;
            color: black !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

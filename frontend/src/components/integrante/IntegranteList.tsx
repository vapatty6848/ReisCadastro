"use client";

import { useState, useEffect, useCallback } from "react";
import api, { getApiUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Printer,
  FileDown,
  Camera,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function IntegranteList() {
  const { token } = useAuth();
  const [integrantes, setIntegrantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    nome: "",
    cin: "",
    tipoIntegrante: "",
    subtipoIntegrante: "",
    corporacao: "",
    tamanhoBota: "",
    tamanhoUniforme: "",
    patrimonio: "",
    instrumento: "",
    statusDevolucao: "",
    dataDevolucao: "",
  });

  const fetchIntegrantes = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.nome) params.append("nome", filters.nome);
        if (filters.cin) params.append("cin", filters.cin);
        if (filters.tipoIntegrante)
          params.append("tipoIntegrante", filters.tipoIntegrante);
        if (filters.subtipoIntegrante)
          params.append("subtipoIntegrante", filters.subtipoIntegrante);
        if (filters.corporacao) params.append("corporacao", filters.corporacao);
        if (filters.tamanhoBota)
          params.append("tamanhoBota", filters.tamanhoBota);
        if (filters.tamanhoUniforme)
          params.append("tamanhoUniforme", filters.tamanhoUniforme);
        if (filters.patrimonio) params.append("patrimonio", filters.patrimonio);
        if (filters.instrumento)
          params.append("instrumento", filters.instrumento);
        if (filters.statusDevolucao)
          params.append("statusDevolucao", filters.statusDevolucao);
        if (filters.dataDevolucao)
          params.append("dataDevolucao", filters.dataDevolucao);

        params.append("page", String(pageToFetch));
        params.append("limit", "20");

        const response = await api.get(`/api/integrantes?${params.toString()}`);
        setIntegrantes(response.data.data);
        setMeta(response.data.meta);
        setHasSearched(true);
      } catch (error) {
        console.error("Erro ao buscar integrantes:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchIntegrantes(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters, fetchIntegrantes]); // Removi o comentário vazio e adicionei o debounce

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o integrante ${nome}?`)) {
      try {
        await api.delete(`/api/integrantes/${id}`);
        alert("Integrante excluído com sucesso!");
        fetchIntegrantes();
      } catch (error) {
        alert("Erro ao excluir integrante.");
      }
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "Lista de Integrantes";
    window.print();
    document.title = originalTitle;
  };

  const getColCount = () => {
    if (filters.statusDevolucao === "NAO_DEVOLVIDO") return 4;
    if (filters.tamanhoBota || filters.tamanhoUniforme) return 7;
    if (
      filters.patrimonio ||
      filters.instrumento ||
      filters.statusDevolucao === "DEVOLVIDO"
    )
      return 6;
    return 6;
  };

  const handleExportCSV = () => {
    if (integrantes.length === 0) return;

    const isInstrumentSearch =
      filters.patrimonio ||
      filters.instrumento ||
      filters.statusDevolucao ||
      filters.subtipoIntegrante === "INSTRUMENTOS";

    let headers = [
      "Nome",
      "Corporação",
      "Tipo",
      "Patrimônio",
      "Bota",
      "Uniforme",
    ];
    if (isInstrumentSearch) {
      headers = [
        "Nome",
        "Patrimônio",
        "Instrumento",
        "Recebimento",
        "Devolução",
      ];
    }

    const rows = integrantes.map((i: any) => {
      if (isInstrumentSearch) {
        return [
          i.nome,
          i.patrimonio || "",
          i.instrumento || "",
          i.instrumentoRecebimento
            ? new Date(i.instrumentoRecebimento).toLocaleDateString("pt-BR")
            : "",
          i.instrumentoDevolucao
            ? new Date(i.instrumentoDevolucao).toLocaleDateString("pt-BR")
            : "Não devolvido",
        ];
      }
      return [
        i.nome,
        i.corporacao?.nome || "",
        i.tipoIntegrante,
        i.patrimonio || "",
        i.tamanhoBota || "",
        i.tamanhoUniforme || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `integrantes_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Título visível apenas na impressão */}
      <div className="hidden print:block mb-4 border-b border-gray-800 pb-2">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Lista de Integrantes
        </h1>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-700">
          <p>Corporação AReis</p>
          <p>Data: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestão de Integrantes
        </h1>
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
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            value={filters.nome}
            onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por nome..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            CIN
          </label>
          <input
            type="text"
            value={filters.cin}
            onChange={(e) => setFilters({ ...filters, cin: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por CIN..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            value={filters.tipoIntegrante}
            onChange={(e) =>
              setFilters({ ...filters, tipoIntegrante: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Tipo de integrante"
          >
            <option value="">Todos</option>
            <option value="CORPO_MUSICAL">Corpo Musical</option>
            <option value="LINHA_FRENTE">Linha de Frente</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Subtipo
          </label>
          <select
            value={filters.subtipoIntegrante}
            onChange={(e) =>
              setFilters({ ...filters, subtipoIntegrante: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Subtipo de integrante"
          >
            <option value="">Todos</option>
            <option value="INSTRUMENTOS">Instrumentos</option>
            <option value="INSTRUMENTOS_ROTATIVOS">Instrumentos/Rotativos</option>
            <option value="COMANDANTE_MOR">Comandante Mor</option>
            <option value="PAVILHAO_NACIONAL">Pavilhão Nacional</option>
            <option value="CORPO_COREOGRAFICO">Corpo Coreográfico</option>
            <option value="BALIZAS">Balizas</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Corporação
          </label>
          <input
            type="text"
            value={filters.corporacao}
            onChange={(e) =>
              setFilters({ ...filters, corporacao: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por corporação..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Patrimônio
          </label>
          <input
            type="text"
            value={filters.patrimonio}
            onChange={(e) =>
              setFilters({ ...filters, patrimonio: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por patrimônio..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Instrumento
          </label>
          <input
            type="text"
            value={filters.instrumento}
            onChange={(e) =>
              setFilters({ ...filters, instrumento: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Filtrar por instrumento..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Uniforme
          </label>
          <input
            type="text"
            value={filters.tamanhoUniforme}
            onChange={(e) =>
              setFilters({ ...filters, tamanhoUniforme: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Uniforme..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Bota
          </label>
          <input
            type="text"
            value={filters.tamanhoBota}
            onChange={(e) =>
              setFilters({ ...filters, tamanhoBota: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Bota..."
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Devolução
          </label>
          <select
            name="statusDevolucao"
            value={filters.statusDevolucao}
            onChange={(e) =>
              setFilters({
                ...filters,
                statusDevolucao: e.target.value,
                dataDevolucao:
                  e.target.value !== "DEVOLVIDO" ? "" : filters.dataDevolucao,
              })
            }
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Status de devolução"
          >
            <option value="">Todos</option>
            <option value="DEVOLVIDO">Devolvidos</option>
            <option value="NAO_DEVOLVIDO">Não Devolvidos</option>
          </select>
        </div>

        {filters.statusDevolucao === "DEVOLVIDO" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Até a data
            </label>
            <input
              type="date"
              value={filters.dataDevolucao}
              onChange={(e) =>
                setFilters({ ...filters, dataDevolucao: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Até a data de devolução"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 md:col-span-3 lg:col-span-5">
          <button
            onClick={() => {
              setFilters({
                nome: "",
                cin: "",
                tipoIntegrante: "",
                subtipoIntegrante: "",
                corporacao: "",
                tamanhoBota: "",
                tamanhoUniforme: "",
                patrimonio: "",
                instrumento: "",
                statusDevolucao: "",
                dataDevolucao: "",
              });
            }}
            className="px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 whitespace-nowrap"
          >
            Limpar
          </button>
          <button
            onClick={() => fetchIntegrantes(1)}
            className="flex items-center justify-center gap-2 px-8 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            <Search size={20} /> Filtrar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl print:shadow-none print:border-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 print:bg-white print:border-b print:border-gray-800">
              <th className="p-4 font-semibold text-gray-700 w-16 print:hidden">
                Foto
              </th>
              <th className="p-4 print:py-2 font-semibold text-gray-700 print:text-[14px] print:font-normal">
                Nome do Integrante
              </th>
              <th className="p-4 print:py-2 font-semibold text-gray-700 hidden print:table-cell print:text-[14px] print:font-normal">
                CIN
              </th>
              <th className="p-4 print:py-2 font-semibold text-gray-700 hidden print:table-cell print:text-[14px] print:font-normal">
                Telefone
              </th>
              <th className="p-4 print:py-2 font-semibold text-gray-700 hidden print:table-cell print:text-[14px] print:font-normal text-center">
                Check
              </th>
              {filters.statusDevolucao === "NAO_DEVOLVIDO" ? (
                <>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Patrimônio
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Data de Entrega
                  </th>
                </>
              ) : filters.tamanhoUniforme || filters.tamanhoBota ? (
                <>
                  <th className="p-4 font-semibold text-gray-700 print:table-cell">
                    Corporação
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:table-cell">
                    Bota
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:table-cell">
                    Uniforme
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:table-cell">
                    Patrimônio
                  </th>
                </>
              ) : filters.patrimonio ||
                filters.instrumento ||
                filters.statusDevolucao === "DEVOLVIDO" ? (
                <>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Instrumento
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Patrimônio
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Recebimento
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Devolução
                  </th>
                </>
              ) : (
                <>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Corporação
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Tipo
                  </th>
                  <th className="p-4 font-semibold text-gray-700 print:hidden">
                    Patrimônio
                  </th>
                </>
              )}
              <th className="p-4 font-semibold text-center text-gray-700 print:hidden">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && integrantes.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4">
                    <div className="w-48 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : integrantes.length === 0 ? (
              <tr>
                <td
                  colSpan={getColCount()}
                  className="p-8 text-center text-gray-500"
                >
                  Nenhum integrante encontrado.
                </td>
              </tr>
            ) : (
              integrantes.map((integrante: any) => (
                <tr
                  key={integrante.id}
                  className="transition-colors border-b border-gray-50 hover:bg-gray-50 print:hover:bg-white"
                >
                  <td className="p-4 print:hidden">
                    <div className="relative w-12 h-12 overflow-hidden bg-gray-100 rounded-full border border-gray-200 shadow-sm">
                      {integrante.fotoPerfil ? (
                        <Image
                          src={`${getApiUrl()}${integrante.fotoPerfil}`}
                          alt={integrante.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <Camera size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800 print:text-[14px] print:font-normal">
                    {integrante.nome}
                  </td>
                  <td className="p-4 text-gray-600 hidden print:table-cell print:text-[14px]">
                    {integrante.cin || integrante.documento}
                  </td>
                  <td className="p-4 text-gray-600 hidden print:table-cell print:text-[14px]">
                    {integrante.telefone}
                  </td>
                  <td className="p-4 text-gray-600 hidden print:table-cell">
                    <div className="w-4 h-4 border border-black mx-auto"></div>
                  </td>

                  {filters.statusDevolucao === "NAO_DEVOLVIDO" ? (
                    <>
                      <td className="p-4 text-gray-600 print:hidden">
                        {integrante.patrimonio || "-"}
                      </td>
                      <td className="p-4 text-gray-600 print:hidden">
                        {formatDate(integrante.instrumentoRecebimento) || "-"}
                      </td>
                    </>
                  ) : filters.tamanhoUniforme || filters.tamanhoBota ? (
                    <>
                      <td className="p-4 text-gray-600 print:table-cell">
                        {integrante.corporacao?.nome}
                      </td>
                      <td className="p-4 text-gray-600 print:table-cell">
                        {integrante.tamanhoBota || "-"}
                      </td>
                      <td className="p-4 text-gray-600 print:table-cell">
                        {integrante.tamanhoUniforme || "-"}
                      </td>
                      <td className="p-4 text-gray-600 print:table-cell">
                        {integrante.patrimonio || "-"}
                      </td>
                    </>
                  ) : filters.patrimonio ||
                    filters.instrumento ||
                    filters.statusDevolucao === "DEVOLVIDO" ? (
                    <>
                      <td className="p-4 text-gray-600 print:hidden">
                        {integrante.instrumento || "-"}
                      </td>
                      <td className="p-4 text-gray-600 print:hidden">
                        {integrante.patrimonio || "-"}
                      </td>
                      <td className="p-4 text-gray-600 print:hidden">
                        {formatDate(integrante.instrumentoRecebimento) || "-"}
                      </td>
                      <td className="p-4 text-gray-600 print:hidden">
                        {integrante.instrumentoDevolucao ? (
                          formatDate(integrante.instrumentoDevolucao)
                        ) : (
                          <span className="font-medium text-red-500">
                            Não devolvido
                          </span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-gray-600 print:hidden">
                        {integrante.corporacao?.nome}
                      </td>
                      <td className="p-4 text-sm text-gray-600 print:hidden">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${integrante.tipoIntegrante === "CORPO_MUSICAL" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"} print:p-0 print:text-black`}
                        >
                          {integrante.tipoIntegrante.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 print:hidden">
                        {integrante.patrimonio || "-"}
                      </td>
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
                        onClick={() =>
                          handleDelete(integrante.id, integrante.nome)
                        }
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
      {/* Paginação */}
      {hasSearched && meta.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-xl print:hidden">
          <div className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-semibold text-gray-700">
              {integrantes.length}
            </span>{" "}
            de <span className="font-semibold text-gray-700">{meta.total}</span>{" "}
            integrantes
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchIntegrantes(meta.page - 1)}
              disabled={meta.page === 1 || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex items-center px-4 text-sm font-medium text-gray-700">
              Página {meta.page} de {meta.totalPages}
            </div>
            <button
              onClick={() => fetchIntegrantes(meta.page + 1)}
              disabled={meta.page === meta.totalPages || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm !important;
            size: auto;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Esconder elementos desnecessários */
          .print\:hidden,
          .no-print,
          nav,
          button,
          aside,
          header {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* Garantir que a tabela ocupe a largura toda e tenha bordas visíveis */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important; /* Diminuído para caber mais */
          }

          th {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            color: black !important;
            font-weight: bold !important;
            border: 1px solid #000 !important;
          }

          td {
            border: 1px solid #ccc !important;
            padding: 4px 6px !important; /* Mais compacto */
            color: black !important;
          }

          td span {
            font-size: 10px !important;
            background: none !important;
            color: black !important;
            padding: 0 !important;
            border: none !important;
          }

          /* Títulos e Containers */
          h1,
          h2,
          h3 {
            color: black !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }

          /* Remover sombras e bordas arredondadas que ficam feias no papel */
          .shadow-sm,
          .rounded-xl,
          .bg-white {
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .overflow-hidden {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}

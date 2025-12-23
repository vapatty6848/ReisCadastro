'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/form/Input';
import { Select } from '@/components/form/Select';
import { Search, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AlunosPage() {
  const { token } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nome: '',
    responsavel: '',
    instrumentoOrigem: '',
    tipoIntegrante: ''
  });

  const fetchAlunos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.nome) params.append('nome', filters.nome);
      if (filters.responsavel) params.append('responsavel', filters.responsavel);
      if (filters.instrumentoOrigem) params.append('instrumentoOrigem', filters.instrumentoOrigem);
      if (filters.tipoIntegrante) params.append('tipoIntegrante', filters.tipoIntegrante);

      const response = await axios.get(`http://localhost:3001/api/alunos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAlunos();
  }, [token]);

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o aluno ${nome}?`)) {
      try {
        await axios.delete(`http://localhost:3001/api/alunos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Aluno excluído com sucesso!');
        fetchAlunos();
      } catch (error) {
        alert('Erro ao excluir aluno.');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Integrantes</h1>
        <Link 
          href="/dashboard/alunos/novo" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Novo Cadastro
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Aluno</label>
          <input 
            type="text"
            value={filters.nome}
            onChange={(e) => setFilters({...filters, nome: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="Pesquisar por nome..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <input 
            type="text"
            value={filters.responsavel}
            onChange={(e) => setFilters({...filters, responsavel: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="Nome do pai/mãe..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select 
            value={filters.tipoIntegrante}
            onChange={(e) => setFilters({...filters, tipoIntegrante: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none"
          >
            <option value="">Todos</option>
            <option value="CORPO_MUSICAL">Corpo Musical</option>
            <option value="LINHA_FRENTE">Linha de Frente</option>
          </select>
        </div>
        <button 
          onClick={fetchAlunos}
          className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2"
        >
          <Search size={20} /> Filtrar
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-700">Nome do Aluno</th>
              <th className="p-4 font-semibold text-gray-700">Tipo</th>
              <th className="p-4 font-semibold text-gray-700">Escola</th>
              <th className="p-4 font-semibold text-gray-700">Turma</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando...</td></tr>
            ) : alunos.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum aluno encontrado.</td></tr>
            ) : (
              alunos.map((aluno: any) => (
                <tr key={aluno.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{aluno.nome}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${aluno.tipoIntegrante === 'CORPO_MUSICAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {aluno.tipoIntegrante.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{aluno.escola?.nome}</td>
                  <td className="p-4 text-gray-600">{aluno.turma}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Link 
                        href={`/dashboard/alunos/editar/${aluno.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(aluno.id, aluno.nome)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

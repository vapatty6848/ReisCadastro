import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CorporacaoOption {
  id: string;
  nome: string;
  telefone: string;
  isPredefinida?: boolean;
}

interface CorporacaoSelectorProps {
  register: any;
  errors: any;
  setValue: any;
  readOnly?: boolean;
}

export const CorporacaoSelector: React.FC<CorporacaoSelectorProps> = ({
  register,
  errors,
  setValue,
  readOnly
}) => {
  const [corporacoes, setCorporacoes] = useState<CorporacaoOption[]>([]);
  const [showNewCorporacao, setShowNewCorporacao] = useState(false);
  const [isLoadingCorporacoes, setIsLoadingCorporacoes] = useState(true);
  const [newCorporacaoName, setNewCorporacaoName] = useState('');
  const [newCorporacaoPhone, setNewCorporacaoPhone] = useState('');

  useEffect(() => {
    carregarCorporacoes();
  }, []);

  const carregarCorporacoes = async () => {
    try {
      setIsLoadingCorporacoes(true);
      const response = await api.get('/api/corporacoes');
      setCorporacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar corporações:', error);
    } finally {
      setIsLoadingCorporacoes(false);
    }
  };

  const adicionarNovaCorporacao = async () => {
    if (!newCorporacaoName || !newCorporacaoPhone) {
      alert('Nome e telefone da corporação são obrigatórios');
      return;
    }

    try {
      const response = await api.post('/api/corporacoes', {
        nome: newCorporacaoName,
        telefone: newCorporacaoPhone
      });

      setCorporacoes([...corporacoes, response.data]);
      setValue('corporacao.id', response.data.id);
      setValue('corporacao.nome', response.data.nome);
      setValue('corporacao.telefone', response.data.telefone);

      setNewCorporacaoName('');
      setNewCorporacaoPhone('');
      setShowNewCorporacao(false);

      alert('Corporação adicionada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar corporação:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar corporação');
    }
  };

  const aoSelecionarCorporacao = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;

    if (id === 'new') {
      setShowNewCorporacao(true);
      setValue('corporacao.id', '');
      setValue('corporacao.nome', '');
      setValue('corporacao.telefone', '');
      return;
    }

    const corp = corporacoes.find(c => c.id === id);
    if (corp) {
      setValue('corporacao.id', corp.id);
      setValue('corporacao.nome', corp.nome);
      setValue('corporacao.telefone', corp.telefone);
      setShowNewCorporacao(false);
    }
  };

  const opcoes = corporacoes.map(corp => ({
    value: corp.id,
    label: corp.nome
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="block text-gray-700 mb-1 font-medium">Selecionar Corporação</label>
          <select
            {...register('corporacao.id')}
            onChange={aoSelecionarCorporacao}
            disabled={readOnly || isLoadingCorporacoes}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">--- Selecione uma corporação ---</option>
            {opcoes.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value="new">+ Adicionar Nova Corporação</option>
          </select>
          {errors.corporacao?.id && <p className="text-red-500 text-sm mt-1">{errors.corporacao.id.message}</p>}
        </div>
      </div>

      {showNewCorporacao && !readOnly && (
        <div className="p-4 mt-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="mb-3 font-semibold text-blue-800">Adicionar Nova Corporação</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Nome da corporação"
              value={newCorporacaoName}
              onChange={(e) => setNewCorporacaoName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="text"
              placeholder="Telefone"
              value={newCorporacaoPhone}
              onChange={(e) => setNewCorporacaoPhone(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={adicionarNovaCorporacao}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Adicionar Corporação
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewCorporacao(false);
                setNewCorporacaoName('');
                setNewCorporacaoPhone('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

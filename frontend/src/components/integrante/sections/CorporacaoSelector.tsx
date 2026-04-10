import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CorporacaoOption {
  id: string;
  nome: string;
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
  const corporacaoNomeRegister = register('corporacao.nome');

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
    if (!newCorporacaoName.trim()) {
      alert('Nome da corporação é obrigatório');
      return;
    }

    try {
      const response = await api.post('/api/corporacoes', {
        nome: newCorporacaoName
      });

      setCorporacoes([...corporacoes, response.data]);
      setValue('corporacao.nome', response.data.nome, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setNewCorporacaoName('');
      setShowNewCorporacao(false);

      alert('Corporação adicionada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar corporação:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar corporação');
    }
  };

  const aoSelecionarCorporacao = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nome = e.target.value;

    if (nome === 'new') {
      setShowNewCorporacao(true);
      setValue('corporacao.nome', '', {
        shouldValidate: false,
        shouldDirty: true,
      });
      return;
    }

    const corp = corporacoes.find(c => c.nome === nome);
    if (corp) {
      setValue('corporacao.nome', corp.nome, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setShowNewCorporacao(false);
    }
  };

  const opcoes = corporacoes.map(corp => ({
    value: corp.nome,
    label: corp.nome
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="block text-gray-700 mb-1 font-medium">Selecionar Corporação</label>
          <select
            {...corporacaoNomeRegister}
            onChange={(e) => {
              corporacaoNomeRegister.onChange(e);
              aoSelecionarCorporacao(e);
            }}
            disabled={readOnly || isLoadingCorporacoes}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">--- Selecione uma corporação ---</option>
            {opcoes.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value="new">+ Adicionar Nova Corporação</option>
          </select>
          {errors.corporacao?.nome && <p className="text-red-500 text-sm mt-1">{errors.corporacao.nome.message}</p>}
        </div>
      </div>

      {showNewCorporacao && !readOnly && (
        <div className="p-4 mt-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="mb-3 font-semibold text-blue-800">Adicionar Nova Corporação</h4>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Nome da corporação"
              value={newCorporacaoName}
              onChange={(e) => setNewCorporacaoName(e.target.value)}
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

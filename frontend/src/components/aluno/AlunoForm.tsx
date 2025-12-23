'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alunoSchema, AlunoData } from '@/schemas';
import { Input } from '../form/Input';
import { Select } from '../form/Select';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AlunoFormProps {
  id?: string;
}

export const AlunoForm = ({ id }: AlunoFormProps) => {
  const { token } = useAuth();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(!!id);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AlunoData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      tipoIntegrante: 'CORPO_MUSICAL',
    }
  });

  const instrumentoSelecionado = watch('instrumento');

  useEffect(() => {
    if (id && token) {
      const fetchAluno = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/api/alunos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = response.data;

          // Formatar datas para o input type="date" (YYYY-MM-DD)
          if (data.dataNascimento) data.dataNascimento = new Date(data.dataNascimento).toISOString().split('T')[0];
          if (data.dataMatricula) data.dataMatricula = new Date(data.dataMatricula).toISOString().split('T')[0];
          if (data.instrumentoRecebimento) data.instrumentoRecebimento = new Date(data.instrumentoRecebimento).toISOString().split('T')[0];
          if (data.instrumentoDevolucao) data.instrumentoDevolucao = new Date(data.instrumentoDevolucao).toISOString().split('T')[0];

          reset(data);
        } catch (error) {
          console.error('Erro ao buscar aluno:', error);
          alert('Erro ao carregar dados do aluno.');
        } finally {
          setLoading(false);
        }
      };
      fetchAluno();
    }
  }, [id, token, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...selectedFiles, ...newFiles].slice(0, 5);

      if (selectedFiles.length + newFiles.length > 5) {
        alert('Você pode selecionar no máximo 5 arquivos. Apenas os 5 primeiros foram mantidos.');
      }

      setSelectedFiles(updatedFiles);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: AlunoData) => {
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('fotos', file);
      });

      formData.append('data', JSON.stringify(data));

      const url = id ? `http://localhost:3001/api/alunos/${id}` : 'http://localhost:3001/api/alunos';
      const method = id ? 'patch' : 'post';

      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(id ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
      router.push('/dashboard/alunos');
    } catch (err: any) {
      console.error(err.response?.data);
      alert('Erro ao salvar aluno: ' + (err.response?.data?.message || 'Erro desconhecido'));
    }
  };

  if (loading) return <div className="text-center p-10">Carregando dados...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">
        {id ? 'Editar Integrante' : 'Ficha de Cadastro de Integrante'}
      </h2>

      {/* Seção 1: Dados Pessoais do Aluno */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
          <span className="bg-blue-100 p-1 rounded">01</span> Dados do Aluno
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input label="Nome Completo" register={register('nome')} error={errors.nome?.message} />
          </div>
          <Input label="CPF" register={register('cpf')} error={errors.cpf?.message} />
          <Input label="Data de Nascimento" type="date" register={register('dataNascimento')} error={errors.dataNascimento?.message} />
          <Input label="Telefone" register={register('telefone')} error={errors.telefone?.message} />
          <Input label="Email" type="email" register={register('email')} error={errors.email?.message} />

          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">Fotos / Documentos (Máx. 5)</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none"
              accept="image/*,.pdf"
            />
            <div className="mt-2 space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded text-sm">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 font-bold px-2">✕</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{selectedFiles.length} de 5 arquivo(s) selecionado(s)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-2">
            <Input label="Rua" register={register('rua')} error={errors.rua?.message} />
          </div>
          <Input label="Número" register={register('numero')} error={errors.numero?.message} />
          <Input label="Bairro" register={register('bairro')} error={errors.bairro?.message} />
          <Input label="CEP" register={register('cep')} error={errors.cep?.message} />
        </div>
      </section>

      {/* Seção 2: Dados do Responsável */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
          <span className="bg-blue-100 p-1 rounded">02</span> Dados do Responsável
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input label="Nome do Responsável" register={register('responsavel.nome')} error={errors.responsavel?.nome?.message} />
          </div>
          <Input label="CPF do Responsável" register={register('responsavel.cpf')} error={errors.responsavel?.cpf?.message} />
          <Input label="Parentesco" register={register('responsavel.parentesco')} error={errors.responsavel?.parentesco?.message} />
          <Input label="Telefone" register={register('responsavel.telefone')} error={errors.responsavel?.telefone?.message} />
          <Input label="Email" type="email" register={register('responsavel.email')} error={errors.responsavel?.email?.message} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-2">
            <Input label="Rua" register={register('responsavel.rua')} error={errors.responsavel?.rua?.message} />
          </div>
          <Input label="Número" register={register('responsavel.numero')} error={errors.responsavel?.numero?.message} />
          <Input label="Bairro" register={register('responsavel.bairro')} error={errors.responsavel?.bairro?.message} />
        </div>
      </section>

      {/* Seção 3: Dados Escolares */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
          <span className="bg-blue-100 p-1 rounded">03</span> Dados Escolares
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input label="Nome da Escola" register={register('escola.nome')} error={errors.escola?.nome?.message} />
          </div>
          <Input label="Telefone da Escola" register={register('escola.telefone')} error={errors.escola?.telefone?.message} />
          <Input label="Série/Ano" register={register('escola.serie')} error={errors.escola?.serie?.message} />
          <Input label="Turma" register={register('turma')} error={errors.turma?.message} />
          <Input label="Data de Matrícula" type="date" register={register('dataMatricula')} error={errors.dataMatricula?.message} />
          <Input label="Número da Matrícula" register={register('matriculaNumero')} error={errors.matriculaNumero?.message} />
        </div>
      </section>

      {/* Seção 4: Dados na Fanfarra */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
          <span className="bg-blue-100 p-1 rounded">04</span> Atuação na Fanfarra
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Tipo de Integrante"
            register={register('tipoIntegrante')}
            error={errors.tipoIntegrante?.message}
            options={[
              { value: 'CORPO_MUSICAL', label: 'Corpo Musical' },
              { value: 'LINHA_FRENTE', label: 'Linha de Frente' }
            ]}
          />
          <Select
            label="Subtipo"
            register={register('subtipoIntegrante')}
            error={errors.subtipoIntegrante?.message}
            options={[
              { value: 'INSTRUMENTOS', label: 'Instrumentos' },
              { value: 'COMANDANTE_MOR', label: 'Comandante Mor' },
              { value: 'PAVILHAO_NACIONAL', label: 'Pavilhão Nacional' },
              { value: 'CORPO_COREOGRAFICO', label: 'Corpo Coreográfico' },
              { value: 'BALIZAS', label: 'Balizas' }
            ]}
          />

          <Select
            label="Instrumento"
            register={register('instrumento')}
            error={errors.instrumento?.message}
            options={[
              { value: '', label: 'Nenhum' },
              { value: 'TROMPETE', label: 'Trompete' },
              { value: 'TROMBONE', label: 'Trombone' },
              { value: 'TUBA', label: 'Tuba' },
              { value: 'CAIXA', label: 'Caixa' },
              { value: 'BUMBO', label: 'Bumbo' },
              { value: 'PRATOS', label: 'Pratos' },
              { value: 'OUTRO', label: 'Outro' }
            ]}
          />

          {instrumentoSelecionado && (
            <>
              <Select
                label="Origem do Instrumento"
                register={register('instrumentoOrigem')}
                error={errors.instrumentoOrigem?.message}
                options={[
                  { value: 'PROJETO', label: 'Projeto' },
                  { value: 'EMPRESA', label: 'Empresa' }
                ]}
              />
              <Input label="Data Recebimento" type="date" register={register('instrumentoRecebimento')} error={errors.instrumentoRecebimento?.message} />
              <Input label="Data Devolução" type="date" register={register('instrumentoDevolucao')} error={errors.instrumentoDevolucao?.message} />
            </>
          )}

          <Input label="Tamanho Uniforme (0-999)" register={register('tamanhoUniforme')} error={errors.tamanhoUniforme?.message} maxLength={3} />
          <Input label="Tamanho Bota (0-999)" register={register('tamanhoBota')} error={errors.tamanhoBota?.message} maxLength={3} />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 mb-1 font-medium">Observações</label>
          <textarea
            {...register('observacoes')}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none h-24"
          />
        </div>
      </section>

      <div className="pt-6 flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="bg-blue-600 text-white px-10 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all transform hover:scale-105">
          {id ? 'Salvar Alterações' : 'Finalizar Cadastro'}
        </button>
      </div>
    </form>
  );
};

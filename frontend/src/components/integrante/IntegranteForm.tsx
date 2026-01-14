'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { integranteSchema, IntegranteData } from '@/schemas';
import { Input } from '../form/Input';
import { Select } from '../form/Select';
import api, { getApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, Trash2, Camera } from 'lucide-react';
import { CameraCapture } from '../form/CameraCapture';

interface IntegranteFormProps {
  id?: string;
  readOnly?: boolean;
  onSuccess?: () => void;
}

export const IntegranteForm = ({ id, readOnly, onSuccess }: IntegranteFormProps) => {
  const { token } = useAuth();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!profilePhoto) {
      setProfilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(profilePhoto);
    setProfilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePhoto]);

  const [showDevolucaoDate, setShowDevolucaoDate] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<IntegranteData>({
    resolver: zodResolver(integranteSchema),
    defaultValues: {
      tipoIntegrante: 'CORPO_MUSICAL',
    }
  });

  const dataDevolucaoValue = watch('instrumentoDevolucao');

  useEffect(() => {
    if (dataDevolucaoValue) {
      setShowDevolucaoDate(true);
    } else {
      setShowDevolucaoDate(false);
    }
  }, [dataDevolucaoValue]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form errors:', errors);
    }
  }, [errors]);

  const subtipoSelecionado = watch('subtipoIntegrante');
  const fotosExistentes = watch('fotos') as string[] | undefined;
  const fotoPerfilExistente = watch('fotoPerfil') as string | undefined;

  useEffect(() => {
    if (id && token) {
      const fetchIntegrante = async () => {
        try {
          const response = await api.get(`/api/integrantes/${id}`);
          const data = response.data;

          // Formatar datas para o input type="date" (YYYY-MM-DD)
          if (data.dataNascimento) data.dataNascimento = new Date(data.dataNascimento).toISOString().split('T')[0];
          if (data.dataMatricula) data.dataMatricula = new Date(data.dataMatricula).toISOString().split('T')[0];
          if (data.instrumentoRecebimento) data.instrumentoRecebimento = new Date(data.instrumentoRecebimento).toISOString().split('T')[0];
          if (data.instrumentoDevolucao) data.instrumentoDevolucao = new Date(data.instrumentoDevolucao).toISOString().split('T')[0];

          reset(data);
        } catch (error) {
          console.error('Erro ao buscar integrante:', error);
          alert('Erro ao carregar dados do integrante.');
        } finally {
          setLoading(false);
        }
      };
      fetchIntegrante();
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

  const handleDelete = async () => {
    if (id && confirm('Tem certeza que deseja excluir este integrante?')) {
      try {
        await api.delete(`/api/integrantes/${id}`);
        alert('Integrante excluído com sucesso!');
        router.push('/dashboard/integrantes');
      } catch (error) {
        alert('Erro ao excluir integrante.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const onSubmit = async (data: IntegranteData) => {
    console.log('Submetendo formulário...', { id, data, profilePhoto: profilePhoto?.name });
    setStatus(null);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('fotos', file);
      });

      if (profilePhoto) {
        console.log('Anexando foto de perfil ao FormData:', profilePhoto.name);
        formData.append('fotoPerfil', profilePhoto);
      }

      // Se a foto de perfil foi removida e não tem uma nova, sinaliza para o backend
      if (!profilePhoto && watch('fotoPerfil') === "") {
        data.fotoPerfil = "";
      }

      formData.append('data', JSON.stringify(data));

      const url = id ? `/api/integrantes/${id}` : '/api/integrantes';

      console.log(`Enviando requisição ${id ? 'PATCH' : 'POST'} para ${url}`);

      const response = await api({
        method: id ? 'PATCH' : 'POST',
        url,
        data: formData
      });

      console.log('Resposta do servidor:', response.data);

      setStatus({
        type: 'success',
        message: id ? 'Integrante atualizado com sucesso!' : 'Integrante cadastrado com sucesso!'
      });

      // Forçar atualização do estado local para refletir a nova imagem se estivermos editando
      if (id && response.data.fotoPerfil) {
        setValue('fotoPerfil', response.data.fotoPerfil);
        setProfilePhoto(null);
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard/integrantes');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Erro na submissão (Catch):', err);
      console.error('Mensagem de erro:', err.message);
      if (err.response) {
        console.error('Status do Erro:', err.response.status);
        console.error('Dados de Resposta do Erro:', err.response.data);
      }

      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido ao salvar';

      setStatus({
        type: 'error',
        message: 'Erro ao salvar integrante: ' + errorMessage
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando dados...</div>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('Erros de validação detectados:', errors);

        // Função auxiliar para extrair todos os campos com erro, incluindo os aninhados
        const getErrorMessages = (obj: any, prefix = ''): string[] => {
          let messages: string[] = [];
          for (const key in obj) {
            const fieldName = prefix ? `${prefix}.${key}` : key;
            if (obj[key].message) {
              messages.push(fieldName);
            } else {
              messages = messages.concat(getErrorMessages(obj[key], fieldName));
            }
          }
          return messages;
        };

        const fieldNames: Record<string, string> = {
          nome: 'Nome',
          cpf: 'CPF',
          dataNascimento: 'Data de Nascimento',
          dataMatricula: 'Data de Matrícula',
          'responsavel.nome': 'Nome do Responsável',
          'responsavel.cpf': 'CPF do Responsável',
          'responsavel.parentesco': 'Parentesco',
          'responsavel.telefone': 'Telefone do Responsável',
          'corporacao.nome': 'Nome da Corporação',
          'corporacao.telefone': 'Telefone da Corporação',
          tipoIntegrante: 'Tipo de Integrante',
          tamanhoUniforme: 'Uniforme',
          tamanhoBota: 'Bota'
        };

        const errorKeys = getErrorMessages(errors);
        const errorList = errorKeys.map(key => fieldNames[key] || key).join(', ');

        setStatus({
          type: 'error',
          message: `Não foi possível salvar. Verifique os campos: ${errorList}.`
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      })}
      className="max-w-5xl p-8 mx-auto space-y-8 bg-white shadow-lg rounded-xl"
    >
      <h2 className="pb-2 text-3xl font-bold text-gray-800 border-b-2 border-blue-500">
        {readOnly ? 'Visualizar Integrante' : id ? 'Editar Integrante' : 'Ficha de Cadastro de Integrante'}
      </h2>

      {status && (
        <div className={`p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <fieldset disabled={readOnly || isSubmitting} className="space-y-8">
        {/* Seção 1: Dados Pessoais do Integrante */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
            <span className="p-1 bg-blue-100 rounded">01</span> Dados do Integrante
          </h3>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Quadro de Foto de Perfil */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-40 h-48 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 flex items-center justify-center group">
                {profilePreview ? (
                  <img src={profilePreview} alt="Preview" className="object-cover w-full h-full" />
                ) : fotoPerfilExistente ? (
                  <img src={`${getApiUrl()}${fotoPerfilExistente}`} alt="Foto Perfil" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-center p-2 text-gray-400">
                    <Camera size={40} className="mx-auto mb-2 opacity-50" />
                    <span className="text-xs font-medium">Foto do Integrante</span>
                  </div>
                )}

                {!readOnly && (profilePhoto || fotoPerfilExistente) && (
                  <button type="button"
                    onClick={() => {
                      if (profilePhoto) setProfilePhoto(null);
                      else setValue('fotoPerfil', "");
                    }}
                    className="absolute top-1 right-1 p-1.5 text-white bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                    title="Remover Foto"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {!readOnly && (
                <div className="flex flex-col w-full gap-2">
                  <button type="button"
                    onClick={() => {
                      setIsCameraOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                  >
                    <Camera size={14} /> TIRAR FOTO
                  </button>

                  <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 transition-all bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100">
                    Escolher Arquivo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setProfilePhoto(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input label="Nome Completo" register={register('nome')} error={errors.nome?.message} />
                </div>
                <div className="relative">
                  <Input label="CPF" register={register('cpf')} error={errors.cpf?.message} />
                  {!readOnly && (
                    <button type="button"
                      onClick={() => {
                        const respCpf = watch('responsavel.cpf');
                        if (respCpf) {
                          setValue('cpf', respCpf);
                        } else {
                          alert('Preencha o CPF do responsável primeiro.');
                        }
                      }}
                      className="absolute right-0 top-0 text-[10px] text-blue-600 hover:underline"
                    >
                      Copiar do Responsável
                    </button>
                  )}
                </div>
                <Input label="Data de Nascimento" type="date" register={register('dataNascimento')} error={errors.dataNascimento?.message} />
                <Input label="Telefone" register={register('telefone')} error={errors.telefone?.message} />
                <Input label="Email" type="email" register={register('email')} error={errors.email?.message} />
                <Input label="Data de Matrícula" type="date" register={register('dataMatricula')} error={errors.dataMatricula?.message} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            {fotosExistentes && fotosExistentes.length > 0 && (
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Arquivos Atuais</label>
                <div className="flex flex-wrap gap-2">
                  {fotosExistentes.map((foto, index) => (
                    <div key={index} className="relative group">
                      <a
                        href={`${getApiUrl()}${foto}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 pr-8 text-xs text-blue-600 border border-blue-200 rounded bg-blue-50 hover:bg-blue-100"
                      >
                        {foto.split('/').pop()}
                      </a>
                      {!readOnly && (
                        <button type="button"
                          onClick={() => {
                            const novasFotos = fotosExistentes.filter((_, i) => i !== index);
                            setValue('fotos', novasFotos);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Remover arquivo"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!readOnly && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Documentos e Fotos Extras (Máx. 5)</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="w-full p-2 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*,.pdf"
                      title="Selecione arquivos para upload"
                    />
                  </div>
                </div>

                {isCameraOpen && (
                  <CameraCapture
                    onCapture={(file) => {
                      setProfilePhoto(file);
                    }}
                    onClose={() => setIsCameraOpen(false)}
                  />
                )}

                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 text-sm bg-gray-100 rounded">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)} className="px-2 font-bold text-red-500 hover:text-red-700">✕</button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">{selectedFiles.length} de 5 arquivo(s) selecionado(s)</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input label="Rua" register={register('rua')} error={errors.rua?.message} />
            </div>
            <Input label="Número" register={register('numero')} error={errors.numero?.message} />
            <Input label="Bairro" register={register('bairro')} error={errors.bairro?.message} />
            <Input label="CEP" register={register('cep')} error={errors.cep?.message} />
          </div>
        </section>

        {/* Seção 2: Dados do Responsável */}
        <section className="p-6 rounded-lg bg-gray-50">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
            <span className="p-1 bg-blue-100 rounded">02</span> Dados do Responsável
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input label="Nome do Responsável" register={register('responsavel.nome')} error={errors.responsavel?.nome?.message} />
            </div>
            <Input label="CPF do Responsável" register={register('responsavel.cpf')} error={errors.responsavel?.cpf?.message} />
            <Input label="Parentesco" register={register('responsavel.parentesco')} error={errors.responsavel?.parentesco?.message} />
            <Input label="Telefone" register={register('responsavel.telefone')} error={errors.responsavel?.telefone?.message} />
            <Input label="Email" type="email" register={register('responsavel.email')} error={errors.responsavel?.email?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Input label="Rua" register={register('responsavel.rua')} error={errors.responsavel?.rua?.message} />
              {!readOnly && (
                <button type="button"
                  onClick={() => {
                    setValue('responsavel.rua', watch('rua') || '');
                    setValue('responsavel.numero', watch('numero') || '');
                    setValue('responsavel.bairro', watch('bairro') || '');
                    setValue('responsavel.cep', watch('cep') || '');
                  }}
                  className="absolute right-0 top-0 text-[10px] text-blue-600 hover:underline"
                >
                  Copiar Endereço do Integrante
                </button>
              )}
            </div>
            <Input label="Número" register={register('responsavel.numero')} error={errors.responsavel?.numero?.message} />
            <Input label="Bairro" register={register('responsavel.bairro')} error={errors.responsavel?.bairro?.message} />
          </div>
        </section>

        {/* Seção 3: Dados da Corporação */}
        <section>
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
            <span className="p-1 bg-blue-100 rounded">03</span> Dados da Corporação
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input label="Nome da Corporação" register={register('corporacao.nome')} error={errors.corporacao?.nome?.message} />
            </div>
            <Input label="Telefone da Corporação" register={register('corporacao.telefone')} error={errors.corporacao?.telefone?.message} />
            <Input label="Número da Matrícula" register={register('matriculaNumero')} error={errors.matriculaNumero?.message} />
          </div>
        </section>

        {/* Seção 4: Dados na Corporação */}
        <section className="p-6 rounded-lg bg-blue-50">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
            <span className="p-1 bg-blue-100 rounded">04</span> Atuação na Corporação
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

            {subtipoSelecionado === 'INSTRUMENTOS' && (
              <>
                <Input label="Instrumento" register={register('instrumento')} error={errors.instrumento?.message} />
                <Input label="Patrimônio" register={register('patrimonio')} error={errors.patrimonio?.message} />
                <Select
                  label="Origem do Instrumento"
                  register={register('instrumentoOrigem')}
                  error={errors.instrumentoOrigem?.message}
                  options={[
                    { value: 'PROJETO', label: 'Projeto' },
                    { value: 'EMPRESA', label: 'Empresa' }
                  ]}
                />
                <Input label="Data Recebimento" type="date" register={register('instrumentoRecebimento')} error={errors.instrumentoRecebimento?.message as string} />

                {!readOnly && (
                  <div className="flex items-center gap-2 col-span-full">
                    <input
                      type="checkbox"
                      id="chkDevolvido"
                      checked={showDevolucaoDate}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setShowDevolucaoDate(isChecked);
                        if (!isChecked) {
                          setValue('instrumentoDevolucao', null);
                        } else {
                          // Se marcou mas não tem data, coloca a de hoje como sugestão
                          setValue('instrumentoDevolucao', new Date().toISOString().split('T')[0]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="chkDevolvido" className="text-sm font-medium text-gray-700">Marcar como Devolvido</label>
                  </div>
                )}

                {(showDevolucaoDate || (readOnly && watch('instrumentoDevolucao'))) && (
                  <Input label="Data Devolução" type="date" register={register('instrumentoDevolucao')} error={errors.instrumentoDevolucao?.message as string} />
                )}
              </>
            )}

            <Input label="Uniforme" register={register('tamanhoUniforme')} error={errors.tamanhoUniforme?.message} maxLength={3} />
            <Input label="Bota" register={register('tamanhoBota')} error={errors.tamanhoBota?.message} maxLength={3} />
          </div>
          <div className="mt-4">
            <label className="block mb-1 font-medium text-gray-700">Observações</label>
            <textarea
              {...register('observacoes')}
              className="w-full h-24 p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </section>
      </fieldset>

      <div className="flex justify-end gap-4 pt-6 print:hidden">
        {id && (
          <>
            <button type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <Printer size={18} /> Imprimir
            </button>
            {!readOnly && (
              <button type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-2 text-red-600 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={18} /> Excluir
              </button>
            )}
          </>
        )}
        <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100">
          {readOnly ? 'Voltar' : 'Cancelar'}
        </button>
        {!readOnly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-10 py-2 font-bold text-white transition-all transform rounded-lg shadow-md hover:scale-105 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Finalizar Cadastro')}
          </button>
        )}
      </div>
    </form >
  );
};

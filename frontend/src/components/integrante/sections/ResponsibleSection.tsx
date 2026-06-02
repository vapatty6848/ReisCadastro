import React from 'react';
import { Input } from '../../form/Input';

interface ResponsibleSectionProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  readOnly?: boolean;
}

export const ResponsibleSection: React.FC<ResponsibleSectionProps> = ({
  register,
  errors,
  setValue,
  watch,
  readOnly
}) => {
  const handleCopiarTelefoneIntegrante = () => {
    setValue('responsavel.telefone', watch('telefone') || '');
  };

  const handleCopiarEmailIntegrante = () => {
    setValue('responsavel.email', watch('email') || '');
  };

  const handleCopiarEnderecoIntegrante = () => {
    // O CIN do responsável é um dado próprio e não deve ser sobrescrito
    // pela cópia dos dados do integrante.
    setValue('responsavel.rua', watch('rua') || '');
    setValue('responsavel.numero', watch('numero') || '');
    setValue('responsavel.bairro', watch('bairro') || '');
    setValue('responsavel.cep', watch('cep') || '');
  };

  return (
    <section className="p-6 rounded-lg bg-gray-50/50 border border-gray-100">
      <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
        <span className="p-1 bg-blue-100 rounded">04</span> Dados do Responsável
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Input label="Nome do Responsável" register={register('responsavel.nome')} error={errors.responsavel?.nome?.message} readOnly={readOnly} />
        </div>
        <Input label="CIN do Responsável" register={register('responsavel.cin')} error={errors.responsavel?.cin?.message} readOnly={readOnly} />
        <Input label="Parentesco" register={register('responsavel.parentesco')} error={errors.responsavel?.parentesco?.message} readOnly={readOnly} />
        <div className="relative">
          <Input label="Telefone" register={register('responsavel.telefone')} error={errors.responsavel?.telefone?.message} readOnly={readOnly} />
          {!readOnly && (
            <button
              type="button"
              data-testid="btn-copiar-telefone-integrante"
              onClick={handleCopiarTelefoneIntegrante}
              className="absolute right-0 top-0 text-[10px] text-blue-600 hover:underline font-medium"
            >
              Copiar Telefone
            </button>
          )}
        </div>
        <div className="relative">
          <Input label="Email" type="email" register={register('responsavel.email')} error={errors.responsavel?.email?.message} readOnly={readOnly} />
          {!readOnly && (
            <button
              type="button"
              data-testid="btn-copiar-email-integrante"
              onClick={handleCopiarEmailIntegrante}
              className="absolute right-0 top-0 text-[10px] text-blue-600 hover:underline font-medium"
            >
              Copiar Email
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Input label="Rua" register={register('responsavel.rua')} error={errors.responsavel?.rua?.message} readOnly={readOnly} />
          {!readOnly && (
            <button
              type="button"
              data-testid="btn-copiar-endereco-integrante"
              onClick={handleCopiarEnderecoIntegrante}
              className="absolute right-0 top-0 text-[10px] text-blue-600 hover:underline font-medium"
            >
              Copiar Endereço
            </button>
          )}
        </div>
        <Input label="Número" register={register('responsavel.numero')} error={errors.responsavel?.numero?.message} readOnly={readOnly} />
        <Input label="Bairro" register={register('responsavel.bairro')} error={errors.responsavel?.bairro?.message} readOnly={readOnly} />
      </div>
    </section>
  );
};

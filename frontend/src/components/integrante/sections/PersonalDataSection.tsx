import React from 'react';
import { Input } from '../../form/Input';
import { Select } from '../../form/Select';

interface PersonalDataSectionProps {
  register: any;
  errors: any;
  watch?: any;
  readOnly?: boolean;
}

export const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  register,
  errors,
  watch,
  readOnly
}) => {
  const documentoTipo = watch?.('documentoTipo') || 'CPF';

  return (
    <div className="md:col-span-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Nome Completo" register={register('nome')} error={errors.nome?.message} readOnly={readOnly} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              label="Tipo de Documento"
              register={register('documentoTipo')}
              error={errors.documentoTipo?.message}
              disabled={readOnly}
              options={[
                { value: 'CPF', label: 'CPF' },
                { value: 'CIN', label: 'CIN' }
              ]}
            />
          </div>
          <div className="flex-1">
            <Input
              label={documentoTipo === 'CPF' ? 'CPF' : 'CIN'}
              register={register('documento')}
              error={errors.documento?.message}
              readOnly={readOnly}
            />
          </div>
        </div>
        <Input label="Data de Nascimento" type="date" register={register('dataNascimento')} error={errors.dataNascimento?.message as string} readOnly={readOnly} />
        <Input label="Telefone" register={register('telefone')} error={errors.telefone?.message} readOnly={readOnly} />
        <Input label="Email" type="email" register={register('email')} error={errors.email?.message} readOnly={readOnly} />
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Input label="Rua" register={register('rua')} error={errors.rua?.message} readOnly={readOnly} />
        </div>
        <Input label="Número" register={register('numero')} error={errors.numero?.message} readOnly={readOnly} />
        <Input label="Complemento" register={register('complemento')} error={errors.complemento?.message} readOnly={readOnly} />
        <Input label="Bairro" register={register('bairro')} error={errors.bairro?.message} readOnly={readOnly} />
        <Input label="CEP" register={register('cep')} error={errors.cep?.message} readOnly={readOnly} />
      </div>
    </div>
  );
};

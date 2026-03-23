import React from 'react';
import { Input } from '../../form/Input';
import { Select } from '../../form/Select';
import { CorporacaoSelector } from './CorporacaoSelector';

interface CorporationSectionProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  subtipoSelecionado: string;
  showDevolucaoDate: boolean;
  setShowDevolucaoDate: (show: boolean) => void;
  readOnly?: boolean;
}

export const CorporationSection: React.FC<CorporationSectionProps> = ({
  register,
  errors,
  watch,
  setValue,
  subtipoSelecionado,
  showDevolucaoDate,
  setShowDevolucaoDate,
  readOnly
}) => {
  return (
    <>
      <section className="p-6 rounded-lg bg-white border border-gray-100 shadow-sm">
        <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
          <span className="p-1 bg-blue-100 rounded">03</span> Dados da Corporação
        </h3>

        <CorporacaoSelector
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          readOnly={readOnly}
        />

        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
          <Input label="Data de Matrícula" type="date" register={register('dataMatricula')} error={errors.dataMatricula?.message} readOnly={readOnly} />
          <Input label="Número da Matrícula (Auto)" register={register('matriculaNumero')} error={errors.matriculaNumero?.message} readOnly={true} placeholder="Gerado automaticamente" />
        </div>
      </section>

      <section className="p-6 rounded-lg bg-blue-50/50 border border-blue-100">
        <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
          <span className="p-1 bg-blue-100 rounded">04</span> Atuação na Corporação
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            label="Tipo de Integrante"
            register={register('tipoIntegrante')}
            error={errors.tipoIntegrante?.message}
            disabled={readOnly}
            options={[
              { value: 'CORPO_MUSICAL', label: 'Corpo Musical' },
              { value: 'LINHA_FRENTE', label: 'Linha de Frente' },
              { value: 'APOIO', label: 'Apoio' }
            ]}
          />
          {watch('tipoIntegrante') !== 'APOIO' && (
            <Select
              label="Subtipo"
              register={register('subtipoIntegrante')}
              error={errors.subtipoIntegrante?.message}
              disabled={readOnly}
              options={[
                { value: 'INSTRUMENTOS', label: 'Instrumentos' },
                { value: 'COMANDANTE_MOR', label: 'Comandante Mor' },
                { value: 'PAVILHAO_NACIONAL', label: 'Pavilhão Nacional' },
                { value: 'CORPO_COREOGRAFICO', label: 'Corpo Coreográfico' },
                { value: 'BALIZAS', label: 'Balizas' }
              ]}
            />
          )}

          {subtipoSelecionado === 'INSTRUMENTOS' && (
            <>
              <Input label="Instrumento" register={register('instrumento')} error={errors.instrumento?.message} readOnly={readOnly} />
              <Input label="Patrimônio" register={register('patrimonio')} error={errors.patrimonio?.message} readOnly={readOnly} />
              <Select
                label="Origem do Instrumento"
                register={register('instrumentoOrigem')}
                error={errors.instrumentoOrigem?.message}
                disabled={readOnly}
                options={[
                  { value: 'PROJETO', label: 'Projeto' },
                  { value: 'EMPRESA', label: 'Empresa' }
                ]}
              />
              <Input label="Data Recebimento" type="date" register={register('instrumentoRecebimento')} error={errors.instrumentoRecebimento?.message as string} readOnly={readOnly} />

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
                        setValue('instrumentoDevolucao', new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="chkDevolvido" className="text-sm font-medium text-gray-700 cursor-pointer">Marcar como Devolvido</label>
                </div>
              )}

              {(showDevolucaoDate || (readOnly && watch('instrumentoDevolucao'))) && (
                <Input label="Data Devolução" type="date" register={register('instrumentoDevolucao')} error={errors.instrumentoDevolucao?.message as string} readOnly={readOnly} />
              )}
            </>
          )}

          <Input label="Uniforme" register={register('tamanhoUniforme')} error={errors.tamanhoUniforme?.message} maxLength={3} readOnly={readOnly} />
          <Input label="Bota" register={register('tamanhoBota')} error={errors.tamanhoBota?.message} maxLength={3} readOnly={readOnly} />
        </div>
        <div className="mt-4">
          <label className="block mb-1 font-medium text-gray-700">Observações</label>
          <textarea
            {...register('observacoes')}
            readOnly={readOnly}
            className="w-full h-24 p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          />
        </div>
      </section>
    </>
  );
};

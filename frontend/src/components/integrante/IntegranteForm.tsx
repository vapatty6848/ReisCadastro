'use client';

import { useIntegranteForm } from '@/hooks/integrante/useIntegranteForm';
import { PersonalDataSection } from './sections/PersonalDataSection';
import { PhotoUploadSection } from './sections/PhotoUploadSection';
import { ResponsibleSection } from './sections/ResponsibleSection';
import { CorporationSection } from './sections/CorporationSection';
import { FormActions } from './sections/FormActions';
import { ErrorDisplay } from './sections/ErrorDisplay';
import { useRouter } from 'next/navigation';

interface IntegranteFormProps {
  id?: string;
  readOnly?: boolean;
  onSuccess?: () => void;
}

export const IntegranteForm = ({ id, readOnly, onSuccess }: IntegranteFormProps) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    subtipoSelecionado,
    isSubmitting,
    showDevolucaoDate,
    setShowDevolucaoDate,
    isCameraOpen,
    setIsCameraOpen,
    profilePhoto,
    setProfilePhoto,
    selectedFiles,
    setSelectedFiles,
    removeFile,
    handlePrint,
    handleDelete,
  } = useIntegranteForm({ id, readOnly });

  return (
    <form onSubmit={handleSubmit} className="p-4 mx-auto max-w-7xl md:p-8">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Ficha de Cadastro de Integrante</h2>
      </div>

      <ErrorDisplay errors={errors} />

      <fieldset disabled={readOnly} className="space-y-8">
        {/* Seção 01: Dados e Foto */}
        <section className="p-6 rounded-lg bg-gray-50/50 border border-gray-100">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-700">
            <span className="p-1 bg-blue-100 rounded">01</span> Dados do Integrante
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <PersonalDataSection register={register} errors={errors} watch={watch} readOnly={readOnly} />
            <PhotoUploadSection
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              profilePhoto={profilePhoto}
              setProfilePhoto={setProfilePhoto}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              removeFile={removeFile}
              isCameraOpen={isCameraOpen}
              setIsCameraOpen={setIsCameraOpen}
              readOnly={readOnly}
            />
          </div>
        </section>

        <ResponsibleSection
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          readOnly={readOnly}
        />

        <CorporationSection
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          subtipoSelecionado={(subtipoSelecionado || '').toString()}
          showDevolucaoDate={showDevolucaoDate}
          setShowDevolucaoDate={setShowDevolucaoDate}
          readOnly={readOnly}
        />
      </fieldset>

      <FormActions
        id={id}
        readOnly={readOnly}
        isSubmitting={isSubmitting}
        onPrint={handlePrint}
        onDelete={handleDelete}
        onCancel={() => router.back()}
      />
    </form>
  );
};

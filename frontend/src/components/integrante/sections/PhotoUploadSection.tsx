import React from "react";
import { Camera } from "lucide-react";
import { CameraCapture } from "../../form/CameraCapture";
import { getApiUrl } from "@/lib/api";
import Image from "next/image";

interface PhotoUploadSectionProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  profilePhoto: File | null;
  setProfilePhoto: (file: File | null) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[] | ((prev: File[]) => File[])) => void;
  removeFile: (index: number) => void;
  isCameraOpen: boolean;
  setIsCameraOpen: (open: boolean) => void;
  readOnly?: boolean;
}

export const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  register,
  errors,
  watch,
  setValue,
  profilePhoto,
  setProfilePhoto,
  selectedFiles,
  setSelectedFiles,
  removeFile,
  isCameraOpen,
  setIsCameraOpen,
  readOnly,
}) => {
  const fotoPerfilValue = watch('fotoPerfil');
  const existingPhotos: string[] = watch('fotos') || [];

  const removeExistingPhoto = (index: number) => {
    const updated = existingPhotos.filter((_, i) => i !== index);
    setValue('fotos', updated);
  };

  return (
    <div className="md:col-span-1">
      <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          Foto e Documentos
        </label>

        {!readOnly && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex items-center justify-center gap-2 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
              >
                <Camera size={20} /> Capturar Foto
              </button>

              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const filesArray = Array.from(e.target.files);
                      setSelectedFiles((prev) =>
                        [...prev, ...filesArray].slice(0, 5),
                      );
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full gap-2 py-3 text-blue-600 transition-colors border-2 border-blue-100 border-dashed rounded-lg cursor-pointer hover:bg-blue-50"
                >
                  Selecionar Arquivos (Máx 5)
                </label>
              </div>
            </div>

            {profilePhoto && (
              <div className="relative p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="mb-1 text-[10px] font-bold text-blue-600 uppercase">
                  Nova Foto Capturada:
                </p>
                <div className="relative w-full h-40">
                  <Image
                    src={URL.createObjectURL(profilePhoto)}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setProfilePhoto(null)}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-500 shadow-sm hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

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
                <div
                  key={index}
                  className="flex items-center justify-between p-2 text-sm bg-white border border-gray-100 rounded shadow-sm"
                >
                  <span className="truncate max-w-[150px] text-gray-600">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="px-2 font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {selectedFiles.length > 0 && (
                <p className="mt-1 text-[10px] text-right text-gray-500">
                  {selectedFiles.length} de 5 arquivo(s) selecionado(s)
                </p>
              )}

              {existingPhotos.length > 0 && (
                <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="mb-2 text-xs font-semibold text-gray-600 uppercase">
                    Documentos Existentes
                  </p>
                  <ul className="space-y-2">
                    {existingPhotos.map((fileName, index) => (
                      <li
                        key={fileName}
                        className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-md"
                      >
                        <a
                          href={`${getApiUrl()}/uploads/${fileName}`}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate max-w-[160px] text-sm text-blue-600 hover:underline"
                        >
                          {fileName}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(index)}
                          className="px-2 py-1 text-xs font-bold text-red-500 rounded hover:bg-red-50"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {readOnly && fotoPerfilValue && (
          <div className="mt-2">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Foto do Integrante:
            </p>
            <div className="relative w-full h-48 border-2 border-blue-100 rounded-lg shadow-md overflow-hidden">
              <Image
                src={`${getApiUrl()}/uploads/${fotoPerfilValue}`}
                alt="Foto de Perfil"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {!readOnly && fotoPerfilValue && !profilePhoto && (
          <div className="mt-4 opacity-75">
            <p className="mb-1 text-[10px] font-bold text-gray-500 uppercase">
              Foto Atual:
            </p>
            <div className="relative w-24 h-24 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <Image
                src={`${getApiUrl()}/uploads/${watch("foto_perfil")}`}
                alt="Foto Atual"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { integranteSchema, IntegranteData } from "@/schemas";

interface UseIntegranteFormProps {
  id?: string;
  readOnly?: boolean;
}

export function useIntegranteForm({ id, readOnly }: UseIntegranteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDevolucaoDate, setShowDevolucaoDate] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IntegranteData>({
    resolver: zodResolver(integranteSchema),
    mode: "all",
    defaultValues: {
      documentoTipo: "CIN",
    },
  });

  const subtipoSelecionado = watch("subtipoIntegrante");

  const toDateInputValue = (value?: string | null) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (subtipoSelecionado === "INSTRUMENTOS_ROTATIVOS") {
      setValue("patrimonio", "");
      setValue("instrumentoRecebimento", "");
      setValue("instrumentoDevolucao", "");
      setShowDevolucaoDate(false);
      return;
    }

    if (subtipoSelecionado !== "INSTRUMENTOS") {
      setValue("instrumento", "");
      setValue("instrumentoOrigem", null);
      setValue("patrimonio", "");
      setValue("instrumentoRecebimento", "");
      setValue("instrumentoDevolucao", "");
      setShowDevolucaoDate(false);
    }
  }, [subtipoSelecionado, setValue]);

  useEffect(() => {
    if (id) {
      api.get(`/api/integrantes/${id}`).then((response) => {
        const data = response.data;
        const formattedData = {
          ...data,
          dataNascimento: toDateInputValue(data.dataNascimento),
          dataMatricula: toDateInputValue(data.dataMatricula),
          instrumentoRecebimento: toDateInputValue(data.instrumentoRecebimento),
          instrumentoDevolucao: toDateInputValue(data.instrumentoDevolucao),
        };
        if (data.instrumentoDevolucao) {
          setShowDevolucaoDate(true);
        }
        reset(formattedData);
        setValue("dataNascimento", formattedData.dataNascimento || "");
        setValue("dataMatricula", formattedData.dataMatricula || "");
        setValue(
          "instrumentoRecebimento",
          formattedData.instrumentoRecebimento || "",
        );
        setValue(
          "instrumentoDevolucao",
          formattedData.instrumentoDevolucao || "",
        );
      });
    }
  }, [id, reset, setValue]);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Tem certeza que deseja excluir este integrante?")) {
      try {
        await api.delete(`/api/integrantes/${id}`);
        router.push("/dashboard/integrantes");
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir integrante.");
      }
    }
  };

  const onSubmit = async (data: IntegranteData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      if (profilePhoto) {
        formData.append("fotoPerfil", profilePhoto);
      }

      selectedFiles.forEach((file) => {
        formData.append("fotos", file);
      });

      if (id) {
        await api.patch(`/api/integrantes/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Integrante atualizado com sucesso!");
      } else {
        await api.post("/api/integrantes", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Integrante cadastrado com sucesso!");
      }
      router.push("/dashboard/integrantes");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar integrante.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
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
  };
}

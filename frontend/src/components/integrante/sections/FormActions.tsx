import React from 'react';
import { Printer, Trash2 } from 'lucide-react';

interface FormActionsProps {
  id?: string;
  readOnly?: boolean;
  isSubmitting: boolean;
  onPrint: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  id,
  readOnly,
  isSubmitting,
  onPrint,
  onDelete,
  onCancel
}) => {
  return (
    <div className="flex justify-end gap-4 pt-6 print:hidden">
      {id && (
        <>
          <button type="button"
            onClick={onPrint}
            className="flex items-center gap-2 px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <Printer size={18} /> Imprimir
          </button>
          {!readOnly && (
            <button type="button"
              onClick={onDelete}
              className="flex items-center gap-2 px-6 py-2 text-red-600 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={18} /> Excluir
            </button>
          )}
        </>
      )}
      <button type="button" onClick={onCancel} className="px-6 py-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100">
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
  );
};

import React from 'react';

interface ErrorDisplayProps {
  errors: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  const getErrorMessages = (errors: any) => {
    const messages: string[] = [];

    // Mapeamento amigável para os caminhos de erro
    const fieldLabels: Record<string, string> = {
      'nome': 'Nome',
      'cpf': 'CPF',
      'dataNascimento': 'Data de Nascimento',
      'telefone': 'Telefone',
      'email': 'Email',
      'rg': 'RG',
      'rua': 'Rua',
      'numero': 'Número',
      'bairro': 'Bairro',
      'cep': 'CEP',
      'dataMatricula': 'Data de Matrícula',
      'matriculaNumero': 'Número da Matrícula',
      'tipoIntegrante': 'Tipo de Integrante',
      'subtipoIntegrante': 'Subtipo',
      'instrumento': 'Instrumento',
      'patrimonio': 'Patrimônio',
      'instrumentoOrigem': 'Origem do Instrumento',
      'instrumentoRecebimento': 'Data de Recebimento',
      'tamanhoUniforme': 'Uniforme',
      'tamanhoBota': 'Bota',
      'responsavel.nome': 'Nome do Responsável',
      'responsavel.cpf': 'CPF do Responsável',
      'responsavel.parentesco': 'Parentesco',
      'responsavel.telefone': 'Telefone do Responsável',
      'responsavel.email': 'Email do Responsável',
      'responsavel.rua': 'Rua do Responsável',
      'responsavel.numero': 'Número do Responsável',
      'responsavel.bairro': 'Bairro do Responsável',
      'corporacao.nome': 'Nome da Corporação',
      'corporacao.telefone': 'Telefone da Corporação',
    };

    const traverseErrors = (obj: any, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;

      if (obj.message && typeof obj.message === 'string') {
        messages.push(obj.message);
        return;
      }

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          traverseErrors(obj[key]);
        }
      }
    };

    traverseErrors(errors);
    return messages;
  };

  const errorMessages = getErrorMessages(errors);

  if (errorMessages.length === 0) return null;

  return (
    <div className="p-4 mb-6 border-l-4 border-red-500 rounded-r-lg bg-red-50 print:hidden">
      <h4 className="mb-2 font-bold text-red-800">Por favor, corrija os seguintes erros:</h4>
      <ul className="space-y-1">
        {errorMessages.map((msg, idx) => (
          <li key={idx} className="text-sm text-red-700 font-medium whitespace-pre-wrap">• {msg}</li>
        ))}
      </ul>
    </div>
  );
};

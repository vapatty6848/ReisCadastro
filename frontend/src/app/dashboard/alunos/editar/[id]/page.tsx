'use client';

import { AlunoForm } from '@/components/aluno/AlunoForm';
import { useParams } from 'next/navigation';

export default function EditarAlunoPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-6">
      <AlunoForm id={id} />
    </div>
  );
}

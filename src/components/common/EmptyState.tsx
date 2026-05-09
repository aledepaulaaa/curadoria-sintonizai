import React from 'react';
import { Ghost } from 'lucide-react';

interface EmptyStateProps {
  titulo?: string;
  subtitulo?: string;
  mensagem?: string;
  icone?: React.ReactNode;
  acao?: React.ReactNode;
}

export default function EmptyState({ 
  titulo = 'Nenhum dado encontrado', 
  mensagem = 'Não há registros para exibir no momento.',
  subtitulo = '',
  acao,
  icone = <Ghost className="w-12 h-12 text-zinc-700" />
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
      <div className="mb-4">{icone}</div>
      <h3 className="text-lg font-semibold text-zinc-300">{titulo}</h3>
      {subtitulo && <p className="text-sm text-zinc-500 mt-1 max-w-[280px]">{subtitulo}</p>}
      <p className="text-sm text-zinc-500 mt-1 max-w-[280px]">
        {mensagem}
      </p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

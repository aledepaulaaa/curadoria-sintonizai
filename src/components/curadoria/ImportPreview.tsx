'use client';

import React from 'react';
import type { Evento } from '@/src/types/evento';
import { formatarData } from '@/src/utils/dateUtils';

interface ImportPreviewProps {
  eventos: Evento[];
  onPublicar: () => Promise<void>;
}

export default function ImportPreview({ eventos, onPublicar }: ImportPreviewProps) {
  const [publicando, setPublicando] = React.useState(false);

  const handlePublicar = async () => {
    setPublicando(true);
    try { await onPublicar(); }
    finally { setPublicando(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{eventos.length} eventos prontos para publicação</p>
        <button onClick={handlePublicar} disabled={publicando}
          className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-500 disabled:opacity-50 text-sm">
          {publicando ? 'Publicando...' : '🚀 Publicar Todos'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800 max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400 sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 font-medium">#</th>
              <th className="text-left px-3 py-2 font-medium">Nome</th>
              <th className="text-left px-3 py-2 font-medium">Data</th>
              <th className="text-left px-3 py-2 font-medium">Local</th>
              <th className="text-left px-3 py-2 font-medium">Tipo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {eventos.map((e, i) => (
              <tr key={i} className="hover:bg-zinc-800/50">
                <td className="px-3 py-2 text-zinc-500">{i + 1}</td>
                <td className="px-3 py-2 text-white max-w-[200px] truncate">{e.nome}</td>
                <td className="px-3 py-2 text-zinc-400">{formatarData(e.dataInicio)}</td>
                <td className="px-3 py-2 text-zinc-400">{e.local?.nome}</td>
                <td className="px-3 py-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs">{e.tipo_evento || '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

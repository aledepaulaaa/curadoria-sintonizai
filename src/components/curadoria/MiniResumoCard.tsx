'use client';

import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { MiniResumoCardProps } from '@/src/types/resumoColeta';

export default function MiniResumoCard({ 
  resumo, 
  onAprovarTodos, 
  aprovandoLote,
  compacto = false 
}: MiniResumoCardProps) {
  return (
    <div className="p-5 bg-gradient-to-br from-purple-900/20 via-zinc-900 to-purple-950/30 border border-purple-500/30 rounded-3xl space-y-3 shadow-md">
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
            📊 Mini-Resumo da Coleta Automatizada
          </h4>
          <span className="text-[10px] font-bold text-purple-300/80 bg-purple-900/50 px-2.5 py-0.5 rounded-full">
            📅 {resumo.dataHora}
          </span>
        </div>

        <button
          onClick={onAprovarTodos}
          disabled={aprovandoLote || resumo.totalEncontrados === 0}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {aprovandoLote ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Aprovar Todos os Eventos ({resumo.totalEncontrados})
        </button>
      </div>

      <div className={`grid grid-cols-2 ${compacto ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-2.5 text-xs`}>
        <div className="p-3 bg-white/5 dark:bg-zinc-800/60 rounded-2xl border border-purple-500/10">
          <span className="text-[9px] text-purple-300 font-bold block uppercase tracking-wider">Encontrados</span>
          <span className="text-sm font-black text-emerald-400">{resumo.totalEncontrados} eventos</span>
        </div>

        <div className="p-3 bg-white/5 dark:bg-zinc-800/60 rounded-2xl border border-purple-500/10">
          <span className="text-[9px] text-purple-300 font-bold block uppercase tracking-wider">Cidades - UF Buscadas</span>
          <span className="text-xs font-bold text-zinc-200 truncate block">{resumo.cidades}</span>
        </div>

        <div className="p-3 bg-white/5 dark:bg-zinc-800/60 rounded-2xl border border-purple-500/10">
          <span className="text-[9px] text-purple-300 font-bold block uppercase tracking-wider">Tipos de Eventos</span>
          <span className="text-xs font-bold text-zinc-200 truncate block capitalize">{resumo.tipos}</span>
        </div>

        <div className="p-3 bg-white/5 dark:bg-zinc-800/60 rounded-2xl border border-purple-500/10">
          <span className="text-[9px] text-purple-300 font-bold block uppercase tracking-wider">Fontes Consultadas</span>
          <span className="text-xs font-bold text-zinc-200 truncate block">{resumo.fontes}</span>
        </div>

        <div className="p-3 bg-white/5 dark:bg-zinc-800/60 rounded-2xl border border-purple-500/10">
          <span className="text-[9px] text-purple-300 font-bold block uppercase tracking-wider">Tempo Gasto</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            ⏱️ {resumo.tempoGasto}
          </span>
        </div>

        <div className="p-3 bg-white/5 dark:bg-zinc-800/60 rounded-2xl border border-purple-500/10">
          <span className="text-[9px] text-purple-300 font-bold block uppercase tracking-wider">Fila de Curadoria</span>
          <span className="text-xs font-bold text-amber-400 uppercase">Pendente de Aprovação</span>
        </div>
      </div>
    </div>
  );
}

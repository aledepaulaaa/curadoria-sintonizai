'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import type { ColetaStatusFooterProps } from '@/src/types/resumoColeta';

export default function ColetaStatusFooter({
  coletaEmAndamento,
  tempoDecorridoSegundos,
  formatarRelogio,
  resumo,
  onOpenResumoModal,
  onAprovarTodos,
  aprovandoLote,
}: ColetaStatusFooterProps) {
  // Se não estiver coletando e não tiver resumo pendente, não exibe o rodapé
  if (!coletaEmAndamento && !resumo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 left-4 md:left-80 z-[90] p-3.5 bg-zinc-950/90 dark:bg-zinc-900/95 backdrop-blur-xl border border-purple-500/40 rounded-3xl shadow-2xl flex items-center justify-between flex-wrap gap-3"
    >
      <div className="flex items-center gap-3">
        {coletaEmAndamento ? (
          <div className="w-9 h-9 bg-purple-600/30 rounded-2xl flex items-center justify-center text-purple-400 animate-spin">
            <Loader2 size={18} />
          </div>
        ) : (
          <div className="w-9 h-9 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${coletaEmAndamento ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
            <h4 className="text-xs font-black uppercase text-white tracking-wider">
              {coletaEmAndamento ? 'Robôs em Execução...' : 'Coleta Concluída (Revisão Pendente)'}
            </h4>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            {resumo ? `${resumo.totalEncontrados} eventos encontrados • ${resumo.cidades}` : 'Raspando Sympla & Instagram...'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Relógio Digital */}
        {coletaEmAndamento && (
          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-2xl border border-purple-500/30 font-mono text-xs font-black text-emerald-400">
            <Clock size={14} />
            <span>{formatarRelogio(tempoDecorridoSegundos)}</span>
          </div>
        )}

        {/* Botão Ver Resumo (Abre Modal no Mobile/Desktop) */}
        {resumo && (
          <button
            onClick={onOpenResumoModal}
            className="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <BarChart3 size={14} />
            <span>Ver Resumo</span>
          </button>
        )}

        {/* Botão Aprovar Todos */}
        {resumo && (
          <button
            onClick={onAprovarTodos}
            disabled={aprovandoLote || resumo.totalEncontrados === 0}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {aprovandoLote ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            <span>Aprovar Todos ({resumo.totalEncontrados})</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

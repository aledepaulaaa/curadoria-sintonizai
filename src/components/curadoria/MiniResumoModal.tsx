'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { MiniResumoModalProps } from '@/src/types/resumoColeta';
import MiniResumoCard from './MiniResumoCard';

export default function MiniResumoModal({
  isOpen,
  onClose,
  resumo,
  onAprovarTodos,
  aprovandoLote,
}: MiniResumoModalProps) {
  if (!isOpen || !resumo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 overflow-hidden"
        >
          {/* Top Bar / Close Button */}
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400 animate-pulse" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Resumo da Coleta Automatizada
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mini-Resumo Body */}
          <MiniResumoCard
            resumo={resumo}
            onAprovarTodos={() => {
              onAprovarTodos();
              onClose();
            }}
            aprovandoLote={aprovandoLote}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

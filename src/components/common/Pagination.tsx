'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagina: number;
  totalPaginas: number;
  onPaginaChange: (novaPagina: number) => void;
}

export default function Pagination({ pagina, totalPaginas, onPaginaChange }: PaginationProps) {
  const total = Math.max(1, totalPaginas);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
        Página <span className="text-zinc-900 dark:text-white">{pagina + 1}</span> de <span className="text-zinc-900 dark:text-white">{total}</span>
      </p>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPaginaChange(Math.max(0, pagina - 1))}
          disabled={pagina === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all font-bold text-sm shadow-sm"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </button>
        
        <div className="flex items-center gap-1">
          {/* Mobile indicator */}
          <div className="sm:hidden px-3 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20">
            {pagina + 1}
          </div>
          
          {/* Desktop dots/pages could be added here if needed, but simple is better for now */}
        </div>

        <button
          onClick={() => onPaginaChange(Math.min(total - 1, pagina + 1))}
          disabled={pagina >= total - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all font-bold text-sm shadow-sm"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

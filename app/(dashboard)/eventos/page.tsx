'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEventos } from '@/src/hooks/useEventos';
import { formatarData } from '@/src/utils/dateUtils';
import type { Evento } from '@/src/types/evento';
import { Eye, Edit2, Trash2, Download, CheckSquare, Square, X } from 'lucide-react';
import ConfirmModal from '@/src/components/common/ConfirmModal';
import EventDetailModal from '@/src/components/eventos/EventDetailModal';
import { exportToJson, exportToCsv } from '@/src/utils/exportUtils';

export default function EventosPage() {
  const { eventos, carregando, deletar, deletarBatch } = useEventos();
  const [busca, setBusca] = React.useState('');
  const [pagina, setPagina] = React.useState(0);
  const [itensPorPagina, setItensPorPagina] = React.useState(250);
  const [confirmarExcluir, setConfirmarExcluir] = React.useState<string | null>(null);
  const [confirmarExcluirLote, setConfirmarExcluirLote] = React.useState(false);
  const [eventoSelecionado, setEventoSelecionado] = React.useState<Evento | null>(null);
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set());

  const filtrados = React.useMemo(() => {
    if (!busca.trim()) return eventos;
    const q = busca.toLowerCase();
    return eventos.filter((e) =>
      e.nome.toLowerCase().includes(q) ||
      (e.local?.nome || '').toLowerCase().includes(q) ||
      (e.tipo_evento || '').toLowerCase().includes(q)
    );
  }, [eventos, busca]);

  const paginados = filtrados.slice(pagina * itensPorPagina, (pagina + 1) * itensPorPagina);
  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);

  const toggleSelecionarTudo = () => {
    if (selecionados.size === paginados.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(paginados.map(e => e.id!)));
    }
  };

  const toggleSelecionar = (id: string) => {
    const novo = new Set(selecionados);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setSelecionados(novo);
  };

  const handleExport = (tipo: 'json' | 'csv') => {
    const data = eventos.filter(e => selecionados.has(e.id!));
    if (tipo === 'json') exportToJson(data, 'eventos_export');
    else exportToCsv(data, 'eventos_export');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eventos ({filtrados.length})</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <input
          type="text" 
          value={busca} 
          onChange={(e) => { setBusca(e.target.value); setPagina(0); }}
          placeholder="Buscar por nome, local ou tipo..."
          className="w-full max-w-md px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
        
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Exibir</span>
          <select 
            value={itensPorPagina} 
            onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPagina(0); }}
            className="bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
          >
            {[20, 50, 100, 250, 500].map(n => (
              <option key={n} value={n} className="bg-white dark:bg-zinc-900">{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Barra de Ações em Massa */}
      {selecionados.size > 0 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200"
        >
          <span className="text-sm font-bold">{selecionados.size} selecionados</span>
          <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300 mx-2" />
          <div className="flex gap-2">
            <button onClick={() => handleExport('json')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg transition-colors text-xs font-bold">
              <Download size={14} /> JSON
            </button>
            <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg transition-colors text-xs font-bold">
              <Download size={14} /> CSV
            </button>
            <button 
              onClick={() => setConfirmarExcluirLote(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-bold"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
          <button onClick={() => setSelecionados(new Set())} className="p-1 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {carregando ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-zinc-800 rounded-xl animate-pulse border border-zinc-100 dark:border-zinc-800" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-center w-10">
                  <button onClick={toggleSelecionarTudo} className="text-zinc-400 hover:text-purple-500 transition-colors">
                    {selecionados.size === paginados.length ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold">Nome</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Local</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold">Data</th>
                <th className="text-center px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginados.map((e) => (
                <tr key={e.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group ${selecionados.has(e.id!) ? 'bg-purple-50/50 dark:bg-purple-500/5' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleSelecionar(e.id!)} className={`transition-colors ${selecionados.has(e.id!) ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-300 dark:text-zinc-700 hover:text-purple-500'}`}>
                      {selecionados.has(e.id!) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium max-w-[240px] truncate">{e.nome}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">{e.local?.nome}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium border border-purple-200 dark:border-purple-500/20">{e.tipo_evento || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{formatarData(e.dataInicio)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEventoSelecionado(e)}
                        className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => setEventoSelecionado(e)}
                        className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-blue-500 dark:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setConfirmarExcluir(e.id || '')} 
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPagina(Math.max(0, pagina - 1))} disabled={pagina === 0}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-bold">←</button>
          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{pagina + 1} / {totalPaginas}</span>
          <button onClick={() => setPagina(Math.min(totalPaginas - 1, pagina + 1))} disabled={pagina >= totalPaginas - 1}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-bold">→</button>
        </div>
      )}

      <EventDetailModal
        isOpen={!!eventoSelecionado}
        onClose={() => setEventoSelecionado(null)}
        evento={eventoSelecionado}
      />

      <ConfirmModal
        isOpen={!!confirmarExcluir}
        onClose={() => setConfirmarExcluir(null)}
        onConfirm={() => confirmarExcluir && deletar(confirmarExcluir)}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
      />
      <ConfirmModal
        isOpen={confirmarExcluirLote}
        onClose={() => setConfirmarExcluirLote(false)}
        onConfirm={async () => {
          await deletarBatch(Array.from(selecionados));
          setSelecionados(new Set());
          setConfirmarExcluirLote(false);
        }}
        title="Excluir em Massa"
        message={`Tem certeza que deseja excluir os ${selecionados.size} eventos selecionados? Esta ação não pode ser desfeita.`}
      />
    </motion.div>
  );
}

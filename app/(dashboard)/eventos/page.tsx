'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEventos } from '@/src/hooks/useEventos';
import { formatarData } from '@/src/utils/dateUtils';
import type { Evento } from '@/src/types/evento';
import { Eye, Edit2, Trash2, Download, CheckSquare, Square, X } from 'lucide-react';
import ConfirmModal from '@/src/components/common/ConfirmModal';
import EventDetailModal from '@/src/components/eventos/EventDetailModal';
import Pagination from '@/src/components/common/Pagination';
import { exportToJson, exportToCsv } from '@/src/utils/exportUtils';

export default function EventosPage() {
  const { eventos, carregando, carregar, deletar, deletarBatch } = useEventos();
  const [busca, setBusca] = React.useState('');
  const [pagina, setPagina] = React.useState(0);
  const [itensPorPagina, setItensPorPagina] = React.useState(250);
  const [confirmarExcluir, setConfirmarExcluir] = React.useState<string | null>(null);
  const [confirmarExcluirLote, setConfirmarExcluirLote] = React.useState(false);
  const [eventoSelecionado, setEventoSelecionado] = React.useState<Evento | null>(null);
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set());
  const [filtroQualidade, setFiltroQualidade] = React.useState<'todos' | 'imagem' | 'texto' | 'caracteres'>('todos');

  const [ordem, setOrdem] = React.useState<{ col: string; desc: boolean }>({ col: 'dataInicio', desc: false });

  const handleToggleOrdem = (col: string) => {
    setOrdem(prev => ({
      col,
      desc: prev.col === col ? !prev.desc : true
    }));
  };

  const filtrados = React.useMemo(() => {
    let result = [...eventos];
    
    // Filtro de Qualidade
    if (filtroQualidade === 'imagem') {
      result = result.filter(e => 
        !e.imagemUrl || 
        (!e.imagemUrl.includes('firebasestorage.googleapis.com') && !e.imagemUrl.includes('storage.googleapis.com'))
      );
    } else if (filtroQualidade === 'texto') {
      result = result.filter(e => 
        !e.nome || e.nome.length < 5 || 
        !e.descricao || e.descricao.length < 20
      );
    } else if (filtroQualidade === 'caracteres') {
      const regexInvalido = /[^\x20-\x7E\u00A0-\u00FF\u2010-\u201F]/;
      result = result.filter(e => 
        regexInvalido.test(e.nome) || regexInvalido.test(e.descricao || '')
      );
    }

    // Filtro Global
    if (busca.trim()) {
      const q = busca.toLowerCase();
      result = result.filter((e) =>
        e.nome.toLowerCase().includes(q) ||
        (e.local?.nome || '').toLowerCase().includes(q) ||
        (e.tipo_evento || '').toLowerCase().includes(q)
      );
    }

    // Ordenação
    result.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (ordem.col === 'nome') { valA = a.nome; valB = b.nome; }
      else if (ordem.col === 'local') { valA = a.local?.nome || ''; valB = b.local?.nome || ''; }
      else if (ordem.col === 'tipo') { valA = a.tipo_evento || ''; valB = b.tipo_evento || ''; }
      else if (ordem.col === 'data') { valA = a.dataInicio; valB = b.dataInicio; }

      if (valA < valB) return ordem.desc ? 1 : -1;
      if (valA > valB) return ordem.desc ? -1 : 1;
      return 0;
    });

    return result;
  }, [eventos, busca, ordem, filtroQualidade]);

  // Métricas de Qualidade
  const metricas = React.useMemo(() => {
    const comErroImagem = eventos.filter(e => 
      !e.imagemUrl || 
      (!e.imagemUrl.includes('firebasestorage.googleapis.com') && !e.imagemUrl.includes('storage.googleapis.com'))
    ).length;

    const comErroTexto = eventos.filter(e => 
      !e.nome || e.nome.length < 5 || 
      !e.descricao || e.descricao.length < 20
    ).length;

    const regexInvalido = /[^\x20-\x7E\u00A0-\u00FF\u2010-\u201F]/;
    const comErroCaracteres = eventos.filter(e => 
      regexInvalido.test(e.nome) || regexInvalido.test(e.descricao || '')
    ).length;

    return { total: eventos.length, comErroImagem, comErroTexto, comErroCaracteres };
  }, [eventos]);

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

  const renderSortIcon = (col: string) => {
    if (ordem.col !== col) return <Download size={14} className="opacity-20 rotate-180" />;
    return ordem.desc ? <Download size={14} className="text-purple-500" /> : <Download size={14} className="text-purple-500 rotate-180" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Eventos</h1>
          <button 
            onClick={() => carregar(true)} 
            disabled={carregando}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-all disabled:opacity-50"
            title="Recarregar do servidor"
          >
            <Download size={18} className={carregando ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Indicadores de Qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setFiltroQualidade('todos')}
          className={`p-4 rounded-2xl border transition-all text-left ${filtroQualidade === 'todos' ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-purple-500'}`}
        >
          <p className={`text-xs font-black uppercase tracking-widest ${filtroQualidade === 'todos' ? 'text-purple-200' : 'text-zinc-400'}`}>Total de Eventos</p>
          <p className="text-2xl font-bold">{metricas.total}</p>
        </button>

        <button 
          onClick={() => setFiltroQualidade('imagem')}
          className={`p-4 rounded-2xl border transition-all text-left ${filtroQualidade === 'imagem' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-red-500'}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-black uppercase tracking-widest ${filtroQualidade === 'imagem' ? 'text-red-200' : 'text-zinc-400'}`}>Ajuste de Imagem</p>
            {metricas.comErroImagem > 0 && <span className="flex h-2 w-2 rounded-full bg-red-400 animate-pulse" />}
          </div>
          <p className="text-2xl font-bold">{metricas.comErroImagem}</p>
        </button>

        <button 
          onClick={() => setFiltroQualidade('texto')}
          className={`p-4 rounded-2xl border transition-all text-left ${filtroQualidade === 'texto' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-amber-500'}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-black uppercase tracking-widest ${filtroQualidade === 'texto' ? 'text-amber-200' : 'text-zinc-400'}`}>Ajuste de Conteúdo</p>
            {metricas.comErroTexto > 0 && <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
          </div>
          <p className="text-2xl font-bold">{metricas.comErroTexto}</p>
        </button>

        <button 
          onClick={() => setFiltroQualidade('caracteres')}
          className={`p-4 rounded-2xl border transition-all text-left ${filtroQualidade === 'caracteres' ? 'bg-zinc-600 border-zinc-600 text-white shadow-lg shadow-zinc-500/20' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-500'}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-black uppercase tracking-widest ${filtroQualidade === 'caracteres' ? 'text-zinc-200' : 'text-zinc-400'}`}>Caracteres Inválidos</p>
            {metricas.comErroCaracteres > 0 && <span className="flex h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />}
          </div>
          <p className="text-2xl font-bold">{metricas.comErroCaracteres}</p>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text" 
            value={busca} 
            onChange={(e) => { setBusca(e.target.value); setPagina(0); }}
            placeholder="Buscar por nome, local ou tipo..."
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />
          {busca && (
            <button 
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-zinc-400"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
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
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-center w-10">
                  <button onClick={toggleSelecionarTudo} className="text-zinc-400 hover:text-purple-500 transition-colors">
                    {selecionados.size === paginados.length ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold cursor-pointer hover:text-purple-500 transition-colors" onClick={() => handleToggleOrdem('nome')}>
                  <div className="flex items-center gap-2">Nome {renderSortIcon('nome')}</div>
                </th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell cursor-pointer hover:text-purple-500 transition-colors" onClick={() => handleToggleOrdem('local')}>
                  <div className="flex items-center gap-2">Local {renderSortIcon('local')}</div>
                </th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell cursor-pointer hover:text-purple-500 transition-colors" onClick={() => handleToggleOrdem('tipo')}>
                  <div className="flex items-center gap-2">Tipo {renderSortIcon('tipo')}</div>
                </th>
                <th className="text-left px-4 py-3 font-semibold cursor-pointer hover:text-purple-500 transition-colors" onClick={() => handleToggleOrdem('data')}>
                  <div className="flex items-center gap-2">Data {renderSortIcon('data')}</div>
                </th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
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
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                    <button onClick={() => setBusca(e.local?.nome || '')} className="hover:text-purple-500 transition-colors text-left">{e.local?.nome}</button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {e.tipo_evento ? (
                      <button 
                        onClick={() => setBusca(e.tipo_evento || '')}
                        className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium border border-purple-200 dark:border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                      >
                        {e.tipo_evento}
                      </button>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{formatarData(e.dataInicio)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(!e.imagemUrl || (!e.imagemUrl.includes('firebasestorage.googleapis.com') && !e.imagemUrl.includes('storage.googleapis.com'))) && (
                        <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-black uppercase border border-red-500/20" title="Imagem externa ou ausente">Imagem</span>
                      )}
                      {(!e.nome || e.nome.length < 5 || !e.descricao || e.descricao.length < 20) && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase border border-amber-500/20" title="Conteúdo incompleto">Texto</span>
                      )}
                      {(/[^\x20-\x7E\u00A0-\u00FF\u2010-\u201F]/.test(e.nome) || /[^\x20-\x7E\u00A0-\u00FF\u2010-\u201F]/.test(e.descricao || '')) && (
                        <span className="px-1.5 py-0.5 rounded-md bg-zinc-500/10 text-zinc-500 text-[10px] font-black uppercase border border-zinc-500/20" title="Caracteres especiais/inválidos">Caracteres</span>
                      )}
                      {(e.imagemUrl && (e.imagemUrl.includes('firebasestorage.googleapis.com') || e.imagemUrl.includes('storage.googleapis.com')) && e.nome && e.nome.length >= 5 && e.descricao && e.descricao.length >= 20 && !/[^\x20-\x7E\u00A0-\u00FF\u2010-\u201F]/.test(e.nome) && !/[^\x20-\x7E\u00A0-\u00FF\u2010-\u201F]/.test(e.descricao || '')) && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">OK</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

      <Pagination 
        pagina={pagina} 
        totalPaginas={totalPaginas} 
        onPaginaChange={setPagina} 
      />

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

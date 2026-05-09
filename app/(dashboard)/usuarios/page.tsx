'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { excluirUsuario, listarUsuarios } from '@/src/actions/usuarios/usuariosActions';
import type { Usuario } from '@/src/types/usuario';
import { Edit2, Search, UserCheck, X, Trash2, Eye, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import UserDetailModal from '@/src/components/usuarios/UserDetailModal';
import Pagination from '@/src/components/common/Pagination';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [busca, setBusca] = React.useState('');
  const [pagina, setPagina] = React.useState(0);
  const [itensPorPagina, setItensPorPagina] = React.useState(250);
  const [usuarioSelecionado, setUsuarioSelecionado] = React.useState<Usuario | null>(null);

  const [ordem, setOrdem] = React.useState<{ col: string; desc: boolean }>({ col: 'nome', desc: false });

  const handleToggleOrdem = (col: string) => {
    setOrdem(prev => ({
      col,
      desc: prev.col === col ? !prev.desc : true
    }));
  };

  const carregar = React.useCallback(() => {
    setCarregando(true);
    listarUsuarios().then(setUsuarios).finally(() => setCarregando(false));
  }, []);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) {
      try {
        await excluirUsuario(id);
        carregar();
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const calcularIdade = (dataNasc?: string) => {
    if (!dataNasc) return '—';
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const filtrados = React.useMemo(() => {
    let result = [...usuarios];
    
    // Filtro Global
    if (busca.trim()) {
      const q = busca.toLowerCase();
      result = result.filter(u => 
        (u.nome || '').toLowerCase().includes(q) || 
        (u.email || '').toLowerCase().includes(q) ||
        (u.vibe || '').toLowerCase().includes(q)
      );
    }

    // Ordenação
    result.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (ordem.col === 'nome') { valA = a.nome || ''; valB = b.nome || ''; }
      else if (ordem.col === 'vibe') { valA = a.vibe || ''; valB = b.vibe || ''; }

      if (valA < valB) return ordem.desc ? 1 : -1;
      if (valA > valB) return ordem.desc ? -1 : 1;
      return 0;
    });

    return result;
  }, [usuarios, busca, ordem]);

  const paginados = React.useMemo(() => {
    return filtrados.slice(pagina * itensPorPagina, (pagina + 1) * itensPorPagina);
  }, [filtrados, pagina, itensPorPagina]);

  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);

  const renderSortIcon = (col: string) => {
    if (ordem.col !== col) return <ChevronUp size={14} className="opacity-20" />;
    return ordem.desc ? <ChevronDown size={14} className="text-purple-500" /> : <ChevronUp size={14} className="text-purple-500" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Usuários ({filtrados.length})</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
          <input 
            value={busca} 
            onChange={(e) => { setBusca(e.target.value); setPagina(0); }}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
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

      {carregando ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-white dark:bg-zinc-800 rounded-xl animate-pulse border border-zinc-100 dark:border-zinc-800" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-purple-500 transition-colors" onClick={() => handleToggleOrdem('nome')}>
                  <div className="flex items-center gap-2">Usuário {renderSortIcon('nome')}</div>
                </th>
                <th className="px-4 py-3 font-semibold">Idade</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell cursor-pointer hover:text-purple-500 transition-colors" onClick={() => handleToggleOrdem('vibe')}>
                  <div className="flex items-center gap-2">Vibe {renderSortIcon('vibe')}</div>
                </th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Telefone</th>
                <th className="text-right px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
              {paginados.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                          <UserCheck size={20} />
                       </div>
                       <div>
                          <p className="font-bold text-zinc-900 dark:text-white leading-none mb-1">{u.nome || 'Sem Nome'}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold">
                      <Calendar size={14} className="text-purple-500" />
                      {calcularIdade(u.dataNascimento)}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <button 
                      onClick={() => setBusca(u.vibe || '')}
                      className="px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                    >
                       {u.vibe || '—'}
                    </button>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-xs font-medium">{u.telefone || '—'}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setUsuarioSelecionado(u)}
                        className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-purple-500 transition-colors"
                        title="Visualizar Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleExcluir(u.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={18} />
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

      <UserDetailModal 
        user={usuarioSelecionado} 
        isOpen={!!usuarioSelecionado} 
        onClose={() => setUsuarioSelecionado(null)} 
        onUpdate={carregar}
      />
    </motion.div>
  );
}

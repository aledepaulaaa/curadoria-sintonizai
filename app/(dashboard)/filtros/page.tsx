'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  listarFiltros, salvarFiltros, inicializarFiltrosPadrao, removerGrupoFiltro
} from '@/src/actions/filtros/filtrosActions';
import { 
  Plus, Trash2, Save, RefreshCw, 
  Settings2, Info, CheckCircle2, Loader2, Edit3, GripVertical
} from 'lucide-react';

export default function FiltrosPage() {
  const [filtros, setFiltros] = React.useState<any[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [salvando, setSalvando] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      const data = await listarFiltros();
      if (data.length === 0) {
        await inicializarFiltrosPadrao();
        const first = await listarFiltros();
        setFiltros(first);
      } else {
        setFiltros(data);
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const handleAddItem = (grupoId: string) => {
    const nome = prompt('Nome do novo item:');
    if (!nome) return;
    setFiltros(prev => prev.map(g => 
      g.id === grupoId ? { ...g, itens: [...g.itens, nome] } : g
    ));
  };

  const handleRemoveItem = (grupoId: string, index: number) => {
    setFiltros(prev => prev.map(g => {
      if (g.id === grupoId) {
        const novo = [...g.itens];
        novo.splice(index, 1);
        return { ...g, itens: novo };
      }
      return g;
    }));
  };

  const handleRenameGroup = (grupoId: string) => {
    const grupo = filtros.find(g => g.id === grupoId);
    const novoNome = prompt('Novo nome para o grupo:', grupo.label);
    if (!novoNome) return;
    setFiltros(prev => prev.map(g => 
      g.id === grupoId ? { ...g, label: novoNome } : g
    ));
  };

  const handleCreateGroup = () => {
    const nome = prompt('Nome do novo grupo de filtros:');
    if (!nome) return;
    const id = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    const novoGrupo = {
      id,
      label: nome,
      itens: [],
      icone: '✨',
      ordem: filtros.length + 1
    };
    setFiltros(prev => [...prev, novoGrupo]);
  };

  const handleRemoveGroup = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo? Isso afetará a filtragem no app.')) return;
    try {
      await removerGrupoFiltro(id);
      setFiltros(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      alert('Erro ao excluir grupo');
    }
  };

  const handleSalvar = async (grupo: any) => {
    setSalvando(grupo.id);
    try {
      const { id, ...data } = grupo;
      await salvarFiltros(id, data);
      alert(`Grupo "${grupo.label}" salvo com sucesso!`);
    } finally {
      setSalvando(null);
    }
  };

  if (carregando) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={48} className="animate-spin text-purple-600" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Gestão de Filtros</h1>
          <p className="text-sm text-zinc-500 font-medium">Configure as opções de filtragem que aparecem no App Mobile.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleCreateGroup}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 dark:shadow-none"
          >
            <Plus size={20} />
            Novo Grupo
          </button>
          <button onClick={carregar} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 transition-colors">
            <RefreshCw size={20} className={carregando ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 p-6 rounded-[2.5rem] flex gap-4 items-start">
         <Info className="text-purple-600 shrink-0" size={24} />
         <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong>Importante:</strong> As alterações feitas aqui refletirão instantaneamente no aplicativo dos usuários. 
            Evite remover categorias que já possuem muitos eventos vinculados para não quebrar a filtragem existente.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtros.map((grupo) => (
          <div key={grupo.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl shadow-zinc-100 dark:shadow-none relative group/card">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <span className="text-2xl">{grupo.icone}</span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{grupo.label}</h2>
                    <button onClick={() => handleRenameGroup(grupo.id)} className="text-zinc-400 hover:text-purple-600 transition-colors">
                      <Edit3 size={14} />
                    </button>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleRemoveGroup(grupo.id)}
                   className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center opacity-0 group-hover/card:opacity-100 hover:scale-105 transition-all"
                 >
                   <Trash2 size={18} />
                 </button>
                 <button 
                   onClick={() => handleAddItem(grupo.id)}
                   className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                 >
                   <Plus size={20} />
                 </button>
               </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 min-h-[100px] content-start">
               {grupo.itens?.map((item: string, idx: number) => (
                 <div key={idx} className="group flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{item}</span>
                    <button 
                      onClick={() => handleRemoveItem(grupo.id, idx)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => handleSalvar(grupo)}
              disabled={salvando === grupo.id}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {salvando === grupo.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar Alterações
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  listarCategorias, salvarCategoria, removerCategoria
} from '@/src/actions/categorias/categoriasActions';
import { 
  Plus, Trash2, Save, RefreshCw, Info, Loader2, Edit3, X
} from 'lucide-react';

export default function CategoriasPage() {
  const [grupos, setGrupos] = React.useState<any[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [salvando, setSalvando] = React.useState<string | null>(null);
  const [editados, setEditados] = React.useState<Set<string>>(new Set());

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      const data = await listarCategorias();
      setGrupos(data);
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const handleAddItem = (grupoId: string) => {
    let nome = prompt('Nome da nova categoria:');
    if (!nome) return;
    nome = nome.trim();
    if (!nome) return;

    setGrupos(prev => prev.map(g => {
      if (g.id === grupoId) {
        if (g.itens?.some((i: string) => i.trim().toLowerCase() === nome?.toLowerCase())) {
          alert('Esta categoria já existe neste grupo!');
          return g;
        }
        return { ...g, itens: [...(g.itens || []), nome] };
      }
      return g;
    }));
    setEditados(prev => new Set(prev).add(grupoId));
  };

  const handleRemoveItem = (grupoId: string, index: number) => {
    setGrupos(prev => prev.map(g => {
      if (g.id === grupoId) {
        const novo = [...g.itens];
        novo.splice(index, 1);
        return { ...g, itens: novo };
      }
      return g;
    }));
    setEditados(prev => new Set(prev).add(grupoId));
  };

  const handleRenameGroup = (grupoId: string) => {
    const grupo = grupos.find(g => g.id === grupoId);
    const novoNome = prompt('Novo nome para o grupo de categorias:', grupo.label);
    if (!novoNome) return;
    setGrupos(prev => prev.map(g => 
      g.id === grupoId ? { ...g, label: novoNome } : g
    ));
    setEditados(prev => new Set(prev).add(grupoId));
  };

  const handleCreateGroup = () => {
    const nome = prompt('Nome do novo grupo de categorias:');
    if (!nome) return;
    const id = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    const novoGrupo = {
      id,
      label: nome,
      itens: [],
      icone: '🎭',
      ordem: grupos.length + 1
    };
    setGrupos(prev => [...prev, novoGrupo]);
  };

  const handleRemoveGroup = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo de categorias? Isso afetará o app.')) return;
    try {
      await removerCategoria(id);
      setGrupos(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      alert('Erro ao excluir grupo');
    }
  };

  const handleSalvar = async (grupo: any) => {
    setSalvando(grupo.id);
    try {
      const { id, ...data } = grupo;
      if (data.itens) {
        data.itens = Array.from(new Set(data.itens.map((i: string) => i.trim()))).filter(Boolean);
      }
      await salvarCategoria(id, data);
      setEditados(prev => {
        const novo = new Set(prev);
        novo.delete(grupo.id);
        return novo;
      });
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
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Gestão de Categorias</h1>
          <p className="text-sm text-zinc-500 font-medium">Configure os grupos de categorias principais e seus itens que aparecem no App Mobile.</p>
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
            <strong>Taxonomia Agrupada:</strong> Agora você pode criar grupos de categorias (ex: "Cultura", "Lazer") para organizar melhor os filtros do app.
            Deixe o estado vazio para começar do zero.
         </p>
      </div>

      {grupos.length === 0 ? (
        <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
          <div className="max-w-xs mx-auto space-y-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">📭</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Nenhum grupo definido</h3>
            <p className="text-sm text-zinc-500">Comece criando seu primeiro grupo de categorias para carregar no app.</p>
            <button 
              onClick={handleCreateGroup}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm"
            >
              Criar Agora
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grupos.map((grupo) => (
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
                     className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center md:opacity-0 md:group-hover/card:opacity-100 hover:scale-105 transition-all"
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
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-red-200 dark:hover:border-red-500/30 transition-colors">
                       <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{item}</span>
                       <button 
                         onClick={() => handleRemoveItem(grupo.id, idx)}
                         className="text-zinc-400 hover:text-red-500 transition-colors"
                         title="Remover"
                       >
                         <X size={14} />
                       </button>
                    </div>
                  ))}
               </div>

              <button 
                onClick={() => handleSalvar(grupo)}
                disabled={salvando === grupo.id}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 ${
                  editados.has(grupo.id) 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 animate-pulse' 
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                }`}
              >
                {salvando === grupo.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editados.has(grupo.id) ? 'Confirmar e Salvar' : 'Salvar Alterações'}
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  listarCategorias, salvarCategoria, removerCategoria, inicializarCategoriasPadrao
} from '@/src/actions/categorias/categoriasActions';
import { 
  Plus, Trash2, Save, RefreshCw, 
  Tag, Info, Loader2
} from 'lucide-react';

export default function CategoriasPage() {
  const [categorias, setCategorias] = React.useState<any[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [salvando, setSalvando] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      const data = await listarCategorias();
      if (data.length === 0) {
        await inicializarCategoriasPadrao();
        const first = await listarCategorias();
        setCategorias(first);
      } else {
        setCategorias(data);
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const handleAdd = () => {
    const nome = prompt('Nome da nova categoria:');
    if (!nome) return;
    const id = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    const nova = {
      id,
      label: nome,
      ordem: categorias.length + 1
    };
    setCategorias(prev => [...prev, nova]);
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar eventos existentes.')) return;
    try {
      await removerCategoria(id);
      setCategorias(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert('Erro ao excluir categoria');
    }
  };

  const handleSalvar = async (categoria: any) => {
    setSalvando(categoria.id);
    try {
      const { id, ...data } = categoria;
      await salvarCategoria(id, data);
      alert(`Categoria "${categoria.label}" salva com sucesso!`);
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
          <p className="text-sm text-zinc-500 font-medium">Defina as categorias principais dos eventos (ex: Show, Teatro, etc).</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 dark:shadow-none"
          >
            <Plus size={20} />
            Nova Categoria
          </button>
          <button onClick={carregar} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 transition-colors">
            <RefreshCw size={20} className={carregando ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 p-6 rounded-[2.5rem] flex gap-4 items-start">
         <Info className="text-purple-600 shrink-0" size={24} />
         <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong>Categorias vs Estilos:</strong> Categorias são o "tipo" do evento (ex: Show). Estilos são o "gênero" (ex: Rock). 
            Estas categorias serão usadas pelos curadores na criação de eventos manuais e pela IA.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((cat) => (
          <div key={cat.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl shadow-zinc-100 dark:shadow-none relative group/card">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center">
                    <Tag size={20} />
                  </div>
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{cat.label}</h2>
               </div>
               <button 
                 onClick={() => handleRemove(cat.id)}
                 className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center md:opacity-0 md:group-hover/card:opacity-100 hover:scale-105 transition-all"
               >
                 <Trash2 size={18} />
               </button>
            </div>

            <button 
              onClick={() => handleSalvar(cat)}
              disabled={salvando === cat.id}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {salvando === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar Alterações
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

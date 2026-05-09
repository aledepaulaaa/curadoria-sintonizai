'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  listarEstilos, salvarEstilo, removerEstilo, inicializarEstilosPadrao
} from '@/src/actions/estilos/estilosActions';
import { 
  Plus, Trash2, Save, RefreshCw, 
  Music, Info, Loader2
} from 'lucide-react';

export default function EstilosPage() {
  const [estilos, setEstilos] = React.useState<any[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [salvando, setSalvando] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      const data = await listarEstilos();
      if (data.length === 0) {
        await inicializarEstilosPadrao();
        const first = await listarEstilos();
        setEstilos(first);
      } else {
        setEstilos(data);
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const handleAdd = () => {
    const nome = prompt('Nome do novo Estilo/Ritmo:');
    if (!nome) return;
    const icone = prompt('Emoji para este estilo (opcional):', '🎸');
    const id = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    const novo = {
      id,
      label: nome,
      icone: icone || '🎸',
      ordem: estilos.length + 1
    };
    setEstilos(prev => [...prev, novo]);
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este estilo? Isso afetará a filtragem no app.')) return;
    try {
      await removerEstilo(id);
      setEstilos(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      alert('Erro ao excluir estilo');
    }
  };

  const handleSalvar = async (estilo: any) => {
    setSalvando(estilo.id);
    try {
      const { id, ...data } = estilo;
      await salvarEstilo(id, data);
      alert(`Estilo "${estilo.label}" salvo com sucesso!`);
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
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Gestão de Estilos</h1>
          <p className="text-sm text-zinc-500 font-medium">Configure os ritmos e gêneros musicais (ex: Samba, Rock, MPB).</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 dark:shadow-none"
          >
            <Plus size={20} />
            Novo Estilo
          </button>
          <button onClick={carregar} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 transition-colors">
            <RefreshCw size={20} className={carregando ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 p-6 rounded-[2.5rem] flex gap-4 items-start">
         <Info className="text-purple-600 shrink-0" size={24} />
         <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong>Filtros Dinâmicos:</strong> Os estilos cadastrados aqui serão carregados automaticamente no aplicativo mobile 
            como opções de filtro para os usuários. Use emojis para dar um toque visual aos chips no app.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estilos.map((est) => (
          <div key={est.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl shadow-zinc-100 dark:shadow-none relative group/card">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <span className="text-2xl">{est.icone}</span>
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{est.label}</h2>
               </div>
               <button 
                 onClick={() => handleRemove(est.id)}
                 className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center md:opacity-0 md:group-hover/card:opacity-100 hover:scale-105 transition-all"
               >
                 <Trash2 size={18} />
               </button>
            </div>

            <button 
              onClick={() => handleSalvar(est)}
              disabled={salvando === est.id}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {salvando === est.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar Alterações
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

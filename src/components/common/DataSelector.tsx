'use client';

import React from 'react';
import { db } from '@/src/services/firebaseClient';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Search, Check, X, User, Ticket, Loader2 } from 'lucide-react';

interface DataItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
}

interface DataSelectorProps {
  collectionName: 'usuarios' | 'eventos';
  label: string;
  placeholder: string;
  selectedId?: string;
  onSelect: (item: DataItem | null) => void;
  icon?: React.ReactNode;
}

export default function DataSelector({ 
  collectionName, 
  label, 
  placeholder, 
  selectedId, 
  onSelect,
  icon
}: DataSelectorProps) {
  const [busca, setBusca] = React.useState('');
  const [itens, setItens] = React.useState<DataItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [aberto, setAberto] = React.useState(false);
  const [selecionado, setSelecionado] = React.useState<DataItem | null>(null);

  const buscar = async (val: string) => {
    setLoading(true);
    try {
      const field = collectionName === 'usuarios' ? 'nome' : 'nome'; // Ambos usam 'nome'
      let q;
      
      if (val.length >= 1) {
        q = query(
          collection(db, collectionName),
          where(field, '>=', val),
          where(field, '<=', val + '\uf8ff'),
          limit(8)
        );
      } else {
        q = query(
          collection(db, collectionName),
          limit(8)
        );
      }
      
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.nome || 'Sem Nome',
          subtitle: collectionName === 'usuarios' ? data.email : (data.cidade || data.categoria),
          image: collectionName === 'usuarios' ? (data.fotoPerfil || data.foto) : data.imagemUrl
        };
      }) as DataItem[];
      setItens(list);
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar inicial se já houver um ID selecionado (ex: ao editar)
  React.useEffect(() => {
    if (selectedId && !selecionado) {
       // O ideal seria buscar o item específico pelo ID aqui
       // Para simplificar agora, se o ID mudar externamente e não tivermos o item, resetamos
    }
  }, [selectedId]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (aberto) buscar(busca);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca, aberto]);

  return (
    <div className="relative group">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
        {icon} {label}
      </label>
      
      <div className="relative">
        <div className="absolute left-4 top-3.5 text-zinc-400">
          <Search size={16} />
        </div>
        
        <input 
          type="text"
          value={selecionado ? selecionado.title : busca}
          onChange={(e) => {
            setBusca(e.target.value);
            if (selecionado) {
              setSelecionado(null);
              onSelect(null);
            }
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
        />

        {selecionado ? (
          <button 
            type="button"
            onClick={() => { setSelecionado(null); onSelect(null); setBusca(''); }}
            className="absolute right-3 top-2.5 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-400"
          >
            <X size={14} />
          </button>
        ) : loading ? (
          <div className="absolute right-4 top-3.5 text-purple-500 animate-spin">
            <Loader2 size={16} />
          </div>
        ) : null}
      </div>

      {aberto && !selecionado && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
              {itens.length === 0 && !loading ? (
                <div className="p-6 text-center text-sm text-zinc-500 italic">Nenhum resultado encontrado</div>
              ) : (
                <div className="p-2 space-y-1">
                  {itens.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelecionado(item);
                        onSelect(item);
                        setAberto(false);
                        setBusca('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl text-left transition-all group/item"
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" />
                        ) : (
                          collectionName === 'usuarios' ? <User size={16} className="text-zinc-400" /> : <Ticket size={16} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover/item:text-purple-600 transition-colors">{item.title}</p>
                        {item.subtitle && <p className="text-[10px] text-zinc-500 truncate">{item.subtitle}</p>}
                      </div>
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                         <Check size={14} className="text-purple-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {busca.length === 0 && (
               <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[9px] text-zinc-400 uppercase font-black text-center tracking-widest">Mostrando itens recentes</p>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

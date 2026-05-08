'use client';

import React from 'react';
import { db } from '@/src/services/firebaseClient';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Search, User, Check } from 'lucide-react';

interface UserShort {
  uid: string;
  nome: string;
  email: string;
  foto?: string;
}

interface UserSelectorProps {
  onSelect: (user: UserShort | null) => void;
  selectedUid?: string;
}

export default function UserSelector({ onSelect, selectedUid }: UserSelectorProps) {
  const [busca, setBusca] = React.useState('');
  const [usuarios, setUsuarios] = React.useState<UserShort[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [aberto, setAberto] = React.useState(false);
  const [selecionado, setSelecionado] = React.useState<UserShort | null>(null);

  const buscarUsuarios = async (val: string) => {
    setLoading(true);
    try {
      let q;
      if (val.length >= 1) {
        // Busca por nome
        q = query(
          collection(db, 'usuarios'),
          where('nome', '>=', val),
          where('nome', '<=', val + '\uf8ff'),
          limit(5)
        );
      } else {
        // Lista inicial (recentes ou primeiros)
        q = query(
          collection(db, 'usuarios'),
          limit(5)
        );
      }
      
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        uid: doc.id,
        nome: doc.data().nome || 'Sem Nome',
        email: doc.data().email || '',
        foto: doc.data().fotoPerfil || doc.data().foto
      })) as UserShort[];
      setUsuarios(list);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Carrega iniciais se aberto e busca vazia
    if (aberto && !busca) {
      buscarUsuarios('');
    }
  }, [aberto]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (busca) buscarUsuarios(busca);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca]);

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 mb-1 block">
        Vincular Indicação de Usuário
      </label>
      
      <div className="relative">
        <div className="absolute left-4 top-3.5 text-zinc-400">
          <User size={18} />
        </div>
        <input 
          type="text"
          value={selecionado ? selecionado.nome : busca}
          onChange={(e) => {
            setBusca(e.target.value);
            if (selecionado) {
              setSelecionado(null);
              onSelect(null);
            }
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          placeholder="Buscar usuário por nome..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
        
        {selecionado && (
          <div className="absolute right-4 top-3.5 text-emerald-500">
            <Check size={18} />
          </div>
        )}
      </div>

      {aberto && !selecionado && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-sm text-zinc-500">Buscando...</div>
          ) : usuarios.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">Nenhum usuário encontrado</div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {usuarios.map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => {
                    setSelecionado(u);
                    onSelect(u);
                    setAberto(false);
                    setBusca('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                    {u.foto ? <img src={u.foto} className="w-full h-full object-cover" /> : <User size={16} className="text-zinc-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{u.nome}</p>
                    <p className="text-[10px] text-zinc-500">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { listarPastaStorage } from '@/src/actions/storage/storageActions';
import type { StorageItem } from '@/src/types/common';
import { Image as ImageIcon, X, Loader2, Folder, ChevronRight, Search } from 'lucide-react';

interface GallerySelectorProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function GallerySelector({ onSelect, onClose }: GallerySelectorProps) {
  const [items, setItems] = React.useState<StorageItem[]>([]);
  const [prefix, setPrefix] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [breadcrumb, setBreadcrumb] = React.useState<string[]>([]);
  const [busca, setBusca] = React.useState('');

  const carregar = React.useCallback(async (novoPrefix: string) => {
    setLoading(true);
    try {
      const data = await listarPastaStorage(novoPrefix);
      setItems(data);
      setPrefix(novoPrefix);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { carregar(''); }, [carregar]);

  const navegarPasta = (caminho: string) => {
    setBreadcrumb(prev => [...prev, prefix]);
    carregar(caminho);
  };

  const voltarPasta = () => {
    const anterior = breadcrumb.pop() || '';
    setBreadcrumb([...breadcrumb]);
    carregar(anterior);
  };

  const filtrados = items.filter(i => 
    i.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[80vh] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Escolher da Galeria</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
               <Folder size={10} className="text-purple-500" />
               <span>Raiz</span>
               {breadcrumb.map((b, i) => (
                 <React.Fragment key={i}>
                    <ChevronRight size={10} />
                    <span>{b.split('/').filter(Boolean).pop()}</span>
                 </React.Fragment>
               ))}
               {prefix && (
                 <>
                    <ChevronRight size={10} />
                    <span className="text-purple-600">{prefix.split('/').filter(Boolean).pop()}</span>
                 </>
               )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Busca */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
           <div className="relative">
              <Search className="absolute left-4 top-3 text-zinc-400" size={16} />
              <input 
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar arquivos nesta pasta..."
                className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-zinc-900 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-purple-500"
              />
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {breadcrumb.length > 0 && (
                <button 
                  onClick={voltarPasta}
                  className="aspect-square flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  <Folder size={24} className="text-zinc-400" />
                  <span className="text-[10px] font-black uppercase mt-2">Voltar</span>
                </button>
              )}

              {filtrados.map((item) => (
                <div key={item.caminho} className="relative group">
                  {item.tipo === 'pasta' ? (
                    <button 
                      onClick={() => navegarPasta(item.caminho)}
                      className="w-full aspect-square flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-2xl hover:scale-[1.02] transition-all"
                    >
                      <Folder size={24} className="text-purple-600" />
                      <span className="text-[10px] font-black uppercase mt-2 truncate w-full px-2 text-center">{item.nome}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => item.url && onSelect(item.url)}
                      className="w-full aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden hover:ring-4 hover:ring-purple-500/30 transition-all relative"
                    >
                      {item.url ? (
                        <img src={item.url} alt={item.nome} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-zinc-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-[10px] font-black text-white uppercase tracking-widest bg-purple-600 px-3 py-1.5 rounded-full">Selecionar</span>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && filtrados.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
               <ImageIcon size={48} className="mb-2" />
               <p className="text-xs font-black uppercase tracking-widest">Nenhum item encontrado</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

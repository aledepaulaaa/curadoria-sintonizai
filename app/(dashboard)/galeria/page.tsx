'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { listarPastaStorage, deletarArquivosBatch, uploadArquivoStorage } from '@/src/actions/storage/storageActions';
import type { StorageItem } from '@/src/types/common';
import { 
  Folder, ChevronRight,
  Trash2, Upload, CheckSquare, Square,
  Loader2, RefreshCw, Image as ImageIcon
} from 'lucide-react';

export default function GaleriaPage() {
  const [items, setItems] = React.useState<StorageItem[]>([]);
  const [prefix, setPrefix] = React.useState('');
  const [carregando, setCarregando] = React.useState(true);
  const [breadcrumb, setBreadcrumb] = React.useState<string[]>([]);
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set());
  const [uploading, setUploading] = React.useState(false);

  // Carrega do sessionStorage se existir
  const carregar = React.useCallback(async (novoPrefix: string, force = false) => {
    setCarregando(true);
    setSelecionados(new Set());
    
    const cacheKey = `galeria_cache_${novoPrefix}`;
    if (!force) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setItems(JSON.parse(cached));
        setPrefix(novoPrefix);
        setCarregando(false);
        return;
      }
    }

    try {
      const lista = await listarPastaStorage(novoPrefix);
      setItems(lista);
      setPrefix(novoPrefix);
      sessionStorage.setItem(cacheKey, JSON.stringify(lista));
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => { carregar(''); }, [carregar]);

  const navegarPasta = (caminho: string) => {
    setBreadcrumb((prev) => [...prev, prefix]);
    carregar(caminho);
  };

  const voltarPasta = () => {
    const anterior = breadcrumb.pop() || '';
    setBreadcrumb([...breadcrumb]);
    carregar(anterior);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 20) {
      alert('Você só pode subir até 20 arquivos de uma vez.');
      return;
    }

    setUploading(true);
    let sucessos = 0;
    
    try {
      for (const file of files) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        await uploadArquivoStorage(base64, file.name, prefix);
        sucessos++;
      }
      
      await carregar(prefix, true); // Force refresh
      if (sucessos > 1) alert(`${sucessos} arquivos enviados com sucesso!`);
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Ocorreu um erro durante o upload de alguns arquivos.');
    } finally {
      setUploading(false);
      // Limpar o input para permitir selecionar os mesmos arquivos novamente se necessário
      e.target.value = '';
    }
  };

  const handleDeletar = async () => {
    if (selecionados.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selecionados.size} itens?`)) return;

    setCarregando(true);
    try {
      await deletarArquivosBatch(Array.from(selecionados));
      setSelecionados(new Set());
      await carregar(prefix, true);
    } catch (err) {
      alert('Erro ao deletar: ' + err);
    } finally {
      setCarregando(false);
    }
  };

  const toggleSelecionar = (caminho: string) => {
    const novo = new Set(selecionados);
    if (novo.has(caminho)) novo.delete(caminho);
    else novo.add(caminho);
    setSelecionados(novo);
  };

  const toggleSelecionarTudo = () => {
    if (selecionados.size === items.filter(i => i.tipo === 'arquivo').length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(items.filter(i => i.tipo === 'arquivo').map(i => i.caminho)));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Galeria de Mídias</h1>
          <p className="text-sm text-zinc-500 font-medium">Gerencie as imagens e ativos do Sintonizaí.</p>
        </div>

        <div className="flex items-center gap-2">
           <button onClick={() => carregar(prefix, true)} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-500">
              <RefreshCw size={20} className={carregando ? 'animate-spin' : ''} />
           </button>
           
           <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{uploading ? 'Enviando...' : 'Fazer Upload'}</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" multiple disabled={uploading} />
           </label>
        </div>
      </div>

      {/* Breadcrumb & Batch Actions */}
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button onClick={() => { setBreadcrumb([]); carregar(''); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 shadow-sm border border-zinc-200 dark:border-zinc-700">
            <Folder size={14} className="text-purple-500" />
            Raiz
          </button>
          {breadcrumb.map((b, idx) => (
             <React.Fragment key={idx}>
                <ChevronRight size={14} className="text-zinc-400 shrink-0" />
                <span className="text-xs font-bold text-zinc-400">{b}</span>
             </React.Fragment>
          ))}
          {prefix && (
            <>
              <ChevronRight size={14} className="text-zinc-400 shrink-0" />
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">{prefix.split('/').filter(Boolean).pop()}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {items.some(i => i.tipo === 'arquivo') && (
            <button onClick={toggleSelecionarTudo} className="text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors">
               {selecionados.size === items.filter(i => i.tipo === 'arquivo').length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
            </button>
          )}
          {selecionados.size > 0 && (
            <button onClick={handleDeletar} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20">
               <Trash2 size={12} /> Excluir ({selecionados.size})
            </button>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <motion.div 
              key={item.caminho}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative rounded-3xl border-2 transition-all overflow-hidden bg-white dark:bg-zinc-900 ${
                selecionados.has(item.caminho) ? 'border-purple-600' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {item.tipo === 'pasta' ? (
                <button onClick={() => navegarPasta(item.caminho)} className="w-full aspect-square flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
                    <Folder size={32} />
                  </div>
                  <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider truncate w-full px-2">{item.nome}</p>
                </button>
              ) : (
                <div className="relative aspect-square">
                  {item.url ? (
                    <img src={item.url} alt={item.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50">
                       <ImageIcon size={32} className="text-zinc-300" />
                    </div>
                  )}
                  
                  {/* Overlay Seleção */}
                  <div className={`absolute inset-0 bg-purple-900/40 transition-opacity duration-200 flex items-center justify-center ${selecionados.has(item.caminho) ? 'opacity-100' : 'md:opacity-0 md:group-hover:opacity-100 opacity-100'}`}>
                    <button 
                      onClick={() => toggleSelecionar(item.caminho)}
                      className="p-2 bg-white text-purple-600 rounded-xl shadow-lg transition-transform hover:scale-110"
                    >
                      {selecionados.has(item.caminho) ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>
                  </div>

                  {/* Info Badge */}
                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white">
                    <p className="text-[10px] font-bold truncate">{item.nome}</p>
                    <p className="text-[8px] opacity-60 font-black uppercase tracking-tighter">{item.tamanho ? (item.tamanho / 1024).toFixed(1) : 0} KB</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!carregando && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Folder size={48} className="opacity-10 mb-4" />
          <p className="text-sm font-medium uppercase tracking-widest">Pasta vazia.</p>
        </div>
      )}
    </motion.div>
  );
}

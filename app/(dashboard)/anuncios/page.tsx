'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { listarBanners, criarBanner, deletarBanner } from '@/src/actions/banners/bannersActions';
import type { BannerDestaque } from '@/src/types/banner';

export default function AnunciosPage() {
  const [banners, setBanners] = React.useState<BannerDestaque[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ titulo: '', subtitulo: '', imagemFundo: '', dataInicio: '', dataFim: '' });

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    const lista = await listarBanners();
    setBanners(lista);
    setCarregando(false);
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    await criarBanner({ ...form, ativo: true, tag: 'destaque' });
    setShowForm(false);
    setForm({ titulo: '', subtitulo: '', imagemFundo: '', dataInicio: '', dataFim: '' });
    await carregar();
  };

  const handleDeletar = async (id: string) => {
    await deletarBanner(id);
    await carregar();
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners de Destaque</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500">
          {showForm ? 'Cancelar' : '+ Novo Banner'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCriar} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400">Título</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm text-zinc-400">Subtítulo</label>
              <input value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm text-zinc-400">URL Imagem de Fundo</label>
              <input value={form.imagemFundo} onChange={(e) => setForm({ ...form, imagemFundo: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm text-zinc-400">Data Início</label>
              <input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm text-zinc-400">Data Fim</label>
              <input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} className={inputCls} /></div>
          </div>
          <button type="submit" className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-500">Criar Banner</button>
        </form>
      )}

      {carregando ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 bg-zinc-800 rounded-xl animate-pulse" />)}</div>
      ) : banners.length === 0 ? (
        <p className="text-zinc-500 text-sm">Nenhum banner cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="relative rounded-2xl overflow-hidden border border-zinc-800 group">
              {b.imagemFundo && <img src={b.imagemFundo} alt={b.titulo} className="w-full h-40 object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold">{b.titulo}</h3>
                {b.subtitulo && <p className="text-zinc-300 text-sm">{b.subtitulo}</p>}
              </div>
              <button onClick={() => b.id && handleDeletar(b.id)}
                className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-600/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

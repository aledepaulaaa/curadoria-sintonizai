'use client';

import React from 'react';
import type { Evento } from '@/src/types/evento';
import ImageUpload from '../common/ImageUpload';
import { useFiltros } from '@/src/hooks/useFiltros';
import { Image as ImageIcon } from 'lucide-react';
import GallerySelector from './GallerySelector';
import { AnimatePresence } from 'framer-motion';

interface EventoFormProps {
  onSubmit: (evento: Omit<Evento, 'id'>) => Promise<void>;
  inicial?: Partial<Evento>;
}

export default function EventoForm({ onSubmit, inicial }: EventoFormProps) {
  const { filtros, loading: loadingFiltros } = useFiltros();
  const [form, setForm] = React.useState({
    nome: inicial?.nome || '',
    descricao: inicial?.descricao || '',
    dataInicio: inicial?.dataInicio?.split('T')[0] || '',
    horario: inicial?.horario || '',
    localNome: inicial?.local?.nome || '',
    endereco: inicial?.endereco || '',
    categoria: inicial?.categoria || 'Show',
    estilo: inicial?.estilo || 'Samba',
    vibe: inicial?.vibe || 'Cultural',
    gratuito: inicial?.gratuito || false,
    preco: inicial?.preco || '',
    linkIngresso: inicial?.linkIngresso || '',
    imagemUrl: inicial?.imagemUrl || '',
  });
  const [salvando, setSalvando] = React.useState(false);
  const [abrirGaleria, setAbrirGaleria] = React.useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.dataInicio) return;
    setSalvando(true);
    try {
      await onSubmit({
        nome: form.nome,
        descricao: form.descricao || form.nome,
        dataInicio: `${form.dataInicio}T12:00:00Z`,
        horario: form.horario || 'Confirmar',
        local: { nome: form.localNome || 'Não informado', lat: -23.5505, lng: -46.6333 },
        endereco: form.endereco,
        categoria: form.categoria,
        vibe: form.vibe,
        bombando: false,
        aoVivo: false,
        likes: 0,
        tipo_evento: form.categoria,
        estilo: form.estilo,
        gratuito: form.gratuito,
        preco: form.preco,
        linkIngresso: form.linkIngresso,
        imagemUrl: form.imagemUrl,
        fonte: 'curadoria_manual',
      });
      if (!inicial) {
        setForm({ nome: '', descricao: '', dataInicio: '', horario: '', localNome: '', endereco: '',
          categoria: 'Show', estilo: 'Samba', vibe: 'Cultural', gratuito: false, preco: '', linkIngresso: '', imagemUrl: '' });
      }
    } finally {
      setSalvando(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all";
  const labelCls = "text-sm font-semibold text-zinc-700 dark:text-zinc-400 mb-1 block";

  return (
    <>
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Nome do Evento *</label>
            <input value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} className={inputCls} placeholder="Ex: Show de Jazz no Parque" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data *</label>
              <input type="date" value={form.dataInicio} onChange={(e) => handleChange('dataInicio', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Horário</label>
              <input value={form.horario} onChange={(e) => handleChange('horario', e.target.value)} className={inputCls} placeholder="20h" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Local</label>
            <input value={form.localNome} onChange={(e) => handleChange('localNome', e.target.value)} className={inputCls} placeholder="Nome do local" />
          </div>
          <div>
            <label className={labelCls}>Categoria</label>
            <select value={form.categoria} onChange={(e) => handleChange('categoria', e.target.value)} className={inputCls}>
              {filtros.categorias.map((t: string) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Vibe</label>
            <select value={form.vibe} onChange={(e) => handleChange('vibe', e.target.value)} className={inputCls}>
              {filtros.vibes.map((v: string) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
             <label className={labelCls}>Imagem do Evento</label>
             <button 
               type="button" 
               onClick={() => setAbrirGaleria(true)}
               className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center gap-1"
             >
               <ImageIcon size={12} /> Escolher da Galeria
             </button>
          </div>
          <ImageUpload value={form.imagemUrl} onChange={(url) => handleChange('imagemUrl', url)} />
          
          <div>
            <label className={labelCls}>URL da Imagem (opcional)</label>
            <input value={form.imagemUrl} onChange={(e) => handleChange('imagemUrl', e.target.value)} className={inputCls} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>Estilo Musical / Linguagem</label>
          <select value={form.estilo} onChange={(e) => handleChange('estilo', e.target.value)} className={inputCls}>
            <option value="">Selecione...</option>
            {form.categoria === 'Teatro' 
              ? filtros.teatro.map((r: string) => <option key={r} value={r}>{r}</option>)
              : filtros.ritmos.map((r: string) => <option key={r} value={r}>{r}</option>)
            }
          </select>
        </div>
        <div>
          <label className={labelCls}>Link do Ingresso</label>
          <input value={form.linkIngresso} onChange={(e) => handleChange('linkIngresso', e.target.value)} className={inputCls} placeholder="https://sympla.com.br/..." />
        </div>
      </div>

      <div>
        <label className={labelCls}>Descrição</label>
        <textarea value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)} rows={4} className={inputCls} placeholder="Detalhes do evento..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col justify-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="gratuito" checked={form.gratuito} onChange={(e) => handleChange('gratuito', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer" />
            <label htmlFor="gratuito" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Evento Gratuito</label>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase font-black ml-8 tracking-widest">Aparecerá como "Grátis" no App</p>
        </div>

        <div className={`transition-all ${form.gratuito ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <label className={labelCls}>Valor / Preço</label>
          <div className="relative">
             <span className="absolute left-4 top-3.5 text-zinc-400 font-bold">R$</span>
             <input 
              value={form.preco} 
              onChange={(e) => handleChange('preco', e.target.value)} 
              className={`${inputCls} pl-12`} 
              placeholder="0,00 ou Consultar no link" 
             />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 italic">Ex: 50,00 ou deixe "Consultar no link" se não souber</p>
        </div>
      </div>

      <button type="submit" disabled={salvando}
        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]">
        {salvando ? 'Processando...' : inicial ? 'Salvar Alterações' : 'Publicar Evento'}
      </button>
    </form>

    <AnimatePresence>
      {abrirGaleria && (
        <GallerySelector 
          onSelect={(url) => { handleChange('imagemUrl', url); setAbrirGaleria(false); }}
          onClose={() => setAbrirGaleria(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}

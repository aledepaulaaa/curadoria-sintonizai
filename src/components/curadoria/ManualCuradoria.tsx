'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Tag, 
  Eye, Save, Trash2, Image as ImageIcon,
  CheckCircle2, AlertTriangle, Sparkles, Loader2
} from 'lucide-react';
import { useEventos } from '@/src/hooks/useEventos';
import { useFiltros } from '@/src/hooks/useFiltros';
import ImageUpload from '../common/ImageUpload';
import GallerySelector from './GallerySelector';

export default function ManualCuradoria() {
  const { criar } = useEventos();
  const { filtros, loading: loadingFiltros } = useFiltros();
  const [salvando, setSalvando] = React.useState(false);
  const [abrirGaleria, setAbrirGaleria] = React.useState(false);
  const [form, setForm] = React.useState({
    nome: '',
    descricao: '',
    dataInicio: new Date().toISOString().split('T')[0],
    horario: '',
    localNome: '',
    endereco: '',
    categoria: 'Show',
    vibe: 'Cultural',
    estilo: 'Samba',
    gratuito: false,
    preco: '',
    linkIngresso: '',
    imagemUrl: '',
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    if (!form.nome || !form.dataInicio) {
      alert('Nome e Data são obrigatórios!');
      return;
    }
    setSalvando(true);
    try {
      await criar({
        ...form,
        local: { nome: form.localNome || 'Não informado', lat: -23.5505, lng: -46.6333 },
        dataInicio: `${form.dataInicio}T12:00:00Z`,
        tipo_evento: form.categoria,
        fonte: 'curadoria_manual'
      } as any);
      alert('Evento salvo com sucesso!');
      setForm({
        nome: '',
        descricao: '',
        dataInicio: new Date().toISOString().split('T')[0],
        horario: '',
        localNome: '',
        endereco: '',
        categoria: 'Show',
        vibe: 'Cultural',
        estilo: 'Samba',
        gratuito: false,
        preco: '',
        linkIngresso: '',
        imagemUrl: '',
      });
    } catch (err) {
      alert('Erro ao salvar: ' + err);
    } finally {
      setSalvando(false);
    }
  };

  const labelCls = "block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1";
  const inputCls = "w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white font-medium shadow-sm";

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Formulário */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center">
                <Tag size={20} />
             </div>
             <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Adição Manual</h2>
                <p className="text-xs text-zinc-500 font-medium">Preencha os dados do novo evento.</p>
             </div>
          </div>

          <div className="space-y-6">
             <div>
                <label className={labelCls}>Nome do Evento *</label>
                <input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={inputCls} placeholder="Ex: Grande Roda de Choro" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className={labelCls}>Data *</label>
                   <input type="date" value={form.dataInicio} onChange={e => handleChange('dataInicio', e.target.value)} className={inputCls} />
                </div>
                <div>
                   <label className={labelCls}>Horário</label>
                   <input value={form.horario} onChange={e => handleChange('horario', e.target.value)} className={inputCls} placeholder="Ex: 19h às 22h" />
                </div>
             </div>

             <div>
                <label className={labelCls}>Local / Estabelecimento</label>
                <input value={form.localNome} onChange={e => handleChange('localNome', e.target.value)} className={inputCls} placeholder="Ex: Bar do Alemão" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className={labelCls}>Categoria</label>
                   <select value={form.categoria} onChange={e => handleChange('categoria', e.target.value)} className={inputCls}>
                      {filtros.categorias.map((c: string) => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className={labelCls}>Vibe</label>
                   <select value={form.vibe} onChange={e => handleChange('vibe', e.target.value)} className={inputCls}>
                      {filtros.vibes.map((v: string) => <option key={v} value={v}>{v}</option>)}
                   </select>
                </div>
             </div>

             <div>
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
                <ImageUpload value={form.imagemUrl} onChange={url => handleChange('imagemUrl', url)} />
                <input value={form.imagemUrl} onChange={e => handleChange('imagemUrl', e.target.value)} className={`${inputCls} mt-4 text-xs`} placeholder="Ou cole a URL da imagem aqui..." />
             </div>

             <div>
                <label className={labelCls}>Descrição</label>
                <textarea value={form.descricao} onChange={e => handleChange('descricao', e.target.value)} rows={4} className={inputCls} placeholder="Conte mais sobre o evento..." />
             </div>

             <div className="flex justify-end gap-3 pt-4">
                <button onClick={handleSalvar} disabled={salvando} className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                   {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                   Publicar Evento
                </button>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Preview Mobile */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="sticky top-8 space-y-6"
      >
        <div className="flex items-center gap-2 mb-2 ml-4">
           <Eye size={16} className="text-purple-500" />
           <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Preview App Mobile</span>
        </div>

        {/* Simulador de Card Mobile */}
        <div className="max-w-[320px] mx-auto bg-white dark:bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-900 dark:border-zinc-800 shadow-2xl overflow-hidden aspect-[9/18]">
          <div className="relative h-full flex flex-col bg-zinc-50 dark:bg-black">
            {/* Imagem do Evento */}
            <div className="relative h-2/5 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
               {form.imagemUrl ? (
                 <img src={form.imagemUrl} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                    <ImageIcon size={48} className="opacity-20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sem Imagem</span>
                 </div>
               )}
               {/* Badge Vibe */}
               <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-purple-600 uppercase">
                  {form.vibe}
               </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex-1 flex flex-col">
               <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight mb-4 truncate-2">
                  {form.nome || 'Nome do Evento'}
               </h3>

               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-zinc-500">
                     <Calendar size={16} className="text-purple-500" />
                     <span className="text-xs font-bold">{form.dataInicio} @ {form.horario || '--:--'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-500">
                     <MapPin size={16} className="text-purple-500" />
                     <span className="text-xs font-bold truncate">{form.localNome || 'Local não definido'}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                     <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-black text-zinc-400 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                        {form.categoria}
                     </span>
                     <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest border border-purple-100 dark:border-purple-800/50">
                        {form.estilo}
                     </span>
                  </div>
               </div>

               <div className="mt-auto pt-6">
                  <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
                     Ver Detalhes
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-600/5 border border-purple-600/20 p-6 rounded-3xl">
           <div className="flex items-start gap-3">
              <Sparkles className="text-purple-500 shrink-0" size={20} />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                 O preview acima simula exatamente como o card será renderizado no aplicativo mobile dos usuários. 
                 Mantenha o nome curto e a imagem chamativa para melhor engajamento!
              </p>
           </div>
        </div>
      </motion.div>
    </div>

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

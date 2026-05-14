'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Tag,
  Eye, Save, Image as ImageIcon, Sparkles, Loader2
} from 'lucide-react';
import { useEventos } from '@/src/hooks/useEventos';
import { useCategorias } from '@/src/hooks/useCategorias';
import { useEstilos } from '@/src/hooks/useEstilos';
import { useTiposEvento } from '@/src/hooks/useTiposEvento';
import ImageUpload from '../common/ImageUpload';
import GallerySelector from './GallerySelector';
import UserSelector from './UserSelector';
import { UserCheck } from 'lucide-react';

export default function ManualCuradoria() {
  const { criar } = useEventos();
  const { categorias, loading: loadingCategorias } = useCategorias();
  const { estilos, loading: loadingEstilos } = useEstilos();
  const { tiposEvento, loading: loadingTipos } = useTiposEvento();
  const [salvando, setSalvando] = React.useState(false);
  const [abrirGaleria, setAbrirGaleria] = React.useState(false);
  const [form, setForm] = React.useState({
    nome: '',
    descricao: '',
    dataInicio: new Date().toISOString().split('T')[0],
    horario: '',
    localNome: '',
    endereco: '',
    categoria: '',
    estilo: '',
    tipo_evento: '',
    gratuito: false,
    preco: '',
    linkIngresso: '',
    imagemUrl: '',
    indicadoPor: null as any,
    notaCuradoria: '',
  });

  // Achatando as taxonomias para seleção granular
  const categoriasAchatadas = React.useMemo(() => {
    // Pega os labels dos documentos E os itens de dentro deles para garantir que nada escape
    const labels = categorias.map((c: any) => c.label);
    const subItens = categorias.flatMap((c: any) => c.itens || []);
    return Array.from(new Set([...labels, ...subItens])).filter(Boolean).sort();
  }, [categorias]);

  // Atualizar valores iniciais quando carregarem
  React.useEffect(() => {
    if (!loadingCategorias && !loadingEstilos && !loadingTipos) {
      // Garantir que os estados não fiquem undefined
      setForm(prev => ({
        ...prev,
        categoria: prev.categoria || '',
        estilo: prev.estilo || '',
        tipo_evento: prev.tipo_evento || '',
      }));
    }
  }, [loadingCategorias, loadingEstilos, loadingTipos]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    if (!form.nome || !form.dataInicio || !form.categoria) {
      alert('Nome, Data e Categoria são obrigatórios!');
      return;
    }
    setSalvando(true);
    try {
      await criar({
        ...form,
        local: { 
          nome: form.localNome || 'Não informado', 
          lat: -23.5505, 
          lng: -46.6333 
        },
        dataInicio: `${form.dataInicio}T12:00:00Z`,
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
        categoria: '',
        estilo: '',
        tipo_evento: '',
        gratuito: false,
        preco: '',
        linkIngresso: '',
        imagemUrl: '',
        indicadoPor: null,
        notaCuradoria: '',
      });
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar: ' + err);
    } finally {
      setSalvando(false);
    }
  };

  const labelCls = "block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1";
  const inputCls = "w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Categoria</label>
                  <select 
                    value={form.categoria} 
                    onChange={e => {
                      const val = e.target.value;
                      setForm(prev => ({ ...prev, categoria: val, tipo_evento: '', estilo: '' }));
                    }} 
                    className={inputCls}
                  >
                    <option value="">Selecione a Categoria</option>
                    {categoriasAchatadas.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo de Evento</label>
                  <select 
                    value={form.tipo_evento} 
                    disabled={!form.categoria}
                    onChange={e => {
                      const val = e.target.value;
                      setForm(prev => ({ ...prev, tipo_evento: val, estilo: '' }));
                    }} 
                    className={inputCls}
                  >
                    <option value="">{form.categoria ? 'Selecione o Tipo' : 'Escolha Categoria primeiro'}</option>
                    {(() => {
                      // Tenta filtrar pelo label da categoria
                      const filtrados = tiposEvento
                        .filter((g: any) => 
                          g.label?.trim().toLowerCase() === form.categoria.trim().toLowerCase() ||
                          g.id?.trim().toLowerCase() === form.categoria.trim().toLowerCase()
                        )
                        .flatMap((g: any) => g.itens || []);

                      // Se não achar nada específico para essa categoria, mostra TODOS os tipos como fallback
                      const listaFinal = filtrados.length > 0 
                        ? filtrados 
                        : Array.from(new Set(tiposEvento.flatMap((g: any) => g.itens || [])));

                      return listaFinal.sort().map((tipo: string) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ));
                    })()}
                  </select>
                  {!tiposEvento.some(g => g.label?.trim().toLowerCase() === form.categoria.trim().toLowerCase()) && form.categoria && (
                    <p className="text-[9px] text-amber-500 mt-1 font-bold animate-pulse">⚠️ Usando lista genérica (sem grupo específico)</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Estilo</label>
                  <select 
                    value={form.estilo} 
                    disabled={!form.tipo_evento}
                    onChange={e => handleChange('estilo', e.target.value)} 
                    className={inputCls}
                  >
                    <option value="">{form.tipo_evento ? 'Selecione o Estilo' : 'Escolha Tipo primeiro'}</option>
                    {(() => {
                      // Tenta filtrar pelo label do tipo
                      const filtrados = estilos
                        .filter((g: any) => 
                          g.label?.trim().toLowerCase() === form.tipo_evento.trim().toLowerCase() ||
                          g.id?.trim().toLowerCase() === form.tipo_evento.trim().toLowerCase()
                        )
                        .flatMap((g: any) => g.itens || []);

                      // Fallback para todos os estilos se não achar grupo específico
                      const listaFinal = filtrados.length > 0 
                        ? filtrados 
                        : Array.from(new Set(estilos.flatMap((g: any) => g.itens || [])));

                      return listaFinal.sort().map((estilo: string) => (
                        <option key={estilo} value={estilo}>{estilo}</option>
                      ));
                    })()}
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}>Nota da Curadoria (Destaque no App)</label>
                  <span className={`text-[10px] font-bold ${form.notaCuradoria.length > 100 ? 'text-red-500' : 'text-zinc-400'}`}>
                    {form.notaCuradoria.length}/100
                  </span>
                </div>
                <textarea 
                  value={form.notaCuradoria} 
                  onChange={e => handleChange('notaCuradoria', e.target.value.slice(0, 100))} 
                  rows={2} 
                  className={inputCls} 
                  placeholder="Ex: Últimos ingressos! Ou: Mudança de local para o palco principal." 
                />
                <p className="text-[10px] text-purple-500 mt-1 font-medium">Esta nota terá um destaque colorido no card do App.</p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl">
                <UserSelector
                  selectedUid={form.indicadoPor?.uid}
                  onSelect={(user) => handleChange('indicadoPor', user)}
                />
                {form.indicadoPor && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest">
                    <UserCheck size={14} />
                    Vínculo ativo com {form.indicadoPor.nome}
                  </div>
                )}
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
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight mb-2 truncate-2">
                  {form.nome || 'Nome do Evento'}
                </h3>

                {form.notaCuradoria && (
                  <div className="mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter leading-tight">
                      Nota da Curadoria: {form.notaCuradoria}
                    </p>
                  </div>
                )}

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
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                      {form.tipo_evento}
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

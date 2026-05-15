'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  listarBanners, criarBanner, atualizarBanner, deletarBanner 
} from '@/src/actions/banners/bannersActions';
import type { BannerDestaque } from '@/src/types/banner';
import ImageUpload from '@/src/components/common/ImageUpload';
import GallerySelector from '@/src/components/curadoria/GallerySelector';
import { 
  Plus, Pencil, Trash2, Calendar, Layout, Type, MapPin, 
  ExternalLink, Bell, List, Info, Image as ImageIcon,
  ArrowUp, ArrowDown, Smartphone, Clock
} from 'lucide-react';
import BannerPreview from '@/src/components/curadoria/BannerPreview';
import BannerActionForm from '@/src/components/curadoria/BannerActionForm';

const INITIAL_FORM: Omit<BannerDestaque, 'id'> = {
  titulo: '',
  subtitulo: '',
  descricao: '',
  imagemFundo: '',
  dataInicioExibicao: '',
  dataInicioEvento: '',
  dataFimEvento: '',
  textoStatusEmBreve: 'EM BREVE',
  textoStatusDisponivel: 'DISPONÍVEL',
  textoStatusAoVivo: 'AO VIVO',
  textoEmBreve: 'O evento mais esperado de 2026 vem aí! 🚀',
  textoDisponivel: 'A programação completa já está disponível! 🔥',
  textoAoVivo: 'O EVENTO JÁ COMEÇOU! NÃO FIQUE DE FORA! 🔴',
  textoBotao: 'Ver Programação',
  notificarInicioExibicao: false,
  notificarInicioEvento: true,
  ativo: true,
  ordem: 0,
  tag: 'destaque',
  cidade: 'São Paulo',
  categorias: [],
  aviso: '',
  acao: {
    tipo: 'evento',
    filtros: {
      distanciaMax: 50,
      data: 'tudo',
      tipoEntrada: 'todos',
      categorias: [],
      estilos: [],
    }
  }
};

export default function AnunciosPage() {
  const [banners, setBanners] = React.useState<BannerDestaque[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [showGallery, setShowGallery] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<Omit<BannerDestaque, 'id'>>(INITIAL_FORM);
  const [previewEstado, setPreviewEstado] = React.useState<'em_breve' | 'disponivel' | 'ao_vivo'>('disponivel');

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    const lista = await listarBanners();
    setBanners(lista);
    setCarregando(false);
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const handleEdit = (banner: BannerDestaque) => {
    const { id, ...dados } = banner;
    setForm({
      ...INITIAL_FORM,
      ...dados,
      categorias: dados.categorias || []
    });
    setEditingId(id || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await atualizarBanner(editingId, form);
    } else {
      await criarBanner(form);
    }
    cancelarForm();
    await carregar();
  };

  const cancelarForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleDeletar = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este banner?')) {
      await deletarBanner(id);
      await carregar();
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all";
  const labelCls = "text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5";

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Gestão de Banners</h1>
          <p className="text-zinc-500 text-sm font-medium">Controle os destaques "Netflix-Style" do seu aplicativo.</p>
        </div>
        <button 
          onClick={() => showForm ? cancelarForm() : setShowForm(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            showForm ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/20'
          }`}
        >
          {showForm ? 'Cancelar' : <><Plus size={20} /> Novo Banner</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSave} 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 mb-12 shadow-xl space-y-8"
          >
            {/* Seção Imagem */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <label className={labelCls}><ImageIcon size={12} /> Design do Banner</label>
                  <button 
                    type="button" 
                    onClick={() => setShowGallery(true)}
                    className="text-[10px] font-bold text-purple-600 uppercase hover:underline"
                  >
                    Escolher da Galeria
                  </button>
                </div>
                <ImageUpload 
                  value={form.imagemFundo} 
                  onChange={(url) => setForm({ ...form, imagemFundo: url })} 
                  folder="banners"
                  aspectRatio={16 / 9}
                />

                <div className="pt-4 space-y-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                      <Smartphone size={12} className="text-purple-500" /> Simular Estado no Preview
                    </h5>
                    <div className="flex gap-2">
                      {(['em_breve', 'disponivel', 'ao_vivo'] as const).map(est => (
                        <button
                          key={est}
                          type="button"
                          onClick={() => setPreviewEstado(est)}
                          className={`flex-1 py-2 rounded-xl text-[9px] font-bold uppercase transition-all ${previewEstado === est ? 'bg-purple-600 text-white shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-500'}`}
                        >
                          {est.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}><Type size={12} /> Título de Impacto</label>
                  <input 
                    placeholder="Ex: Virada Cultural 2026"
                    value={form.titulo} 
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })} 
                    className={inputCls} 
                    required 
                  />
                </div>
                <div>
                  <label className={labelCls}><Layout size={12} /> Subtítulo / Chamada</label>
                  <input 
                    placeholder="Ex: O maior evento de SP"
                    value={form.subtitulo} 
                    onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} 
                    className={inputCls} 
                  />
                </div>
                <div>
                  <label className={labelCls}><MapPin size={12} /> Cidade / Local</label>
                  <input 
                    value={form.cidade} 
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })} 
                    className={inputCls} 
                  />
                </div>
                <div>
                  <label className={labelCls}><List size={12} /> Categorias (separadas por vírgula)</label>
                  <input 
                    placeholder="musica, teatro, danca"
                    value={form.categorias?.join(', ')} 
                    onChange={(e) => setForm({ ...form, categorias: e.target.value.split(',').map(s => s.trim()) })} 
                    className={inputCls} 
                  />
                </div>
                <div>
                  <label className={labelCls}><Layout size={12} /> Ordem de Exibição (0 = primeiro)</label>
                  <input 
                    type="number"
                    value={form.ordem} 
                    onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} 
                    className={inputCls} 
                  />
                </div>
                <div>
                  <label className={labelCls}><Type size={12} /> Texto do Botão de Ação</label>
                  <input 
                    placeholder="Ex: Ver Programação"
                    value={form.textoBotao} 
                    onChange={(e) => setForm({ ...form, textoBotao: e.target.value })} 
                    className={inputCls} 
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                {/* Seção Datas e Horários Precisos */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} className="text-purple-500" /> Agendamento e Horários Precisos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}><Calendar size={12} /> Início da Exibição</label>
                      <input 
                        type="datetime-local" 
                        value={form.dataInicioExibicao} 
                        onChange={(e) => setForm({ ...form, dataInicioExibicao: e.target.value })} 
                        className={inputCls} 
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}><Calendar size={12} /> Início do Evento</label>
                      <input 
                        type="datetime-local" 
                        value={form.dataInicioEvento} 
                        onChange={(e) => setForm({ ...form, dataInicioEvento: e.target.value })} 
                        className={inputCls} 
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}><Calendar size={12} /> Fim do Evento (Expiração)</label>
                      <input 
                        type="datetime-local" 
                        value={form.dataFimEvento} 
                        onChange={(e) => setForm({ ...form, dataFimEvento: e.target.value })} 
                        className={inputCls} 
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Notificações */}
                <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/30 space-y-4">
                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <Bell size={14} /> Automação de Push Notifications
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={form.notificarInicioExibicao}
                          onChange={e => setForm({ ...form, notificarInicioExibicao: e.target.checked })}
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${form.notificarInicioExibicao ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                        <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.notificarInicioExibicao ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-purple-500 transition-colors">Notificar ao iniciar exibição no App</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={form.notificarInicioEvento}
                          onChange={e => setForm({ ...form, notificarInicioEvento: e.target.checked })}
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${form.notificarInicioEvento ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                        <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.notificarInicioEvento ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-purple-500 transition-colors">Notificar ao iniciar o evento (Início do Evento)</span>
                    </label>
                  </div>
                </div>

                {/* Seção Status Dinâmicos */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Type size={14} className="text-purple-500" /> Textos dos Badges de Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Status "Em Breve"</label>
                      <input 
                        value={form.textoStatusEmBreve} 
                        onChange={e => setForm({ ...form, textoStatusEmBreve: e.target.value })}
                        className={inputCls}
                        placeholder="Default: EM BREVE"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Status "Disponível"</label>
                      <input 
                        value={form.textoStatusDisponivel} 
                        onChange={e => setForm({ ...form, textoStatusDisponivel: e.target.value })}
                        className={inputCls}
                        placeholder="Default: DISPONÍVEL"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Status "Ao Vivo"</label>
                      <input 
                        value={form.textoStatusAoVivo} 
                        onChange={e => setForm({ ...form, textoStatusAoVivo: e.target.value })}
                        className={inputCls}
                        placeholder="Default: AO VIVO"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Mensagens de Impacto */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Type size={14} className="text-purple-500" /> Mensagens Dinâmicas por estado
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Mensagem (Em Breve)</label>
                      <textarea 
                        value={form.textoEmBreve} 
                        onChange={e => setForm({ ...form, textoEmBreve: e.target.value })}
                        className={`${inputCls} h-20 resize-none text-xs`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Mensagem (Disponível)</label>
                      <textarea 
                        value={form.textoDisponivel} 
                        onChange={e => setForm({ ...form, textoDisponivel: e.target.value })}
                        className={`${inputCls} h-20 resize-none text-xs`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Mensagem (Ao Vivo)</label>
                      <textarea 
                        value={form.textoAoVivo} 
                        onChange={e => setForm({ ...form, textoAoVivo: e.target.value })}
                        className={`${inputCls} h-20 resize-none text-xs`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lógica de Destino */}
              <div className="lg:col-span-3">
                <BannerActionForm 
                  acao={form.acao}
                  onChange={(acao) => setForm({ ...form, acao })}
                />
              </div>

              {/* Preview Mobile */}
              <div className="hidden lg:block">
                <BannerPreview form={form} estadoSimulado={previewEstado} />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={cancelarForm}
                className="px-8 py-3 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                Descartar
              </button>
              <button 
                type="submit" 
                className="px-12 py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest hover:bg-purple-500 hover:scale-[1.02] transition-all shadow-xl shadow-purple-500/20"
              >
                {editingId ? 'Salvar Alterações' : 'Publicar Banner'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Listagem */}
      {carregando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse border border-zinc-200 dark:border-zinc-800" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
           <ImageIcon size={48} className="text-zinc-300 mb-4" />
           <p className="text-zinc-500 font-bold uppercase tracking-widest">Nenhum banner ativo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <motion.div 
              layout
              key={b.id} 
              className="group relative h-56 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all"
            >
              {b.imagemFundo ? (
                <img src={b.imagemFundo} alt={b.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                   <ImageIcon size={40} className="text-zinc-300" />
                </div>
              )}
              
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-lg">
                       #{b.ordem}
                    </div>
                    {b.notificarInicioEvento && <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg"><Bell size={12} /></div>}
                 </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase rounded-full">
                    {b.tag || 'Destaque'}
                  </span>
                  {b.cidade && (
                    <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase rounded-full backdrop-blur-md">
                      {b.cidade}
                    </span>
                  )}
                </div>
                <h3 className="text-white text-2xl font-black uppercase tracking-tighter leading-none mb-1">{b.titulo}</h3>
                <p className="text-zinc-400 text-xs font-medium line-clamp-1">{b.subtitulo}</p>
              </div>

              <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all transform md:translate-y-2 md:group-hover:translate-y-0">
                <button 
                  onClick={() => handleEdit(b)}
                  className="p-3 bg-white text-zinc-900 rounded-2xl hover:bg-purple-600 hover:text-white shadow-xl transition-all"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => b.id && handleDeletar(b.id)}
                  className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-500 shadow-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showGallery && (
        <GallerySelector 
          onSelect={(url) => {
            setForm({ ...form, imagemFundo: url });
            setShowGallery(false);
          }}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}

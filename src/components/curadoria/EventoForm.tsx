'use client';

import React from 'react';
import type { Evento } from '@/src/types/evento';
import ImageUpload from '../common/ImageUpload';
import { useCategorias } from '@/src/hooks/useCategorias';
import { useEstilos } from '@/src/hooks/useEstilos';
import { useTiposEvento } from '@/src/hooks/useTiposEvento';
import { Image as ImageIcon, UserCheck, MapPin } from 'lucide-react';
import GallerySelector from './GallerySelector';
import UserSelector from './UserSelector';
import { AnimatePresence } from 'framer-motion';
import LocationPicker from './LocationPicker';

interface EventoFormProps {
  onSubmit: (evento: Omit<Evento, 'id'>) => Promise<void>;
  inicial?: Partial<Evento>;
}

export default function EventoForm({ onSubmit, inicial }: EventoFormProps) {
  const { categorias, loading: loadingCategorias } = useCategorias();
  const { estilos, loading: loadingEstilos } = useEstilos();
  const { tiposEvento, loading: loadingTipos } = useTiposEvento();

  const [form, setForm] = React.useState({
    nome: inicial?.nome || '',
    descricao: inicial?.descricao || '',
    dataInicio: inicial?.dataInicio?.split('T')[0] || '',
    horario: inicial?.horario || '',
    localNome: inicial?.local?.nome || '',
    endereco: inicial?.endereco || '',
    categoria: inicial?.categoria || '',
    estilo: inicial?.estilo || '',
    tipo_evento: inicial?.tipo_evento || '',
    categorias: inicial?.categorias || (inicial?.categoria ? [inicial.categoria] : []),
    tiposEvento: inicial?.tiposEvento || (inicial?.tipo_evento ? [inicial.tipo_evento] : []),
    vibracoes: inicial?.vibracoes || (inicial?.estilo ? inicial.estilo.split(',').map(s => s.trim()).filter(Boolean) : []),
    gratuito: inicial?.gratuito || false,
    preco: inicial?.preco || '',
    linkIngresso: inicial?.linkIngresso || '',
    imagemUrl: inicial?.imagemUrl || '',
    indicadoPor: inicial?.indicadoPor || null as any,
    notaCuradoria: inicial?.notaCuradoria || '',
    acessibilidade: inicial?.acessibilidade || false,
    lat: inicial?.local?.lat?.toString() || '',
    lng: inicial?.local?.lng?.toString() || '',
  });

  const categoriasAchatadas = React.useMemo(() => {
    return Array.from(new Set(categorias.flatMap((c: any) => c.itens || []))).sort();
  }, [categorias]);

  const estilosAchatados = React.useMemo(() => {
    return Array.from(new Set(estilos.flatMap((e: any) => e.itens || []))).sort();
  }, [estilos]);

  const tiposAchatados = React.useMemo(() => {
    return Array.from(new Set(tiposEvento.flatMap((t: any) => t.itens || []))).sort();
  }, [tiposEvento]);

  // Inicializar campos se vazios quando os metadados carregarem
  React.useEffect(() => {
    if (!loadingCategorias && !loadingEstilos && !loadingTipos) {
      setForm(prev => {
        const defaultCat = categoriasAchatadas[0] || '';
        const defaultTipo = tiposAchatados[0] || '';
        const defaultEstilo = estilosAchatados[0] || '';
        return {
          ...prev,
          categoria: prev.categoria || defaultCat,
          estilo: prev.estilo || defaultEstilo,
          tipo_evento: prev.tipo_evento || defaultTipo,
          categorias: prev.categorias.length > 0 ? prev.categorias : (defaultCat ? [defaultCat] : []),
          tiposEvento: prev.tiposEvento.length > 0 ? prev.tiposEvento : (defaultTipo ? [defaultTipo] : []),
          vibracoes: prev.vibracoes.length > 0 ? prev.vibracoes : (defaultEstilo ? [defaultEstilo] : []),
        };
      });
    }
  }, [loadingCategorias, loadingEstilos, loadingTipos, categoriasAchatadas, estilosAchatados, tiposAchatados]);

  const [salvando, setSalvando] = React.useState(false);
  const [abrirGaleria, setAbrirGaleria] = React.useState(false);

  const handleChange = (field: string, value: string | boolean | any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleCategoria = (cat: string) => {
    const current = form.categorias || [];
    const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
    setForm(prev => ({
      ...prev,
      categorias: next,
      categoria: next[0] || ''
    }));
  };

  const handleToggleTipoEvento = (tipo: string) => {
    const current = form.tiposEvento || [];
    const next = current.includes(tipo) ? current.filter(t => t !== tipo) : [...current, tipo];
    setForm(prev => ({
      ...prev,
      tiposEvento: next,
      tipo_evento: next[0] || ''
    }));
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
        local: { 
          nome: form.localNome || 'Não informado', 
          lat: form.lat ? Number(form.lat.replace(',', '.')) : 0, 
          lng: form.lng ? Number(form.lng.replace(',', '.')) : 0 
        },
        endereco: form.endereco,
        categoria: form.categorias[0] || 'todos',
        bombando: inicial?.bombando || false,
        aoVivo: inicial?.aoVivo || false,
        likes: inicial?.likes || 0,
        tipo_evento: form.tiposEvento[0] || 'Outros',
        estilo: form.vibracoes.join(', '),
        categorias: form.categorias,
        tiposEvento: form.tiposEvento,
        vibracoes: form.vibracoes,
        gratuito: form.gratuito,
        preco: form.preco,
        linkIngresso: form.linkIngresso,
        imagemUrl: form.imagemUrl,
        indicadoPor: form.indicadoPor || undefined,
        notaCuradoria: form.notaCuradoria,
        acessibilidade: form.acessibilidade,
        fonte: inicial?.fonte || (form.indicadoPor ? 'indicacao_usuario' : 'curadoria_manual'),
      } as any);
      if (!inicial) {
        setForm({ 
          nome: '', descricao: '', dataInicio: '', horario: '', localNome: '', endereco: '',
          categoria: categorias[0]?.label || '', estilo: estilos[0]?.label || '', tipo_evento: tiposAchatados[0] || '', 
          categorias: categorias[0]?.label ? [categorias[0].label] : [],
          tiposEvento: tiposAchatados[0] ? [tiposAchatados[0]] : [],
          vibracoes: estilos[0]?.label ? [estilos[0].label] : [],
          gratuito: false, preco: '', linkIngresso: '', imagemUrl: '', indicadoPor: null, notaCuradoria: '', 
          acessibilidade: false, lat: '', lng: '' 
        });
      }
    } finally {
      setSalvando(false);
    }
  };

  const estilosSelecionados = React.useMemo(() => {
    return (form.vibracoes || []).map((s: string) => s.toLowerCase());
  }, [form.vibracoes]);

  const handleToggleEstilo = (estiloNome: string) => {
    const current = form.vibracoes || [];
    const next = current.includes(estiloNome)
      ? current.filter((s: string) => s !== estiloNome)
      : [...current, estiloNome];
    setForm(prev => ({
      ...prev,
      vibracoes: next,
      estilo: next.join(', ')
    }));
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
            <label className={labelCls}>Categorias (Múltiplos)</label>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20 max-h-40 overflow-y-auto space-y-3 shadow-inner">
              {categorias.map((grupo: any) => (
                <div key={grupo.id} className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">{grupo.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {grupo.itens?.map((item: string) => {
                      const ativo = (form.categorias || []).includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleToggleCategoria(item)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                            ativo 
                              ? 'bg-purple-600 border-purple-600 text-white shadow-sm' 
                              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {categorias.length === 0 && (
                <span className="text-xs text-zinc-500 italic">Nenhuma categoria disponível</span>
              )}
            </div>
          </div>
          <div>
            <label className={labelCls}>Tipos de Evento (Múltiplos)</label>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20 max-h-40 overflow-y-auto space-y-3 shadow-inner">
              {tiposEvento.map((grupo: any) => (
                <div key={grupo.id} className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">{grupo.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {grupo.itens?.map((item: string) => {
                      const ativo = (form.tiposEvento || []).includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleToggleTipoEvento(item)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                            ativo 
                              ? 'bg-purple-600 border-purple-600 text-white shadow-sm' 
                              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {tiposEvento.length === 0 && (
                <span className="text-xs text-zinc-500 italic">Nenhum tipo de evento disponível</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-purple-500" /> Latitude
              </label>
              <input value={form.lat} onChange={(e) => handleChange('lat', e.target.value)} className={inputCls} placeholder="-23.5505" />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-purple-500" /> Longitude
              </label>
              <input value={form.lng} onChange={(e) => handleChange('lng', e.target.value)} className={inputCls} placeholder="-46.6333" />
            </div>
          </div>
          
          <div className="pt-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
              Mapa de Ajuste
            </label>
            <LocationPicker 
              initialLat={form.lat ? Number(form.lat) : undefined}
              initialLng={form.lng ? Number(form.lng) : undefined}
              onLocationSelect={(lat, lng) => {
                setForm(p => ({ ...p, lat: lat.toString(), lng: lng.toString() }));
              }}
            />
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
          <label className={labelCls}>Estilo Musical / Linguagem (Múltiplos)</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="Adicionar estilo personalizado..." 
              id="custom-style-input"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    const current = form.estilo ? form.estilo.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                    if (!current.some(s => s.toLowerCase() === val.toLowerCase())) {
                      handleChange('estilo', [...current, val].join(', '));
                    }
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('custom-style-input') as HTMLInputElement;
                const val = input?.value.trim();
                if (val) {
                  const current = form.estilo ? form.estilo.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                  if (!current.some(s => s.toLowerCase() === val.toLowerCase())) {
                    handleChange('estilo', [...current, val].join(', '));
                  }
                  input.value = '';
                }
              }}
              className="px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors active:scale-[0.97]"
            >
              +
            </button>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20 max-h-56 overflow-y-auto space-y-3 shadow-inner">
            {estilos.map((grupo: any) => (
              <div key={grupo.id} className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">{grupo.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {grupo.itens?.map((item: string) => {
                    const ativo = estilosSelecionados.includes(item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleEstilo(item)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          ativo 
                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm' 
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {estilos.length === 0 && (
              <span className="text-xs text-zinc-500 italic">Nenhum estilo disponível</span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Clique nos botões acima ou digite no campo de texto para adicionar estilos personalizados.</p>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <label className={labelCls}>Link do Ingresso</label>
            <input value={form.linkIngresso} onChange={(e) => handleChange('linkIngresso', e.target.value)} className={inputCls} placeholder="https://sympla.com.br/..." />
          </div>
          {form.estilo ? (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/25 rounded-xl">
              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block mb-1">Selecionados ({estilosSelecionados.length})</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">{form.estilo}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl">
        <UserSelector 
          selectedUid={form.indicadoPor?.uid}
          onSelect={(user) => handleChange('indicadoPor', user?.nome)} 
        />
        {form.indicadoPor && (
          <div className="mt-2 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest">
            <UserCheck size={14} />
            Vínculo ativo com {form.indicadoPor.nome}
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>Descrição</label>
        <textarea value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)} rows={4} className={inputCls} placeholder="Detalhes do evento..." />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>Nota da Curadoria (Aviso Importante)</label>
          <span className={`text-[10px] font-bold ${form.notaCuradoria?.length > 100 ? 'text-red-500' : 'text-zinc-400'}`}>
            {form.notaCuradoria?.length || 0}/100
          </span>
        </div>
        <textarea 
          value={form.notaCuradoria} 
          onChange={(e) => handleChange('notaCuradoria', e.target.value.slice(0, 100))} 
          rows={2} 
          className={inputCls} 
          placeholder="Ex: Chegue cedo para garantir lugar! Ou: Evento sujeito a lotação." 
        />
        <p className="text-[10px] text-purple-500 mt-1 font-medium">Esta nota aparecerá com destaque no card do evento no App.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col justify-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="gratuito" checked={form.gratuito} onChange={(e) => handleChange('gratuito', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer" />
            <label htmlFor="gratuito" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Evento Gratuito</label>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase font-black ml-8 tracking-widest">Aparecerá como "Grátis" no App</p>
        </div>

        <div className="flex flex-col justify-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="acessibilidade" checked={form.acessibilidade} onChange={(e) => handleChange('acessibilidade', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer" />
            <label htmlFor="acessibilidade" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Acessibilidade PCD</label>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase font-black ml-8 tracking-widest">Exibe ícone de acessibilidade</p>
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

'use client';

import React from 'react';
import { Zap, Search, Globe, Layout, Ticket, Info, Check, MousePointer2, Filter } from 'lucide-react';
import { useCategorias } from '@/src/hooks/useCategorias';
import { useEstilos } from '@/src/hooks/useEstilos';
import { listarEventos } from '@/src/actions/eventos/eventosActions';
import type { BannerDestaque } from '@/src/types/banner';

interface BannerActionFormProps {
  acao?: BannerDestaque['acao'];
  onChange: (acao: BannerDestaque['acao']) => void;
}

type BannerAcao = NonNullable<BannerDestaque['acao']>;
type BannerFiltros = NonNullable<BannerAcao['filtros']>;

export default function BannerActionForm({ acao, onChange }: BannerActionFormProps) {
  const [tipoAtivo, setTipoAtivo] = React.useState<BannerAcao['tipo']>(acao?.tipo || 'evento');
  const { categorias } = useCategorias();
  const { estilos } = useEstilos();
  const [eventos, setEventos] = React.useState<any[]>([]);
  const [buscaEvento, setBuscaEvento] = React.useState('');
  const [carregandoEventos, setCarregandoEventos] = React.useState(false);

  React.useEffect(() => {
    if (tipoAtivo === 'evento') {
      const fetchEventos = async () => {
        setCarregandoEventos(true);
        try {
          const lista = await listarEventos();
          setEventos(lista);
        } catch (e) {
          console.error(e);
        } finally {
          setCarregandoEventos(false);
        }
      };
      fetchEventos();
    }
  }, [tipoAtivo]);

  const updateAcao = (updates: Partial<BannerAcao>) => {
    onChange({
      tipo: tipoAtivo,
      ...(acao || {}),
      ...updates
    } as BannerAcao);
  };

  const updateFiltros = (updates: Partial<BannerFiltros>) => {
    onChange({
      ...(acao || {}),
      tipo: 'filtro',
      filtros: {
        ...(acao?.filtros || {}),
        ...updates
      }
    } as BannerAcao);
  };

  const eventosFiltrados = eventos.filter(ev => 
    ev.nome.toLowerCase().includes(buscaEvento.toLowerCase())
  ).slice(0, 5);

  const tabs = [
    { id: 'evento', icon: Zap, label: 'Abrir Show' },
    { id: 'filtro', icon: Filter, label: 'Aplicar Filtros' },
    { id: 'externo', icon: Globe, label: 'Link Externo' },
    { id: 'tab', icon: Layout, label: 'Mudar Tab' }
  ];

  return (
    <div className="space-y-6 bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <MousePointer2 size={14} className="text-purple-500" /> Lógica de Destino do Banner
        </h4>
        <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[9px] font-black uppercase">
          Configuração Premium
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setTipoAtivo(tab.id as any);
              updateAcao({ tipo: tab.id as any });
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
              tipoAtivo === tab.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[120px]">
        {tipoAtivo === 'evento' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Busque pelo nome do show ou evento..."
                value={buscaEvento}
                onChange={(e) => setBuscaEvento(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div className="space-y-2">
              {carregandoEventos ? (
                <div className="py-8 flex justify-center"><Zap className="animate-spin text-purple-500" /></div>
              ) : buscaEvento && eventosFiltrados.length > 0 ? (
                eventosFiltrados.map(ev => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => updateAcao({ eventoId: ev.id })}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      acao?.eventoId === ev.id 
                        ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/30' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                         {ev.imagemUrl && <img src={ev.imagemUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{ev.nome}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">{ev.dataInicio} • {ev.local?.nome}</p>
                      </div>
                    </div>
                    {acao?.eventoId === ev.id && <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg"><Check size={12} /></div>}
                  </button>
                ))
              ) : buscaEvento ? (
                <div className="py-8 text-center text-zinc-400 text-xs font-medium">Nenhum evento encontrado</div>
              ) : null}
            </div>
          </div>
        )}

        {tipoAtivo === 'externo' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex gap-3">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                Use este destino para levar o usuário a um site de ingressos, Instagram ou página externa.
              </p>
            </div>
            <input
              type="url"
              placeholder="https://exemplo.com/evento"
              value={acao?.url || ''}
              onChange={(e) => updateAcao({ url: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
            />
          </div>
        )}

        {tipoAtivo === 'tab' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {['home', 'explorar', 'favoritos', 'perfil'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => updateAcao({ tab: tab as any })}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  acao?.tab === tab 
                    ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/30 text-purple-600' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-purple-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${acao?.tab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                   {tab === 'home' && <Layout size={16} />}
                   {tab === 'explorar' && <Search size={16} />}
                   {tab === 'favoritos' && <Ticket size={16} />}
                   {tab === 'perfil' && <MousePointer2 size={16} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{tab}</span>
              </button>
            ))}
          </div>
        )}

        {tipoAtivo === 'filtro' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl flex gap-3">
              <Filter size={16} className="text-purple-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed font-medium">
                Os usuários que clicarem serão levados à aba <strong>Explorar</strong> com estes filtros já aplicados. Ideal para "Shows do Fim de Semana".
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distância e Tipo */}
              <div className="space-y-4">
                <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Distância Máxima (km)</label>
                   <input 
                    type="number"
                    value={acao?.filtros?.distanciaMax || 50}
                    onChange={(e) => updateFiltros({ distanciaMax: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-sm font-bold"
                   />
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Tipo de Entrada</label>
                   <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                     {[
                       { id: 'todos', label: 'Todos' },
                       { id: 'gratis', label: 'Grátis' },
                       { id: 'pago', label: 'Pagos' }
                     ].map(t => (
                       <button
                         key={t.id}
                         type="button"
                         onClick={() => updateFiltros({ tipoEntrada: t.id as any })}
                         className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                           (acao?.filtros?.tipoEntrada || 'todos') === t.id ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg' : 'text-zinc-400'
                         }`}
                       >
                         {t.label}
                       </button>
                     ))}
                   </div>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Data</label>
                   <div className="grid grid-cols-2 gap-2">
                     {[
                       { id: 'hoje', label: 'Hoje' },
                       { id: 'amanha', label: 'Amanhã' },
                       { id: 'fds', label: 'Fim de Semana' },
                       { id: 'tudo', label: 'Sempre' }
                     ].map(d => (
                       <button
                         key={d.id}
                         type="button"
                         onClick={() => updateFiltros({ data: d.id as any })}
                         className={`py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${
                           (acao?.filtros?.data || 'tudo') === d.id 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                            : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500'
                         }`}
                       >
                         {d.label}
                       </button>
                     ))}
                   </div>
                </div>
              </div>

              {/* Categorias e Estilos */}
              <div className="space-y-4">
                <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Categorias</label>
                   <div className="flex flex-wrap gap-1.5">
                     {categorias.flatMap(g => g.itens || []).slice(0, 12).map(cat => (
                       <button
                         key={cat}
                         type="button"
                         onClick={() => {
                           const current = acao?.filtros?.categorias || [];
                           const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
                           updateFiltros({ categorias: next });
                         }}
                         className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                           acao?.filtros?.categorias?.includes(cat) 
                            ? 'bg-zinc-900 text-white' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800'
                         }`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Estilos Musicais</label>
                   <div className="flex flex-wrap gap-1.5">
                     {estilos.flatMap(g => g.itens || []).slice(0, 12).map(est => (
                       <button
                         key={est}
                         type="button"
                         onClick={() => {
                           const current = acao?.filtros?.estilos || [];
                           const next = current.includes(est) ? current.filter(c => c !== est) : [...current, est];
                           updateFiltros({ estilos: next });
                         }}
                         className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                           acao?.filtros?.estilos?.includes(est) 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800'
                         }`}
                       >
                         {est}
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

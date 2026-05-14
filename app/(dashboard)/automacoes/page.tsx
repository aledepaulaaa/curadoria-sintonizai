'use client';

import React from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Bell, 
  Clock, 
  Target, 
  Calendar,
  ChevronRight,
  Info,
  Smartphone,
  Users,
  Ticket
} from 'lucide-react';
import { Automacao, AutomacaoGatilho } from '@/src/types/automacao';
import { 
  listarAutomacoes, 
  salvarAutomacao, 
  excluirAutomacao, 
  alternarStatusAutomacao 
} from '@/src/actions/automacoes/automacoesActions';
import DataSelector from '@/src/components/common/DataSelector';

const GATILHOS: Record<AutomacaoGatilho, { label: string; icon: string; desc: string }> = {
  evento_salvo: { label: 'Evento Salvo', icon: '🔖', desc: 'Dispara quando o usuário favorita um evento' },
  evento_proximo: { label: 'Evento Próximo', icon: '📍', desc: 'Dispara baseado na localização e proximidade temporal' },
  mudanca_evento: { label: 'Mudança de Evento', icon: '✏️', desc: 'Dispara quando um evento salvo é alterado' },
  ingresso_acabando: { label: 'Ingresso Acabando', icon: '🎟️', desc: 'Dispara quando restam poucos ingressos' },
  novo_evento: { label: 'Novo Evento', icon: '✨', desc: 'Dispara quando um evento de estilo preferido é postado' },
  usuario_inativo: { label: 'Usuário Inativo', icon: '💤', desc: 'Dispara após X dias sem abrir o app' },
  recomendacao_geografica: { label: 'Recomendação Geográfica', icon: '📍', desc: 'Push inteligente baseado na localização e favoritos do usuário' },
  banner_exibicao: { label: 'Início de Banner', icon: '🖼️', desc: 'Dispara quando um banner de destaque começa a ser exibido' },
  banner_evento: { label: 'Início do Evento (Banner)', icon: '🔴', desc: 'Dispara quando o evento de um banner em destaque começa' },
  periodico: { label: 'Periódico / Agendado', icon: '📅', desc: 'Dispara em horários/dias fixos (estilo iFood)' },
};

const INITIAL_FORM: Omit<Automacao, 'id'> = {
  nome: '',
  gatilho: 'periodico',
  condicoes: {},
  timing: { tipo: 'imediato' },
  mensagem: { titulo: '', corpo: '' },
  destino: { tipo: 'home' },
  configuracao: { frequencia: 'diaria', ativa: true, horarioExecucao: '12:00' },
  destinatarios: { tipo: 'todos' },
  criadoEm: '',
  atualizadoEm: '',
};

export default function AutomacoesPage() {
  const [automacoes, setAutomacoes] = React.useState<Automacao[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<Omit<Automacao, 'id'>>(INITIAL_FORM);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    const data = await listarAutomacoes();
    setAutomacoes(data);
    setCarregando(false);
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await salvarAutomacao(form, editingId || undefined);
    if (res.success) {
      setShowForm(false);
      setForm(INITIAL_FORM);
      setEditingId(null);
      carregar();
    }
  };

  const handleEditar = (a: Automacao) => {
    const { id, ...rest } = a;
    setForm(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleToggle = async (a: Automacao) => {
    const novoStatus = !a.configuracao.ativa;
    const res = await alternarStatusAutomacao(a.id, novoStatus);
    if (res.success) carregar();
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir esta automação permanentemente?')) return;
    const res = await excluirAutomacao(id);
    if (res.success) carregar();
  };

  const inputCls = "w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all";
  const labelCls = "text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Zap className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Automações</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Crie réguas de comunicação e engajamento automático.</p>
        </div>

        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setForm(INITIAL_FORM); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <Plus size={20} /> Nova Automação
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSalvar} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                <Zap className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{editingId ? 'Editar Automação' : 'Configurar Nova Automação'}</h3>
                <p className="text-xs text-zinc-500">Defina o gatilho, as condições e a mensagem.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-bold text-zinc-400 hover:text-zinc-600">Cancelar</button>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Coluna 1: Gatilho e Timing */}
            <div className="space-y-8">
              <section className="space-y-6">
                <h4 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Play size={14} /> 1. O Gatilho
                </h4>
                
                <div>
                  <label className={labelCls}>Nome da Automação (Interno)</label>
                  <input 
                    required
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Lembrete Almoço iFood Style"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Tipo de Disparo (Gatilho)</label>
                  <select 
                    value={form.gatilho}
                    onChange={e => setForm({ ...form, gatilho: e.target.value as AutomacaoGatilho })}
                    className={inputCls}
                  >
                    {Object.entries(GATILHOS).map(([key, value]) => (
                      <option key={key} value={key}>{value.icon} {value.label}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-[10px] text-zinc-400 italic px-1">{GATILHOS[form.gatilho].desc}</p>
                </div>
              </section>

              <section className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                 <h4 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Clock size={14} /> 2. Timing e Frequência
                </h4>

                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Frequência</label>
                      <select 
                        value={form.configuracao.frequencia}
                        onChange={e => setForm({ ...form, configuracao: { ...form.configuracao, frequencia: e.target.value as any }})}
                        className={inputCls}
                      >
                        <option value="uma_vez">Uma vez (Data Única)</option>
                        <option value="diaria">Diária (Todo dia)</option>
                        <option value="semanal">Semanal (Dias da Semana)</option>
                        <option value="personalizada">📅 Personalizada (Calendário)</option>
                      </select>
                    </div>
                    {(form.gatilho === 'periodico' || form.gatilho === 'recomendacao_geografica' || form.gatilho === 'banner_exibicao' || form.gatilho === 'banner_evento') && (
                      <div>
                        <label className={labelCls}>Horário</label>
                        <input 
                          type="time"
                          value={form.configuracao.horarioExecucao}
                          onChange={e => setForm({ ...form, configuracao: { ...form.configuracao, horarioExecucao: e.target.value }})}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>

                  {form.configuracao.frequencia === 'uma_vez' && (
                    <div>
                      <label className={labelCls}>Data da Execução</label>
                      <input 
                        type="date"
                        value={form.configuracao.dataExecucao}
                        onChange={e => setForm({ ...form, configuracao: { ...form.configuracao, dataExecucao: e.target.value }})}
                        className={inputCls}
                      />
                    </div>
                  )}

                  {form.configuracao.frequencia === 'semanal' && (
                    <div className="space-y-3">
                      <label className={labelCls}>Repetir nos dias:</label>
                      <div className="flex gap-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, idx) => {
                          const selecionado = (form.configuracao.diasSemana || []).includes(idx);
                          return (
                            <button
                              key={`day-${idx}`}
                              type="button"
                              onClick={() => {
                                const atuais = form.configuracao.diasSemana || [];
                                const novos = atuais.includes(idx) 
                                  ? atuais.filter(d => d !== idx)
                                  : [...atuais, idx];
                                setForm({ ...form, configuracao: { ...form.configuracao, diasSemana: novos }});
                              }}
                              className={`w-9 h-9 rounded-lg text-[10px] font-bold border transition-all ${selecionado ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                            >
                              {dia}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {form.configuracao.frequencia === 'personalizada' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className={labelCls}>Datas Selecionadas no Calendário</label>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Recorrente?</span>
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, configuracao: { ...form.configuracao, recorrente: !form.configuracao.recorrente }})}
                            className={`w-8 h-4 rounded-full transition-colors relative ${form.configuracao.recorrente ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                          >
                            <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${form.configuracao.recorrente ? 'translate-x-4' : ''}`} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
                            <span key={`header-${idx}`} className="text-[9px] font-black text-zinc-400">{d}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {/* Mock de Calendário para o Mês Atual */}
                          {Array.from({ length: 31 }).map((_, i) => {
                            const dia = i + 1;
                            const dataStr = `2026-05-${dia.toString().padStart(2, '0')}`;
                            const selecionada = (form.configuracao.datasSelecionadas || []).includes(dataStr);
                            
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  const atuais = form.configuracao.datasSelecionadas || [];
                                  const novas = atuais.includes(dataStr)
                                    ? atuais.filter(d => d !== dataStr)
                                    : [...atuais, dataStr];
                                  setForm({ ...form, configuracao: { ...form.configuracao, datasSelecionadas: novas }});
                                }}
                                className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg border transition-all ${selecionada ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-300'}`}
                              >
                                {dia}
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-3 text-[9px] text-zinc-400 italic text-center">
                          {form.configuracao.datasSelecionadas?.length || 0} datas selecionadas.
                        </p>
                      </div>
                    </div>
                  )}

                  {(form.gatilho === 'evento_salvo' || form.gatilho === 'evento_proximo') && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Timing Relativo ao Evento</p>
                      <div className="grid grid-cols-3 gap-2">
                        <input 
                          type="number"
                          placeholder="Qtd"
                          value={form.timing.valor ?? ''}
                          onChange={e => setForm({ ...form, timing: { ...form.timing, tipo: 'relativo', valor: Number(e.target.value) }})}
                          className={inputCls}
                        />
                        <select 
                          value={form.timing.unidade ?? 'minutos'}
                          onChange={e => setForm({ ...form, timing: { ...form.timing, tipo: 'relativo', unidade: e.target.value as any }})}
                          className={inputCls}
                        >
                          <option value="minutos">Minutos</option>
                          <option value="horas">Horas</option>
                          <option value="dias">Dias</option>
                        </select>
                        <select 
                          value={form.timing.antesOuDepois ?? 'antes'}
                          onChange={e => setForm({ ...form, timing: { ...form.timing, tipo: 'relativo', antesOuDepois: e.target.value as any }})}
                          className={inputCls}
                        >
                          <option value="antes">Antes</option>
                          <option value="depois">Depois</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Coluna 2: Condições e Mensagem */}
            <div className="space-y-8">
              <section className="space-y-6">
                <h4 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Target size={14} /> 3. Condições e Público
                </h4>

                {form.gatilho === 'usuario_inativo' && (
                   <div>
                    <label className={labelCls}>Dias de inatividade</label>
                    <input 
                      type="number"
                      value={form.condicoes.diasInatividade ?? ''}
                      onChange={e => setForm({ ...form, condicoes: { ...form.condicoes, diasInatividade: Number(e.target.value) }})}
                      className={inputCls}
                    />
                  </div>
                )}

                {(form.gatilho === 'evento_proximo' || form.gatilho === 'recomendacao_geografica') && (
                   <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Raio Máx (KM)</label>
                        <input 
                          type="number"
                          value={form.condicoes.distanciaMaxKm ?? ''}
                          onChange={e => setForm({ ...form, condicoes: { ...form.condicoes, distanciaMaxKm: Number(e.target.value) }})}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Apenas Gratuitos?</label>
                        <select 
                          value={form.condicoes.gratuito ? 'sim' : 'nao'}
                          onChange={e => setForm({ ...form, condicoes: { ...form.condicoes, gratuito: e.target.value === 'sim' }})}
                          className={inputCls}
                        >
                          <option value="nao">Não (Todos)</option>
                          <option value="sim">Sim</option>
                        </select>
                      </div>
                    </div>
                    {form.gatilho === 'evento_proximo' && (
                      <div>
                        <label className={labelCls}>Janela (Horas)</label>
                        <input 
                          type="number"
                          value={form.condicoes.janelaHorarioHoras}
                          onChange={e => setForm({ ...form, condicoes: { ...form.condicoes, janelaHorarioHoras: Number(e.target.value) }})}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                   <label className={labelCls}>Destinatários</label>
                   <select 
                      value={form.destinatarios.tipo}
                      onChange={e => setForm({ ...form, destinatarios: { ...form.destinatarios, tipo: e.target.value as any }})}
                      className={inputCls}
                   >
                     <option value="todos">Todos os usuários</option>
                     <option value="especifico">Usuário Específico (Teste)</option>
                   </select>
                   {form.destinatarios.tipo === 'especifico' && (
                      <div className="mt-4">
                        <DataSelector 
                          collectionName="usuarios"
                          label="Escolher Usuário"
                          placeholder="Buscar usuário..."
                          selectedId={form.destinatarios.userId}
                          onSelect={(user) => setForm({ 
                            ...form, 
                            destinatarios: { ...form.destinatarios, userId: user?.id } 
                          })}
                          icon={<Users size={12} />}
                        />
                      </div>
                   )}
                </div>
              </section>

              <section className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Bell size={14} /> 4. Conteúdo
                </h4>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={labelCls}>Conteúdo da Notificação</label>
                    <div className="flex gap-2">
                       <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-mono">[nome_usuario]</span>
                       <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-mono">[nome_evento]</span>
                    </div>
                  </div>
                  <input 
                    required
                    value={form.mensagem.titulo}
                    onChange={e => setForm({ ...form, mensagem: { ...form.mensagem, titulo: e.target.value }})}
                    placeholder="Título da Notificação"
                    className={inputCls}
                  />
                  <textarea 
                    required
                    rows={3}
                    value={form.mensagem.corpo}
                    onChange={e => setForm({ ...form, mensagem: { ...form.mensagem, corpo: e.target.value }})}
                    placeholder="Corpo da mensagem que aparecerá na tela de bloqueio..."
                    className={`${inputCls} mt-2 h-24 resize-none`}
                  />
                  <p className="text-[10px] text-zinc-400 mt-2 italic">
                    Use as tags acima para personalizar a mensagem com dados reais do usuário/evento.
                  </p>
                </div>
              </section>
            </div>

            {/* Coluna 3: Preview e Destino */}
            <div className="space-y-8 bg-zinc-50 dark:bg-zinc-800/30 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
              <section className="space-y-6">
                <h4 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Smartphone size={14} /> 5. Preview & Destino
                </h4>

                <div>
                  <label className={labelCls}>Ao clicar na notificação, levar para:</label>
                  <select 
                    value={form.destino.tipo}
                    onChange={e => setForm({ ...form, destino: { ...form.destino, tipo: e.target.value as any }})}
                    className={inputCls}
                  >
                    <option value="home">🏠 Home / Início do App</option>
                    <option value="evento_contextual">📌 Evento que disparou o gatilho (Dinâmico)</option>
                    <option value="evento">🎟️ Evento Específico (Fixo)</option>
                    <option value="curadoria">✨ Aba Curadoria</option>
                    <option value="perfil">👤 Perfil do Usuário</option>
                  </select>
                  {form.destino.tipo === 'evento' && (
                     <div className="mt-4">
                        <DataSelector 
                          collectionName="eventos"
                          label="Selecionar Evento"
                          placeholder="Buscar evento pelo nome..."
                          selectedId={form.destino.id}
                          onSelect={(evento) => setForm({ 
                            ...form, 
                            destino: { ...form.destino, id: evento?.id } 
                          })}
                          icon={<Ticket size={12} />}
                        />
                     </div>
                  )}
                </div>

                {/* Mockup Notificação */}
                <div className="pt-6">
                   <label className={labelCls}>Preview Mobile</label>
                   <div className="bg-zinc-200 dark:bg-zinc-700 rounded-3xl p-4 shadow-inner">
                      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800 flex gap-3">
                         <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-xl">S</div>
                         <div className="flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                               <span className="text-[10px] font-bold text-zinc-900 dark:text-white">SINTONIZAÍ</span>
                               <span className="text-[8px] text-zinc-400">agora</span>
                            </div>
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">{form.mensagem.titulo || 'Título do Push'}</h5>
                            <p className="text-[10px] text-zinc-500 leading-tight line-clamp-2">{form.mensagem.corpo || 'Corpo da mensagem que aparecerá na tela de bloqueio do usuário...'}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </section>

              <div className="pt-8 flex flex-col gap-3">
                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 active:scale-95"
                >
                  {editingId ? 'Salvar Alterações' : 'Ativar Automação'}
                </button>
                <div className="flex items-start gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                   <Info size={16} className="text-purple-500 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                     Automações "Periódicas" rodam via Cloud Scheduler. Outros gatilhos são ativados por eventos no Firestore.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carregando ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-[2rem]" />
            ))
          ) : automacoes.length === 0 ? (
             <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 border-dashed">
                <Zap size={48} className="text-zinc-300 mb-4" />
                <h3 className="text-xl font-bold text-zinc-400">Nenhuma automação ativa</h3>
                <p className="text-zinc-500 text-sm">Comece criando sua primeira régua de engajamento.</p>
             </div>
          ) : (
            automacoes.map((a) => (
              <div key={a.id} className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                
                {/* Status Indicator */}
                <div className="absolute top-0 right-0 p-6">
                  <button 
                    onClick={() => handleToggle(a)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${a.configuracao.ativa ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  >
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${a.configuracao.ativa ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                     {GATILHOS[a.gatilho].icon}
                   </div>
                   <div>
                      <h4 className="font-black text-zinc-900 dark:text-white line-clamp-1">{a.nome}</h4>
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">{GATILHOS[a.gatilho].label}</span>
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center gap-2">
                      <Bell size={14} className="text-zinc-400" />
                      <p className="text-xs text-zinc-500 line-clamp-1">{a.mensagem.titulo}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-400" />
                      <p className="text-xs text-zinc-500">{a.configuracao.frequencia} {a.configuracao.horarioExecucao && `às ${a.configuracao.horarioExecucao}`}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Target size={14} className="text-zinc-400" />
                      <p className="text-xs text-zinc-500">Destino: <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase text-[10px]">{a.destino.tipo}</span></p>
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                   <button 
                    onClick={() => handleEditar(a)}
                    className="flex-1 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                   >
                     Editar
                   </button>
                   <button 
                    onClick={() => handleExcluir(a.id)}
                    className="w-12 h-11 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

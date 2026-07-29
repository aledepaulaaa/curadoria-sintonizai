'use client';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { X, ExternalLink, Calendar, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { db } from '@/src/services/firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';

interface IndicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IndicationsModal({ isOpen, onClose }: IndicationsModalProps) {
  const { indicacoes, feedbacks, eventosPendentes, loading, marcarTodasComoLidas } = useNotificationStore();

  if (!isOpen) return null;

  const handleMarcarComoVista = async (id: string, tipo: 'ind' | 'feed') => {
    try {
      const docRef = doc(db, tipo === 'ind' ? 'indicacoes' : 'feedbacks', id);
      await updateDoc(docRef, { status: tipo === 'ind' ? 'visualizado' : 'analisado' });
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalNotificacoes = indicacoes.length + feedbacks.length + (eventosPendentes?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Notificações da Comunidade</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Acompanhamento e curadoria de eventos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalNotificacoes > 0 && (
              <button 
                onClick={marcarTodasComoLidas}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-purple-100 transition-all"
              >
                <CheckCircle2 size={12} /> Marcar todas como lidas
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Carregando notificações...</p>
            </div>
          ) : totalNotificacoes === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                <Calendar size={32} />
              </div>
              <h4 className="text-zinc-900 dark:text-white font-medium">Nenhuma notificação nova</h4>
              <p className="text-sm text-zinc-500 max-w-[280px] mt-1">Quando houver novos reports ou coletas concluídas pelo Agent, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Seção de Coletas do Agent Pendentes de Revisão */}
              {eventosPendentes && eventosPendentes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-2 px-1">Coletas do Agent para Revisar ({eventosPendentes.length})</h4>
                  {eventosPendentes.map((ev) => (
                    <div key={ev.id} className="p-4 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-200/50 dark:border-purple-900/30 rounded-xl hover:border-purple-400 transition-all group">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-purple-500" />
                          <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{ev.nome}</h5>
                        </div>
                        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full uppercase">
                          {ev.categoria}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2 italic">"{ev.descricao}"</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200/20 dark:border-purple-900/20">
                        <span className="text-[10px] text-zinc-400">
                          Data: {isNaN(new Date(ev.dataInicio).getTime()) ? 'Data a confirmar' : new Date(ev.dataInicio).toLocaleDateString('pt-BR')}{ev.horario && ev.horario !== 'N/A' ? ` às ${ev.horario}` : ''}
                        </span>
                        <a href="/curadoria" onClick={onClose} className="text-[10px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-tighter">Revisar no Chat</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Seção de Reports */}
              {feedbacks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 px-1">Reports de Erro ({feedbacks.length})</h4>
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className="p-4 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl hover:border-amber-400 transition-all group">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-amber-500" />
                          <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{fb.eventoNome}</h5>
                        </div>
                        <button onClick={() => handleMarcarComoVista(fb.id, 'feed')} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded transition-all">
                          <X size={14} className="text-zinc-400" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 italic">"{fb.descricao}"</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-200/30 dark:border-amber-900/20">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">{fb.categoria}</span>
                        <a href="/comunidade" onClick={onClose} className="text-[10px] font-black text-zinc-400 hover:text-purple-500 uppercase tracking-tighter">Ver no Hub</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Seção de Indicações */}
              {indicacoes.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 px-1">Indicações ({indicacoes.length})</h4>
                  {indicacoes.map((ind) => (
                    <div key={ind.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 rounded-xl hover:border-purple-400 transition-all group">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          {ind.usuario.foto ? (
                            <img src={ind.usuario.foto} alt={ind.usuario.nome} className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/20" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-500 flex items-center justify-center text-white font-bold text-[10px]">
                              {getInitials(ind.usuario.nome)}
                            </div>
                          )}
                          <div>
                            <h5 className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{ind.usuario.nome}</h5>
                            <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">{ind.usuario.email}</p>
                          </div>
                        </div>
                        <button onClick={() => handleMarcarComoVista(ind.id, 'ind')} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all">
                          <X size={14} className="text-zinc-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink size={12} className="text-purple-500" />
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 break-all">{ind.url}</p>
                      </div>

                      <div className="flex items-center justify-end mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700/50">
                        <a href="/comunidade" onClick={onClose} className="text-[10px] font-black text-zinc-400 hover:text-purple-500 uppercase tracking-tighter">Resolver no Hub</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

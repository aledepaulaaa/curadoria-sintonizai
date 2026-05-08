'use client';

import React from 'react';
import { useNotificationStore, Indicacao } from '@/src/store/useNotificationStore';
import { X, ExternalLink, Calendar, User, MessageSquare } from 'lucide-react';
import { db } from '@/src/services/firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';

interface IndicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IndicationsModal({ isOpen, onClose }: IndicationsModalProps) {
  const { indicacoes, loading } = useNotificationStore();

  if (!isOpen) return null;

  const handleMarcarComoVista = async (id: string) => {
    try {
      const docRef = doc(db, 'indicacoes', id);
      await updateDoc(docRef, { status: 'visualizado' });
    } catch (error) {
      console.error('Erro ao atualizar indicação:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Indicações de Usuários</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Sugestões enviadas via app mobile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Carregando indicações...</p>
            </div>
          ) : indicacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                <Calendar size={32} />
              </div>
              <h4 className="text-zinc-900 dark:text-white font-medium">Nenhuma indicação nova</h4>
              <p className="text-sm text-zinc-500 max-w-[280px] mt-1">Quando os usuários sugerirem eventos no app, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {indicacoes.map((ind) => (
                <div key={ind.id} className="group p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 rounded-xl hover:border-purple-400 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 mb-3">
                      {ind.usuario.foto ? (
                        <img src={ind.usuario.foto} alt={ind.usuario.nome} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-500 flex items-center justify-center text-white font-bold text-xs">
                          {getInitials(ind.usuario.nome)}
                        </div>
                      )}
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{ind.usuario.nome}</h5>
                        <p className="text-[10px] text-zinc-500 font-mono">{ind.usuario.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400">
                      {ind.criadoEm?.toDate ? new Date(ind.criadoEm.toDate()).toLocaleDateString() : 'Agora'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink size={12} className="text-purple-500" />
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 break-all">{ind.url}</p>
                    </div>
                    {ind.descricao ? (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">"{ind.descricao}"</p>
                    ) : (
                      <p className="text-xs text-zinc-500 font-italic">Sem observações.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-700/50">
                    <button 
                      onClick={() => handleMarcarComoVista(ind.id)}
                      className="text-xs px-3 py-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      Arquivar
                    </button>
                    <button 
                      onClick={() => {
                        // Aqui poderíamos abrir o formulário de criação com os dados da indicação pré-preenchidos
                        alert('Em breve: Criar evento a partir desta indicação');
                      }}
                      className="text-xs px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Criar Evento
                    </button>
                  </div>
                </div>
              ))}
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

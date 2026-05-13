'use client';

import React from 'react';
import { db } from '@/src/services/firebaseClient';
import { CheckCircle, Clock, AlertTriangle, ExternalLink, Send, Trash2, Square, CheckSquare } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import { Feedback } from '@/src/store/useNotificationStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FeedbacksList() {
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selecionados, setSelecionados] = React.useState<string[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
      setFeedbacks(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleMarcarComoAnalise = async (id: string) => {
    try {
      await updateDoc(doc(db, 'feedbacks', id), { status: 'analisado' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarcarComoResolvido = async (feedback: Feedback) => {
    try {
      // 1. Atualiza status do feedback
      await updateDoc(doc(db, 'feedbacks', feedback.id), { status: 'resolvido', lida: true });

      // 2. Se houver usuário, envia mensagem de confirmação para o Centro de Curadoria dele
      if (feedback.usuarioId) {
        await addDoc(collection(db, 'curadoria_mensagens'), {
          titulo: 'Feedback Recebido!',
          mensagem: `Recebemos o seu feedback sobre o evento "${feedback.eventoNome}" e já tomamos as devidas providências. Agradecemos a contribuição!`,
          destinatarios: [feedback.usuarioId],
          data: serverTimestamp(),
          lida: false,
          tipo: 'curadoria'
        });

        // Trigger push notification (será feito via API route no futuro ou aqui mesmo se tivermos o token)
        // Por enquanto vamos focar na persistência da mensagem.
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este report?')) return;
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExcluirMassa = async () => {
    if (selecionados.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selecionados.length} reports?`)) return;

    try {
      const batch = writeBatch(db);
      selecionados.forEach(id => {
        batch.delete(doc(db, 'feedbacks', id));
      });
      await batch.commit();
      setSelecionados([]);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelecionar = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelecionarTodos = () => {
    if (selecionados.length === feedbacks.length) {
      setSelecionados([]);
    } else {
      setSelecionados(feedbacks.map(f => f.id));
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Clock className="animate-spin text-purple-600" /></div>;

  return (
    <div className="grid gap-4">
      {feedbacks.length > 0 && (
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSelecionarTodos}
              className="p-1 text-zinc-500 hover:text-purple-600 transition-colors"
            >
              {selecionados.length === feedbacks.length ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
              {selecionados.length} selecionados
            </span>
          </div>

          {selecionados.length > 0 && (
            <button 
              onClick={handleExcluirMassa}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-red-100 transition-all"
            >
              <Trash2 size={14} /> Excluir Massa
            </button>
          )}
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800">
          <p className="text-zinc-500">Nenhum report da comunidade ainda.</p>
        </div>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb.id} className={`flex gap-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 border transition-all ${fb.status === 'pendente' ? 'border-purple-200 dark:border-purple-900/30' : 'border-zinc-200 dark:border-zinc-800 opacity-80'}`}>
            <button 
              onClick={() => toggleSelecionar(fb.id)}
              className={`mt-1 p-1 h-fit transition-colors ${selecionados.includes(fb.id) ? 'text-purple-600' : 'text-zinc-300 dark:text-zinc-700'}`}
            >
              {selecionados.includes(fb.id) ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>

            <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    fb.status === 'pendente' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    fb.status === 'analisado' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {fb.status}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {fb.timestamp?.toDate ? format(fb.timestamp.toDate(), "dd 'de' MMMM, HH:mm", { locale: ptBR }) : 'Recentemente'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  {fb.eventoNome}
                  <a href={`/eventos?id=${fb.eventoId}`} target="_blank" className="text-purple-500 hover:text-purple-400">
                    <ExternalLink size={16} />
                  </a>
                </h3>
                
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm">Problema: <strong className="text-zinc-900 dark:text-white">{fb.categoria}</strong></span>
                </div>

                {fb.descricao ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                    "{fb.descricao}"
                  </p>
                ) : null}
              </div>

              <div className="flex md:flex-col gap-2 justify-end">
                {fb.status === 'pendente' && (
                  <button 
                    onClick={() => handleMarcarComoAnalise(fb.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                  >
                    <Clock size={14} /> Analisar
                  </button>
                )}
                {fb.status !== 'resolvido' && (
                  <button 
                    onClick={() => handleMarcarComoResolvido(fb)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all"
                  >
                    <CheckCircle size={14} /> Resolver {fb.usuarioId && '& Notificar'}
                  </button>
                )}

                <button 
                  onClick={() => handleExcluir(fb.id)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Excluir report"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

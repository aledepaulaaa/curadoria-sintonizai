'use client';

import React from 'react';
import { db } from '@/src/services/firebaseClient';
import { CheckCircle, Clock, ExternalLink, User, Trash2, Square, CheckSquare } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Indicacao } from '@/src/store/useNotificationStore';

export default function IndicacoesList() {
  const [indicacoes, setIndicacoes] = React.useState<Indicacao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selecionados, setSelecionados] = React.useState<string[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'indicacoes'), orderBy('criadoEm', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Indicacao[];
      setIndicacoes(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleResolver = async (indicacao: Indicacao, status: 'aprovado' | 'rejeitado') => {
    try {
      await updateDoc(doc(db, 'indicacoes', indicacao.id), { status });

      if (indicacao.usuario?.uid) {
        const msg = status === 'aprovado' 
          ? `Sua indicação do evento em "${indicacao.url}" foi aprovada! Em breve ele estará no app. Obrigado pela contribuição.`
          : `Recebemos sua indicação de evento, mas infelizmente ela não pôde ser aprovada no momento. Continue contribuindo!`;

        await addDoc(collection(db, 'curadoria_mensagens'), {
          titulo: status === 'aprovado' ? 'Indicação Aprovada!' : 'Indicação Analisada',
          mensagem: msg,
          destinatarios: [indicacao.usuario.uid],
          data: serverTimestamp(),
          lida: false,
          tipo: 'curadoria'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta indicação?')) return;
    try {
      await deleteDoc(doc(db, 'indicacoes', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExcluirMassa = async () => {
    if (selecionados.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selecionados.length} indicações?`)) return;

    try {
      const batch = writeBatch(db);
      selecionados.forEach(id => {
        batch.delete(doc(db, 'indicacoes', id));
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
    if (selecionados.length === indicacoes.length) {
      setSelecionados([]);
    } else {
      setSelecionados(indicacoes.map(i => i.id));
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Clock className="animate-spin text-purple-600" /></div>;

  return (
    <div className="grid gap-4">
      {indicacoes.length > 0 && (
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSelecionarTodos}
              className="p-1 text-zinc-500 hover:text-purple-600 transition-colors"
            >
              {selecionados.length === indicacoes.length ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
              {selecionados.length} selecionadas
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

      {indicacoes.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800">
          <p className="text-zinc-500">Nenhuma indicação pendente.</p>
        </div>
      ) : (
        indicacoes.map((ind) => (
          <div key={ind.id} className={`flex gap-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 border transition-all ${ind.status === 'pendente' ? 'border-purple-200 dark:border-purple-900/30' : 'border-zinc-200 dark:border-zinc-800 opacity-80'}`}>
            <button 
              onClick={() => toggleSelecionar(ind.id)}
              className={`mt-1 p-1 h-fit transition-colors ${selecionados.includes(ind.id) ? 'text-purple-600' : 'text-zinc-300 dark:text-zinc-700'}`}
            >
              {selecionados.includes(ind.id) ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>

            <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    ind.status === 'pendente' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    ind.status === 'aprovado' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {ind.status}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {ind.criadoEm?.toDate ? format(ind.criadoEm.toDate(), "dd 'de' MMMM, HH:mm", { locale: ptBR }) : 'Recentemente'}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                    Nova Indicação de Evento
                  </h3>
                  <a 
                    href={ind.url} 
                    target="_blank" 
                    className="text-purple-600 hover:underline flex items-center gap-2 text-sm font-medium"
                  >
                    {ind.url} <ExternalLink size={14} />
                  </a>
                </div>

                {ind.descricao ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                    {ind.descricao}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <User size={14} className="text-purple-500" />
                    <span className="text-xs font-bold">Enviado por {ind.usuario?.nome || 'Usuário Anônimo'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 ml-6">
                    <p className="text-[10px] text-zinc-500"><span className="font-bold">Email:</span> {ind.usuario?.email || '—'}</p>
                    <p className="text-[10px] text-zinc-500"><span className="font-bold">UID:</span> {ind.usuario?.uid || '—'}</p>
                    {ind.usuario?.telefone && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="text-zinc-500 font-bold">WhatsApp:</span> {ind.usuario.telefone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 justify-end">
                {ind.status === 'pendente' && (
                  <>
                    <button 
                      onClick={() => handleResolver(ind, 'aprovado')}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all"
                    >
                      <CheckCircle size={14} /> Aprovar
                    </button>
                    <button 
                      onClick={() => handleResolver(ind, 'rejeitado')}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      Rejeitar
                    </button>
                  </>
                )}

                <button 
                  onClick={() => handleExcluir(ind.id)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Excluir indicação"
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

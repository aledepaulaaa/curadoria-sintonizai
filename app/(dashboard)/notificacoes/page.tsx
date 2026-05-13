'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { db } from '@/src/services/firebaseClient';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { Search, Loader2, Check, X, Users, ImageIcon, LinkIcon, Send, Info } from 'lucide-react';

export default function NotificacoesPushPage() {
  const [titulo, setTitulo] = React.useState('');
  const [mensagem, setMensagem] = React.useState('');
  const [imagemUrl, setImagemUrl] = React.useState('');
  const [destinatario, setDestinatario] = React.useState<'todos' | 'especifico'>('todos');
  const [userId, setUserId] = React.useState('');
  const [tipoLink, setTipoLink] = React.useState<'nenhum' | 'evento' | 'curadoria'>('nenhum');
  const [entidadeId, setEntidadeId] = React.useState('');
  const [enviando, setEnviando] = React.useState(false);
  const [resultado, setResultado] = React.useState<{ tipo: 'sucesso' | 'erro', msg: string } | null>(null);

  // Estados para Busca de Usuário
  const [buscaUser, setBuscaUser] = React.useState('');
  const [usuarios, setUsuarios] = React.useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [userDropdown, setUserDropdown] = React.useState(false);
  const [userSelecionado, setUserSelecionado] = React.useState<any | null>(null);

  React.useEffect(() => {
    // Carrega usuários iniciais
    buscarUsuarios('');
  }, []);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (buscaUser.length >= 2 && !userSelecionado) {
        buscarUsuarios(buscaUser);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [buscaUser]);

  const buscarUsuarios = async (termo: string) => {
    setLoadingUsers(true);
    try {
      let q;
      if (termo) {
        q = query(
          collection(db, 'usuarios'),
          where('nome', '>=', termo),
          where('nome', '<=', termo + '\uf8ff'),
          limit(10)
        );
      } else {
        q = query(
          collection(db, 'usuarios'),
          limit(10)
        );
      }
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      setUsuarios(docs);
      if (termo) setUserDropdown(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);

    try {
      // 1. Persistir no Firestore (Coleção curadoria_mensagens)
      const msgData = {
        titulo,
        mensagem,
        imagemUrl: imagemUrl || null,
        data: serverTimestamp(),
        lida: false,
        tipo: 'curadoria',
        destinatarios: destinatario === 'todos' ? ['global'] : [userId],
        link: tipoLink !== 'nenhum' ? { tipo: tipoLink, id: entidadeId } : null
      };

      await addDoc(collection(db, 'curadoria_mensagens'), msgData);

      // 2. Chamar API de Push
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          mensagem,
          imagemUrl,
          userId: destinatario === 'especifico' ? userId : null,
          data: {
            tipo: tipoLink,
            ...(entidadeId && { eventoId: entidadeId })
          }
        })
      });

      if (response.ok) {
        setResultado({ tipo: 'sucesso', msg: 'Notificação enviada com sucesso!' });
        setTitulo('');
        setMensagem('');
        setImagemUrl('');
        setEntidadeId('');
      } else {
        throw new Error('Falha ao enviar push');
      }

    } catch (error) {
      setResultado({ tipo: 'erro', msg: 'Erro ao enviar notificação. Verifique os logs.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-6 pb-20">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Notificações Push</h1>
        <p className="text-sm text-zinc-500 font-medium">Comunique-se diretamente com os usuários do aplicativo.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleEnviar} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
            
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-2">Público Alvo</label>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl gap-2">
                <button 
                  type="button"
                  onClick={() => setDestinatario('todos')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${destinatario === 'todos' ? 'bg-white dark:bg-zinc-900 text-purple-600 shadow-sm' : 'text-zinc-500'}`}
                >
                  <Users size={14} /> Todos os Usuários
                </button>
                <button 
                  type="button"
                  onClick={() => setDestinatario('especifico')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${destinatario === 'especifico' ? 'bg-white dark:bg-zinc-900 text-purple-600 shadow-sm' : 'text-zinc-500'}`}
                >
                  <Users size={14} /> Usuário Específico
                </button>
              </div>

              {destinatario === 'especifico' && (
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-zinc-400">
                    {loadingUsers ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </div>
                  <input 
                    type="text"
                    placeholder="Digite o nome do usuário..."
                    value={userSelecionado ? `${userSelecionado.nome} - ${userSelecionado.uid}` : buscaUser}
                    onChange={(e) => {
                      setBuscaUser(e.target.value);
                      if (userSelecionado) {
                        setUserSelecionado(null);
                        setUserId('');
                      }
                    }}
                    onFocus={() => {
                      setUserDropdown(true);
                    }}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-12 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                    required={destinatario === 'especifico'}
                  />
                  
                  {userSelecionado && (
                    <button 
                      type="button"
                      onClick={() => {
                        setUserSelecionado(null);
                        setUserId('');
                        setBuscaUser('');
                      }}
                      className="absolute right-4 top-3.5 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}

                  {userDropdown && !userSelecionado && usuarios.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 max-h-60 overflow-y-auto">
                      {usuarios.map((u) => (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => {
                            setUserSelecionado(u);
                            setUserId(u.uid);
                            setUserDropdown(false);
                            setBuscaUser('');
                          }}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                              {u.fotoPerfil ? <img src={u.fotoPerfil} className="w-full h-full object-cover" /> : <Users size={14} className="text-zinc-500" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-zinc-900 dark:text-white">{u.nome}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{u.uid}</span>
                            </div>
                          </div>
                          <Check size={14} className="text-purple-500 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-2">Conteúdo da Mensagem</label>
              <input 
                type="text"
                placeholder="Título da Notificação"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-base font-bold focus:ring-2 focus:ring-purple-500 transition-all placeholder:font-medium"
                required
              />
              <textarea 
                placeholder="Texto da mensagem..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={4}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-2 flex items-center gap-2">
                  <ImageIcon size={12} /> Imagem (URL)
                </label>
                <input 
                  type="url"
                  placeholder="https://..."
                  value={imagemUrl}
                  onChange={(e) => setImagemUrl(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-2 flex items-center gap-2">
                  <LinkIcon size={12} /> Link de Destino
                </label>
                <select 
                  value={tipoLink}
                  onChange={(e) => setTipoLink(e.target.value as any)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                >
                  <option value="nenhum">Apenas abrir o app</option>
                  <option value="evento">Abrir Evento Específico</option>
                  <option value="curadoria">Abrir Centro de Curadoria</option>
                </select>
              </div>
            </div>

            {tipoLink === 'evento' && (
              <input 
                type="text"
                placeholder="ID do Evento"
                value={entidadeId}
                onChange={(e) => setEntidadeId(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={enviando}
                className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-400 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-purple-500/20 transition-all"
              >
                {enviando ? 'Enviando...' : <><Send size={18} /> Disparar Notificação</>}
              </button>
            </div>

            {resultado && (
              <div className={`p-4 rounded-2xl text-sm font-bold text-center ${resultado.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {resultado.msg}
              </div>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-[2rem] p-6 text-white border border-zinc-800 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-6">Preview Mobile</h3>
            <div className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700 space-y-3">
              <div className="flex items-center gap-2">
                <img src="/icone.svg" className="w-5 h-5" alt="" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Sintonizaí • Agora</span>
              </div>
              <div>
                <p className="text-sm font-bold">{titulo || 'Título da Notificação'}</p>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{mensagem || 'O texto da sua mensagem aparecerá aqui para o usuário...'}</p>
              </div>
              {imagemUrl && (
                <div className="w-full h-32 rounded-xl bg-zinc-700 overflow-hidden mt-2">
                  <img src={imagemUrl} className="w-full h-full object-cover" alt="" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] p-6 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-4">
              <Info size={20} />
              <h3 className="font-bold">Regras de Ouro</h3>
            </div>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed font-medium">
              <li>• Evite termos genéricos como "Clique aqui".</li>
              <li>• Use gatilhos emocionais (Urgência, Exclusividade).</li>
              <li>• Mantenha o título curto (máx 50 caracteres).</li>
              <li>• Respeite o horário nobre (18h-20h).</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

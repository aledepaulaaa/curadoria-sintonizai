'use client';

import React from 'react';
import { chatComGemini } from '@/src/actions/ia/geminiActions';
import { 
  listarConversasIA, 
  criarConversaIA, 
  atualizarConversaIA, 
  deletarConversaIA, 
  buscarConversaIA,
  type ConversaIA 
} from '@/src/actions/ia/conversasActions';
import { 
  Send, Loader2, Bot, User, Sparkles, AlertCircle, 
  Plus, History, Edit3, Trash2, FileText, Paperclip, X,
  Check, ArrowRight, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function GeminiChat() {
  const [conversas, setConversas] = React.useState<ConversaIA[]>([]);
  const [conversaAtiva, setConversaAtiva] = React.useState<ConversaIA | null>(null);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editandoTitulo, setEditandoTitulo] = React.useState<string | null>(null);
  const [novoTitulo, setNovoTitulo] = React.useState('');
  const [sidebarAberta, setSidebarAberta] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Fechar sidebar automaticamente no mobile ao carregar
  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarAberta(false);
    }
  }, []);

  const [imagemAnexada, setImagemAnexada] = React.useState<{ data: string, mimeType: string, preview: string } | null>(null);
  const [propostaAjuste, setPropostaAjuste] = React.useState<any>(null);
  const [statusIA, setStatusIA] = React.useState<string | null>(null);

  const carregarConversas = React.useCallback(async () => {
    const lista = await listarConversasIA();
    setConversas(lista);
  }, []);

  React.useEffect(() => {
    carregarConversas();
  }, [carregarConversas]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversaAtiva?.mensagens]);

  const handleNovaConversa = async () => {
    const res = await criarConversaIA();
    if (res.success && res.data) {
      setConversas([res.data, ...conversas]);
      setConversaAtiva(res.data);
    }
  };

  const handleSelecionarConversa = async (id: string) => {
    const c = await buscarConversaIA(id);
    if (c) {
      setConversaAtiva(c);
      if (window.innerWidth < 768) {
        setSidebarAberta(false);
      }
    }
  };

  const handleRenomear = async (id: string) => {
    if (!novoTitulo.trim()) return;
    await atualizarConversaIA(id, { titulo: novoTitulo });
    setEditandoTitulo(null);
    carregarConversas();
    if (conversaAtiva?.id === id) {
      setConversaAtiva({ ...conversaAtiva, titulo: novoTitulo });
    }
  };

  const handleDeletar = async (id: string) => {
    await deletarConversaIA(id);
    carregarConversas();
    if (conversaAtiva?.id === id) setConversaAtiva(null);
  };

  const processarArquivo = async (file: File): Promise<{ content?: string, image?: { data: string, mimeType: string, preview: string } }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          resolve({ 
            image: { 
              data: base64, 
              mimeType: file.type,
              preview: e.target?.result as string
            } 
          });
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith('.json') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        reader.onload = (e) => resolve({ content: e.target?.result as string });
        reader.readAsText(file);
      } else if (file.name.endsWith('.xlsx')) {
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet);
          resolve({ content: JSON.stringify(json, null, 2) });
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject('Formato não suportado');
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversaAtiva) return;

    setLoading(true);
    setStatusIA('Lendo arquivo...');
    try {
      const res = await processarArquivo(file);
      if (res.image) {
        setImagemAnexada(res.image);
      } else if (res.content) {
        const prompt = `Analise este arquivo (${file.name}):\n\n${res.content}`;
        setInput(prompt);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
      setStatusIA(null);
      e.target.value = ''; // Limpar input
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !imagemAnexada) || loading || !conversaAtiva) return;

    const textoEnvio = input.trim() || (imagemAnexada ? "Analise esta imagem e extraia os dados do evento." : "");
    const userMsg: Message = { role: 'user', parts: [{ text: textoEnvio }] };
    const novasMensagens = [...conversaAtiva.mensagens, userMsg];
    
    // Update local state immediately
    setConversaAtiva({ ...conversaAtiva, mensagens: novasMensagens });
    setInput('');
    const imgParaEnviar = imagemAnexada;
    setImagemAnexada(null);
    setLoading(true);
    setStatusIA('IA pensando...');
    setError(null);

    try {
      const response = await chatComGemini(novasMensagens, imgParaEnviar ? { data: imgParaEnviar.data, mimeType: imgParaEnviar.mimeType } : undefined);
      if (response.success && response.data) {
        const modelMsg: Message = { role: 'model', parts: [{ text: response.data }] };
        const finalMsgs = [...novasMensagens, modelMsg];
        
        await atualizarConversaIA(conversaAtiva.id, { mensagens: finalMsgs });
        setConversaAtiva({ ...conversaAtiva, mensagens: finalMsgs });

        if (response.metadata?.propostaAjuste) {
          setPropostaAjuste(response.metadata.propostaAjuste);
        }
      } else {
        setError(response.error || 'Falha na resposta da IA');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
      setStatusIA(null);
    }
  };

  const handleConfirmarAjuste = async () => {
    if (!propostaAjuste) return;
    setLoading(true);
    setStatusIA('Aplicando correções massivas...');
    try {
      const { aplicarAjusteMassivo } = await import('@/src/actions/eventos/bulkActions');
      const res = await aplicarAjusteMassivo({
        ids: propostaAjuste.eventos.map((e: any) => e.id),
        campo: propostaAjuste.campo,
        novoValor: propostaAjuste.novoValor
      });

      if (res.success) {
        setPropostaAjuste(null);
        // Adicionar mensagem de sucesso no chat
        const msgSucesso: Message = { role: 'model', parts: [{ text: `✅ Sucesso! Ajustei ${res.data?.count} eventos para "${propostaAjuste.novoValor}" no campo "${propostaAjuste.campo}".` }] };
        const finalMsgs = [...(conversaAtiva?.mensagens || []), msgSucesso];
        if (conversaAtiva) {
          await atualizarConversaIA(conversaAtiva.id, { mensagens: finalMsgs });
          setConversaAtiva({ ...conversaAtiva, mensagens: finalMsgs });
        }
      } else {
        setError('Erro ao aplicar ajuste: ' + res.error);
      }
    } catch (e) {
      setError('Falha crítica ao aplicar ajuste');
    } finally {
      setLoading(false);
      setStatusIA(null);
    }
  };

  return (
    <div className="flex h-[700px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden relative">
      {/* Sidebar de Histórico */}
      <motion.div 
        initial={false}
        animate={{ 
          width: sidebarAberta ? (window.innerWidth < 768 ? '100%' : 300) : 0,
          opacity: sidebarAberta ? 1 : 0
        }}
        className={`bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden absolute md:relative z-20 h-full shadow-2xl md:shadow-none`}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> Histórico
          </span>
          <div className="flex items-center gap-2">
            <button onClick={handleNovaConversa} className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20">
              <Plus size={16} />
            </button>
            <button onClick={() => setSidebarAberta(false)} className="md:hidden p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500">
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversas.map((c) => (
            <div 
              key={c.id} 
              onClick={() => handleSelecionarConversa(c.id)}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                conversaAtiva?.id === c.id 
                  ? 'bg-white dark:bg-zinc-800 border-purple-200 dark:border-purple-500/30 shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              {editandoTitulo === c.id ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                   <input 
                    autoFocus
                    value={novoTitulo} 
                    onChange={e => setNovoTitulo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRenomear(c.id)}
                    className="w-full bg-zinc-100 dark:bg-zinc-700 border-none text-xs rounded p-1 outline-none focus:ring-1 focus:ring-purple-500"
                   />
                   <button onClick={() => handleRenomear(c.id)} className="text-green-500 p-1"><Check size={14}/></button>
                   <button onClick={() => setEditandoTitulo(null)} className="text-red-500 p-1"><X size={14}/></button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 truncate pr-12">{c.titulo}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">{new Date(c.atualizadoEm).toLocaleDateString()}</p>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditandoTitulo(c.id); setNovoTitulo(c.titulo); }} 
                      className="p-1.5 hover:text-blue-500 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-700 md:bg-transparent rounded-lg shadow-sm md:shadow-none"
                    >
                      <Edit3 size={14}/>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeletar(c.id); }} 
                      className="p-1.5 hover:text-red-500 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-700 md:bg-transparent rounded-lg shadow-sm md:shadow-none"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarAberta(!sidebarAberta)} 
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                sidebarAberta 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' 
                  : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500'
              }`}
            >
              <History size={18} />
              <span className="text-xs font-bold md:hidden">Histórico</span>
            </button>
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                {conversaAtiva?.titulo || 'Gemini Curation'}
              </h3>
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-zinc-500 uppercase">IA Vision Ativa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-white dark:bg-zinc-900">
          {!conversaAtiva ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <Bot size={48} className="text-zinc-300 dark:text-zinc-700" />
              <div className="max-w-xs">
                 <h4 className="text-sm font-bold text-zinc-400">Nenhuma conversa selecionada</h4>
                 <p className="text-xs text-zinc-500 mt-1">Selecione uma conversa ao lado ou crie uma nova para começar a curadoria com IA.</p>
                 <button onClick={handleNovaConversa} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20">
                    Começar Agora
                 </button>
              </div>
            </div>
          ) : conversaAtiva.mensagens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Sparkles size={48} className="text-zinc-300 dark:text-zinc-700" />
              <div className="max-w-xs">
                 <p className="text-sm font-bold text-zinc-400">Chat Iniciado!</p>
                 <p className="text-xs text-zinc-500 mt-1">Envie uma mensagem ou anexe um print de evento.</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {conversaAtiva.mensagens.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-tr-none' 
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-700/50 shadow-sm'
                    }`}>
                      {msg.parts[0].text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {loading && (
            <div className="flex justify-start">
               <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                     <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex flex-col gap-2">
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                     </div>
                     {statusIA && <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest animate-pulse">{statusIA}</span>}
                  </div>
               </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100 dark:border-red-500/20">
                 <AlertCircle size={14} />
                 {error}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-3">
            {/* Imagem Anexada Preview */}
            <AnimatePresence>
              {imagemAnexada && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-purple-500 group"
                >
                  <img src={imagemAnexada.preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImagemAnexada(null)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 relative">
              <div className="flex items-center gap-2">
                 <label className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm text-zinc-500">
                    <Paperclip size={18} />
                    <input type="file" accept=".json,.csv,.xlsx,.txt,image/*" onChange={handleFileUpload} className="hidden" />
                 </label>
              </div>

              <input
                disabled={!conversaAtiva}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={conversaAtiva ? "Pergunte algo ou anexe um print..." : "Selecione uma conversa..."}
                className="flex-1 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
              <button 
                onClick={handleSend}
                disabled={loading || (!input.trim() && !imagemAnexada) || !conversaAtiva}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Proposta de Ajuste Massivo */}
      <AnimatePresence>
        {propostaAjuste && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-purple-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Proposta de Ajuste Massivo</h2>
                    <p className="text-sm text-purple-100 font-medium">A IA identificou {propostaAjuste.eventos.length} eventos para corrigir</p>
                  </div>
                </div>
                <button onClick={() => setPropostaAjuste(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={14} /> Justificativa da IA
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed italic">
                    "{propostaAjuste.justificativa}"
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Eventos Selecionados</span>
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                      Campo: {propostaAjuste.campo}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {propostaAjuste.eventos.map((ev: any) => (
                      <div key={ev.id} className="p-4 bg-white dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-purple-200 dark:hover:border-purple-900/30 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{ev.nome}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-medium text-zinc-400 line-through">{ev.antigo || 'vazio'}</span>
                          <ArrowRight size={14} className="text-purple-400" />
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">
                            {ev.novo}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-4">
                <button 
                  onClick={() => setPropostaAjuste(null)}
                  className="flex-1 py-4 px-6 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmarAjuste}
                  disabled={loading}
                  className="flex-1 py-4 px-6 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Confirmar Ajustes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

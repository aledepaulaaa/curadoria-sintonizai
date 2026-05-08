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
  Check
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
    if (c) setConversaAtiva(c);
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

  const processarArquivo = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.name.endsWith('.json')) {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      } else if (file.name.endsWith('.xlsx')) {
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet);
          resolve(JSON.stringify(json, null, 2));
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
    try {
      const content = await processarArquivo(file);
      const prompt = `Analise este arquivo (${file.name}):\n\n${content}`;
      setInput(prompt);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !conversaAtiva) return;

    const userMsg: Message = { role: 'user', parts: [{ text: input }] };
    const novasMensagens = [...conversaAtiva.mensagens, userMsg];
    
    // Update local state immediately
    setConversaAtiva({ ...conversaAtiva, mensagens: novasMensagens });
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await chatComGemini(novasMensagens);
      if (response.success && response.data) {
        const modelMsg: Message = { role: 'model', parts: [{ text: response.data }] };
        const finalMsgs = [...novasMensagens, modelMsg];
        
        await atualizarConversaIA(conversaAtiva.id, { mensagens: finalMsgs });
        setConversaAtiva({ ...conversaAtiva, mensagens: finalMsgs });
      } else {
        setError(response.error || 'Falha na resposta da IA');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[700px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Sidebar de Histórico */}
      <motion.div 
        animate={{ width: sidebarAberta ? 300 : 0 }}
        className="bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> Histórico
          </span>
          <button onClick={handleNovaConversa} className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20">
            <Plus size={16} />
          </button>
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
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditandoTitulo(c.id); setNovoTitulo(c.titulo); }} className="p-1 hover:text-blue-500"><Edit3 size={12}/></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletar(c.id); }} className="p-1 hover:text-red-500"><Trash2 size={12}/></button>
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
            <button onClick={() => setSidebarAberta(!sidebarAberta)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
              <History size={18} />
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
                 <span className="text-[10px] font-bold text-zinc-500 uppercase">IA Ativa</span>
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
                 <p className="text-xs text-zinc-500 mt-1">Envie uma mensagem ou anexe um arquivo para começar a análise.</p>
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
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex gap-1">
                     <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                     <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                     <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
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
          <div className="flex gap-2 relative">
            <div className="absolute -top-12 left-0 flex gap-2">
               <label className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm text-zinc-500 flex items-center gap-2 text-xs font-bold">
                  <Paperclip size={14} /> Anexar Dados
                  <input type="file" accept=".json,.csv,.xlsx,.txt" onChange={handleFileUpload} className="hidden" />
               </label>
            </div>

            <input
              disabled={!conversaAtiva}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={conversaAtiva ? "Pergunte algo ou cole dados..." : "Selecione uma conversa..."}
              className="flex-1 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim() || !conversaAtiva}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GeminiChat from '@/src/components/curadoria/GeminiChat';
import ImportManager from '@/src/components/curadoria/ImportManager';
import ManualCuradoria from '@/src/components/curadoria/ManualCuradoria';
import { Sparkles, FileUp, Edit3 } from 'lucide-react';

export default function CuradoriaPage() {
  const [tab, setTab] = React.useState<'chat' | 'import' | 'manual'>('chat');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Central de Curadoria</h1>
          <p className="text-sm text-zinc-500 font-medium">Gerencie o conteúdo do Sintonizaí com IA ou manualmente.</p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-700 shadow-inner">
           <button 
             onClick={() => setTab('chat')}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
               tab === 'chat' ? 'bg-white dark:bg-zinc-900 text-purple-600 shadow-xl' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
             }`}
           >
             <Sparkles size={14} /> Chat IA
           </button>
           <button 
             onClick={() => setTab('manual')}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
               tab === 'manual' ? 'bg-white dark:bg-zinc-900 text-purple-600 shadow-xl' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
             }`}
           >
             <Edit3 size={14} /> Manual
           </button>
           <button 
             onClick={() => setTab('import')}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
               tab === 'import' ? 'bg-white dark:bg-zinc-900 text-purple-600 shadow-xl' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
             }`}
           >
             <FileUp size={14} /> Importação
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'chat' && <GeminiChat />}
          {tab === 'manual' && <ManualCuradoria />}
          {tab === 'import' && <ImportManager />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

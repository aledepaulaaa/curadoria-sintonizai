'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, MapPin } from 'lucide-react';
import FeedbacksList from '@/src/components/comunidade/FeedbacksList';
import IndicacoesList from '@/src/components/comunidade/IndicacoesList';

export default function ComunidadePage() {
  const [tab, setTab] = React.useState<'feedbacks' | 'indicacoes'>('feedbacks');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Hub da Comunidade</h1>
          <p className="text-sm text-zinc-500 font-medium">Gerencie reports de erros e indicações de novos eventos.</p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-700 shadow-inner">
           <button 
             onClick={() => setTab('feedbacks')}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
               tab === 'feedbacks' ? 'bg-white dark:bg-zinc-900 text-purple-600 shadow-xl' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
             }`}
           >
             <MessageSquare size={14} /> Reports
           </button>
           <button 
             onClick={() => setTab('indicacoes')}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
               tab === 'indicacoes' ? 'bg-white dark:bg-zinc-900 text-purple-600 shadow-xl' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
             }`}
           >
             <MapPin size={14} /> Indicações
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
          {tab === 'feedbacks' && <FeedbacksList />}
          {tab === 'indicacoes' && <IndicacoesList />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

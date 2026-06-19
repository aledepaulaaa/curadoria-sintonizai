'use client';

import { AlertTriangle, RefreshCcw, Zap } from 'lucide-react';
import EmptyState from '@/src/components/common/EmptyState';
import ChartCard from '@/src/components/dashboard/ChartCard';
import KpiCard from '@/src/components/dashboard/KpiCard';
import { useInsights } from '@/src/hooks/useInsights';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { kpis, categorias, gratuitos, topShared, pushStats, topBuscas, totalBuscas, carregando, erro, carregar } = useInsights();

  // Injetar KPI de Push se disponível
  const allKpis = [...kpis];
  if (pushStats) {
    allKpis.push({ label: 'Cliques Push', valor: pushStats.totalClicks, icone: 'Zap' });
  }

  if (carregando) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-[400px]">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Ops! Algo deu errado</h3>
        <p className="text-sm text-zinc-500 mt-2 mb-6">{erro}</p>
        <button 
          onClick={() => carregar()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
        >
          <RefreshCcw size={16} />
          Tentar Novamente
        </button>
      </div>
    );
  }

  const temDados = kpis.some(k => k.valor > 0) || categorias.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>

      {!temDados ? (
        <EmptyState 
          titulo="Nenhum evento cadastrado" 
          mensagem="Comece importando ou criando eventos para visualizar os dados aqui."
        />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {allKpis.map((kpi, i) => (
              <KpiCard key={i} {...kpi} delay={i * 0.1} />
            ))}
          </div>

          {/* Charts & Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard titulo="Distribuição por Categoria" dados={categorias} tipo="bar" />
            
            {/* Top Shared Events */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Top 10 Compartilhados</h3>
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-[10px] font-bold uppercase">Popularidade</div>
              </div>

              <div className="space-y-3">
                {topShared.length > 0 ? (
                  topShared.map((item, i) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 group hover:border-purple-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{item.nome}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-600">
                        <span className="text-sm font-black">{item.total}</span>
                        <span className="text-[10px] font-bold uppercase opacity-60">shares</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-zinc-500 text-sm italic">Nenhum compartilhamento registrado ainda.</div>
                )}
              </div>
            </div>

            {/* Top Searched Terms */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Top 10 Termos de Busca</h3>
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-[10px] font-bold uppercase">Marketing</div>
              </div>

              <div className="space-y-3">
                {topBuscas && topBuscas.length > 0 ? (
                  topBuscas.map((item, i) => (
                    <div key={item.termo} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 group hover:border-purple-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{item.termo}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-600">
                        <span className="text-sm font-black">{item.total}</span>
                        <span className="text-[10px] font-bold uppercase opacity-60">buscas</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-zinc-500 text-sm italic">Nenhuma busca registrada ainda.</div>
                )}
              </div>
            </div>

            <ChartCard titulo="Gratuito vs Pago" dados={gratuitos} tipo="pie" />
          </div>

          {/* Push Analytics Section */}
          {pushStats && (
            <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-purple-600 rounded-lg">
                   <Zap size={18} className="text-white" />
                 </div>
                 <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Engajamento de Notificações</h2>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ChartCard titulo="Cliques por Plataforma" dados={pushStats.byPlatform} tipo="pie" />
                 <div className="lg:col-span-2">
                   <ChartCard titulo="Cliques por Dia da Semana" dados={pushStats.byDay} tipo="bar" />
                 </div>
               </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

'use client';

import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartData } from '@/src/types/common';
import { useThemeContext } from '@/src/contexts/ThemeContext';
import { motion } from 'framer-motion';

const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6'];

interface ChartCardProps {
  titulo: string;
  dados: ChartData[];
  tipo: 'bar' | 'pie';
}

export default function ChartCard({ titulo, dados, tipo }: ChartCardProps) {
  const { mode } = useThemeContext();
  const [mounted, setMounted] = React.useState(false);
  const topDados = tipo === 'bar' ? dados.slice(0, 8) : dados;

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 min-h-[350px] overflow-hidden"
    >
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-300 mb-4">{titulo}</h3>

      <div className="h-64 w-full min-w-0 relative">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
            {tipo === 'bar' ? (
              <BarChart data={topDados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="nome" tick={{ fill: '#71717A', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#71717A', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: mode === 'dark' ? '#27272A' : '#FFF', border: '1px solid #E4E4E7', borderRadius: 12, color: mode === 'dark' ? '#FFF' : '#18181B' }} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {topDados.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie data={topDados} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="valor">
                  {topDados.map((entry, i) => <Cell key={i} fill={entry.cor || COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: mode === 'dark' ? '#27272A' : '#FFF', border: '1px solid #E4E4E7', borderRadius: 12, color: mode === 'dark' ? '#FFF' : '#18181B' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

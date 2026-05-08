import { motion } from 'framer-motion';
import { Ticket, TrendingUp, Users, Bell, Share2, Calendar, type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  valor: number;
  icone: string;
  cor?: string;
  delay?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Ticket: Ticket,
  TrendingUp: TrendingUp,
  Users: Users,
  Bell: Bell,
  Share2: Share2,
  Calendar: Calendar,
};

export default function KpiCard({ label, valor, icone, delay = 0 }: KpiCardProps) {
  const Icon = ICON_MAP[icone] || Ticket;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 hover:border-purple-400 dark:hover:border-purple-500/30 transition-colors group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full -translate-y-8 translate-x-8 transition-transform group-hover:scale-110" />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{valor.toLocaleString('pt-BR')}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors">
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

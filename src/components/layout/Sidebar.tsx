'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Sparkles, 
  Ticket, 
  Users, 
  Megaphone, 
  Image as ImageIcon, 
  FileText,
  Settings2,
  Tag,
  Music
} from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/curadoria', label: 'Curadoria', icon: Sparkles },
  { href: '/eventos', label: 'Eventos', icon: Ticket },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/estilos', label: 'Estilos', icon: Music },
  { href: '/filtros', label: 'Filtros', icon: Settings2 },
  { href: '/anuncios', label: 'Banners', icon: Megaphone },
  { href: '/galeria', label: 'Galeria', icon: ImageIcon },
  { href: '/api-docs', label: 'API Docs', icon: FileText },
];

interface SidebarProps {
  aberta: boolean;
  onFechar: () => void;
}

export default function Sidebar({ aberta, onFechar }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarColapsada } = useUIStore();

  return (
    <>
      {/* Overlay mobile */}
      {aberta && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onFechar} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 
          transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
          ${aberta ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarColapsada ? 'w-20' : 'w-72'}`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-6 py-6 border-b border-zinc-200 dark:border-zinc-800 h-24 overflow-hidden`}>
          <img src="/icone.svg" alt="Sintonizaí" className="w-10 h-10 flex-shrink-0" />
          {!sidebarColapsada && (
            <div className="whitespace-nowrap">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Sintonizaí</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Curadoria CMS</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onFechar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                  ${ativo
                    ? 'bg-purple-50 dark:bg-purple-600/30 text-purple-600 dark:text-white border border-purple-200 dark:border-purple-500/30'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
              >
                <item.icon size={22} className={ativo ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors'} />
                {!sidebarColapsada && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">v1.0.7</p>
        </div>
      </aside>
    </>
  );
}

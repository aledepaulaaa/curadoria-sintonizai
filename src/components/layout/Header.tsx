import React from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { useThemeContext } from '@/src/contexts/ThemeContext';
import { 
  Menu, 
  Moon, 
  Sun, 
  LogOut, 
  PanelLeftClose, 
  PanelLeftOpen 
} from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { Bell } from 'lucide-react';
import IndicationsModal from '../curadoria/IndicationsModal';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeContext();
  const { sidebarColapsada, toggleSidebarColapsada } = useUIStore();
  const { naoLidas, iniciarListener } = useNotificationStore();
  const [menuAberto, setMenuAberto] = React.useState(false);
  const [modalIndicacoesAberto, setModalIndicacoesAberto] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = iniciarListener();
    return () => unsubscribe();
  }, [iniciarListener]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        {/* Menu hamburger mobile */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Toggle Sidebar Desktop */}
        <button
          onClick={toggleSidebarColapsada}
          className="hidden lg:flex p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={sidebarColapsada ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {sidebarColapsada ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block">
          Painel de Curadoria
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notificações */}
        <button
          onClick={() => setModalIndicacoesAberto(true)}
          className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Indicações de Usuários"
        >
          <Bell size={20} />
          {naoLidas > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
              {naoLidas}
            </span>
          )}
        </button>

        {/* Toggle tema */}
        <button
          onClick={toggleMode}
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <IndicationsModal 
          isOpen={modalIndicacoesAberto} 
          onClose={() => setModalIndicacoesAberto(false)} 
        />

        <div className="relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 transition-all"
          >
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300 hidden lg:block">
              {user?.displayName || user?.email || 'Admin'}
            </span>
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 z-50">
              <button
                onClick={() => { setMenuAberto(false); logout(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuthContext } from '@/src/contexts/AuthContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import Sidebar from '@/src/components/layout/Sidebar';
import Header from '@/src/components/layout/Header';
import IndicationsModal from '@/src/components/curadoria/IndicationsModal';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <img src="/icone.svg" alt="Carregando..." className="w-16 h-16" />
          <p className="text-zinc-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarAberta, setSidebarAberta] = React.useState(false);
  const [modalIndicacoesAberto, setModalIndicacoesAberto] = React.useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen transition-colors duration-300">
        <Sidebar aberta={sidebarAberta} onFechar={() => setSidebarAberta(false)} />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header 
            onToggleSidebar={() => setSidebarAberta(!sidebarAberta)} 
            onOpenNotifications={() => setModalIndicacoesAberto(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <IndicationsModal 
        isOpen={modalIndicacoesAberto} 
        onClose={() => setModalIndicacoesAberto(false)} 
      />
    </AuthGuard>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DashboardShell>{children}</DashboardShell>
      </ThemeProvider>
    </AuthProvider>
  );
}

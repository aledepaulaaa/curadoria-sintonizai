'use client';

import React from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  mode: 'dark',
  toggleMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ThemeMode>('dark');

  React.useEffect(() => {
    const saved = localStorage.getItem('sintonizai-theme') as ThemeMode | null;
    if (saved) {
      setMode(saved);
    } else {
      // Se não houver salvo, verifica a classe atual ou preferência do sistema
      const isDark = document.documentElement.classList.contains('dark');
      setMode(isDark ? 'dark' : 'light');
    }
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    console.log('🌓 Alterando tema para:', mode);
    if (mode === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      console.log('✅ Classe "dark" adicionada ao HTML e Body');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      console.log('✅ Classe "dark" removida do HTML e Body');
    }
  }, [mode]);

  const toggleMode = React.useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sintonizai-theme', next);
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeContext = () => React.useContext(ThemeContext);

import { create } from 'zustand';

interface UIState {
  sidebarAberta: boolean;
  sidebarColapsada: boolean;
  setSidebarAberta: (aberta: boolean) => void;
  toggleSidebarColapsada: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarAberta: false,
  sidebarColapsada: false,
  setSidebarAberta: (sidebarAberta) => set({ sidebarAberta }),
  toggleSidebarColapsada: () => set((state) => ({ sidebarColapsada: !state.sidebarColapsada })),
}));

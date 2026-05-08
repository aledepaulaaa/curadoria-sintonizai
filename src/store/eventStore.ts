import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Evento } from '@/src/types/evento';
import { listarEventos } from '@/src/actions/eventos/eventosActions';

interface EventState {
  eventos: Evento[];
  carregando: boolean;
  ultimaAtualizacao: number | null;
  
  // Ações
  setEventos: (eventos: Evento[]) => void;
  carregarEventos: (force?: boolean) => Promise<void>;
  adicionarEvento: (evento: Evento) => void;
  atualizarEventoLocal: (id: string, dados: Partial<Evento>) => void;
  removerEventoLocal: (id: string) => void;
  removerEventosBatchLocal: (ids: string[]) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      eventos: [],
      carregando: false,
      ultimaAtualizacao: null,

      setEventos: (eventos) => set({ eventos, ultimaAtualizacao: Date.now() }),

      carregarEventos: async (force = false) => {
        const { eventos, ultimaAtualizacao, carregando } = get();
        
        // Se já está carregando, não faz nada
        if (carregando) return;

        // Cache por 5 minutos, a menos que force o refresh
        const cincoMinutos = 5 * 60 * 1000;
        const cacheValido = ultimaAtualizacao && (Date.now() - ultimaAtualizacao < cincoMinutos);

        if (!force && eventos.length > 0 && cacheValido) {
          return;
        }

        set({ carregando: true });
        try {
          const lista = await listarEventos();
          set({ eventos: lista, ultimaAtualizacao: Date.now(), carregando: false });
        } catch (error) {
          console.error('[Store] Erro ao carregar eventos:', error);
          set({ carregando: false });
        }
      },

      adicionarEvento: (evento) => 
        set((state) => ({ 
          eventos: [evento, ...state.eventos],
          ultimaAtualizacao: Date.now()
        })),

      atualizarEventoLocal: (id, dados) =>
        set((state) => ({
          eventos: state.eventos.map((e) => (e.id === id ? { ...e, ...dados } : e)),
          ultimaAtualizacao: Date.now()
        })),

      removerEventoLocal: (id) =>
        set((state) => ({
          eventos: state.eventos.filter((e) => e.id !== id),
          ultimaAtualizacao: Date.now()
        })),

      removerEventosBatchLocal: (ids) =>
        set((state) => ({
          eventos: state.eventos.filter((e) => !ids.includes(e.id || '')),
          ultimaAtualizacao: Date.now()
        })),
    }),
    {
      name: 'curadoria-eventos-cache',
      storage: createJSONStorage(() => localStorage),
      // Não persistir o estado de carregamento
      partialize: (state) => ({ 
        eventos: state.eventos, 
        ultimaAtualizacao: state.ultimaAtualizacao 
      }),
    }
  )
);

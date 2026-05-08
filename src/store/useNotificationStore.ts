import { create } from 'zustand';
import { db } from '../services/firebaseClient';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export interface Indicacao {
  id: string;
  url: string;
  descricao: string;
  usuario: {
    uid: string;
    nome: string;
    email: string;
    foto?: string | null;
    localizacao?: any;
  };
  status: 'pendente' | 'aprovado' | 'rejeitado';
  criadoEm: any;
}

interface NotificationState {
  indicacoes: Indicacao[];
  naoLidas: number;
  loading: boolean;
  setIndicacoes: (indicacoes: Indicacao[]) => void;
  iniciarListener: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  indicacoes: [],
  naoLidas: 0,
  loading: true,

  setIndicacoes: (indicacoes) => set({ 
    indicacoes, 
    naoLidas: indicacoes.filter(i => i.status === 'pendente').length,
    loading: false 
  }),

  iniciarListener: () => {
    const q = query(
      collection(db, 'indicacoes'),
      where('status', '==', 'pendente'),
      orderBy('criadoEm', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Indicacao[];
      
      set({ 
        indicacoes: docs,
        naoLidas: docs.length,
        loading: false 
      });
    });

    return unsubscribe;
  }
}));

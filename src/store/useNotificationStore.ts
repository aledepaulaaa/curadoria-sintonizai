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
    telefone?: string;
    localizacao?: any;
  };
  status: 'pendente' | 'aprovado' | 'rejeitado';
  criadoEm: any;
}

export interface Feedback {
  id: string;
  eventoId: string;
  eventoNome: string;
  usuarioId: string | null;
  categoria: string;
  descricao: string;
  status: 'pendente' | 'analisado' | 'resolvido';
  lida: boolean;
  timestamp: any;
}

interface NotificationState {
  indicacoes: Indicacao[];
  feedbacks: Feedback[];
  naoLidas: number;
  loading: boolean;
  iniciarListener: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  indicacoes: [],
  feedbacks: [],
  naoLidas: 0,
  loading: true,

  iniciarListener: () => {
    // Listener Indicações
    const qInd = query(
      collection(db, 'indicacoes'),
      where('status', '==', 'pendente'),
      orderBy('criadoEm', 'desc')
    );

    // Listener Feedbacks
    const qFeed = query(
      collection(db, 'feedbacks'),
      where('status', '==', 'pendente'),
      orderBy('timestamp', 'desc')
    );

    let unsubFeed: (() => void) | null = null;

    const unsubInd = onSnapshot(qInd, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Indicacao[];
      set({ indicacoes: docs });
      actualizarContagem(set, get);
    });

    unsubFeed = onSnapshot(qFeed, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
      set({ feedbacks: docs });
      actualizarContagem(set, get);
    });

    return () => {
      unsubInd();
      if (unsubFeed) unsubFeed();
    };
  }
}));

function actualizarContagem(set: any, get: any) {
  const { indicacoes, feedbacks } = get();
  set({ 
    naoLidas: indicacoes.length + feedbacks.length,
    loading: false 
  });
}

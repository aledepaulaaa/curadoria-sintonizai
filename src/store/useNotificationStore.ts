import { create } from 'zustand';
import { db } from '../services/firebaseClient';
import { collection, query, where, onSnapshot, orderBy, writeBatch, doc } from 'firebase/firestore';

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
  marcarTodasComoLidas: () => Promise<void>;
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

    const unsubFeed = onSnapshot(qFeed, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
      set({
        feedbacks: docs,
        naoLidas: get().indicacoes.length + docs.length,
        loading: false
      });
    });

    const unsubInd = onSnapshot(qInd, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Indicacao[];
      set({
        indicacoes: docs,
        naoLidas: docs.length + get().feedbacks.length,
        loading: false
      });
    });

    return () => {
      unsubInd();
      if (unsubFeed) unsubFeed();
    };
  },

  marcarTodasComoLidas: async () => {
    const { indicacoes, feedbacks } = get();
    try {
      const batch = writeBatch(db);

      indicacoes.forEach(ind => {
        batch.update(doc(db, 'indicacoes', ind.id), { status: 'visualizado' });
      });

      feedbacks.forEach(fb => {
        batch.update(doc(db, 'feedbacks', fb.id), { status: 'analisado' });
      });

      await batch.commit();

      // Update local state immediately for better UX
      set({
        indicacoes: [],
        feedbacks: [],
        naoLidas: 0
      });
    } catch (e) {
      console.error('Erro ao marcar notificações como lidas:', e);
    }
  }
}));

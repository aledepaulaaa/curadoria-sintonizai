import { create } from 'zustand';
import { db } from '../services/firebaseClient';
import { collection, query as fsQuery, where, onSnapshot, orderBy, writeBatch, doc } from 'firebase/firestore';
import { listarEventosPendentes } from '@/src/actions/eventos/eventosActions';
import type { Evento } from '../types/evento';

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
  eventosPendentes: Evento[];
  naoLidas: number;
  loading: boolean;
  iniciarListener: () => () => void;
  carregarEventosPendentes: () => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  let intervalId: any = null;

  return {
    indicacoes: [],
    feedbacks: [],
    eventosPendentes: [],
    naoLidas: 0,
    loading: true,

    carregarEventosPendentes: async () => {
      try {
        const eventos = await listarEventosPendentes();
        set({
          eventosPendentes: eventos,
          naoLidas: get().indicacoes.length + get().feedbacks.length + eventos.length,
        });
      } catch (err) {
        console.error('Erro ao carregar eventos pendentes no store:', err);
      }
    },

    iniciarListener: () => {
      // Listener Indicações Firebase
      const qInd = fsQuery(
        collection(db, 'indicacoes'),
        where('status', '==', 'pendente'),
        orderBy('criadoEm', 'desc')
      );

      // Listener Feedbacks Firebase
      const qFeed = fsQuery(
        collection(db, 'feedbacks'),
        where('status', '==', 'pendente'),
        orderBy('timestamp', 'desc')
      );

      const unsubFeed = onSnapshot(qFeed, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
        set({
          feedbacks: docs,
          naoLidas: get().indicacoes.length + docs.length + get().eventosPendentes.length,
          loading: false
        });
      });

      const unsubInd = onSnapshot(qInd, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Indicacao[];
        set({
          indicacoes: docs,
          naoLidas: docs.length + get().feedbacks.length + get().eventosPendentes.length,
          loading: false
        });
      });

      // Carrega os eventos pendentes do PostgreSQL imediatamente
      get().carregarEventosPendentes();

      // Configura polling a cada 8 segundos para atualizar os eventos do Postgres coletados pelo Agent em background
      intervalId = setInterval(() => {
        get().carregarEventosPendentes();
      }, 8000);

      return () => {
        unsubInd();
        if (unsubFeed) unsubFeed();
        if (intervalId) clearInterval(intervalId);
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

        set({
          indicacoes: [],
          feedbacks: [],
          naoLidas: get().eventosPendentes.length
        });
      } catch (e) {
        console.error('Erro ao marcar notificações como lidas:', e);
      }
    }
  };
});

'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import type { BannerDestaque } from '@/src/types/banner';

const COLLECTION = 'banners_destaque';

export async function listarBanners(): Promise<BannerDestaque[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy('ordem', 'asc').get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BannerDestaque));
}

export async function criarBanner(banner: Omit<BannerDestaque, 'id'>): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add(banner);
  await syncBannerAutomacoes(ref.id, banner);
  return ref.id;
}

export async function atualizarBanner(id: string, dados: Partial<BannerDestaque>): Promise<void> {
  const { id: _, ...rest } = dados as BannerDestaque;
  await adminDb.collection(COLLECTION).doc(id).update(rest);
  
  // Busca o banner completo para sincronizar as automações
  const snap = await adminDb.collection(COLLECTION).doc(id).get();
  if (snap.exists) {
    await syncBannerAutomacoes(id, snap.data() as BannerDestaque);
  }
}

export async function deletarBanner(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
  // Limpa automações vinculadas
  await adminDb.collection('automacoes').doc(`banner-exibicao-${id}`).delete().catch(() => {});
  await adminDb.collection('automacoes').doc(`banner-evento-${id}`).delete().catch(() => {});
}

async function syncBannerAutomacoes(bannerId: string, banner: Omit<BannerDestaque, 'id'>) {
  const agora = new Date().toISOString();

  // 1. Notificação de Início de Exibição
  if (banner.notificarInicioExibicao && banner.dataInicioExibicao) {
    const dataHora = banner.dataInicioExibicao; // YYYY-MM-DDTHH:mm
    const [data, hora] = dataHora.split('T');

    await adminDb.collection('automacoes').doc(`banner-exibicao-${bannerId}`).set({
      id: `banner-exibicao-${bannerId}`,
      nome: `[BANNER] Início Exibição: ${banner.titulo}`,
      gatilho: 'periodico', // Usando periódico mas com configuração de data se suportado, ou apenas hora se diário
      mensagem: {
        titulo: `✨ Novidade no App: ${banner.titulo}`,
        corpo: banner.textoEmBreve || 'Confira o que preparamos para você!',
      },
      destino: { tipo: 'home' },
      timing: { tipo: 'imediato' }, // Dispara exatamente no horário
      configuracao: {
        ativa: true,
        frequencia: 'uma_vez',
        horarioExecucao: hora,
        dataExecucao: data,
      },
      destinatarios: { tipo: 'todos' },
      condicoes: {},
      criadoEm: agora,
      atualizadoEm: agora
    }, { merge: true });
  } else {
    await adminDb.collection('automacoes').doc(`banner-exibicao-${bannerId}`).delete().catch(() => {});
  }

  // 2. Notificação de Início do Evento
  if (banner.notificarInicioEvento && banner.dataInicioEvento) {
    const dataHora = banner.dataInicioEvento;
    const [data, hora] = dataHora.split('T');

    await adminDb.collection('automacoes').doc(`banner-evento-${bannerId}`).set({
      id: `banner-evento-${bannerId}`,
      nome: `[BANNER] Início Evento: ${banner.titulo}`,
      gatilho: 'periodico',
      mensagem: {
        titulo: `🔴 AO VIVO: ${banner.titulo}`,
        corpo: banner.textoAoVivo || 'O evento começou! Clique para ver a programação.',
      },
      destino: { tipo: 'home' },
      timing: { tipo: 'imediato' },
      configuracao: {
        ativa: true,
        frequencia: 'uma_vez',
        horarioExecucao: hora,
        dataExecucao: data,
      },
      destinatarios: { tipo: 'todos' },
      condicoes: {},
      criadoEm: agora,
      atualizadoEm: agora
    }, { merge: true });
  } else {
    await adminDb.collection('automacoes').doc(`banner-evento-${bannerId}`).delete().catch(() => {});
  }
}

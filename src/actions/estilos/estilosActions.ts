'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import { slugify } from '@/src/utils/stringUtils';

export async function listarEstilos() {
  const snapshot = await adminDb.collection('configuracoes_estilos').orderBy('ordem', 'asc').get();
  const estilos: any[] = [];
  snapshot.forEach(doc => {
    estilos.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return estilos;
}

export async function salvarEstilo(id: string, data: { label: string, itens: string[], icone?: string, ordem?: number }) {
  const finalId = id || slugify(data.label);
  await adminDb.collection('configuracoes_estilos').doc(finalId).set({
    ...data,
    id: finalId,
    ultimaAtualizacao: new Date().toISOString()
  }, { merge: true });
}

export async function removerEstilo(id: string) {
  await adminDb.collection('configuracoes_estilos').doc(id).delete();
}

export async function inicializarEstilosPadrao() {
  // Removida inicialização padrão conforme solicitado - Curadoria define os dados
  return [];
}

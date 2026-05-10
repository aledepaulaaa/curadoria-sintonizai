'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import { slugify } from '@/src/utils/stringUtils';

export async function listarTiposEvento() {
  const snapshot = await adminDb.collection('configuracoes_tipo_evento').orderBy('ordem', 'asc').get();
  const tipos: any[] = [];
  snapshot.forEach(doc => {
    tipos.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return tipos;
}

export async function salvarTipoEvento(id: string, data: { label: string, itens: string[], icone?: string, ordem?: number }) {
  const finalId = id || slugify(data.label);
  await adminDb.collection('configuracoes_tipo_evento').doc(finalId).set({
    ...data,
    id: finalId,
    ultimaAtualizacao: new Date().toISOString()
  }, { merge: true });
}

export async function removerTipoEvento(id: string) {
  await adminDb.collection('configuracoes_tipo_evento').doc(id).delete();
}

export async function inicializarTiposEventoPadrao() {
  // Removida inicialização padrão conforme solicitado - Curadoria define os dados
  return [];
}

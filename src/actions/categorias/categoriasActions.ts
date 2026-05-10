'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import { slugify } from '@/src/utils/stringUtils';

export async function listarCategorias() {
  const snapshot = await adminDb.collection('configuracoes_categorias').orderBy('ordem', 'asc').get();
  const categorias: any[] = [];
  snapshot.forEach(doc => {
    categorias.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return categorias;
}

export async function salvarCategoria(id: string, data: { label: string, itens: string[], icone?: string, ordem?: number }) {
  const finalId = id || slugify(data.label);
  await adminDb.collection('configuracoes_categorias').doc(finalId).set({
    ...data,
    id: finalId,
    ultimaAtualizacao: new Date().toISOString()
  }, { merge: true });
}

export async function removerCategoria(id: string) {
  await adminDb.collection('configuracoes_categorias').doc(id).delete();
}

export async function inicializarCategoriasPadrao() {
  // Removida inicialização padrão conforme solicitado - Curadoria define os dados
  return [];
}

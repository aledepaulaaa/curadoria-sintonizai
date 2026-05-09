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

export async function salvarCategoria(id: string, data: { label: string, ordem?: number }) {
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
  const padrao = [
    { id: 'show', label: 'Show', ordem: 1 },
    { id: 'ao_vivo', label: 'Ao vivo', ordem: 2 },
    { id: 'sarau', label: 'Sarau', ordem: 3 },
    { id: 'teatro', label: 'Teatro', ordem: 4 },
    { id: 'exposicao', label: 'Exposição', ordem: 5 },
    { id: 'gastronomia', label: 'Gastronomia', ordem: 6 },
    { id: 'infantil', label: 'Infantil', ordem: 7 },
    { id: 'festa', label: 'Festa', ordem: 8 },
    { id: 'cinema', label: 'Cinema', ordem: 9 },
    { id: 'cultura_popular', label: 'Cultura Popular', ordem: 10 }
  ];

  for (const item of padrao) {
    const { id, ...data } = item;
    await salvarCategoria(id, data);
  }
}

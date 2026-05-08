'use server';

import { adminDb } from '@/src/services/firebaseAdmin';

export async function listarFiltros() {
  const snapshot = await adminDb.collection('configuracoes_filtros').orderBy('ordem', 'asc').get();
  const filtros: any[] = [];
  snapshot.forEach(doc => {
    filtros.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return filtros;
}

export async function salvarFiltros(id: string, data: { label: string, itens: string[], icone?: string, ordem?: number }) {
  await adminDb.collection('configuracoes_filtros').doc(id).set({
    ...data,
    ultimaAtualizacao: new Date().toISOString()
  }, { merge: true });
}

export async function removerGrupoFiltro(id: string) {
  await adminDb.collection('configuracoes_filtros').doc(id).delete();
}

export async function inicializarFiltrosPadrao() {
  const padrao = [
    { id: 'categorias', label: 'Categorias Principais', icone: '🎭', itens: ['Show', 'Ao vivo', 'Sarau', 'Teatro', 'Exposição', 'Gastronomia', 'Infantil', 'Festa', 'Cinema', 'Cultura Popular'], ordem: 1 },
    { id: 'ritmos', label: 'Ritmos de Música', icone: '🎸', itens: ['Samba', 'Rock', 'MPB', 'Funk', 'Jazz', 'Indie', 'Reggae', 'Rap / Trap', 'Sertanejo', 'Forró', 'Pop', 'Blues'], ordem: 2 },
    { id: 'vibes', label: 'Vibes / Clima', icone: '✨', itens: ['Cultural', 'Agitada', 'Relax', 'Família', 'Romântica', 'Alternativa'], ordem: 3 },
    { id: 'teatro', label: 'Gêneros de Teatro', icone: '🏛️', itens: ['Musical', 'Comédia', 'Drama', 'Contemporâneo', 'Experimental'], ordem: 4 }
  ];

  for (const item of padrao) {
    const { id, ...data } = item;
    await salvarFiltros(id, data);
  }
}

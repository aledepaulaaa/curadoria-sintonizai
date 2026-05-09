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

export async function salvarEstilo(id: string, data: { label: string, icone?: string, ordem?: number }) {
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
  const padrao = [
    { id: 'samba', label: 'Samba', icone: '🥁', ordem: 1 },
    { id: 'rock', label: 'Rock', icone: '🎸', ordem: 2 },
    { id: 'mpb', label: 'MPB', icone: '🎤', ordem: 3 },
    { id: 'jazz', label: 'Jazz', icone: '🎷', ordem: 4 },
    { id: 'funk', label: 'Funk', icone: '💃', ordem: 5 },
    { id: 'reggae', label: 'Reggae', icone: '🌿', ordem: 6 },
    { id: 'sertanejo', label: 'Sertanejo', icone: '🤠', ordem: 7 },
    { id: 'forro', label: 'Forró', icone: '🪗', ordem: 8 },
    { id: 'pop', label: 'Pop', icone: '✨', ordem: 9 },
    { id: 'blues', label: 'Blues', icone: '🎹', ordem: 10 }
  ];

  for (const item of padrao) {
    const { id, ...data } = item;
    await salvarEstilo(id, data);
  }
}

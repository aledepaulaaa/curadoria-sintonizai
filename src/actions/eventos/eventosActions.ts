'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import type { Evento } from '@/src/types/evento';

const COLLECTION = 'eventos';

export async function listarEventos(): Promise<Evento[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy('dataInicio', 'asc').get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Evento));
}

export async function criarEvento(evento: Omit<Evento, 'id'>): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add(evento);
  return ref.id;
}

export async function criarEventosBatch(eventos: Omit<Evento, 'id'>[]): Promise<number> {
  const batch = adminDb.batch();
  let count = 0;

  for (const evento of eventos) {
    const ref = adminDb.collection(COLLECTION).doc();
    batch.set(ref, evento);
    count++;
    if (count % 500 === 0) {
      await batch.commit();
    }
  }

  if (count % 500 !== 0) await batch.commit();
  return count;
}

export async function atualizarEvento(id: string, dados: Partial<Evento>): Promise<void> {
  const { id: _, ...rest } = dados as Evento;
  await adminDb.collection(COLLECTION).doc(id).update(rest);
}

export async function deletarEvento(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

export async function atualizarEventosBatch(ids: string[], dados: Partial<Evento>): Promise<number> {
  const batch = adminDb.batch();
  let count = 0;
  
  for (const id of ids) {
    const ref = adminDb.collection(COLLECTION).doc(id);
    batch.update(ref, dados);
    count++;
    if (count % 500 === 0) {
      await batch.commit();
    }
  }
  
  if (count % 500 !== 0) await batch.commit();
  return count;
}

export async function deletarEventosBatch(ids: string[]): Promise<number> {
  const batch = adminDb.batch();
  let count = 0;
  
  for (const id of ids) {
    const ref = adminDb.collection(COLLECTION).doc(id);
    batch.delete(ref);
    count++;
    if (count % 500 === 0) {
      await batch.commit();
    }
  }
  
  if (count % 500 !== 0) await batch.commit();
  return count;
}

export async function verificarDuplicado(nome: string, dataInicio: string, horario: string): Promise<boolean> {
  const snap = await adminDb.collection(COLLECTION).where('nome', '==', nome).get();
  const dia = dataInicio.split('T')[0];
  return snap.docs.some((doc) => {
    const d = doc.data();
    return d.dataInicio?.split('T')[0] === dia && d.horario === horario;
  });
}

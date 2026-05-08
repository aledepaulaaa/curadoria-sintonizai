'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import type { Usuario } from '@/src/types/usuario';

const COLLECTION = 'usuarios';

export async function listarUsuarios(): Promise<Usuario[]> {
  const snap = await adminDb.collection(COLLECTION).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Usuario));
}

export async function buscarUsuario(id: string): Promise<Usuario | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Usuario;
}

export async function atualizarUsuario(id: string, dados: Partial<Usuario>): Promise<void> {
  const { id: _, ...rest } = dados as Usuario;
  await adminDb.collection(COLLECTION).doc(id).update(rest);
}

export async function excluirUsuario(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

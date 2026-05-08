'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';

const COLLECTION = 'conversas_ia';

export interface ConversaIA {
  id: string;
  titulo: string;
  mensagens: { role: 'user' | 'model', parts: { text: string }[] }[];
  criadoEm: string;
  atualizadoEm: string;
}

export async function listarConversasIA(): Promise<ConversaIA[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy('atualizadoEm', 'desc').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConversaIA));
}

export async function criarConversaIA(titulo: string = 'Nova Conversa'): Promise<ActionResponse<ConversaIA>> {
  try {
    const data = {
      titulo,
      mensagens: [],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    const ref = await adminDb.collection(COLLECTION).add(data);
    return createSuccessResponse({ id: ref.id, ...data });
  } catch (error) {
    return handleActionError(error, 'criarConversaIA');
  }
}

export async function atualizarConversaIA(id: string, dados: Partial<ConversaIA>): Promise<ActionResponse<void>> {
  try {
    await adminDb.collection(COLLECTION).doc(id).update({
      ...dados,
      atualizadoEm: new Date().toISOString()
    });
    return createSuccessResponse(undefined);
  } catch (error) {
    return handleActionError(error, 'atualizarConversaIA');
  }
}

export async function deletarConversaIA(id: string): Promise<ActionResponse<void>> {
  try {
    await adminDb.collection(COLLECTION).doc(id).delete();
    return createSuccessResponse(undefined);
  } catch (error) {
    return handleActionError(error, 'deletarConversaIA');
  }
}

export async function buscarConversaIA(id: string): Promise<ConversaIA | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as ConversaIA;
}

'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import { Automacao } from '@/src/types/automacao';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'automacoes';

export async function listarAutomacoes() {
  try {
    const snapshot = await adminDb.collection(COLLECTION).orderBy('criadoEm', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automacao));
  } catch (error) {
    console.error('Erro ao listar automações:', error);
    return [];
  }
}

export async function salvarAutomacao(data: Omit<Automacao, 'id'>, id?: string) {
  try {
    const agora = new Date().toISOString();
    const docRef = id ? adminDb.collection(COLLECTION).doc(id) : adminDb.collection(COLLECTION).doc();
    
    const payload = {
      ...data,
      id: docRef.id,
      atualizadoEm: agora,
      criadoEm: data.criadoEm || agora
    };

    await docRef.set(payload, { merge: true });
    revalidatePath('/automacoes');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao salvar automação:', error);
    return { success: false, error: 'Falha ao salvar automação' };
  }
}

export async function alternarStatusAutomacao(id: string, ativa: boolean) {
  try {
    const docRef = adminDb.collection(COLLECTION).doc(id);
    await docRef.update({ 
      'configuracao.ativa': ativa,
      atualizadoEm: new Date().toISOString()
    });
    revalidatePath('/automacoes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    return { success: false };
  }
}

export async function excluirAutomacao(id: string) {
  try {
    await adminDb.collection(COLLECTION).doc(id).delete();
    revalidatePath('/automacoes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir automação:', error);
    return { success: false };
  }
}

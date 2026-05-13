'use server';

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
} from 'firebase/firestore';
import { Automacao } from '@/src/types/automacao';
import { revalidatePath } from 'next/cache';
import { db } from '@/src/services/firebaseClient';


const COLLECTION = 'automacoes';

export async function listarAutomacoes() {
  try {
    const q = query(collection(db, COLLECTION), orderBy('criadoEm', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automacao));
  } catch (error) {
    console.error('Erro ao listar automações:', error);
    return [];
  }
}

export async function salvarAutomacao(data: Omit<Automacao, 'id'>, id?: string) {
  try {
    const agora = new Date().toISOString();
    const docRef = id ? doc(db, COLLECTION, id) : doc(collection(db, COLLECTION));
    
    const payload = {
      ...data,
      id: docRef.id,
      atualizadoEm: agora,
      criadoEm: data.criadoEm || agora
    };

    await setDoc(docRef, payload, { merge: true });
    revalidatePath('/automacoes');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao salvar automação:', error);
    return { success: false, error: 'Falha ao salvar automação' };
  }
}

export async function alternarStatusAutomacao(id: string, ativa: boolean) {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { 
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
    await deleteDoc(doc(db, COLLECTION, id));
    revalidatePath('/automacoes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir automação:', error);
    return { success: false };
  }
}

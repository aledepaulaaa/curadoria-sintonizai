'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import type { Evento } from '@/src/types/evento';

const COLLECTION = 'eventos';

export async function listarEventos(): Promise<Evento[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy('dataInicio', 'asc').get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Evento));
}

export async function criarEvento(evento: Omit<Evento, 'id'>): Promise<string> {
  const duplicado = await verificarDuplicado(
    evento.nome, 
    evento.dataInicio, 
    evento.horario || '',
    evento.categoria,
    evento.tipo_evento,
    evento.estilo
  );
  if (duplicado) {
    throw new Error(`Já existe um evento cadastrado com este nome ("${evento.nome}") nesta data, horário e taxonomia.`);
  }
  const ref = await adminDb.collection(COLLECTION).add({
    ...evento,
    ultimaAtualizacao: new Date().toISOString()
  });
  return ref.id;
}

export async function criarEventosBatch(eventos: Omit<Evento, 'id'>[]): Promise<{ adicionados: number, ignorados: number }> {
  let adicionados = 0;
  let ignorados = 0;
  const chunk = 500;

  for (let i = 0; i < eventos.length; i += chunk) {
    const batch = adminDb.batch();
    const slice = eventos.slice(i, i + chunk);

    for (const evento of slice) {
      // Se o evento já vier com um ID (ex: importação com ID definido), usamos ele para checar existência direta
      const idExistente = (evento as any).id;
      if (idExistente) {
        const doc = await adminDb.collection(COLLECTION).doc(idExistente).get();
        if (doc.exists) {
          ignorados++;
          continue;
        }
      }

      // Verificação por conjunto de dados (Nome + Data + Filtros)
      const duplicado = await verificarDuplicado(
        evento.nome, 
        evento.dataInicio, 
        evento.horario || '',
        evento.categoria,
        evento.tipo_evento,
        evento.estilo
      );

      if (duplicado) {
        ignorados++;
        continue;
      }

      const ref = idExistente 
        ? adminDb.collection(COLLECTION).doc(idExistente)
        : adminDb.collection(COLLECTION).doc();
      
      batch.set(ref, {
        ...evento,
        ultimaAtualizacao: new Date().toISOString()
      });
      adicionados++;
    }
    await batch.commit();
  }

  return { adicionados, ignorados };
}

export async function atualizarEvento(id: string, dados: Partial<Evento>): Promise<void> {
  const { id: _, ...rest } = dados as Evento;
  await adminDb.collection(COLLECTION).doc(id).update({
    ...rest,
    ultimaAtualizacao: new Date().toISOString()
  });
}

export async function deletarEvento(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

export async function atualizarEventosBatch(ids: string[], dados: Partial<Evento>): Promise<number> {
  const batch = adminDb.batch();
  let count = 0;
  
  for (const id of ids) {
    const ref = adminDb.collection(COLLECTION).doc(id);
    batch.update(ref, {
      ...dados,
      ultimaAtualizacao: new Date().toISOString()
    });
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

export async function verificarDuplicado(
  nome: string, 
  dataInicio: string, 
  horario: string,
  categoria?: string,
  tipo_evento?: string,
  estilo?: string
): Promise<boolean> {
  const snap = await adminDb.collection(COLLECTION)
    .where('nome', '==', nome)
    .get();

  const dia = dataInicio.split('T')[0];
  
  return snap.docs.some((doc) => {
    const d = doc.data();
    const dataMatch = d.dataInicio?.split('T')[0] === dia;
    const horarioMatch = d.horario === horario;
    
    // Se a nova taxonomia estiver presente, verificamos ela também para evitar duplicidade em eventos diferentes no mesmo local/data
    const categoriaMatch = !categoria || d.categoria === categoria;
    const tipoMatch = !tipo_evento || d.tipo_evento === tipo_evento;
    const estiloMatch = !estilo || d.estilo === estilo;

    return dataMatch && horarioMatch && categoriaMatch && tipoMatch && estiloMatch;
  });
}

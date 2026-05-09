'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';

interface BulkUpdateData {
  ids: string[];
  campo: string;
  novoValor: any;
}

export async function aplicarAjusteMassivo(data: BulkUpdateData): Promise<ActionResponse<{ count: number }>> {
  try {
    const { ids, campo, novoValor } = data;
    if (!ids || ids.length === 0) throw new Error('Nenhum ID fornecido');
    if (!campo) throw new Error('Nenhum campo fornecido');

    const batch = adminDb.batch();
    const colRef = adminDb.collection('eventos');

    ids.forEach(id => {
      const docRef = colRef.doc(id);
      batch.update(docRef, {
        [campo]: novoValor,
        atualizadoEm: new Date().toISOString(),
        editadoPorIA: true
      });
    });

    await batch.commit();

    return createSuccessResponse({ count: ids.length });
  } catch (error) {
    return handleActionError(error, 'aplicarAjusteMassivo');
  }
}

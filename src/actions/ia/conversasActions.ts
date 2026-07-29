'use server';
import { query } from '@/src/services/db';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';
import crypto from 'crypto';

export interface ConversaIA {
  id: string;
  chatId: string;
  titulo: string;
  mensagens: { role: 'user' | 'model', parts: { text: string }[] }[];
  criadoEm: string;
  atualizadoEm: string;
}

export async function listarConversasIA(): Promise<ConversaIA[]> {
  try {
    const res = await query('SELECT * FROM conversas_ia ORDER BY "atualizadoEm" DESC');
    return res.rows.map(row => ({
      id: row.id,
      chatId: row.chatId,
      titulo: row.titulo,
      mensagens: typeof row.mensagens === 'string' ? JSON.parse(row.mensagens) : row.mensagens,
      criadoEm: row.criadoEm.toISOString(),
      atualizadoEm: row.atualizadoEm.toISOString(),
    }));
  } catch (error) {
    console.error('Erro ao listar conversas no PostgreSQL:', error);
    return [];
  }
}

export async function criarConversaIA(titulo: string = 'Nova Conversa'): Promise<ActionResponse<ConversaIA>> {
  try {
    const id = crypto.randomUUID();
    const chatId = `chat_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
    const criadoEm = new Date();
    const atualizadoEm = new Date();
    const mensagensJson = JSON.stringify([]);

    const sql = `
      INSERT INTO conversas_ia (id, "chatId", titulo, mensagens, "criadoEm", "atualizadoEm")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const res = await query(sql, [id, chatId, titulo, mensagensJson, criadoEm, atualizadoEm]);
    const row = res.rows[0];

    return createSuccessResponse({
      id: row.id,
      chatId: row.chatId,
      titulo: row.titulo,
      mensagens: [],
      criadoEm: row.criadoEm.toISOString(),
      atualizadoEm: row.atualizadoEm.toISOString(),
    });
  } catch (error) {
    return handleActionError(error, 'criarConversaIA');
  }
}

export async function atualizarConversaIA(id: string, dados: Partial<ConversaIA>): Promise<ActionResponse<void>> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (dados.titulo !== undefined) {
      fields.push(`titulo = $${index++}`);
      values.push(dados.titulo);
    }
    if (dados.mensagens !== undefined) {
      fields.push(`mensagens = $${index++}`);
      values.push(JSON.stringify(dados.mensagens));
    }

    fields.push(`"atualizadoEm" = $${index++}`);
    values.push(new Date());

    values.push(id);
    const sql = `UPDATE conversas_ia SET ${fields.join(', ')} WHERE id = $${index}`;
    await query(sql, values);

    return createSuccessResponse(undefined);
  } catch (error) {
    return handleActionError(error, 'atualizarConversaIA');
  }
}

export async function deletarConversaIA(id: string): Promise<ActionResponse<void>> {
  try {
    await query('DELETE FROM conversas_ia WHERE id = $1', [id]);
    return createSuccessResponse(undefined);
  } catch (error) {
    return handleActionError(error, 'deletarConversaIA');
  }
}

export async function buscarConversaIA(id: string): Promise<ConversaIA | null> {
  try {
    const res = await query('SELECT * FROM conversas_ia WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      chatId: row.chatId,
      titulo: row.titulo,
      mensagens: typeof row.mensagens === 'string' ? JSON.parse(row.mensagens) : row.mensagens,
      criadoEm: row.criadoEm.toISOString(),
      atualizadoEm: row.atualizadoEm.toISOString(),
    };
  } catch (error) {
    console.error('Erro ao buscar conversa no PostgreSQL:', error);
    return null;
  }
}

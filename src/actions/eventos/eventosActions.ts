'use server';

import { query } from '@/src/services/db';
import type { Evento } from '@/src/types/evento';
import crypto from 'crypto';

function mapRowToEvento(row: any): Evento {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    horario: row.horario,
    dataInicio: row.dataInicio instanceof Date ? row.dataInicio.toISOString() : new Date(row.dataInicio).toISOString(),
    local: {
      nome: row.localNome,
      lat: Number(row.localLat),
      lng: Number(row.localLng),
    },
    cidade: row.cidade || undefined,
    distancia: row.distancia || undefined,
    distanciaValor: row.distanciaValor !== null ? Number(row.distanciaValor) : undefined,
    categoria: row.categoria,
    genero: row.genero || undefined,
    vibe: row.estilo || 'todos',
    bombando: !!row.bombando,
    aoVivo: !!row.aoVivo,
    likes: Number(row.likes || 0),
    imagemUrl: row.imagemUrl || undefined,
    imagemLocal: row.imagemLocal || undefined,
    endereco: row.endereco || undefined,
    preco: row.preco || undefined,
    gratuito: !!row.gratuito,
    linkIngresso: row.linkIngresso || undefined,
    fonte: row.fonte || undefined,
    tipo_evento: row.tipo_evento || undefined,
    estilo: row.estilo || undefined,
    tiposEvento: row.tiposEvento || [],
    vibracoes: row.vibracoes || [],
    categorias: row.categorias || [],
    tags: row.tags || [],
    nota: row.nota !== null ? Number(row.nota) : undefined,
    notaCuradoria: row.notaCuradoria || undefined,
    acessibilidade: !!row.acessibilidade,
  };
}

export async function listarEventos(): Promise<Evento[]> {
  try {
    const res = await query('SELECT * FROM events ORDER BY "dataInicio" ASC');
    return res.rows.map(mapRowToEvento);
  } catch (error) {
    console.error('Erro ao listar eventos no PostgreSQL:', error);
    return [];
  }
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

  const id = crypto.randomUUID();
  const sql = `
    INSERT INTO events (
      id, nome, descricao, horario, "dataInicio", "localNome", "localLat", "localLng",
      cidade, categoria, genero, bombando, "aoVivo", likes, "imagemUrl", "imagemLocal",
      endereco, preco, gratuito, "linkIngresso", fonte, tipo_evento, estilo,
      "tiposEvento", vibracoes, categorias, tags, "notaCuradoria", acessibilidade, status, "criadoEm", "atualizadoEm"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
    ) RETURNING id
  `;

  const dataInicio = new Date(evento.dataInicio);
  const localNome = evento.local?.nome || '';
  const localLat = evento.local?.lat || 0;
  const localLng = evento.local?.lng || 0;
  const vibe = evento.vibe || 'todos';

  const params = [
    id,
    evento.nome,
    evento.descricao,
    evento.horario,
    dataInicio,
    localNome,
    localLat,
    localLng,
    evento.cidade || 'São Paulo',
    evento.categoria || 'todos',
    evento.genero || null,
    evento.bombando || false,
    evento.aoVivo || false,
    0, // likes
    evento.imagemUrl || null,
    evento.imagemLocal || null,
    evento.endereco || null,
    evento.preco || null,
    evento.gratuito || false,
    evento.linkIngresso || null,
    evento.fonte || '',
    evento.tipo_evento || 'todos',
    evento.estilo || vibe,
    evento.tiposEvento || [],
    evento.vibracoes || [],
    evento.categorias || [],
    evento.tags || [],
    evento.notaCuradoria || null,
    evento.acessibilidade || false,
    'pendente', // status
    new Date(),
    new Date()
  ];

  const res = await query(sql, params);
  return res.rows[0].id;
}

export async function criarEventosBatch(eventos: Omit<Evento, 'id'>[]): Promise<{ adicionados: number, ignorados: number }> {
  let adicionados = 0;
  let ignorados = 0;

  for (const ev of eventos) {
    try {
      const duplicado = await verificarDuplicado(
        ev.nome,
        ev.dataInicio,
        ev.horario || '',
        ev.categoria,
        ev.tipo_evento,
        ev.estilo
      );

      if (duplicado) {
        ignorados++;
        continue;
      }

      await criarEvento(ev);
      adicionados++;
    } catch (err) {
      console.error(`Erro ao salvar lote de evento "${ev.nome}":`, err);
      ignorados++;
    }
  }

  return { adicionados, ignorados };
}

export async function atualizarEvento(id: string, dados: Partial<Evento>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  const mapping: Record<string, string> = {
    nome: 'nome',
    descricao: 'descricao',
    horario: 'horario',
    cidade: 'cidade',
    distancia: 'distancia',
    categoria: 'categoria',
    genero: 'genero',
    bombando: 'bombando',
    aoVivo: 'aoVivo',
    likes: 'likes',
    imagemUrl: 'imagemUrl',
    imagemLocal: 'imagemLocal',
    endereco: 'endereco',
    preco: 'preco',
    gratuito: 'gratuito',
    linkIngresso: 'linkIngresso',
    fonte: 'fonte',
    tipo_evento: 'tipo_evento',
    estilo: 'estilo',
    tiposEvento: 'tiposEvento',
    vibracoes: 'vibracoes',
    categorias: 'categorias',
    tags: 'tags',
    notaCuradoria: 'notaCuradoria',
    acessibilidade: 'acessibilidade',
    status: 'status',
  };

  for (const [key, columnName] of Object.entries(mapping)) {
    if (dados[key as keyof Evento] !== undefined) {
      fields.push(`"${columnName}" = $${index++}`);
      values.push(dados[key as keyof Evento]);
    }
  }

  if (dados.local !== undefined) {
    fields.push(`"localNome" = $${index++}`);
    values.push(dados.local.nome);
    fields.push(`"localLat" = $${index++}`);
    values.push(dados.local.lat);
    fields.push(`"localLng" = $${index++}`);
    values.push(dados.local.lng);
  }

  if (dados.dataInicio !== undefined) {
    fields.push(`"dataInicio" = $${index++}`);
    values.push(new Date(dados.dataInicio));
  }

  fields.push(`"atualizadoEm" = $${index++}`);
  values.push(new Date());

  values.push(id);
  const sql = `UPDATE events SET ${fields.join(', ')} WHERE id = $${index}`;
  await query(sql, values);
}

export async function deletarEvento(id: string): Promise<void> {
  await query('DELETE FROM events WHERE id = $1', [id]);
}

export async function atualizarEventosBatch(ids: string[], dados: Partial<Evento>): Promise<number> {
  let count = 0;
  for (const id of ids) {
    try {
      await atualizarEvento(id, dados);
      count++;
    } catch (e) {
      console.error(`Erro ao atualizar batch do ID ${id}:`, e);
    }
  }
  return count;
}

export async function deletarEventosBatch(ids: string[]): Promise<number> {
  await query('DELETE FROM events WHERE id = ANY($1)', [ids]);
  return ids.length;
}

export async function verificarDuplicado(
  nome: string, 
  dataInicio: string, 
  horario: string,
  categoria?: string,
  tipo_evento?: string,
  estilo?: string
): Promise<boolean> {
  try {
    const dia = dataInicio.split('T')[0];
    const sql = `
      SELECT id FROM events 
      WHERE nome = $1 
        AND DATE("dataInicio") = $2 
        AND horario = $3
        ${categoria ? 'AND categoria::text = $4' : ''}
        ${tipo_evento ? 'AND tipo_evento = $5' : ''}
        ${estilo ? 'AND estilo = $6' : ''}
    `;
    const params = [nome, dia, horario];
    if (categoria) params.push(categoria);
    if (tipo_evento) params.push(tipo_evento);
    if (estilo) params.push(estilo);

    const res = await query(sql, params);
    return res.rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar duplicidade no Postgres:', error);
    return false;
  }
}

export async function listarEventosPendentes(): Promise<Evento[]> {
  try {
    const res = await query('SELECT * FROM events WHERE status::text = \'pendente\' ORDER BY "dataInicio" ASC');
    return res.rows.map(mapRowToEvento);
  } catch (error) {
    console.error('Erro ao listar eventos pendentes:', error);
    return [];
  }
}

export async function aprovarTodosEventosPendentes(): Promise<number> {
  try {
    const res = await query(
      "UPDATE events SET status = 'aprovado', \"atualizadoEm\" = NOW() WHERE status::text = 'pendente' AND nome NOT LIKE '%0 Eventos%' RETURNING id"
    );
    await query("DELETE FROM events WHERE status::text = 'pendente' AND nome LIKE '%0 Eventos%'");
    return res.rows.length;
  } catch (error) {
    console.error('Erro ao aprovar todos os eventos pendentes:', error);
    return 0;
  }
}


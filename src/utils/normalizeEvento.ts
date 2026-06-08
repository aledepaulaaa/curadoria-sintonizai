import type { Evento, EventoRaw } from '@/src/types/evento';

const KEY_MAP: Record<string, string> = {
  datainicio: 'dataInicio',
  validado: 'Validado',
  gratuito: 'Gratuito',
  linkingresso: 'linkIngresso',
  link: 'linkIngresso',
  local_nome: 'local_nome',
};

function normalizeKey(key: string): string {
  const lower = key.toLowerCase().trim();
  return KEY_MAP[lower] || key;
}

function parseDate(raw: string): string {
  if (!raw || !raw.trim()) return new Date().toISOString();

  const cleaned = raw.trim().split(' a ')[0].trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) return cleaned;

  const parts = cleaned.split('/');
  if (parts.length === 3) {
    let [dia, mes, ano] = parts;
    dia = dia.padStart(2, '0');
    mes = mes.padStart(2, '0');
    if (ano.length === 2) ano = `20${ano}`;
    return `${ano}-${mes}-${dia}T12:00:00Z`;
  }

  return new Date().toISOString();
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\uFFFD/g, '')
    .trim();
}

function mapCategoria(tipoEvento: string): string {
  const lower = (tipoEvento || '').toLowerCase();
  if (lower.includes('música') || lower.includes('musica') || lower.includes('show')) return 'musica';
  if (lower.includes('teatro')) return 'teatro';
  if (lower.includes('dança') || lower.includes('danca')) return 'danca';
  if (lower.includes('infantil')) return 'infantil';
  if (lower.includes('arte') || lower.includes('exposição')) return 'arte';
  if (lower.includes('gastronomia')) return 'gastronomia';
  return 'todos';
}

export function normalizeEvento(raw: EventoRaw): Evento | null {
  const normalized: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!key.trim()) continue;
    normalized[normalizeKey(key)] = (val || '').toString();
  }

  const nome = cleanText(normalized.nome || '');
  if (!nome) return null;

  const tipoEvento = cleanText(normalized.tipo_evento || '');
  const gratuitoStr = (normalized.Gratuito || normalized.gratuito || '').toLowerCase();
  const estilo = cleanText(normalized.estilo || '');
  const categoria = mapCategoria(tipoEvento);

  const rawTipos = (raw as any).tiposEvento;
  const tiposEvento = Array.isArray(rawTipos)
    ? rawTipos.map((t: any) => cleanText(t))
    : (tipoEvento ? tipoEvento.split(',').map(t => cleanText(t)) : []);

  const rawVibes = (raw as any).vibracoes;
  const vibracoes = Array.isArray(rawVibes)
    ? rawVibes.map((v: any) => cleanText(v))
    : (estilo ? estilo.split(',').map(v => cleanText(v)) : []);

  const rawCats = (raw as any).categorias;
  const categorias = Array.isArray(rawCats)
    ? rawCats.map((c: any) => cleanText(c))
    : (categoria ? [categoria] : []);

  return {
    nome,
    descricao: cleanText(normalized.descricao || nome),
    horario: cleanText(normalized.horario || 'Confirmar'),
    dataInicio: parseDate(normalized.dataInicio || ''),
    local: {
      nome: cleanText(normalized.local_nome || 'Não informado'),
      lat: -23.5505,
      lng: -46.6333,
    },
    cidade: 'São Paulo',
    categoria,
    vibe: 'cultural',
    bombando: false,
    aoVivo: false,
    likes: 0,
    endereco: cleanText(normalized.endereco || ''),
    preco: cleanText(normalized.preco || ''),
    gratuito: gratuitoStr === 'sim' || gratuitoStr === 'true',
    linkIngresso: cleanText(normalized.linkIngresso || ''),
    fonte: 'curadoria_painel',
    tipo_evento: tipoEvento || 'Outros',
    estilo,
    tiposEvento,
    vibracoes,
    categorias,
  };
}

export function normalizeEventoBatch(rawList: EventoRaw[]): Evento[] {
  return rawList
    .map(normalizeEvento)
    .filter((e): e is Evento => e !== null);
}

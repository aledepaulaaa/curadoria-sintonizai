export interface LocalEvento {
  nome: string;
  lat: number;
  lng: number;
}

export interface Evento {
  id?: string;
  nome: string;
  descricao: string;
  horario: string;
  dataInicio: string;
  local: LocalEvento;
  cidade?: string;
  distancia?: string;
  distanciaValor?: number;
  categoria: string;
  genero?: string;
  vibe: string;
  bombando: boolean;
  aoVivo: boolean;
  likes: number;
  imagemUrl?: string;
  imagemLocal?: string;
  endereco?: string;
  preco?: string;
  gratuito?: boolean;
  linkIngresso?: string;
  fonte?: string;
  tipo_evento?: string;
  estilo?: string;
  tags?: string[];
  nota?: number;
  shares?: number;
  indicadoPor?: {
    nome: string;
    uid: string;
    foto?: string;
  };
}

export interface EventoRaw {
  [key: string]: string | undefined;
}

export type EventoFormData = Omit<Evento, 'id' | 'likes' | 'distancia' | 'distanciaValor'>;

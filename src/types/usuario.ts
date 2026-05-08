export interface Usuario {
  id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  vibe?: string;
  localizacao?: {
    lat: number;
    lng: number;
    cidade?: string;
    enderecoCompleto?: string;
  };
  criadoEm?: string;
  dataNascimento?: string;
  fotoPerfil?: string;
  preferencias?: string[];
  favoritos?: string[];
}

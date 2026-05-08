export interface BannerDestaque {
  id?: string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  imagemFundo: string;
  dataInicio: string;
  dataFim: string;
  tag?: string;
  link?: string;
  ativo: boolean;
  ordem?: number;
}

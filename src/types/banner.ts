export interface BannerDestaque {
  id?: string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  imagemFundo: string;
  
  // Controle Temporal
  dataInicioExibicao: string; // Quando o banner começa a aparecer no feed
  dataInicioEvento: string;   // Data do evento em si (para cálculo de "em breve/disponível")
  dataFimEvento: string;      // Data final do evento (expira o banner)

  // Textos Dinâmicos por Estado
  textoEmBreve: string;
  textoDisponivel: string;
  textoAoVivo: string;

  tag?: string;
  link?: string;
  ativo: boolean;
  ordem?: number;
  cidade?: string;
  categorias: string[];
  aviso?: string;
}

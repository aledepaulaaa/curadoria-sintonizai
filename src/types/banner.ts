export interface BannerDestaque {
  id?: string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  imagemFundo: string;
  
  // Controle Temporal (ISO strings com horário)
  dataInicioExibicao: string; // Quando o banner começa a aparecer no feed
  dataInicioEvento: string;   // Início do evento (muda para 'ao_vivo' se houver horário ou 'disponivel')
  dataFimEvento: string;      // Fim do evento (remove o banner)

  // Textos Dinâmicos de Status (O que aparece no badge)
  textoStatusEmBreve: string;      // Default: "EM BREVE"
  textoStatusDisponivel: string;   // Default: "DISPONÍVEL"
  textoStatusAoVivo: string;       // Default: "AO VIVO"

  // Mensagens Dinâmicas (O que aparece no corpo do banner)
  textoEmBreve: string;
  textoDisponivel: string;
  textoAoVivo: string;

  // Botão Dinâmico
  textoBotao: string; // Default: "Ver Programação"

  // Notificações
  notificarInicioExibicao: boolean;
  notificarInicioEvento: boolean;

  tag?: string;
  link?: string;
  ativo: boolean;
  ordem: number;
  cidade?: string;
  categorias: string[];
  aviso?: string;
}

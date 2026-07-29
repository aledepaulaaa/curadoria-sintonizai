export interface ResumoColetaDados {
  totalEncontrados: number;
  cidades: string;
  tipos: string;
  fontes: string;
  dataHora: string;
  tempoGasto: string;
}

export interface MiniResumoCardProps {
  resumo: ResumoColetaDados;
  onAprovarTodos: () => void;
  aprovandoLote: boolean;
  compacto?: boolean;
}

export interface MiniResumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumo: ResumoColetaDados | null;
  onAprovarTodos: () => void;
  aprovandoLote: boolean;
}

export interface ColetaStatusFooterProps {
  coletaEmAndamento: boolean;
  tempoDecorridoSegundos: number;
  formatarRelogio: (segundos: number) => string;
  resumo: ResumoColetaDados | null;
  onOpenResumoModal: () => void;
  onAprovarTodos: () => void;
  aprovandoLote: boolean;
}

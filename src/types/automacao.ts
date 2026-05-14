export type AutomacaoGatilho = 
  | 'evento_salvo' 
  | 'evento_proximo' 
  | 'mudanca_evento' 
  | 'ingresso_acabando' 
  | 'novo_evento' 
  | 'usuario_inativo' 
  | 'recomendacao_geografica' 
  | 'banner_exibicao'
  | 'banner_evento'
  | 'periodico';

export type AutomacaoUnidadeTempo = 'minutos' | 'horas' | 'dias';

export interface Automacao {
  id: string;
  nome: string;
  gatilho: AutomacaoGatilho;
  
  // Condições dinâmicas baseadas no gatilho
  condicoes: {
    distanciaMaxKm?: number;
    janelaHorarioHoras?: number;
    estilos?: string[];
    gratuito?: boolean;
    diasInatividade?: number;
    minIngressosRestantes?: number;
  };

  // Timing do disparo
  timing: {
    tipo: 'imediato' | 'relativo';
    valor?: number;
    unidade?: AutomacaoUnidadeTempo;
    antesOuDepois?: 'antes' | 'depois';
  };

  // Conteúdo da Notificação
  mensagem: {
    titulo: string;
    corpo: string;
    imagemUrl?: string;
  };

  // Destino do Clique
  destino: {
    tipo: 'evento' | 'evento_contextual' | 'perfil' | 'curadoria' | 'home' | 'externo';
    id?: string; // ID do evento ou perfil
    url?: string; // Para links externos
  };

  // Configuração de Execução
  configuracao: {
    frequencia: 'uma_vez' | 'diaria' | 'semanal' | 'personalizada';
    diasSemana?: number[]; // [0, 1, 2...] para semanal
    datasSelecionadas?: string[]; // ["2026-05-14", ...] para personalizada
    recorrente?: boolean; // Se as datas selecionadas devem repetir anualmente
    ativa: boolean;
    horarioExecucao?: string; // HH:mm para periódicos
    dataExecucao?: string; // YYYY-MM-DD para uma_vez
  };

  destinatarios: {
    tipo: 'todos' | 'especifico';
    userId?: string;
  };

  criadoEm: string;
  atualizadoEm: string;
  ultimaExecucao?: string;
}

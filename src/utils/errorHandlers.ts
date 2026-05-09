/**
 * Utilitários para tratamento de erros silenciosos e padronizados
 */

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  metadata?: any;
}

export function handleActionError(error: any, context: string): ActionResponse {
  // Log interno no servidor para depuração
  console.error(`[Error in ${context}]:`, error);

  // Mapeamento de erros comuns para mensagens amigáveis
  const message = error?.message || '';
  
  if (message.includes('permission-denied')) {
    return { success: false, error: 'Você não tem permissão para realizar esta ação.', code: 'UNAUTHORIZED' };
  }

  if (message.includes('not-found')) {
    return { success: false, error: 'O recurso solicitado não foi encontrado.', code: 'NOT_FOUND' };
  }

  if (message.includes('network-error')) {
    return { success: false, error: 'Erro de conexão com o servidor.', code: 'NETWORK_ERROR' };
  }

  // Erro genérico para o usuário final (evita sujar o console com detalhes técnicos)
  return { 
    success: false, 
    error: 'Ocorreu um erro interno. Tente novamente mais tarde.', 
    code: 'INTERNAL_ERROR' 
  };
}

export function createSuccessResponse<T>(data: T, metadata?: any): ActionResponse<T> {
  return { success: true, data, metadata };
}

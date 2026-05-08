export interface KpiData {
  label: string;
  valor: number;
  icone: string;
  cor?: string;
}

export interface ChartData {
  nome: string;
  valor: number;
  cor?: string;
}

export interface StorageItem {
  nome: string;
  caminho: string;
  url?: string;
  tipo: 'pasta' | 'arquivo';
  tamanho?: number;
}

export interface ApiResponse<T = unknown> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
}

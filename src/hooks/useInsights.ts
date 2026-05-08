'use client';

import React from 'react';
import { buscarInsights } from '@/src/actions/insights/insightsActions';
import type { KpiData, ChartData } from '@/src/types/common';

export function useInsights() {
  const [kpis, setKpis] = React.useState<KpiData[]>([]);
  const [categorias, setCategorias] = React.useState<ChartData[]>([]);
  const [gratuitos, setGratuitos] = React.useState<ChartData[]>([]);
  const [topShared, setTopShared] = React.useState<{ id: string, nome: string, total: number }[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const response = await buscarInsights();
      if (response.success && response.data) {
        setKpis(response.data.kpis);
        setCategorias(response.data.categorias);
        setGratuitos(response.data.gratuitos);
        setTopShared(response.data.topShared);
      } else {
        setErro(response.error || 'Falha ao carregar dados');
      }
    } catch (e) {
      setErro('Erro inesperado na conexão');
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  return { kpis, categorias, gratuitos, topShared, carregando, erro, carregar };
}

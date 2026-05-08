'use client';

import React from 'react';
import { listarFiltros } from '@/src/actions/filtros/filtrosActions';
import * as CONSTANTS from '@/src/constants/curadoria';

export function useFiltros() {
  const [filtros, setFiltros] = React.useState<any>({
    categorias: CONSTANTS.CATEGORIAS_EVENTO,
    ritmos: CONSTANTS.RITMOS_MUSICA,
    vibes: CONSTANTS.VIBES,
    teatro: CONSTANTS.TIPOS_TEATRO
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const carregar = async () => {
      try {
        const data = await listarFiltros();
        if (Array.isArray(data) && data.length > 0) {
          const novosFiltros: any = {};
          data.forEach((f: any) => {
            if (f.id && f.itens) {
              novosFiltros[f.id] = f.itens;
            }
          });
          setFiltros((prev: any) => ({ ...prev, ...novosFiltros }));
        }
      } catch (e) {
        console.error('Erro ao carregar filtros dinâmicos:', e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  return { filtros, loading };
}

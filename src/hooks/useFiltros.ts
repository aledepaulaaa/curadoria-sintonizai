'use client';

import React from 'react';
import { listarFiltros } from '@/src/actions/filtros/filtrosActions';
export function useFiltros() {
  const [filtros, setFiltros] = React.useState<any>({
    categorias: [],
    ritmos: [],
    vibes: [],
    teatro: []
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
          setFiltros(novosFiltros);
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

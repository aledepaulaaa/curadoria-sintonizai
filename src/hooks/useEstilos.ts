'use client';

import React from 'react';
import { listarEstilos } from '@/src/actions/estilos/estilosActions';

export function useEstilos() {
  const [estilos, setEstilos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const carregar = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarEstilos();
      setEstilos(data);
    } catch (e) {
      console.error('Erro ao carregar estilos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  return { estilos, loading, recarregar: carregar };
}

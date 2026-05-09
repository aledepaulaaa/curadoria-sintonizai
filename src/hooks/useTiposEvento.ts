'use client';

import React from 'react';
import { listarTiposEvento } from '@/src/actions/filtros/tiposEventoActions';

export function useTiposEvento() {
  const [tiposEvento, setTiposEvento] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const carregar = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarTiposEvento();
      setTiposEvento(data);
    } catch (e) {
      console.error('Erro ao carregar tipos de evento:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  return { tiposEvento, loading, recarregar: carregar };
}

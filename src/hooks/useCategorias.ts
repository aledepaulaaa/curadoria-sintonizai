'use client';

import React from 'react';
import { listarCategorias } from '@/src/actions/categorias/categoriasActions';

export function useCategorias() {
  const [categorias, setCategorias] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const carregar = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarCategorias();
      setCategorias(data);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  return { categorias, loading, recarregar: carregar };
}

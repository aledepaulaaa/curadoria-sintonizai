'use client';

import React from 'react';
import { listarEventos, criarEvento, atualizarEvento, deletarEvento, criarEventosBatch, deletarEventosBatch } from '@/src/actions/eventos/eventosActions';
import type { Evento } from '@/src/types/evento';

export function useEventos() {
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [carregando, setCarregando] = React.useState(false);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarEventos();
      setEventos(lista);
    } finally {
      setCarregando(false);
    }
  }, []);

  const criar = React.useCallback(async (evento: Omit<Evento, 'id'>) => {
    await criarEvento(evento);
    await carregar();
  }, [carregar]);

  const criarBatch = React.useCallback(async (lista: Omit<Evento, 'id'>[]) => {
    const count = await criarEventosBatch(lista);
    await carregar();
    return count;
  }, [carregar]);

  const atualizar = React.useCallback(async (id: string, dados: Partial<Evento>) => {
    await atualizarEvento(id, dados);
    await carregar();
  }, [carregar]);

  const deletar = React.useCallback(async (id: string) => {
    await deletarEvento(id);
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deletarBatch = React.useCallback(async (ids: string[]) => {
    await deletarEventosBatch(ids);
    setEventos((prev) => prev.filter((e) => !ids.includes(e.id || '')));
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  return { eventos, carregando, carregar, criar, criarBatch, atualizar, deletar, deletarBatch };
}

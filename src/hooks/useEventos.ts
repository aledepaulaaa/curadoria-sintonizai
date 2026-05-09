'use client';

import React from 'react';
import { 
  listarEventos, 
  criarEvento, 
  atualizarEvento, 
  deletarEvento, 
  criarEventosBatch, 
  deletarEventosBatch,
  atualizarEventosBatch
} from '@/src/actions/eventos/eventosActions';
import { useEventStore } from '@/src/store/eventStore';
import type { Evento } from '@/src/types/evento';

export function useEventos() {
  const { 
    eventos, 
    carregando, 
    carregarEventos, 
    adicionarEvento, 
    atualizarEventoLocal, 
    atualizarEventosBatchLocal,
    removerEventoLocal,
    removerEventosBatchLocal
  } = useEventStore();

  const carregar = React.useCallback(async (force = false) => {
    await carregarEventos(force);
  }, [carregarEventos]);

  const criar = React.useCallback(async (evento: Omit<Evento, 'id'>) => {
    const id = await criarEvento(evento);
    adicionarEvento({ ...evento, id } as Evento);
  }, [adicionarEvento]);

  const criarBatch = React.useCallback(async (lista: Omit<Evento, 'id'>[]) => {
    const count = await criarEventosBatch(lista);
    await carregar(true); // Batch é complexo demais para atualizar localmente um por um com IDs corretos de uma vez sem retorno da lista
    return count;
  }, [carregar]);

  const atualizar = React.useCallback(async (id: string, dados: Partial<Evento>) => {
    await atualizarEvento(id, dados);
    atualizarEventoLocal(id, dados);
  }, [atualizarEventoLocal]);

  const atualizarEmMassa = React.useCallback(async (ids: string[], dados: Partial<Evento>) => {
    await atualizarEventosBatch(ids, dados);
    atualizarEventosBatchLocal(ids, dados);
  }, [atualizarEventosBatchLocal]);

  const deletar = React.useCallback(async (id: string) => {
    await deletarEvento(id);
    removerEventoLocal(id);
  }, [removerEventoLocal]);

  const deletarBatch = React.useCallback(async (ids: string[]) => {
    await deletarEventosBatch(ids);
    removerEventosBatchLocal(ids);
  }, [removerEventosBatchLocal]);

  React.useEffect(() => { 
    carregar(); 
  }, [carregar]);

  return { eventos, carregando, carregar, criar, criarBatch, atualizar, atualizarEmMassa, deletar, deletarBatch };
}

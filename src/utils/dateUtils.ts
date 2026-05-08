import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatarData(iso: string): string {
  try {
    const date = parseISO(iso);
    if (!isValid(date)) return iso;
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function formatarDataHora(iso: string, horario?: string): string {
  const data = formatarData(iso);
  return horario ? `${data} às ${horario}` : data;
}

export function isEventoFuturo(dataInicio: string): boolean {
  try {
    const date = parseISO(dataInicio);
    return isValid(date) && date >= new Date();
  } catch {
    return false;
  }
}

import ticketHistoryService from '../api/ticketHistoryService';
import type { TicketHistoryDTO } from '../types';
import { useFetch } from './useFetch';

export function useTicketHistory(ticketId: string) {
  const { data, loading, error, refetch } = useFetch<TicketHistoryDTO[]>(
    () => ticketHistoryService.getByTicketId(ticketId),
    [ticketId],
  );

  return {
    history: data ?? [],
    loading,
    error,
    refetch,
  };
}

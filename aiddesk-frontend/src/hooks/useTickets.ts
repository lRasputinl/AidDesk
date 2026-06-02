import { useCallback, useEffect, useState } from 'react';
import ticketService from '../api/ticketService';
import type { TicketResponseDTO } from '../types';
import { useAuth } from '../context/AuthContext';

export function useTickets() {
  const { isSupport, isManager, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: TicketResponseDTO[];
      if (isManager || isAdmin) {
        data = await ticketService.getAll();
      } else if (isSupport) {
        data = await ticketService.getAssigned();
      } else {
        data = await ticketService.getMy();
      }
      setTickets(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки тикетов');
    } finally {
      setLoading(false);
    }
  }, [isSupport, isManager, isAdmin]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, refetch: fetchTickets };
}

export function useTicket(ticketId: string) {
  const [ticket, setTicket] = useState<TicketResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getById(ticketId);
      setTicket(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки тикета');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, loading, error, refetch: fetchTicket };
}

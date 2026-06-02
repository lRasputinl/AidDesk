import apiClient from './client';
import type { TicketHistoryDTO } from '../types';

const ticketHistoryService = {
  getByTicketId: async (ticketId: string): Promise<TicketHistoryDTO[]> => {
    const response = await apiClient.get<TicketHistoryDTO[]>('/api/tickethistories', {
      params: { ticketId },
    });
    return response.data;
  },
};

export default ticketHistoryService;

import apiClient from './client';
import type {
  AssignTicketDTO,
  CreateTicketByClientDTO,
  CreateTicketBySupportDTO,
  TicketResponseDTO,
  UpdateTicketDTO,
  UpdateTicketStatusDTO,
} from '../types';

const ticketService = {
  /** Manager only — get all tickets */
  getAll: async (): Promise<TicketResponseDTO[]> => {
    const response = await apiClient.get<TicketResponseDTO[]>('/api/tickets');
    return response.data;
  },

  /** Support only — get tickets assigned to current user */
  getAssigned: async (): Promise<TicketResponseDTO[]> => {
    const response = await apiClient.get<TicketResponseDTO[]>('/api/tickets/assigned');
    return response.data;
  },

  /** Any authenticated user — get ticket by id */
  getById: async (ticketId: string): Promise<TicketResponseDTO> => {
    const response = await apiClient.get<TicketResponseDTO>(`/api/tickets/${ticketId}`);
    return response.data;
  },

  /** Any authenticated user — get own tickets */
  getMy: async (): Promise<TicketResponseDTO[]> => {
    const response = await apiClient.get<TicketResponseDTO[]>('/api/tickets/my');
    return response.data;
  },

  /** Client only */
  createByClient: async (data: CreateTicketByClientDTO): Promise<TicketResponseDTO> => {
    const response = await apiClient.post<TicketResponseDTO>('/api/tickets', data);
    return response.data;
  },

  /** Manager only — create on behalf of client */
  createByManager: async (data: CreateTicketBySupportDTO): Promise<TicketResponseDTO> => {
    const response = await apiClient.post<TicketResponseDTO>('/api/tickets/manager', data);
    return response.data;
  },

  /** Support only — change status of assigned ticket */
  updateStatus: async (ticketId: string, data: UpdateTicketStatusDTO): Promise<void> => {
    await apiClient.patch(`/api/tickets/${ticketId}/status`, data);
  },

  /** Manager only — assign to support employee and/or change priority */
  assign: async (ticketId: string, data: AssignTicketDTO): Promise<void> => {
    await apiClient.patch(`/api/tickets/${ticketId}/assign`, data);
  },

  /** Manager only — full update */
  update: async (ticketId: string, data: UpdateTicketDTO): Promise<void> => {
    await apiClient.put('/api/tickets', data, { params: { ticketId } });
  },

  /** Manager only — delete ticket */
  delete: async (ticketId: string): Promise<void> => {
    await apiClient.delete('/api/tickets', { params: { ticketId } });
  },
};

export default ticketService;

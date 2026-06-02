import apiClient from './client';
import type {
  CommentResponseDTO,
  CreateCommentByClientDTO,
  CreateCommentBySupportDTO,
} from '../types';

const commentService = {
  getByTicketId: async (ticketId: string): Promise<CommentResponseDTO[]> => {
    const response = await apiClient.get<CommentResponseDTO[]>(`/api/comments/${ticketId}`);
    return response.data;
  },

  createByClient: async (
    ticketId: string,
    data: CreateCommentByClientDTO,
  ): Promise<CommentResponseDTO> => {
    const response = await apiClient.post<CommentResponseDTO>('/api/comments/client', data, {
      params: { ticketId },
    });
    return response.data;
  },

  createBySupport: async (
    ticketId: string,
    data: CreateCommentBySupportDTO,
  ): Promise<CommentResponseDTO> => {
    const response = await apiClient.post<CommentResponseDTO>('/api/comments/support', data, {
      params: { ticketId },
    });
    return response.data;
  },
};

export default commentService;

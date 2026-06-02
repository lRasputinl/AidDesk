import commentService from '../api/commentService';
import type { CommentResponseDTO } from '../types';
import { useFetch } from './useFetch';

export function useComments(ticketId: string) {
  const { data, loading, error, refetch } = useFetch<CommentResponseDTO[]>(
    () => commentService.getByTicketId(ticketId),
    [ticketId],
  );

  return {
    comments: data ?? [],
    loading,
    error,
    refetch,
  };
}

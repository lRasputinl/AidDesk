import userService from '../api/userService';
import type { UserResponseDTO } from '../types';
import { useFetch } from './useFetch';

export function useUsers() {
  const { data, loading, error, refetch } = useFetch<UserResponseDTO[]>(
    () => userService.getAll(),
    [],
  );

  return {
    users: data ?? [],
    loading,
    error,
    refetch,
  };
}

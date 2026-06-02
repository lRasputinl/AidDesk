import axios from 'axios';

/**
 * Extracts a human-readable error message from an Axios error or any unknown error.
 * Falls back to the provided `fallback` string if no message is available.
 */
export function extractApiError(err: unknown, fallback = 'Произошла ошибка'): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

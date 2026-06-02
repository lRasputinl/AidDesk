import apiClient from './client';
import type { UpdateUserDTO, UserResponseDTO } from '../types';

const userService = {
  /** Support only */
  getAll: async (): Promise<UserResponseDTO[]> => {
    const response = await apiClient.get<UserResponseDTO[]>('/api/users');
    return response.data;
  },

  /** Support only */
  getById: async (userId: string): Promise<UserResponseDTO> => {
    const response = await apiClient.get<UserResponseDTO>(`/api/users/${userId}`);
    return response.data;
  },

  /** Any authenticated user — returns own profile */
  getMe: async (): Promise<UserResponseDTO> => {
    const response = await apiClient.get<UserResponseDTO>('/api/users/me');
    return response.data;
  },

  /** Any authenticated user — updates own profile */
  updateMe: async (data: UpdateUserDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.put<UserResponseDTO>('/api/users/me', data);
    return response.data;
  },

  /** Any authenticated user — changes own password */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.put('/api/users/me/password', data);
  },

  /** Manager only — change a user's role */
  changeRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.put(`/api/users/${userId}/role`, { role });
  },

  /** Manager only */
  delete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}`);
  },
};

export default userService;

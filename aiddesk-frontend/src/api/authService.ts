import apiClient from './client';
import type { AuthResponseDTO, LoginDTO, RegisterDTO } from '../types';

const authService = {
  login: async (data: LoginDTO): Promise<AuthResponseDTO> => {
    const response = await apiClient.post<AuthResponseDTO>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDTO): Promise<void> => {
    await apiClient.post('/api/auth/register', data);
  },
};

export default authService;

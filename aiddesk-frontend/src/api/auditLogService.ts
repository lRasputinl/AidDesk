import apiClient from './client';
import type { AuditLogResponseDTO } from '../types';

const auditLogService = {
  getAll: async (): Promise<AuditLogResponseDTO[]> => {
    const response = await apiClient.get<AuditLogResponseDTO[]>('/api/auditlogs');
    return response.data;
  },
};

export default auditLogService;

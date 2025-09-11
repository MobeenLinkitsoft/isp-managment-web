import apiClient from '../api-client';

export interface ConnectionType {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: string;
}

export const fetchConnectionTypes = async (): Promise<ConnectionType[]> => {
  const { data } = await apiClient.get('/connection-types');
  return data;
};

export const fetchConnectionType = async (id: string): Promise<ConnectionType> => {
  const { data } = await apiClient.get(`/connection-types/${id}`);
  return data;
};

export const addConnectionType = async (connectionType: Omit<ConnectionType, 'id'>): Promise<ConnectionType> => {
  const { data } = await apiClient.post('/connection-types', connectionType);
  return data;
};

export const updateConnectionType = async (
  id: string,
  updates: Partial<ConnectionType>
): Promise<ConnectionType> => {
  const { data } = await apiClient.put(`/connection-types/${id}`, updates);
  return data;
};

export const deleteConnectionType = async (id: string): Promise<void> => {
  await apiClient.delete(`/connection-types/${id}`);
};
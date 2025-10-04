import apiClient from '../api-client';

export interface Customer {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  mobile: string;
  nationalId: string;
  address: string;
  isActive: boolean;
  status: string;
  connectionStartDate: string;
  registrationDate: number;
  connectionEndDate: string | null;
  password: string;
  plan: {
    id: string;
    name: string;
    price: number;
    description: string;
    speed: number;
    isActive: boolean;
    addedBy: string;
    createdAt: number;
    updatedAt: number;
  };
  connectionType: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
  };
  addedBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    deletedAt: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface StatsInfo {
  total: number;
  active: number;
  inactive: number;
}

export interface FiltersInfo {
  search: string | null;
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: PaginationInfo;
  stats: StatsInfo;
  filters: FiltersInfo;
}

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const fetchCustomers = async (params?: FetchCustomersParams): Promise<CustomersResponse> => {
  const { data } = await apiClient.get('/customers', { params });
  return data;
};

export const fetchCustomer = async (id: string): Promise<Customer> => {
  const { data } = await apiClient.get(`/customers/${id}`);
  return data;
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const { data } = await apiClient.post('/customers', customer);
  return data;
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
  const { data } = await apiClient.put(`/customers/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await apiClient.put(`/customers/status/${id}`);
};
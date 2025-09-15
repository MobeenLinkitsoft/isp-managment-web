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
  status:string;ƒ
  plan: {
    id: string;
    name: string;
      price: number; // required
  };
  connectionType: {
    id: string;
    name: string;
  };
}

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data } = await apiClient.get('/customers');
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
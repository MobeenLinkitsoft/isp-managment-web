import apiClient from '../api-client';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  password?: string;

}

export interface EmployeesResponse {
  success: boolean;
  users: Employee[];
  count: number;
}

const handleApiError = (error: any, defaultMessage: string) => {
  console.error('API Error:', error);
  
  // Extract error message from different possible error formats
  const message = error.response?.data?.message || 
                 error.message || 
                 defaultMessage;
  
  throw new Error(message);
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data } = await apiClient.get('/users');
    return data?.users;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch employees');
  }
};

export const fetchEmployee = async (id: string): Promise<Employee> => {
  try {
    const { data } = await apiClient.get(`/users/${id}`);
    return data?.user;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch employee');
  }
};

export const addEmployee = async (employee: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: string;
}): Promise<Employee> => {
  try {
    const { data } = await apiClient.post('/users', employee);
    return data;
  } catch (error) {
    return handleApiError(error, 'Failed to add employee');
  }
};

export const updateEmployee = async (
  id: string, 
  updates: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    role?: string;
  }
): Promise<Employee> => {
  try {
    const { data } = await apiClient.put(`/users/${id}`, updates);
    return data;
  } catch (error) {
    return handleApiError(error, 'Failed to update employee');
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    handleApiError(error, 'Failed to delete employee');
    throw error;
  }
};

export const restoreEmployee = async (id: string): Promise<void> => {
  try {
    await apiClient.post(`/users/${id}/restore`);
  } catch (error) {
    handleApiError(error, 'Failed to restore employee');
    throw error;
  }
};

// export const changeEmployeeStatus = async (id: string, isActive: boolean): Promise<Employee> => {
//   try {
//     const { data } = await apiClient.patch(`/users/${id}/status`, { isActive });
//     return data;
//   } catch (error) {
//     return handleApiError(error, 'Failed to change employee status');
//   }
// };

// export const fetchEmployeeStats = async (): Promise<{
//   total: number;
//   active: number;
//   inactive: number;
//   admins: number;
//   staff: number;
// }> => {
//   try {
//     const { data } = await apiClient.get('/users/stats');
//     return data;
//   } catch (error) {
//     return handleApiError(error, 'Failed to fetch employee statistics');
//   }
// };
import apiClient from '../api-client';

export interface Payment {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate: number;
  dueDate: number;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
  receivedBy?: string;
  customer: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    addedBy?: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
  };
  connectionStartDate?: string;
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

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
  pagination: PaginationInfo;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export interface PaymentStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  totalRecords: number;
  paidRecords: number;
  pendingRecords: number;
}

export const fetchPayments = async (
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<PaymentsResponse> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (status && status !== 'all') {
    params.append('status', status);
  }
  
  const { data } = await apiClient.get(`/payments?${params}`);
  return data;
};

export const markPaymentAsPaid = async (
  paymentId: string,
  paymentData: {
    paymentMethod: string;
    transactionRef?: string;
    notes?: string;
    receivedBy?: string;
  }
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post(
    `/payments/${paymentId}/mark-paid`,
    paymentData
  );
  return data;
};
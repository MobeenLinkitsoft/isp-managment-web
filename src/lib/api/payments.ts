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
  };
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
  count: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
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
  status?: string
): Promise<PaymentsResponse> => {
  const params = new URLSearchParams({
    startDate,
    endDate
  });
  
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

 
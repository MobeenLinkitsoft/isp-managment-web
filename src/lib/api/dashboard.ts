import apiClient from '../api-client';

export interface DashboardMetrics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  activeCustomers: number;
  inactiveCustomers: number;
  paymentStatusDistribution: {
    paid: number;
    pending: number;
    overdue: number;
    cancelled: number;
  };
  recentPayments: any[];
  recentCustomers: any[];
  customerGrowth: Array<{ month: string; count: number }>;
  revenueGrowth: Array<{ month: string; revenue: number }>;
  topPackages: Array<{ name: string; count: number }>;
  connectionTypeDistribution: Array<{ name: string; count: number }>;
  customerRetentionRate: string;
  averageRevenuePerCustomer: string;
  paymentCollectionRate: string;
}

export interface QuickStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  pendingPayments: number;
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data } = await apiClient.get('/dashboard');
  console.log(">>>>>>>",data)
  return data;
};

export const fetchQuickStats = async (): Promise<QuickStats> => {
  const { data } = await apiClient.get('/dashboard/quick-stats');
  return data;
};

export const fetchRevenueAnalytics = async (): Promise<any> => {
  const { data } = await apiClient.get('/dashboard/revenue');
  return data;
};

export const fetchCustomerAnalytics = async (): Promise<any> => {
  const { data } = await apiClient.get('/dashboard/customers');
  return data;
};
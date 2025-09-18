"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  ArrowPathIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  HomeIcon,
  WifiIcon,
  CubeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { logoutUser, getCurrentUser } from "../../lib/auth";
import {
  fetchDashboardMetrics,
  fetchQuickStats,
  fetchRevenueAnalytics,
  fetchCustomerAnalytics,
} from "../../lib/api/dashboard";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
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

interface QuickStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  pendingPayments: number;
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Customers", href: "/customers", icon: UsersIcon },
  { name: "Connections", href: "/connections", icon: WifiIcon },
  { name: "Payments", href: "/payments", icon: CurrencyDollarIcon },
  { name: "Inventory", href: "/inventory", icon: CubeIcon },
  { name: "Employees", href: "/employees", icon: UserGroupIcon },
  { name: "Packages", href: "/packages", icon: ChartBarIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Dashboard() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [metrics, stats, revenue, customers] = await Promise.all([
        fetchDashboardMetrics(),
        fetchQuickStats(),
        fetchRevenueAnalytics(),
        fetchCustomerAnalytics(),
      ]);

      setDashboardData(metrics);
      setQuickStats(stats);
      setRevenueData(revenue);
      setCustomerData(customers);
    } catch (error) {
      console.error("Dashboard error:", error);
      alert("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed");
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const quickActions = [
    {
      title: "Add Customer",
      icon: <UsersIcon className="w-5 h-5 text-[#4F46E5]" />,
      bg: "bg-indigo-600 hover:bg-indigo-700",
      href: "/customers/new",
    },
    {
      title: "Payments",
      icon: <CurrencyDollarIcon className="w-5 h-5 text-[#10B981]" />,
      bg: "bg-green-600 hover:bg-green-700",
      href: "/khata",
    },
    {
      title: "Create Invoice",
      icon: <ChartBarIcon className="w-5 h-5 text-[#F59E0B]" />,
      bg: "bg-amber-600 hover:bg-amber-700",
      href: "/invoices/new",
    },
    {
      title: "Manage Packages",
      icon: <CogIcon className="w-5 h-5 text-[#8B5CF6]" />,
      bg: "bg-purple-600 hover:bg-purple-700",
      href: "/packages",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "overdue":
        return "#EF4444";
      case "cancelled":
        return "#64748B";
      default:
        return "#6B7280";
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs${amount?.toLocaleString()}`;
  };

  const getRandomColor = () => {
    const colors = [
      "#4F46E5",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#14B8A6",
      "#F97316",
      "#64748B",
      "#0EA5E9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Prepare chart data
  const connectionTypeChartData = {
    labels:
      dashboardData?.connectionTypeDistribution?.map((item) => item.name) || [],
    datasets: [
      {
        data:
          dashboardData?.connectionTypeDistribution?.map(
            (item) => item.count
          ) || [],
        backgroundColor:
          dashboardData?.connectionTypeDistribution?.map(() =>
            getRandomColor()
          ) || [],
        borderWidth: 0,
      },
    ],
  };

  const packageChartData = {
    labels:
      dashboardData?.topPackages?.map((item) => item.name.substring(0, 12)) ||
      [],
    datasets: [
      {
        label: "Subscribers",
        data: dashboardData?.topPackages?.map((item) => item.count) || [],
        backgroundColor: "#4F46E5",
      },
    ],
  };

  const revenueChartData = {
    labels:
      dashboardData?.revenueGrowth?.map((item) => item.month.split(" ")[0]) ||
      [],
    datasets: [
      {
        label: "Revenue",
        data: dashboardData?.revenueGrowth?.map((item) => item.revenue) || [],
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Logging out...</p>
        </div>
      </div>
    );
  }

  // if (isLoading) {
  //     <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  //         <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
  //       </div>
  //     </div>
  // }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="mr-4 text-white lg:hidden"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div>
                <p className="text-white text-xl">Welcome back, Naeem ISP</p>
                <h1 className="text-white text-3xl font-bold">
                  {currentUser?.firstName || "User"}
                </h1>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleRefresh}
                className="text-white p-2 rounded-full hover:bg-indigo-500 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogoutPress}
                className="text-white p-2 rounded-full hover:bg-indigo-500 transition-colors lg:hidden"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-5 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Logout
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="flex-1 px-6 -mt-8 pb-8">
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Customers",
                value: quickStats?.totalCustomers || 0,
                change: "+12.5%",
                icon: UsersIcon,
                color: "indigo",
              },
              {
                title: "Active Connections",
                value: dashboardData?.activeCustomers || 0,
                change: "+8.2%",
                icon: ChartBarIcon,
                color: "green",
              },
              {
                title: "Pending Payments",
                value: formatCurrency(quickStats?.pendingPayments || 0),
                change: "+5.3%",
                icon: ClockIcon,
                color: "yellow",
              },
              {
                title: "Monthly Revenue",
                value: formatCurrency(dashboardData?.monthlyRevenue || 0),
                change: "+15.7%",
                icon: CurrencyDollarIcon,
                color: "purple",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 border-${stat.color}-500`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {stat.value}
                    </h3>
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-${
                          stat.change.includes("+") ? "green" : "red"
                        }-500 text-sm flex items-center`}
                      >
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />{" "}
                        {stat.change}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rest of your dashboard content remains the same */}
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`${action.bg} p-6 rounded-2xl text-white text-center transition-transform hover:scale-105 shadow-md`}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full mb-3">
                    {action.icon}
                  </div>
                  <span className="font-semibold">{action.title}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Revenue Analytics
                </h3>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="h-64">
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </div>

            {/* Customer Growth Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Customer Growth
                </h3>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="h-64">
                <Bar data={packageChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Connection Types */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Connection Types
              </h3>
              <div className="h-64">
                <Pie data={connectionTypeChartData} options={chartOptions} />
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Payment Status
              </h3>
              {dashboardData?.paymentStatusDistribution && (
                <div className="space-y-4">
                  {Object.entries(dashboardData.paymentStatusDistribution).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: getStatusColor(status) }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {status}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Performance Metrics
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Customer Retention",
                    value: dashboardData?.customerRetentionRate || "0%",
                    color: "text-green-600",
                  },
                  {
                    label: "Avg Revenue/Customer",
                    value: `Rs${
                      dashboardData?.averageRevenuePerCustomer || "0"
                    }`,
                    color: "text-blue-600",
                  },
                  {
                    label: "Payment Collection",
                    value: dashboardData?.paymentCollectionRate || "0%",
                    color: "text-indigo-600",
                  },
                  {
                    label: "New Customers",
                    value: quickStats?.newCustomersThisMonth || 0,
                    color: "text-purple-600",
                  },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">
                      {metric.label}
                    </span>
                    <span className={`text-sm font-bold ${metric.color}`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Payments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Payments
                </h3>
                <Link
                  href="/payments"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData?.recentPayments?.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full ${
                          payment.status === "paid"
                            ? "bg-green-100"
                            : payment.status === "pending"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <CreditCardIcon
                          className={`w-4 h-4 ${
                            payment.status === "paid"
                              ? "text-green-600"
                              : payment.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">
                          {payment.customer?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.plan?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p
                        className="text-xs capitalize"
                        style={{ color: getStatusColor(payment.status) }}
                      >
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Customers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Customers
                </h3>
                <Link
                  href="/customers"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData?.recentCustomers?.slice(0, 5).map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UsersIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.mobile}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {customer.plan?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.connectionType?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

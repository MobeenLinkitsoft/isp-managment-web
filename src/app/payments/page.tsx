"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  WifiIcon,
  ChevronDownIcon,
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentCurrencyDollarIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  fetchPayments,
  markPaymentAsPaid,
  Payment,
  PaymentStats,
  PaginationInfo,
} from "../../lib/api/payments";
import { fetchEmployees } from "../../lib/api/employees";
import { getCurrentUser } from "../../lib/storage";

const ITEMS_PER_PAGE = 10;

const paymentMethods = [
  {
    label: "Cash",
    value: "cash",
    icon: DocumentCurrencyDollarIcon,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    label: "Bank Transfer",
    value: "bank",
    icon: BanknotesIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    label: "JazzCash",
    value: "jazzcash",
    icon: QrCodeIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    label: "EasyPaisa",
    value: "easypaisa",
    icon: ReceiptPercentIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    label: "Other",
    value: "other",
    icon: CreditCardIcon,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
];

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

export default function KhataPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: ITEMS_PER_PAGE,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiSearchQuery, setApiSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);

  // Date range state
  const now = new Date();

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // first and last day of current month (local time)
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // use lazy initializers so values are computed once
  const [tempStartDate, setTempStartDate] = useState<string>(() =>
    formatLocalDate(firstOfMonth)
  );
  const [tempEndDate, setTempEndDate] = useState<string>(() =>
    formatLocalDate(lastOfMonth)
  );

  const [startDate, setStartDate] = useState<string>(tempStartDate);
  const [endDate, setEndDate] = useState<string>(tempEndDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, currentUser, currentPage, statusFilter, apiSearchQuery]);

  const filterPaymentsByRole = (paymentsData: Payment[]) => {
    if (currentUser?.role === "admin") {
      return paymentsData; // Admin sees all payments
    } else {
      // Employee sees only payments they created or received
      return paymentsData.filter(
        (payment) => payment.customer?.addedBy === currentUser?.id
      );
    }
  };

 const loadData = async () => {
  try {
    setIsLoading(true);
    
    // If there's a search query, we don't use date filters
    const paymentsResponse = await fetchPayments(
      apiSearchQuery ? '' : startDate, // Don't use dates when searching
      apiSearchQuery ? '' : endDate,   // Don't use dates when searching
      currentPage, 
      ITEMS_PER_PAGE,
      statusFilter,
      apiSearchQuery
    );
    
    const filteredPaymentsData = filterPaymentsByRole(paymentsResponse.data);
    setPayments(filteredPaymentsData);
    setPagination(paymentsResponse.pagination);
    setStats(paymentsResponse.stats);

    if (currentUser?.role === "admin") {
      const employeesResponse = await fetchEmployees();
      setEmployees(employeesResponse);
    }
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Failed to load payments data");
  } finally {
    setIsLoading(false);
    setRefreshing(false);
    setIsSearching(false);
  }
};

  const handleSearch = () => {
    if (searchQuery.trim() !== apiSearchQuery) {
      setIsSearching(true);
      setApiSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (apiSearchQuery !== "") {
      setApiSearchQuery("");
      setCurrentPage(1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1); // Reset to first page on refresh
    loadData();
  };

  const handleDateSearch = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1); // Reset to first page when date changes
    setShowDatePicker(false);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalAmount = stats.totalAmount || payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const paidAmount = stats.paidAmount || payments.reduce(
    (sum, payment) => (payment.status === "paid" ? sum + payment.amount : sum),
    0
  );

  // Client-side search filtering is removed since we're using API search

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;

    try {
      setSaving(true);
      await markPaymentAsPaid(selectedPayment.id, {
        paymentMethod,
        transactionRef,
        notes,
      });

      setShowPaymentModal(false);
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = (payment: Payment) => {
    const printDate = new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy

    const printContent = `
    <div style="width:58mm;font-size:12px;font-family:Arial,sans-serif;line-height:1.4;">
      <!-- Logo and Header -->
      <div style="text-align:center; margin-bottom:8px;">
        <img src="/assets/logo.png" alt="Logo" style="max-width:150px;height:auto;margin:0 auto 1px;">
        <h3 style="margin:2px 0;font-weight:bold;font-size:14px;">Payment Receipt</h3>
      </div>
      
      <hr style="border:none;border-top:1px solid #000;margin:4px 0;" />
      
      <!-- Customer Details -->
      <div style="margin:4px 0;">
        <div><strong>Date:</strong> ${printDate}</div>
        <div><strong>Customer:</strong> ${payment.customer.name}</div>
        <div><strong>Phone:</strong> ${payment.customer.mobile}</div>
        <div><strong>Activation Date:</strong> ${formatDate(
          payment.customer.connectionStartDate
        )}</div>
      </div>
      
      <hr style="border:none;border-top:1px dashed #000;margin:4px 0;" />
      
      <!-- Package Details Table -->
      <table style="width:100%;font-size:11px;border-collapse:collapse;margin:4px 0;">
        <thead>
          <tr>
            <th style="text-align:left;font-weight:bold;padding:2px;"></th>
            <th style="text-align:center;font-weight:bold;padding:2px;">Days</th>
            <th style="text-align:right;font-weight:bold;padding:2px;">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:2px;"></td>
            <td style="text-align:center;padding:2px;">30</td>
            <td style="text-align:right;padding:2px;">Rs ${payment.amount.toFixed(
              2
            )}</td>
          </tr>
        </tbody>
      </table>
      
      <hr style="border:none;border-top:1px dashed #000;margin:4px 0;" />
      
      <!-- Total -->
      <table style="width:100%;font-size:12px;">
        <tr>
          <td style="font-weight:bold;">Total Amount</td>
          <td style="text-align:right;font-weight:bold;">Rs ${payment.amount.toFixed(
            2
          )}</td>
        </tr>
      </table>
      
      <hr style="border:none;border-top:1px dashed #000;margin:4px 0;" />
      
      <!-- Success Message -->
      <div style="text-align:center;margin:3px 0;">
        <div style="font-weight:bold;margin:1px 0;font-size:13px;">Payment Successful</div>
        <div style="margin:2px 0;">Thank you for the payment!</div>
      </div>
      
      <hr style="border:none;border-top:1px solid #000;margin:4px 0;" />
      
      <!-- Office Address -->
      <div style="text-align:center;font-size:12px;margin-top:4px;">
        <div><strong>Office Address:</strong></div>
        <div>Dehli chowk national laboratory</div>
        <div><strong>Helpline:</strong> 03336881973</div>
      </div>
    </div>
  `;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${payment.customer.name}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
      printWindow.document.close();
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Payments
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track customer payments
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon
                className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, mobile, or email..."
                  className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-12 pr-3 flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute inset-y-0 right-0 px-3 flex items-center bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isSearching ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm">
                      {formatDisplayDate(startDate)} -{" "}
                      {formatDisplayDate(endDate)}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                {showDatePicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={tempStartDate}
                          onChange={(e) => setTempStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={tempEndDate}
                          onChange={(e) => setTempEndDate(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDateSearch}
                          className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                        >
                          Apply Dates
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Amount
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(totalAmount)}
                </h3>
                <p className="text-blue-200 text-xs mt-1">
                  {apiSearchQuery ? "Search results" : "Selected period"}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Paid Amount
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(paidAmount)}
                </h3>
                <p className="text-green-200 text-xs mt-1">
                  {apiSearchQuery ? "Search results" : "Selected period"}
                </p>
              </div>
              <CheckBadgeIcon className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-100 text-sm font-medium">
                  Total Records
                </p>
                <h3 className="text-2xl font-bold mt-1">{pagination.totalCount}</h3>
                <p className="text-red-200 text-xs mt-1">
                  Showing {payments.length} of {pagination.totalCount}
                  {apiSearchQuery && " (search results)"}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-red-200" />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {apiSearchQuery ? "No payments found" : "No payments found"}
              </h3>
              <p className="mt-2 text-gray-500">
                {apiSearchQuery
                  ? "Try a different search term"
                  : "No payments in the selected date range"}
              </p>
              {apiSearchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Act. Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.customer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.customer.mobile}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.plan.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rs {payment.plan.price}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(payment.dueDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(payment.customer.connectionStartDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setPaymentMethod(
                                  payment.paymentMethod || "cash"
                                );
                                setTransactionRef(payment.transactionRef || "");
                                setNotes(payment.notes || "");
                                setShowPaymentModal(true);
                              }}
                              disabled={payment.status === "paid"}
                              className={`p-1 rounded ${
                                payment.status === "paid"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-indigo-600 hover:text-indigo-900"
                              }`}
                              title={
                                payment.status === "paid"
                                  ? "Already paid"
                                  : "Mark as paid"
                              }
                            >
                              <CheckBadgeIcon className="w-5 h-5" />
                            </button>
                            <Link
                              href={`/customers/${payment.customer.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Customer"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            {payment.status === "paid" && (
                              <button
                                onClick={() => handlePrint(payment)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Print Payment"
                              >
                                🖨️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(pagination.currentPage - 1) * pagination.limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.currentPage * pagination.limit,
                            pagination.totalCount
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {pagination.totalCount}
                        </span>{" "}
                        results
                        {apiSearchQuery && " (search results)"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="hidden md:flex space-x-1">
                        {generatePageNumbers().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                            disabled={page === '...'}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.currentPage
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } ${page === '...' ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* Mobile page indicator */}
                      <div className="md:hidden text-sm text-gray-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Mark Payment as Paid
              </h2>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedPayment.customer.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPayment.customer.mobile}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">
                    {selectedPayment.plan.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">
                    {formatDate(selectedPayment.dueDate)}
                  </span>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        {(() => {
                          const method = paymentMethods.find(
                            (m) => m.value === paymentMethod
                          );
                          if (method && method.icon) {
                            const IconComponent = method.icon;
                            return (
                              <>
                                <IconComponent className="w-5 h-5 mr-2 text-gray-400" />
                                <span>{method.label}</span>
                              </>
                            );
                          }
                          return <span>Select Payment Method</span>;
                        })()}
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </button>
                    {showMethodDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          return (
                            <button
                              key={method.value}
                              onClick={() => {
                                setPaymentMethod(method.value);
                                setShowMethodDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center"
                            >
                              <Icon className="w-5 h-5 mr-2 text-gray-400" />
                              <span>{method.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Reference (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this payment"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePayment}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Processing..." : "Mark as Paid"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              {isSearching ? "Searching payments..." : "Loading payments..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
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
} from "@heroicons/react/24/outline";
import {
  fetchPayments,
  markPaymentAsPaid,
  Payment,
  PaymentStats,
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
  const [stats, setStats] = useState<PaymentStats>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalRecords: 0,
    paidRecords: 0,
    pendingRecords: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // const user = getCurrentUser();
  // const userData = user ? JSON.parse(user) : null;
  // const isAdmin = userData?.role === "admin";
  // const currentEmployeeId = userData?.id;

  useEffect(() => {
    loadData();
  }, [startDate, endDate, currentUser]);

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
      // const [paymentsData] = await Promise.all([
      //   fetchPayments(startDate, endDate),
      //   // fetchEmployees(),
      // ]);
      const paymentsData = await fetchPayments(startDate, endDate);
      const filteredPaymentsData = filterPaymentsByRole(paymentsData.data);

      setPayments(filteredPaymentsData);

      if (currentUser?.role === "admin") {
        const employeesResponse = await fetchEmployees();
        setEmployees(employeesResponse);
      }

      // setStats({
      //   totalAmount: filteredPaymentsData.totalAmount || 0,
      //   paidAmount: filteredPaymentsData.paidAmount || 0,
      //   pendingAmount: filteredPaymentsData.pendingAmount || 0,
      //   totalRecords: filteredPaymentsData.count || 0,
      //   paidRecords: filteredPaymentsData.data.filter((p) => p.status === "paid")
      //     .length,
      //   pendingRecords: filteredPaymentsData.data.filter((p) => p.status === "pending")
      //     .length,
      // });
      // setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load payments data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDateSearch = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDatePicker(false);
  };

  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const paidAmount = payments.reduce(
    (sum, payment) => (payment.status === "paid" ? sum + payment.amount : sum),
    0
  );

  const filteredPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const matchesSearch =
        payment.customer.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.customer.mobile.includes(searchQuery) ||
        payment.customer.email
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered;
  }, [payments, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const currentItems = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
    <div style="width:58mm;font-size:12px;">
      <h2 style="text-align:center; margin:0; font-weight:bold;">
        NAEEM INTERNET SERVICE
      </h2>
      <h3 style="text-align:center; margin:4px 0;">Payment Receipt</h3>
  
        <div><strong>Customer:</strong> ${payment.customer.name}</div>
        <br/>
        <div><strong>Date:</strong> ${printDate}</div>
       
      <hr />
      <table style="width:100%; font-size:12px; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align:left; font-weight:bold;">Package</th>
            <th style="text-align:right; font-weight:bold;">Days</th>
            <th style="text-align:right; font-weight:bold;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${payment.plan.name}</td>
            <td style="text-align:right;">30</td>
            <td style="text-align:right;">Rs ${payment.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <table style="width:100%; font-size:12px;">
        <tr>
          <td colspan="2" style="font-weight:bold;">Total</td>
          <td style="text-align:right; font-weight:bold;">Rs ${payment.amount.toFixed(2)}</td>
        </tr>
      </table>
      <hr />
      <p style="text-align:center; margin:8px 0;">Thank you!</p>
    </div>
  `;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head><title>Receipt</title></head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
      printWindow.document.close();
    }
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
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
                <h3 className="text-2xl font-bold mt-1">{payments?.length}</h3>
              </div>
              <ClockIcon className="w-8 h-8 text-red-200" />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No payments found
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : "No payments in the selected date range"}
              </p>
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
                    {currentItems.map((payment) => (
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
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === "paid"
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
                              className={`p-1 rounded ${payment.status === "paid"
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
              {totalPages > 1 && (
                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredPayments.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredPayments.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
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
              Loading payments...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

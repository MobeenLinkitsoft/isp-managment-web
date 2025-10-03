"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UsersIcon,
  UserPlusIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { fetchCustomers, deleteCustomer, type Customer, type PaginationInfo, type FetchCustomersParams } from "../../lib/api/customer";
import { fetchConnectionTypes } from "../../lib/api/connections";
import { fetchPackages } from "../../lib/api/packages";

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [connectionTypes, setConnectionTypes] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load connection types and packages on mount
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [connectionTypesData, packagesData] = await Promise.all([
          fetchConnectionTypes(),
          fetchPackages(),
        ]);
        setConnectionTypes(connectionTypesData);
        setPackages(packagesData);
      } catch (error) {
        console.error("Error loading static data:", error);
      }
    };
    loadStaticData();
  }, []);

  // Load customers with pagination and filters
  const loadCustomers = async (page: number = 1, search: string = searchQuery, filter: string = activeFilter) => {
    try {
      setIsLoading(true);
      
      const params: FetchCustomersParams = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      // Add search query if provided
      if (search) {
        params.search = search;
      }

      // Add status filter if not "all"
      if (filter !== "all") {
        params.status = filter === "active" ? "active" : "inactive";
      }

      const response = await fetchCustomers(params);
      
      setCustomers(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("Failed to load customers");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    loadCustomers(1, searchQuery, activeFilter);
  }, [searchQuery, activeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCustomers(currentPage, searchQuery, activeFilter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset to page 1 when search changes
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  };

  const handleStatusToggle = async (customer: Customer) => {
    const newStatus = !customer.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${action} ${customer.name}?`))
      return;

    try {
      setUpdatingId(customer.id);
      await deleteCustomer(customer.id);
      
      // Reload current page after status change
      loadCustomers(currentPage, searchQuery, activeFilter);
      
      alert(`Customer ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing customer:`, error);
      alert(`Failed to ${action} customer`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Local sorting for current page (optional - you can remove this if you want server-side sorting)
  const sortedCustomers = useMemo(() => {
    if (!sortConfig) return customers;

    return [...customers].sort((a, b) => {
      if (
        a[sortConfig.key as keyof Customer] <
        b[sortConfig.key as keyof Customer]
      ) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (
        a[sortConfig.key as keyof Customer] >
        b[sortConfig.key as keyof Customer]
      ) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [customers, sortConfig]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    loadCustomers(page, searchQuery, activeFilter);
  };

  // Stats calculation (you might want to get this from API too)
  const stats = [
    {
      title: "Total Customers",
      value: pagination?.totalCount || 0,
      filter: "all",
      color: "bg-blue-500",
    },
    {
      title: "Active Customers",
      value: customers.filter((c) => c.isActive).length, // This is just for current page - consider API endpoint for stats
      filter: "active",
      color: "bg-green-500",
    },
    {
      title: "Inactive Customers",
      value: customers.filter((c) => !c.isActive).length, // This is just for current page - consider API endpoint for stats
      filter: "inactive",
      color: "bg-red-500",
    },
    {
      title: "Current Page",
      value: customers.length,
      filter: "current",
      color: "bg-purple-500",
    },
  ];

  const getConnectionTypeName = (id: string) => {
    const type = connectionTypes.find((t) => t.id === id);
    return type ? type.name : "Unknown";
  };

  const getPackageName = (id: string) => {
    const pkg = packages.find((p) => p.id === id);
    return pkg ? pkg.name : "Unknown";
  };

  const SortableHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: string;
  }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        {sortConfig?.key === sortKey && (
          <span className="ml-1">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your customer database efficiently
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <Link
              href="/customers/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Add Customer
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${stat.color} cursor-pointer transition-transform hover:scale-105`}
              onClick={() => handleFilterChange(stat.filter)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`p-3 rounded-lg ${stat.color
                    .replace("bg-", "bg-")
                    .replace("-500", "-100")}`}
                >
                  <UsersIcon
                    className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers by name, email, mobile, NIC, or username..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={activeFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {sortedCustomers.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No customers found
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : "Get started by adding your first customer"}
              </p>
              <div className="mt-6">
                <Link
                  href="/customers/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Customer
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader label="Customer" sortKey="name" />
                      <SortableHeader label="Contact" sortKey="mobile" />
                      <SortableHeader label="Plan" sortKey="plan.name" />
                      <SortableHeader label="Act. Date" sortKey="date" />
                      <SortableHeader
                        label="Connection"
                        sortKey="connectionType.name"
                      />
                      <SortableHeader label="Status" sortKey="isActive" />
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{customer.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.mobile}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getPackageName(customer.plan?.id)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rs{customer.plan?.price}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(Number(customer.connectionStartDate))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getConnectionTypeName(customer.connectionType?.id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              customer.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3 items-center">
                            <Link
                              href={`/customers/${customer.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>

                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={customer.isActive}
                                onChange={() => handleStatusToggle(customer)}
                                disabled={updatingId === customer.id}
                              />
                              <div
                                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border 
                                after:rounded-full after:h-5 after:w-5 after:transition-all 
                                ${
                                  customer.isActive
                                    ? "peer-checked:bg-green-600"
                                    : "bg-gray-400"
                                }
                                ${
                                  updatingId === customer.id ? "opacity-50" : ""
                                }
                              `}
                              ></div>
                              {updatingId === customer.id && (
                                <div className="ml-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                </div>
                              )}
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
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
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading customers...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
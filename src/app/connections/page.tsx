"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  WifiIcon,
  PlusIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  BoltIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  fetchConnectionTypes,
  deleteConnectionType,
  // restoreConnectionType,
  ConnectionType,
} from "../../lib/api/connections";

const ITEMS_PER_PAGE = 10;

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const data = await fetchConnectionTypes();
      setConnections(data);
    } catch (error) {
      console.error("Error fetching connections:", error);
      alert("Failed to fetch connection types");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConnections();
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

  const sortedAndFilteredConnections = useMemo(() => {
    let filtered = connections.filter((connection) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        connection.name.toLowerCase().includes(searchLower) ||
        (connection.description?.toLowerCase() || "").includes(searchLower)
      );
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (
          a[sortConfig.key as keyof ConnectionType] <
          b[sortConfig.key as keyof ConnectionType]
        ) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (
          a[sortConfig.key as keyof ConnectionType] >
          b[sortConfig.key as keyof ConnectionType]
        ) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [connections, searchQuery, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(
    sortedAndFilteredConnections.length / ITEMS_PER_PAGE
  );
  const currentItems = sortedAndFilteredConnections.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = [
    {
      title: "Total Types",
      value: connections.length,
      icon: BoltIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Types",
      value: connections.filter(conn => conn?.isActive).length,
      icon: ChartBarIcon,
      color: "bg-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Inactive Types",
      value: connections.filter(conn => !conn?.isActive).length,
      icon: WifiIcon,
      color: "bg-red-500",
      bgColor: "bg-red-100",
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Connection Types
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your internet connection types
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
            <Link
              href="/connections/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Connection
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500 transition-transform hover:scale-105"
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
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search connection types by name or description..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
        </div>

        {/* Connections Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <WifiIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No connection types found
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : "Get started by adding your first connection type"}
              </p>
              <div className="mt-6">
                <Link
                  href="/connections/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Connection Type
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader label="Connection Type" sortKey="name" />
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
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
                    {currentItems.map((connection) => (
                      <tr
                        key={connection.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <WifiIcon className="w-5 h-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {connection.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-md truncate">
                            {connection.description ||
                              "No description provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              connection.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {connection.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3 items-center">
                            <Link
                              href={`/connections/${connection.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/connections/edit/${connection.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </Link>
                            
                            {/* Toggle Switch */}
                            {/* <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={connection.isActive}
                                onChange={() => handleStatusToggle(connection)}
                                disabled={updatingId === connection.id}
                              />
                              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border 
                                after:rounded-full after:h-5 after:w-5 after:transition-all 
                                ${connection.isActive ? 'peer-checked:bg-green-600' : 'bg-gray-400'}
                                ${updatingId === connection.id ? 'opacity-50' : ''}
                              `}></div>
                              {updatingId === connection.id && (
                                <div className="ml-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                </div>
                              )}
                            </label> */}
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
                            sortedAndFilteredConnections.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {sortedAndFilteredConnections.length}
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
                        <ChevronLeftIcon className="w-5 h-5" />
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
              Loading connections...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
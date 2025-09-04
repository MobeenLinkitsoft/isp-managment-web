"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  WifiIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  fetchPackages,
  deletePackage,
  Package,
  fetchPackageStats,
} from "../../lib/api/packages";

const ITEMS_PER_PAGE = 10;

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalRevenue: 0,
    averagePrice: 0,
    maxSpeed: 0,
    minSpeed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [packagesData, statsData] = await Promise.all([
        fetchPackages(),
        fetchPackageStats(),
      ]);

      setPackages(packagesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load packages data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" package?`)) return;

    try {
      setDeletingId(id);
      await deletePackage(id);
      setPackages(packages.filter((pkg) => pkg.id !== id));
      // Refresh stats after deletion
      const statsData = await fetchPackageStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package");
    } finally {
      setDeletingId(null);
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

  const filteredPackages = useMemo(() => {
    let filtered = packages.filter((pkg) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower) ||
        pkg.speed.toString().includes(searchQuery) ||
        pkg.price.toString().includes(searchQuery)
      );
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (
          a[sortConfig.key as keyof Package] <
          b[sortConfig.key as keyof Package]
        ) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (
          a[sortConfig.key as keyof Package] >
          b[sortConfig.key as keyof Package]
        ) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [packages, searchQuery, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const currentItems = filteredPackages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statsCards = [
    {
      title: "Total Packages",
      value: stats.totalPackages,
      icon: WifiIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Avg. Price",
      value: `Rs${stats.averagePrice.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Max Speed",
      value: `${stats.maxSpeed} Mbps`,
      icon: BoltIcon,
      color: "bg-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Revenue",
      value: `Rs${stats.totalRevenue.toFixed(2)}`,
      icon: ChartBarIcon,
      color: "bg-orange-500",
      bgColor: "bg-orange-100",
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

  const formatSpeed = (speed: number) => {
    return `${speed} Mbps`;
  };

  const formatPrice = (price: number) => {
    return `Rs${price.toFixed(2)}`;
  };

  // if (isLoading) {
  //   return (
  //     <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
  //         <p className="mt-4 text-white font-medium">Loading packages...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Internet Packages
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your internet service packages
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
              href="/packages/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Package
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
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
                placeholder="Search packages by name, description, speed, or price..."
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

        {/* Packages Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <WifiIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No packages found
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : "Get started by adding your first package"}
              </p>
              <div className="mt-6">
                <Link
                  href="/packages/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Package
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader label="Package" sortKey="name" />
                      <SortableHeader label="Speed" sortKey="speed" />
                      <SortableHeader label="Price" sortKey="price" />
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((pkg) => (
                      <tr
                        key={pkg.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                <WifiIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {pkg.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <BoltIcon className="w-4 h-4 mr-1" />
                            {formatSpeed(pkg.speed)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {formatPrice(pkg.price)}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-md truncate">
                            {pkg.description || "No description provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/packages/${pkg.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/packages/edit/${pkg.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </Link>
                            {/* <button
                              onClick={() => handleDelete(pkg.id, pkg.name)}
                              disabled={deletingId === pkg.id}
                              className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === pkg.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                              ) : (
                                <TrashIcon className="w-5 h-5" />
                              )}
                            </button> */}
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
                            filteredPackages.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredPackages.length}
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
              Loading packages...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

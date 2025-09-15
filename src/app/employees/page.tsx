"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchEmployees,
  deleteEmployee,
  restoreEmployee,
  Employee,
} from "../../lib/api/employees";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  UserCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = employees.filter((employee) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.phone?.includes(searchQuery)
      );
    });
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load employee data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (employee: Employee) => {
    const newStatus = !employee.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (
      !confirm(
        `Are you sure you want to ${action} ${employee.firstName} ${employee.lastName}?`
      )
    )
      return;

    try {
      setUpdatingId(employee.id);
      if (newStatus) {
        await restoreEmployee(employee.id);
      } else {
        await deleteEmployee(employee.id);
      }

      // Update local state immediately for better UX
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id ? { ...emp, isActive: newStatus } : emp
        )
      );

      alert(`Employee ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing employee:`, error);
      alert(`Failed to ${action} employee`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Employee Management
        </h1>
        <Link
          href="/employees/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Employee
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-3">
              <UserCircleIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Total</h2>
              <p className="text-2xl font-semibold text-gray-900">
                {employees?.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Active</h2>
              <p className="text-2xl font-semibold text-gray-900">
                {employees?.filter((x) => x.isActive)?.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3">
              <ChartBarIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Inactive</h2>
              <p className="text-2xl font-semibold text-gray-900">
                {employees?.filter((x) => x.isActive == false)?.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <UserCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Admins</h2>
              <p className="text-2xl font-semibold text-gray-900">
                {employees?.filter((x) => x.role === "admin")?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={loadData}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <ArrowPathIcon
              className={`h-5 w-5 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {isLoading ? "Loading employees..." : "No employees found"}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-indigo-800">
                            {employee.firstName.charAt(0)}
                            {employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.phone}
                      </div>
                       <div className="text-sm text-gray-500">
                        {employee.password}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {employee.role || "Employee"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() =>
                            router.push(`/employees/edit/${employee.id}`)
                          }
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Edit employee"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={employee.isActive}
                            onChange={() => handleStatusToggle(employee)}
                            disabled={updatingId === employee.id}
                          />
                          <div
                            className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                            peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                            after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border 
                            after:rounded-full after:h-5 after:w-5 after:transition-all 
                            ${
                              employee.isActive
                                ? "peer-checked:bg-green-600"
                                : "bg-gray-400"
                            }
                            ${updatingId === employee.id ? "opacity-50" : ""}
                          `}
                          ></div>
                          {updatingId === employee.id && (
                            <div className="ml-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                            </div>
                          )}
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading Employee...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

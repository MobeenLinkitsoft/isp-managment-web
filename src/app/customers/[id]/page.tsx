"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  WifiIcon,
  CreditCardIcon,
  CalendarIcon,
  IdentificationIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import { fetchCustomer, deleteCustomer } from "../../../lib/api/customer";

export default function CustomerDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const customerData = await fetchCustomer(id);
        setCustomer(customerData);
      } catch (error) {
        console.error("Error loading customer:", error);
        alert("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${customer?.name}?`)) return;

    try {
      await deleteCustomer(id);
      router.push("/customers");
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Customer not found
          </h1>
          <Link
            href="/customers"
            className="text-indigo-600 hover:text-indigo-900"
          >
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/customers"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Customers
          </Link>

          <div className="flex space-x-2">
            <Link
              href={`/customers/edit/${id}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Customer Card */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Avatar and Basic Info */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {customer.name}
            </h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                customer.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {customer.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Personal Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <IdentificationIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {customer.nationalId || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">{customer.mobile}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{customer.address}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center">
                    <NumberedListIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connection Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Connection Details</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <WifiIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {customer.connectionType?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <CreditCardIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {customer.plan?.name || "N/A"} - Rs
                    {customer.plan?.price || "0"}
                  </span>
                </div>
                {customer.registrationDate && (
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">
                      Registered:{" "}
                      {new Date(customer.registrationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

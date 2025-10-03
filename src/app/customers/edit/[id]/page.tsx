"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  WifiIcon,
  CreditCardIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { updateCustomer, fetchCustomer } from "../../../../lib/api/customer";
import { fetchConnectionTypes } from "../../../../lib/api/connections";
import { fetchPackages } from "../../../../lib/api/packages";

interface FormData {
  name: string;
  username: string;
  password: string;
  plan: string;
  connectionType: string;
  nationalId: string;
  mobile: string;
  phone: string;
  email: string;
  address: string;
  connectionStartDate: string;
}

// Helper function to convert Unix timestamp to date string
const unixTimestampToDateString = (timestamp: number): string => {
  // Multiply by 1000 to convert seconds to milliseconds
  const date = new Date(timestamp * 1000);
  return date.toISOString().split("T")[0];
};

// Helper function to convert date string to Unix timestamp
const dateStringToUnixTimestamp = (dateString: string): number => {
  const date = new Date(dateString);
  return Math.floor(date.getTime() / 1000);
};

export default function EditCustomer() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionTypes, setConnectionTypes] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalPlan, setOriginalPlan] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    password: "",
    plan: "",
    connectionType: "",
    nationalId: "",
    mobile: "",
    phone: "",
    email: "",
    address: "",
    connectionStartDate: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [connectionTypesData, packagesData, customerData] =
          await Promise.all([
            fetchConnectionTypes(),
            fetchPackages(),
            fetchCustomer(id),
          ]);

        setConnectionTypes(connectionTypesData);
        setPackages(packagesData);

        // Convert Unix timestamp to date string for the form
        let connectionStartDate = "";
        if (customerData.connectionStartDate) {
          // Check if it's already a Unix timestamp (number) or a string
          if (typeof customerData.connectionStartDate === "number") {
            connectionStartDate = unixTimestampToDateString(
              customerData.connectionStartDate
            );
          } else if (typeof customerData.connectionStartDate === "string") {
            // If it's already a string, check if it's a timestamp or ISO string
            if (/^\d+$/.test(customerData.connectionStartDate)) {
              // It's a string containing only numbers, treat as Unix timestamp
              connectionStartDate = unixTimestampToDateString(
                parseInt(customerData.connectionStartDate)
              );
            } else {
              // It's probably an ISO string, use it directly
              connectionStartDate = new Date(customerData.connectionStartDate)
                .toISOString()
                .split("T")[0];
            }
          }
        } else {
          // Default to today if no date is set
          connectionStartDate = new Date().toISOString().split("T")[0];
        }

        setFormData({
          name: customerData.name,
          username: customerData.username,
          password: "",
          plan: customerData.plan?.id || "",
          connectionType: customerData.connectionType?.id || "",
          nationalId: customerData.nationalId,
          mobile: customerData.mobile,
          phone: customerData.phone || "",
          email: customerData.email || "",
          address: customerData.address || "",
          connectionStartDate: connectionStartDate,
        });
        setOriginalPlan(customerData.plan?.id || "");
      } catch (error) {
        console.error("Error loading form data:", error);
        alert("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value) newErrors.name = "Name is required";
        else delete newErrors.name;
        break;
      case "username":
        if (!value) newErrors.username = "Username is required";
        else if (value.length < 3)
          newErrors.username = "Username must be at least 3 characters";
        else delete newErrors.username;
        break;
      case "password":
        if (value && value.length < 4)
          newErrors.password = "Password must be at least 4 characters";
        else delete newErrors.password;
        break;
      case "nationalId":
        if (!value) newErrors.nationalId = "National ID is required";
        else delete newErrors.nationalId;
        break;
      case "mobile":
        if (!value) newErrors.mobile = "Mobile number is required";
        else delete newErrors.mobile;
        break;
      case "plan":
        if (!value) newErrors.plan = "Plan is required";
        else delete newErrors.plan;
        break;
      case "connectionType":
        if (!value) newErrors.connectionType = "Connection type is required";
        else delete newErrors.connectionType;
        break;
      case "connectionStartDate":
        if (!value)
          newErrors.connectionStartDate = "Activation date is required";
        else delete newErrors.connectionStartDate;
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateForm = () => {
    let isValid = true;
    const requiredFields: (keyof FormData)[] = [
      "name",
      "username",
      "nationalId",
      "mobile",
      "plan",
      "connectionType",
      "connectionStartDate",
    ];

    requiredFields.forEach((field) => {
      isValid = validateField(field, formData[field]) && isValid;
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix all errors before submitting");
      return;
    }

    try {
      setSaving(true);

      // Convert date string back to Unix timestamp for API
      // const connectionStartDateTimestamp = formData.connectionStartDate
      //   ? dateStringToUnixTimestamp(formData.connectionStartDate)
      //   : null;

      const apiData: any = {
        ...formData,
        connectionStartDate: formData.connectionStartDate
          ? `${formData.connectionStartDate}T00:00:00`
          : null,
      };

      // Remove password if empty (keep current password)
      if (!apiData.password) {
        delete apiData.password;
      }

      // Only send plan if it's changed
      if (formData.plan === originalPlan) {
        delete apiData.plan;
      }

      await updateCustomer(id, apiData);

      router.push("/customers");
      router.refresh();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/customers"
            className="mr-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIC Number *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.nationalId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.nationalId}
                  onChange={(e) => handleChange("nationalId", e.target.value)}
                />
                {errors.nationalId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nationalId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connection Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Type *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.connectionType ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.connectionType}
                  onChange={(e) =>
                    handleChange("connectionType", e.target.value)
                  }
                >
                  <option value="">Select Connection Type</option>
                  {connectionTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.connectionType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.connectionType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.plan ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.plan}
                  onChange={(e) => handleChange("plan", e.target.value)}
                >
                  <option value="">Select Plan</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - Rs{pkg.price}
                    </option>
                  ))}
                </select>
                {errors.plan && (
                  <p className="text-red-500 text-sm mt-1">{errors.plan}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Activation Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.connectionStartDate
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={formData.connectionStartDate}
                    onChange={(e) =>
                      handleChange("connectionStartDate", e.target.value)
                    }
                  />
                  {/* <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" /> */}
                </div>
                {errors.connectionStartDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.connectionStartDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Update Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

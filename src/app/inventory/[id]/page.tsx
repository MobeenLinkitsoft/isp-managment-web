"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  TagIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { fetchInventoryItem, deleteInventoryItem } from "../../../lib/api/inventory";

export default function InventoryDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
//   console.log('--------id',item)

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await fetchInventoryItem(id);
        setItem(data?.inventory);
      } catch (error) {
        console.error("Error loading item:", error);
        alert("Failed to load item details");
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item?.name}"?`)) return;

    try {
      await deleteInventoryItem(id);
      alert("Item deleted successfully");
      router.push("/inventory");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CubeIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Item not found</h3>
          <button
            onClick={() => router.push("/inventory")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Inventory
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/inventory/edit/${id}`)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{item?.name}</h1>
                <p className="text-indigo-100 mt-1">{item?.brand} {item?.model}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">Rs {item?.unitPrice?.toFixed(2)}</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  item?.quantity <= item?.minQuantity 
                    ? "bg-red-100 text-red-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {item?.quantity <= item?.minQuantity && (
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  )}
                  {item?.quantity} in stock
                  {item?.quantity <= item?.minQuantity && " (Low Stock)"}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div className="flex items-center">
                <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Category: </span>
                <span className="ml-2 font-medium">{item?.category}</span>
              </div>

              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Location: </span>
                <span className="ml-2 font-medium">{item?.location}</span>
              </div>

              <div className="flex items-center">
                <CubeIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Serial Number: </span>
                <span className="ml-2 font-medium">{item?.serialNumber || "N/A"}</span>
              </div>

              {item?.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{item?.description}</p>
                </div>
              )}
            </div>

            {/* Stock & Pricing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Stock & Pricing</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Current Stock</div>
                  <div className="text-2xl font-bold text-gray-900">{item?.quantity}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Minimum Stock</div>
                  <div className="text-2xl font-bold text-gray-900">{item?.minQuantity}</div>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-indigo-600 mr-2" />
                  <span className="text-sm text-indigo-600">Unit Price</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900 mt-1">
                  Rs {item?.unitPrice?.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Purchase Details</h2>
              
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Purchase Date: </span>
                <span className="ml-2 font-medium">
                  {new Date(item?.purchaseDate)?.toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Warranty Expiry: </span>
                <span className="ml-2 font-medium">
                  {new Date(item?.warrantyExpiry)?.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Supplier Information</h2>
              
              {item?.supplier && (
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Supplier: </span>
                  <span className="ml-2 font-medium">{item?.supplier}</span>
                </div>
              )}

              {item?.supplierContact && (
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Contact: </span>
                  <span className="ml-2 font-medium">{item?.supplierContact}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {item?.notes && (
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400 float-left mr-3" />
                  <p className="text-gray-700">{item?.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
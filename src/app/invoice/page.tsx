"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  MinusIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface InventoryItem {
  id: number;
  name: string;
  price: string;
  warranty: string;
}

export default function CreateInvoice() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [serviceCharges, setServiceCharges] = useState("0");
  const [packageCharges, setPackageCharges] = useState("0");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { id: 1, name: "", price: "", warranty: "" },
  ]);

  const addInventoryItem = () => {
    setInventoryItems([
      ...inventoryItems,
      {
        id: inventoryItems.length + 1,
        name: "",
        price: "",
        warranty: "",
      },
    ]);
  };

  const removeInventoryItem = (id: number) => {
    if (inventoryItems.length > 1) {
      setInventoryItems(inventoryItems.filter((item) => item.id !== id));
    }
  };

  const updateInventoryItem = (id: number, field: keyof InventoryItem, value: string) => {
    setInventoryItems(
      inventoryItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    const invTotal = inventoryItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    return (
      (parseFloat(serviceCharges) || 0) +
      (parseFloat(packageCharges) || 0) +
      invTotal
    ).toFixed(2);
  };

  const handleSubmit = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    const invoiceData = {
      customerName,
      serviceCharges: parseFloat(serviceCharges) || 0,
      packageCharges: parseFloat(packageCharges) || 0,
      inventoryItems: inventoryItems.map((item) => ({
        name: item.name,
        price: parseFloat(item.price) || 0,
        warranty: item.warranty,
      })),
      total: calculateTotal(),
      date: new Date().toLocaleDateString(),
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    };

    // Store in localStorage for the preview page
    localStorage.setItem("invoiceData", JSON.stringify(invoiceData));
    router.push("/invoice/preview");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details to generate a new invoice
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Customer Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          {/* Charges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Charges (Rs)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
                value={serviceCharges}
                onChange={(e) => setServiceCharges(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Charges (Rs)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
                value={packageCharges}
                onChange={(e) => setPackageCharges(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Inventory Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Inventory Items
              </label>
              <button
                onClick={addInventoryItem}
                className="flex items-center text-indigo-600 hover:text-indigo-700"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {inventoryItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                >
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        updateInventoryItem(item.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateInventoryItem(item.id, "price", e.target.value)
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Warranty (days)"
                      value={item.warranty}
                      onChange={(e) =>
                        updateInventoryItem(item.id, "warranty", e.target.value)
                      }
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <button
                      onClick={() => removeInventoryItem(item.id)}
                      className="w-full p-3 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      disabled={inventoryItems.length === 1}
                    >
                      <MinusIcon className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                Rs {calculateTotal()}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg flex items-center justify-center"
          >
            Generate Invoice
            <DocumentArrowDownIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
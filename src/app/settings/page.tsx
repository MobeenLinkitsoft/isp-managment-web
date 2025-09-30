"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftEndOnRectangleIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "../../lib/storage";
import { logoutUser } from "../../lib/auth";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logoutUser();
    }
  };

  const handlePrint = () => {
    const printDate = new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy
    const formattedActivationDate = new Date().toLocaleDateString("en-GB");

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
        <div><strong>Customer:</strong> Test Customer</div>
        <div><strong>Phone:</strong> 0300-1234567</div>
        <div><strong>Activation Date:</strong> ${formattedActivationDate}</div>
        <div><strong>Cashier:</strong> ${currentUser?.firstName || "Admin"}</div>
      </div>
      
      <hr style="border:none;border-top:1px dashed #000;margin:4px 0;" />
      
      <!-- Package Details Table -->
      <table style="width:100%;font-size:11px;border-collapse:collapse;margin:4px 0;">
        <thead>
          <tr>
            <th style="text-align:left;font-weight:bold;padding:2px;">Package</th>
            <th style="text-align:center;font-weight:bold;padding:2px;">Days</th>
            <th style="text-align:right;font-weight:bold;padding:2px;">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:2px;">Basic Internet</td>
            <td style="text-align:center;padding:2px;">30</td>
            <td style="text-align:right;padding:2px;">Rs 1500.00</td>
          </tr>
          <tr>
            <td style="padding:2px;">Installation</td>
            <td style="text-align:center;padding:2px;">1</td>
            <td style="text-align:right;padding:2px;">Rs 500.00</td>
          </tr>
        </tbody>
      </table>
      
      <hr style="border:none;border-top:1px dashed #000;margin:4px 0;" />
      
      <!-- Total -->
      <table style="width:100%;font-size:12px;">
        <tr>
          <td style="font-weight:bold;">Total Amount</td>
          <td style="text-align:right;font-weight:bold;">Rs 2000.00</td>
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
            <title>Receipt</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                div { box-sizing: border-box; }
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load user data</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 ml-4">
            Profile Settings
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {currentUser.firstName.charAt(0)}
                    {currentUser.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div
                className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${currentUser.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
              />
            </div>

            {/* User Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <p className="text-gray-600 mb-1">{currentUser.email}</p>
            <p className="text-sm text-gray-500 capitalize mb-4">
              {currentUser.role} • {currentUser.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {/* Print Receipt Button */}
        <button
          onClick={handlePrint}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center mb-4"
        >
          <PrinterIcon className="w-5 h-5 mr-2" />
          Print Test Receipt
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center"
        >
          <ArrowLeftEndOnRectangleIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading Settings...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
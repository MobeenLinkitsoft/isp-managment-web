"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ArrowLeftIcon,
  ShareIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

interface InvoiceItem {
  name: string;
  price: number;
  warranty: string;
}

interface InvoiceData {
  customerName: string;
  serviceCharges: number;
  packageCharges: number;
  inventoryItems: InvoiceItem[];
  total: string;
  date: string;
  invoiceNumber: string;
}

export default function InvoicePreview() {
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("invoiceData");
    if (data) {
      setInvoiceData(JSON.parse(data));
    } else {
      router.push("/invoice");
    }
  }, [router]);

  const handleShare = async () => {
    if (!invoiceData) return;

    const invoiceText = generateInvoiceText(invoiceData);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoiceData.invoiceNumber}`,
          text: invoiceText,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(invoiceText);
        alert("Invoice text copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        alert("Sharing not supported on this browser");
      }
    }
  };

  const generateInvoiceText = (data: InvoiceData) => {
    let text = `INVOICE #${data.invoiceNumber}\n\n`;
    text += `Date: ${data.date}\n`;
    text += `Customer: ${data.customerName}\n\n`;
    text += `Service Charges: Rs ${data.serviceCharges.toFixed(2)}\n`;
    text += `Package Charges: Rs ${data.packageCharges.toFixed(2)}\n\n`;
    text += `Inventory Items:\n`;

    data.inventoryItems.forEach((item, index) => {
      text += `${index + 1}. ${item.name} - Rs ${item.price.toFixed(2)}`;
      if (item.warranty) {
        text += ` (Warranty: ${item.warranty} days)`;
      }
      text += `\n`;
    });

    text += `\nTotal Amount: Rs ${data.total}\n\n`;
    text += `Thank you!`;

    return text;
  };

  // Create a completely clean version for PDF generation
  const downloadPDF = async () => {
    if (!invoiceRef.current || !invoiceData) return;

    try {
      // Create a completely clean HTML structure without any CSS classes
      const cleanHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoiceData.invoiceNumber}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background: white;
                color: black;
              }
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
              }
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #ddd;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                font-weight: bold;
                margin-bottom: 10px;
                font-size: 18px;
              }
              .charges-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                font-weight: bold;
                background-color: #f8f9fa;
              }
              .total-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                margin-top: 20px;
              }
              .total-amount {
                font-size: 24px;
                font-weight: bold;
                color: #4f46e5;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <!-- Invoice Header -->
              <div class="header">
                <div>
                  <h1 style="font-size: 28px; font-weight: bold; margin: 0;">INVOICE</h1>
                  <p style="color: #666; margin: 5px 0;">#${invoiceData.invoiceNumber}</p>
                </div>
                <div style="text-align: right;">
                  <p style="color: #666; margin: 0;">Date: ${invoiceData.date}</p>
                </div>
              </div>

              <!-- Customer Info -->
              <div class="section">
                <h2 class="section-title">Bill To:</h2>
                <p>${invoiceData.customerName}</p>
              </div>

              <!-- Charges -->
              <div class="section">
                <h2 class="section-title">Charges</h2>
                <div class="charges-row">
                  <span>Service Charges:</span>
                  <span>Rs ${invoiceData.serviceCharges.toFixed(2)}</span>
                </div>
                <div class="charges-row">
                  <span>Package Charges:</span>
                  <span>Rs ${invoiceData.packageCharges.toFixed(2)}</span>
                </div>
              </div>

              <!-- Inventory Items -->
              <div class="section">
                <h2 class="section-title">Inventory Items</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Warranty</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoiceData.inventoryItems.map((item, index) => `
                      <tr>
                        <td>${item.name}</td>
                        <td style="text-align: right;">Rs ${item.price.toFixed(2)}</td>
                        <td style="text-align: right;">${item.warranty || "-"} ${item.warranty ? "days" : ""}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Total -->
              <div class="total-section">
                <div style="font-size: 18px; font-weight: bold;">Total Amount:</div>
                <div class="total-amount">Rs ${invoiceData.total}</div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p style="color: #4f46e5; font-weight: bold; margin: 0;">Thank you!</p>
                <p style="color: #666; font-size: 14px; margin: 5px 0;">Please make payment within 7 days</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Create a hidden iframe to render the clean HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '1123px'; // A4 height in pixels at 96dpi
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      iframeDoc.open();
      iframeDoc.write(cleanHTML);
      iframeDoc.close();

      // Wait for the iframe to load completely
      await new Promise(resolve => {
        iframe.onload = resolve;
        // Fallback in case onload doesn't fire
        setTimeout(resolve, 1000);
      });

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: iframeDoc.body.scrollHeight,
        windowWidth: 800,
        windowHeight: iframeDoc.body.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);

      // Clean up
      document.body.removeChild(iframe);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Print function
  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printContent = invoiceRef.current.innerHTML;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups for printing");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData?.invoiceNumber}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: black;
            }
            .print-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            @media print {
              body { 
                padding: 0;
                margin: 0;
              }
              .print-container {
                box-shadow: none !important;
                border-radius: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-6 no-print">
          <button
            onClick={() => router.back()}
            className="flex items-center text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Create
          </button>

          <div className="flex space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ShareIcon className="w-5 h-5 mr-2" />
              Share
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <PrinterIcon className="w-5 h-5 mr-2" />
              Print
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div
          ref={invoiceRef}
          className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:rounded-none"
        >
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600 mt-2">#{invoiceData.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Date: {invoiceData.date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Bill To:
            </h2>
            <p className="text-gray-900">{invoiceData.customerName}</p>
          </div>

          {/* Charges */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Charges
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="text-gray-600">Service Charges:</div>
              <div className="text-right font-medium">
                Rs {invoiceData.serviceCharges.toFixed(2)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-600">Package Charges:</div>
              <div className="text-right font-medium">
                Rs {invoiceData.packageCharges.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Inventory Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Inventory Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-2 text-gray-600 font-semibold">
                      Item
                    </th>
                    <th className="text-right pb-2 text-gray-600 font-semibold">
                      Price
                    </th>
                    <th className="text-right pb-2 text-gray-600 font-semibold">
                      Warranty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.inventoryItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{item.name}</td>
                      <td className="py-3 text-right text-gray-900">
                        Rs {item.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {item.warranty || "-"} {item.warranty ? "days" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-lg font-semibold text-gray-900">
              Total Amount:
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              Rs {invoiceData.total}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-indigo-600 font-semibold">Thank you!</p>
            <p className="text-gray-600 text-sm mt-1">
              Please make payment within 7 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
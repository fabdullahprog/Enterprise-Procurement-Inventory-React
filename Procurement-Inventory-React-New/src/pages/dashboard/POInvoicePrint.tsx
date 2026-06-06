import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// 1. Self-Contained Architecture & Types
export interface POItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  orderedQuantity: number;
  poRate: number;
  totalPrice: number;
}

export interface PurchaseOrderResponseDto {
  id: number;
  poNumber: string;
  poDate: string;
  supplierName: string;
  expectedDeliveryDate: string;
  totalBDTAmount: number;
  status: string;
  items: POItemResponseDto[];
}

// Amount in Words Helper for BDT (Taka)
function convertAmountToWords(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero Taka Only';

  function convert(n: number): string {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  }

  const taka = Math.floor(amount);
  const poisha = Math.round((amount - taka) * 100);

  let result = convert(taka) + ' Taka';
  if (poisha > 0) {
    result += ' and ' + convert(poisha) + ' Poisha';
  }
  return result + ' Only';
}

const PrinterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const POInvoicePrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [poData, setPoData] = useState<PurchaseOrderResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPOData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:5186/api/PurchaseOrder/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPoData(response.data);
    } catch (err: any) {
      console.error('Error fetching PO:', err);
      setError(err.response?.data?.message || 'Failed to load purchase order data. Please check your connection or access rights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPOData();
    }
  }, [id]);

  // Auto-print when data is ready
  useEffect(() => {
    if (!loading && poData && !error) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, poData, error]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Loading Official Document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border-t-4 border-red-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Document Unavailable</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={fetchPOData}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!poData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Loading Official Document...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white flex flex-col items-center">
      {/* Print Action Bar - Hidden on print */}
      <div className="w-full max-w-[21cm] flex justify-end mb-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded shadow hover:bg-indigo-700 transition-colors"
        >
          <PrinterIcon />
          Print Document
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="w-full max-w-[21cm] min-h-[29.7cm] mx-auto bg-white p-10 shadow-lg print:shadow-none print:p-0 relative flex flex-col">
        
        {/* 3. Invoice Header & Corporate Pad */}
        <header className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8 mt-2">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              SuperShop ERP Centralized System
            </h1>
            <p className="text-sm text-slate-600 font-medium">123 Corporate Avenue, Commercial District</p>
            <p className="text-sm text-slate-600">Dhaka - 1200, Bangladesh</p>
            <p className="text-sm text-slate-600 mt-1 font-medium">Contact: +880 96 12345678 | procurement@supershop.local</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-4">
              Purchase Order
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-left inline-block">
              <div className="font-bold text-slate-700 text-right">PO Ref:</div>
              <div className="font-semibold text-slate-900">{poData?.poNumber}</div>
              
              <div className="font-bold text-slate-700 text-right">Date:</div>
              <div className="font-semibold text-slate-900">{formatDate(poData?.poDate || '')}</div>
              
              <div className="font-bold text-slate-700 text-right">Delivery Date:</div>
              <div className="font-semibold text-slate-900">{formatDate(poData?.expectedDeliveryDate || '')}</div>
              
              <div className="font-bold text-slate-700 text-right">Status:</div>
              <div className="font-semibold text-slate-900 uppercase">{poData?.status}</div>
            </div>
          </div>
        </header>

        {/* 4. Vendor & Warehouse Scope ("To" Section) */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vendor Details</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 min-h-[120px]">
              <h4 className="text-lg font-bold text-slate-800 mb-1">{poData?.supplierName}</h4>
              <p className="text-sm text-slate-600 font-medium">Attn: Account Manager</p>
              <p className="text-sm text-slate-600 mt-2 text-balance">
                Authorized Supplier Address<br/>
                Registered Office Contact Location
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Location</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 min-h-[120px]">
              <h4 className="text-lg font-bold text-slate-800 mb-1">SuperShop Central Hub</h4>
              <p className="text-sm text-slate-600 font-medium">Counter Warehouse</p>
              <p className="text-sm text-slate-600 mt-2 text-balance">
                Logistics standard terms apply.<br/>
                Delivery between 09:00 AM - 04:00 PM.
              </p>
            </div>
          </div>
        </div>

        {/* 5. High-Density Commercial Item Grid */}
        <div className="flex-grow">
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300 w-12 text-center">SL</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300">Particulars / Item Description</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300 w-24 text-right">Qty</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300 w-32 text-right">Rate (BDT)</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 w-36 text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {poData?.items && poData?.items?.length > 0 ? (
                poData?.items?.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="py-2 px-3 text-sm text-slate-700 border-r border-slate-300 text-center">{index + 1}</td>
                    <td className="py-2 px-3 text-sm font-medium text-slate-900 border-r border-slate-300">{item?.productName}</td>
                    <td className="py-2 px-3 text-sm text-slate-700 border-r border-slate-300 text-right">{item?.orderedQuantity}</td>
                    <td className="py-2 px-3 text-sm text-slate-700 border-r border-slate-300 text-right">
                      {item?.poRate?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-sm font-semibold text-slate-900 text-right">
                      {item?.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">No items found in this purchase order.</td>
                </tr>
              )}
              {/* Padding rows to ensure table takes some space if items are few */}
              {poData?.items && poData?.items?.length < 5 && Array.from({ length: 5 - poData.items.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-200">
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Summary Blocks & Taka In Words Helper */}
        <div className="mt-6 flex justify-between items-start">
          <div className="w-3/5 pr-8 mt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount In Words:</h4>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm font-semibold text-slate-800 italic">
              {convertAmountToWords(poData?.totalBDTAmount || 0)}
            </div>
            
            <div className="mt-4 text-xs text-slate-500 space-y-1">
              <p><strong>Terms & Conditions:</strong></p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Goods must be delivered strictly within the stipulated Delivery Date.</li>
                <li>Invoice and Challan must accompany the delivery.</li>
                <li>Payment will be processed post quality verification & GRN approval.</li>
              </ul>
            </div>
          </div>
          
          <div className="w-2/5">
            <table className="w-full text-right">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-sm font-bold text-slate-600">Sub-Total:</td>
                  <td className="py-2 px-3 text-sm font-semibold text-slate-900 w-36">
                     {poData?.totalBDTAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-sm font-bold text-slate-600">Estimated Tax/VAT (0%):</td>
                  <td className="py-2 px-3 text-sm font-semibold text-slate-900"> 0.00</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-base font-extrabold text-slate-900 uppercase">Grand Total:</td>
                  <td className="py-3 px-3 text-lg font-black text-indigo-700 bg-indigo-50 border border-indigo-100 print:border-slate-800 print:text-slate-900 print:bg-transparent">
                     {poData?.totalBDTAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Double Signature Block at the absolute bottom margin */}
        <div className="mt-auto pt-24 pb-8 flex justify-between items-end border-slate-300">
          <div className="w-64 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">Vendor Acceptance</h5>
              <p className="text-xs text-slate-500 mt-1">Signature & Stamp Location</p>
            </div>
          </div>
          
          <div className="w-64 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">Authorized Signature</h5>
              <p className="text-xs text-slate-500 mt-1">Procurement Officer</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default POInvoicePrint;

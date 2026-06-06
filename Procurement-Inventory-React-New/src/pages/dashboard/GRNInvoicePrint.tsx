import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { grnApi, GRN } from '../../api/grnApi';

const PrinterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const GRNInvoicePrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [grnData, setGrnData] = useState<GRN | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGRNData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) return;
      const response = await grnApi.getById(Number(id));
      setGrnData(response.data || response); // Handle both nested and unnested data
    } catch (err: any) {
      console.error('Error fetching GRN:', err);
      setError(err.response?.data?.message || 'Failed to load GRN data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchGRNData();
    }
  }, [id]);

  // Auto-print when data is ready
  useEffect(() => {
    if (!loading && grnData && !error) {
      console.log("GRN API Data:", grnData);
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, grnData, error]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  if (loading || !grnData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Loading Goods Receipt Note...</p>
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
            onClick={fetchGRNData}
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded hover:bg-teal-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white flex flex-col items-center">
      {/* Print Action Bar - Hidden on print */}
      <div className="w-full max-w-[21cm] flex justify-end mb-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-teal-600 text-white font-medium rounded shadow hover:bg-teal-700 transition-colors"
        >
          <PrinterIcon />
          Print GRN
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="w-full max-w-[21cm] min-h-[29.7cm] mx-auto bg-white p-10 shadow-lg print:shadow-none print:p-0 relative flex flex-col">
        
        {/* Header Section */}
        <header className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8 mt-2">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              SuperShop ERP Centralized System
            </h1>
            <p className="text-sm text-slate-600 font-medium">123 Corporate Avenue, Commercial District</p>
            <p className="text-sm text-slate-600">Dhaka - 1200, Bangladesh</p>
            <p className="text-sm text-slate-600 mt-1 font-medium">Contact: +880 96 12345678 | store@supershop.local</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-4">
              Goods Receipt Note
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-left inline-block">
              <div className="font-bold text-slate-700 text-right">GRN No:</div>
              <div className="font-semibold text-slate-900">{grnData?.grnNumber}</div>
              
              <div className="font-bold text-slate-700 text-right">Date:</div>
              <div className="font-semibold text-slate-900">{formatDate(grnData?.receivedDate)}</div>
              
              <div className="font-bold text-slate-700 text-right">Ref PO No:</div>
              <div className="font-semibold text-slate-900">{grnData?.purchaseOrderNumber || `PO-${grnData?.purchaseOrderId}`}</div>
              
              <div className="font-bold text-slate-700 text-right">Challan No:</div>
              <div className="font-semibold text-slate-900">{(grnData as any)?.challanNo || 'N/A'}</div>
            </div>
          </div>
        </header>

        {/* Vendor & Store Scope */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Supplier Details</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 min-h-[90px]">
              <h4 className="text-lg font-bold text-slate-800 mb-1">{grnData?.supplierName || 'N/A'}</h4>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Receiving Location</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 min-h-[90px]">
              <h4 className="text-lg font-bold text-slate-800 mb-1">{grnData?.storeName || 'Main Warehouse'}</h4>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-grow">
          <table className="w-full table-fixed text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="py-2 px-2 text-sm font-bold text-slate-800 border-r border-slate-300 w-10 text-center">SL</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300 w-[35%]">Item Description</th>
                <th className="py-2 px-2 text-xs font-bold text-slate-800 border-r border-slate-300 w-16 text-center break-words">PO Qty</th>
                <th className="py-2 px-2 text-xs font-bold text-slate-800 border-r border-slate-300 w-16 text-center break-words">Received</th>
                <th className="py-2 px-2 text-xs font-bold text-teal-700 border-r border-slate-300 w-16 text-center break-words">Accepted</th>
                <th className="py-2 px-2 text-xs font-bold text-rose-700 border-r border-slate-300 w-16 text-center break-words">Rejected</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 w-[20%]">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {grnData?.items && grnData.items.length > 0 ? (
                grnData.items.map((item: any, index: number) => (
                  <tr key={item.id || index} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="py-2 px-2 text-sm text-slate-700 border-r border-slate-300 text-center">{index + 1}</td>
                    <td className="py-2 px-3 text-sm font-medium text-slate-900 border-r border-slate-300 break-words whitespace-normal">{item.productName || `Product #${item.productId}`}</td>
                    <td className="py-2 px-2 text-sm text-slate-700 border-r border-slate-300 text-center">{item.orderedQuantity ?? '-'}</td>
                    <td className="py-2 px-2 text-sm font-semibold text-slate-900 border-r border-slate-300 text-center">{item.receivedQuantity}</td>
                    <td className="py-2 px-2 text-sm font-semibold text-teal-700 border-r border-slate-300 text-center">{item.acceptedQuantity}</td>
                    <td className="py-2 px-2 text-sm font-semibold text-rose-700 border-r border-slate-300 text-center">{item.rejectedQuantity}</td>
                    <td className="py-2 px-3 text-sm text-slate-600 text-left capitalize break-words whitespace-normal">{item.condition || item.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">No items found in this Goods Receipt Note.</td>
                </tr>
              )}
              {/* Padding rows */}
              {grnData?.items && grnData.items.length < 10 && Array.from({ length: 10 - grnData.items.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-200">
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-xs text-slate-500 space-y-1">
            <p><strong>Note:</strong> This document certifies the physical receipt of goods. Unit prices and financials are excluded from this copy.</p>
          </div>
        </div>

        {/* Footer Section (Signatures) */}
        <div className="mt-auto pt-24 pb-8 flex justify-between items-end border-slate-300">
          <div className="w-48 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">Received By</h5>
              <p className="text-xs text-slate-500 mt-1">{grnData?.receivedBy || 'Store Keeper'}</p>
            </div>
          </div>
          
          <div className="w-48 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">QC Checked By</h5>
              <p className="text-xs text-slate-500 mt-1">Quality Assurance</p>
            </div>
          </div>

          <div className="w-48 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">Authorized By</h5>
              <p className="text-xs text-slate-500 mt-1">Warehouse Manager</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default GRNInvoicePrint;

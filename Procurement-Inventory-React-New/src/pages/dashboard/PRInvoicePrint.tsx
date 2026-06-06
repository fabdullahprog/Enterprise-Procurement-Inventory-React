import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { purchaseApi, PurchaseRequisition } from '../../api/purchaseApi';

const PrinterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const PRInvoicePrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prData, setPrData] = useState<PurchaseRequisition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPRData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) return;
      const response = await purchaseApi.getRequisitionById(Number(id));
      setPrData(response as any); // Sometimes axios wraps data in .data, but this seems handled properly by the api definition itself. Wait, getRequisitionById returns Promise<PurchaseRequisition>. Let's type assert and check.
    } catch (err: any) {
      console.error('Error fetching PR:', err);
      setError(err.response?.data?.message || 'Failed to load PR data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPRData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && prData && !error) {
      console.log("PR API Data:", prData);
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, prData, error]);

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

  if (loading || !prData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Loading Purchase Requisition...</p>
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
            onClick={fetchPRData}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white flex flex-col items-center">
      {/* Print Action Bar */}
      <div className="w-full max-w-[21cm] flex justify-end mb-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded shadow hover:bg-indigo-700 transition-colors"
        >
          <PrinterIcon />
          Print PR
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
            <p className="text-sm text-slate-600 mt-1 font-medium">Contact: +880 96 12345678 | procurement@supershop.local</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-4">
              PURCHASE REQUISITION
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-left inline-block">
              <div className="font-bold text-slate-700 text-right">PR No:</div>
              <div className="font-semibold text-slate-900">{prData?.requisitionNumber}</div>
              
              <div className="font-bold text-slate-700 text-right">Date:</div>
              <div className="font-semibold text-slate-900">{formatDate(prData?.requisitionDate)}</div>
              
              <div className="font-bold text-slate-700 text-right">Expected By:</div>
              <div className="font-semibold text-slate-900">{formatDate(prData?.requiredByDate)}</div>
              
              <div className="font-bold text-slate-700 text-right">Status:</div>
              <div className="font-semibold text-slate-900 capitalize">{prData?.status}</div>
            </div>
          </div>
        </header>

        {/* Scope Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requesting Details</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 min-h-[90px]">
              <h4 className="text-lg font-bold text-slate-800 mb-1">{prData?.departmentName || 'N/A'}</h4>
              <p className="text-sm text-slate-600">Requested By: {prData?.requestedByName || prData?.requestedByEmail || 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Notes</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 min-h-[90px]">
              <p className="text-sm text-slate-600 italic break-words whitespace-normal">{prData?.notes || 'No additional notes provided.'}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-grow">
          <table className="w-full table-fixed text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300 w-12 text-center">SL</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300 w-[45%]">Item Description</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-300 w-24 text-center">Requested Qty</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 w-[20%]">Purpose / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {prData?.items && prData.items.length > 0 ? (
                prData.items.map((item: any, index: number) => (
                  <tr key={item.id || index} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="py-2 px-3 text-sm text-slate-700 border-r border-slate-300 text-center">{index + 1}</td>
                    <td className="py-2 px-3 text-sm font-medium text-slate-900 border-r border-slate-300 break-words whitespace-normal">{item.productName || `Product #${item.productId}`}</td>
                    <td className="py-2 px-3 text-sm font-semibold text-slate-900 border-r border-slate-300 text-center">{item.requiredQuantity}</td>
                    <td className="py-2 px-3 text-sm text-slate-600 text-left break-words whitespace-normal">{item.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">No items found in this requisition.</td>
                </tr>
              )}
              {/* Padding rows */}
              {prData?.items && prData.items.length < 15 && Array.from({ length: 15 - prData.items.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-200">
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3 border-r border-slate-300"></td>
                  <td className="py-3 px-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-xs text-slate-500 space-y-1">
            <p><strong>Note:</strong> This document is a formal request for purchase. It does not guarantee authorization until fully approved.</p>
          </div>
        </div>

        {/* Footer Section (Signatures) */}
        <div className="mt-auto pt-24 pb-8 flex justify-between items-end border-slate-300">
          <div className="w-48 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">Requested By</h5>
              <p className="text-xs text-slate-500 mt-1">{prData?.requestedByName || prData?.requestedByEmail || 'Department Head'}</p>
            </div>
          </div>
          
          <div className="w-48 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">Received By</h5>
              <p className="text-xs text-slate-500 mt-1">Procurement Dept</p>
            </div>
          </div>

          <div className="w-48 text-center">
            <div className="border-t-2 border-slate-800 pt-2">
              <h5 className="font-bold text-slate-800 text-sm">Approved By</h5>
              <p className="text-xs text-slate-500 mt-1">Authorized Signatory</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PRInvoicePrint;

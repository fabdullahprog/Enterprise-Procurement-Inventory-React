import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText
} from 'lucide-react';

interface RFQ {
  id: number;
  rfqNumber: string;
  rfqDate: string;
  quotationDeadline: string;
  status: string;
  notes?: string;
  requisitionId: number;
  requisitionNumber?: string;
  createdById: number;
  createdByEmail?: string;
  productCount?: number;
  quotationCount?: number;
  hasCS?: boolean;
  csId?: number;
}

const RFQListPage: React.FC = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  
  // Data states
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [filteredRfqs, setFilteredRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [rfqNumber, setRfqNumber] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  
  // Expanded row state
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [rfqDetails, setRfqDetails] = useState<Record<number, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});

  const isPurchaseRole = roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager'].includes(r));

  useEffect(() => {
    loadRFQs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rfqs, rfqNumber, statusFilter, dateFrom, dateTo, pageSize]);

  const loadRFQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rfqApi.getAllRFQs();
      const rfqData = Array.isArray(data) ? data : [];
      setRfqs(rfqData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load RFQs');
      console.error('Error loading RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rfqs];

    if (rfqNumber.trim()) {
      filtered = filtered.filter(r => 
        r.rfqNumber.toLowerCase().includes(rfqNumber.toLowerCase()) ||
        r.requisitionNumber?.toLowerCase().includes(rfqNumber.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(r => new Date(r.rfqDate) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(r => new Date(r.rfqDate) <= new Date(dateTo));
    }

    setFilteredRfqs(filtered);
  };

  const handleClear = () => {
    setRfqNumber('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const toggleRow = async (id: number) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
      return;
    }
    setExpandedRowId(id);
    if (!rfqDetails[id]) {
      setLoadingDetails(prev => ({ ...prev, [id]: true }));
      try {
        const details = await rfqApi.getRFQById(id);
        setRfqDetails(prev => ({ ...prev, [id]: details }));
      } catch (error) {
        console.error("Failed to fetch RFQ details", error);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sent': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Active</span>;
      case 'QuotationReceived': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">Quotations Received</span>;
      case 'Closed': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Closed</span>;
      default: 
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  // Stats
  const totalRFQs = rfqs.length;
  const activeRFQs = rfqs.filter(r => r.status === 'Sent').length;
  const receivedRFQs = rfqs.filter(r => r.status === 'QuotationReceived').length;
  const closedRFQs = rfqs.filter(r => r.status === 'Closed').length;

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto w-full min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">RFQ List</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Requests for Quotation and monitor supplier responses.</p>
        </div>
        <button 
          onClick={loadRFQs}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total RFQs', value: totalRFQs, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active (Sent)', value: activeRFQs, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Received', value: receivedRFQs, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Closed', value: closedRFQs, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Filter RFQs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Search Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="RFQ or PR No..."
                className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={rfqNumber}
                onChange={(e) => setRfqNumber(e.target.value)}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              className="w-full px-3 py-1.5 text-[13px] border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Sent">Active (Sent)</option>
              <option value="QuotationReceived">Quotations Received</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
            <input
              type="date"
              className="w-full px-3 py-1.5 text-[13px] border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
            <input
              type="date"
              className="w-full px-3 py-1.5 text-[13px] border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleClear}
              className="px-4 py-1.5 text-[13px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors w-full"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center justify-between">
          <p>{error}</p>
          <button onClick={loadRFQs} className="text-red-700 font-semibold hover:underline">Try Again</button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
        {/* Table Controls */}
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-lg">
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold">{filteredRfqs.length > 0 ? 1 : 0}</span> to <span className="font-semibold">{Math.min(pageSize, filteredRfqs.length)}</span> of <span className="font-semibold">{filteredRfqs.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Rows per page:</label>
            <select
              className="px-2 py-1 text-xs border border-slate-300 rounded outline-none focus:border-indigo-500 text-slate-700"
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
              <p className="text-sm font-medium">Loading RFQs...</p>
            </div>
          ) : filteredRfqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <FileText className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-base font-medium text-slate-600">No RFQs found</p>
              <p className="text-sm mt-1">Adjust your filters to see results.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[12px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold w-10"></th>
                  <th className="py-2.5 px-3 font-semibold">RFQ Number</th>
                  <th className="py-2.5 px-3 font-semibold">Source PR</th>
                  <th className="py-2.5 px-3 font-semibold">RFQ Date</th>
                  <th className="py-2.5 px-3 font-semibold">Deadline</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Items</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold bg-slate-100 sticky right-0 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] z-10 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
                {filteredRfqs.slice(0, pageSize).map((rfq) => (
                  <React.Fragment key={rfq.id}>
                    {/* Main Row */}
                    <tr 
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${expandedRowId === rfq.id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => toggleRow(rfq.id)}
                    >
                      <td className="py-2 px-3 text-slate-400">
                        {expandedRowId === rfq.id ? (
                          <ChevronUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium text-indigo-700">{rfq.rfqNumber}</td>
                      <td className="py-2 px-3 text-slate-600">{rfq.requisitionNumber || `#${rfq.requisitionId}`}</td>
                      <td className="py-2 px-3 text-slate-600">{new Date(rfq.rfqDate).toLocaleDateString()}</td>
                      <td className="py-2 px-3 text-slate-600">{new Date(rfq.quotationDeadline).toLocaleDateString()}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                          {rfq.productCount || 0}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {getStatusBadge(rfq.status)}
                      </td>
                      <td className="py-2 px-3 sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.03)] z-10 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm"
                            onClick={() => navigate(`/dashboard/rfq/${rfq.id}/submit-quotation`)}
                            title="Add Supplier Quotation"
                          >
                            Add Supplier Q.
                          </button>
                          {isPurchaseRole && rfq.status === 'QuotationReceived' && !rfq.hasCS && (
                            <button
                              className="px-2 py-1 bg-indigo-600 text-white text-[11px] font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm"
                              onClick={() => navigate(`/dashboard/rfq/${rfq.id}/create-cs`)}
                            >
                              Create CS
                            </button>
                          )}
                          {rfq.hasCS && (
                            <button
                              className="px-2 py-1 bg-green-600 text-white text-[11px] font-medium rounded hover:bg-green-700 transition-colors shadow-sm"
                              onClick={() => navigate(`/comparative-statement/view/${rfq.csId || rfq.id}`)}
                            >
                              View CS
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Nested Details */}
                    {expandedRowId === rfq.id && (
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <td colSpan={8} className="p-0">
                          <div className="px-10 py-4 border-l-4 border-indigo-400">
                            {loadingDetails[rfq.id] ? (
                              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                                Loading RFQ details...
                              </div>
                            ) : rfqDetails[rfq.id] ? (
                              <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse text-[12px]">
                                  <thead className="bg-slate-100 text-slate-600">
                                    <tr>
                                      <th className="py-2 px-4 font-semibold border-b border-slate-200 w-16 text-center">#</th>
                                      <th className="py-2 px-4 font-semibold border-b border-slate-200">Product Name</th>
                                      <th className="py-2 px-4 font-semibold border-b border-slate-200 text-right">Requested Qty</th>
                                      <th className="py-2 px-4 font-semibold border-b border-slate-200 text-center">UOM</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {rfqDetails[rfq.id].items && rfqDetails[rfq.id].items.length > 0 ? (
                                      rfqDetails[rfq.id].items.map((item: any, idx: number) => (
                                        <tr key={item.id || idx} className="hover:bg-slate-50">
                                          <td className="py-2 px-4 text-center text-slate-500">{idx + 1}</td>
                                          <td className="py-2 px-4 font-medium text-slate-700">{item.productName || item.product?.name || 'Unknown Product'}</td>
                                          <td className="py-2 px-4 text-right text-slate-600">{item.quantity}</td>
                                          <td className="py-2 px-4 text-center text-slate-500">{item.unitOfMeasure || item.product?.unitOfMeasure || '-'}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={4} className="py-4 px-4 text-center text-slate-500 italic">
                                          No items found for this RFQ.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-sm text-red-500 py-2">Failed to load details.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFQListPage;

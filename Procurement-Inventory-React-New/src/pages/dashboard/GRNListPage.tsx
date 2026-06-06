// src/pages/dashboard/GRNListPage.tsx
import { useState, useEffect } from 'react';
import { grnApi, GRN } from '../../api/grnApi';
import './my-requisitions.css';

const GRNListPage = () => {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [filteredGrns, setFilteredGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Stats
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    loadGrns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [grns, searchTerm, statusFilter, dateFrom, dateTo]);

  const loadGrns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await grnApi.getAll();
      const data = Array.isArray(response) ? response : response.data || response.$values || [];
      setGrns(data);
      calculateStats(data);
    } catch (err: any) {
      console.error('Error loading GRNs:', err);
      setError(err.response?.data?.message || 'Failed to load GRN records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: GRN[]) => {
    setStats({
      total: data.length,
      approved: data.filter(g => g.status === 'Approved').length,
      pending: data.filter(g => ['Draft', 'PendingStoreApproval'].includes(g.status)).length,
      rejected: data.filter(g => g.status === 'Rejected').length,
    });
  };

  const applyFilters = () => {
    let filtered = [...grns];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.grnNumber?.toLowerCase().includes(term) ||
        g.purchaseOrderNumber?.toLowerCase().includes(term) ||
        g.supplierName?.toLowerCase().includes(term)
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(g => g.status === statusFilter);
    }
    if (dateFrom) {
      filtered = filtered.filter(g => new Date(g.receivedDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(g => new Date(g.receivedDate) <= new Date(dateTo));
    }
    setFilteredGrns(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Draft': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'PendingStoreApproval': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Received': return 'bg-teal-50 text-teal-700 border border-teal-200';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="my-requisitions-page">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading GRN records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-requisitions-page">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
          <h2 className="text-lg font-bold text-rose-800 mb-2">Error Loading GRNs</h2>
          <p className="text-rose-600 mb-4">{error}</p>
          <button onClick={loadGrns} className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requisitions-page">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-black text-slate-800">{stats.total}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total GRNs</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div className="text-2xl font-black text-emerald-700">{stats.approved}</div>
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mt-1">Approved</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <div className="text-2xl font-black text-amber-700">{stats.pending}</div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm">
          <div className="text-2xl font-black text-rose-700">{stats.rejected}</div>
          <div className="text-xs font-bold text-rose-500 uppercase tracking-wider mt-1">Rejected</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-row-top">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              className="filter-input"
              placeholder="GRN #, PO #, or Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="PendingStoreApproval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date From</label>
            <input type="date" className="filter-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Date To</label>
            <input type="date" className="filter-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
        <div className="filter-row-bottom">
          <div className="filter-actions">
            <button className="btn-search" onClick={applyFilters}>Search</button>
            <button className="btn-clear" onClick={handleClear}>Clear</button>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header-section">
        <div className="header-left">
          <h1 className="page-title">Goods Receipt Notes (GRN)</h1>
          <p className="page-subtitle">Complete history of all goods received against Purchase Orders</p>
        </div>
        <div className="header-right">
          <button className="btn-new-requisition" onClick={loadGrns}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredGrns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No GRN records found</h3>
          <p className="text-sm text-slate-400">Receive goods from Purchase Orders to see entries here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left w-10">#</th>
                  <th className="px-3 py-2.5 text-left">GRN Number</th>
                  <th className="px-3 py-2.5 text-left">PO Reference</th>
                  <th className="px-3 py-2.5 text-left">Supplier</th>
                  <th className="px-3 py-2.5 text-center">Received Qty</th>
                  <th className="px-3 py-2.5 text-center">Received Date</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-left">Received By</th>
                  <th className="px-3 py-2.5 text-center sticky right-0 bg-slate-50 z-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrns.map((grn, index) => (
                  <>
                    <tr key={grn.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-slate-500">{index + 1}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-teal-700 text-xs bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
                          {grn.grnNumber}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                        {grn.purchaseOrderNumber || `PO-${grn.purchaseOrderId}`}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={grn.supplierName || ''}>
                        {grn.supplierName || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-800">
                        {(grn as any).receivedQuantity ?? grn.items?.reduce((sum: number, i: any) => sum + (i.receivedQuantity || 0), 0) ?? '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap">
                        {new Date(grn.receivedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusBadge(grn.status)}`}>
                          {grn.status === 'PendingStoreApproval' ? 'Pending' : grn.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={(grn as any).receivedByName || ''}>
                        {(grn as any).receivedByName || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center sticky right-0 bg-white z-10">
                        <button
                          className="text-xs px-3 py-1.5 font-bold rounded-lg transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          onClick={() => setExpandedRow(expandedRow === grn.id ? null : grn.id)}
                        >
                          {expandedRow === grn.id ? 'Hide' : 'View'} Items
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expandedRow === grn.id && grn.items && grn.items.length > 0 && (
                      <tr key={`detail-${grn.id}`}>
                        <td colSpan={9} className="p-0">
                          <div className="bg-slate-50/80 border-y border-slate-200 px-6 py-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                                Line Items for {grn.grnNumber}
                              </h4>
                              <button 
                                onClick={() => window.open(`/dashboard/grn-print/${grn.id}`, '_blank')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                  <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                                Print GRN
                              </button>
                            </div>
                            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Product</th>
                                    <th className="px-4 py-2 text-center text-xs font-bold text-slate-500">Ordered</th>
                                    <th className="px-4 py-2 text-center text-xs font-bold text-slate-500">Received</th>
                                    <th className="px-4 py-2 text-center text-xs font-bold text-teal-600">Accepted (QC)</th>
                                    <th className="px-4 py-2 text-center text-xs font-bold text-rose-500">Rejected</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Condition</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {grn.items.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2.5 font-medium text-slate-900">{item.productName || `Product #${item.productId}`}</td>
                                      <td className="px-4 py-2.5 text-center text-slate-400 font-bold">{item.orderedQuantity ?? '-'}</td>
                                      <td className="px-4 py-2.5 text-center font-bold text-slate-800">{item.receivedQuantity}</td>
                                      <td className="px-4 py-2.5 text-center">
                                        <span className="inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                          {item.acceptedQuantity}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                          item.rejectedQuantity > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                          {item.rejectedQuantity}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-slate-600 capitalize">{item.condition || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNListPage;

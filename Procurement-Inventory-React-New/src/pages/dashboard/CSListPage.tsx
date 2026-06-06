// src/pages/dashboard/CSListPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import { useAuth } from '../../context/AuthContext';

interface CSSupplierRow {
  supplierName: string;
  isSelected: boolean;
}

interface CS {
  id: number;
  csNumber: string;
  csDate: string;
  status: string;
  totalBDTAmount: number;
  remarks?: string;
  approvedAt?: string;
  rfqNumber?: string;
  createdByEmail?: string;
  supplierRows?: CSSupplierRow[];
}

const CSListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles } = useAuth();

  const [csList, setCSList] = useState<CS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const isPurchaseRole = roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager'].includes(r));
  const isMDOrAdmin = roles.some(r => ['Admin', 'MD'].includes(r));

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
    loadCS();
  }, []);

  const loadCS = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rfqApi.getAllCS();
      setCSList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // Don't show "Failed to load" if it's just a 404 no-data response
      if (err.response?.status === 404) {
        setCSList([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load Comparative Statements');
        console.error('Error loading CS:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: number) => {
    if (!confirm('Mark this CS as Reviewed?')) return;

    try {
      await rfqApi.reviewCS(id);
      setSuccessMessage('CS marked as Reviewed');
      loadCS();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to review CS');
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this Comparative Statement?')) return;

    try {
      await rfqApi.approveCS(id);
      setSuccessMessage('CS approved successfully');
      loadCS();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve CS');
    }
  };

  const filteredCS = csList?.filter(cs => cs != null).filter(cs => {
    const status = cs?.status || 'Unknown';
    const matchesSearch = (cs?.csNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cs?.rfqNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Reviewed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'POCreated': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Helper to extract the winning supplier(s) from the supplierRows payload
  const getWinningSupplier = (cs: CS) => {
    if (!cs?.supplierRows || cs.supplierRows.length === 0) return 'Pending Selection';
    const selected = cs.supplierRows.filter(r => r?.isSelected);
    if (selected.length === 0) return 'Pending Selection';
    // Remove duplicates if multiple rows from the same supplier were selected
    const uniqueSuppliers = Array.from(new Set(selected.map(s => s?.supplierName).filter(Boolean)));
    return uniqueSuppliers.join(', ');
  };

  return (
    <div className="page-enter">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Comparative Statements</h1>
          <p className="text-sm text-slate-500 mt-1">Review and approve comparative statements</p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">×</button>
        </div>
      )}

      {error && csList.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by CS or RFQ number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Approved">Approved</option>
          <option value="POCreated">PO Created</option>
        </select>
        <button
          onClick={loadCS}
          className="text-sm px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-200">
          <svg className="animate-spin h-8 w-8 text-teal-500 mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p className="text-sm text-slate-500 font-medium">Loading Comparative Statements...</p>
        </div>
      ) : csList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-200 text-center px-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">No Comparative Statements Found</h3>
          <p className="text-sm text-slate-500">Comparative statements will appear here once they are created from an RFQ.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-4 py-3">CS Number</th>
                  <th className="px-4 py-3">RFQ Ref</th>
                  <th className="px-4 py-3 text-center">Date</th>
                  <th className="px-4 py-3">Winning Supplier</th>
                  <th className="px-4 py-3 text-right">Amount (BDT)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center sticky right-0 bg-slate-50 border-l border-slate-200 z-10 w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredCS.map(cs => {
                  const currentStatus = cs?.status || 'Unknown';
                  return (
                  <tr key={cs?.id || Math.random()} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {cs?.csNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {cs?.rfqNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 whitespace-nowrap">
                      {cs?.csDate ? new Date(cs.csDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 truncate max-w-[200px]" title={getWinningSupplier(cs)}>
                      {getWinningSupplier(cs)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{(cs?.totalBDTAmount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadgeClass(currentStatus)}`}>
                        {currentStatus === 'POCreated' ? 'PO Created' : currentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/50 border-l border-slate-100 z-10">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                          onClick={() => navigate(`/dashboard/cs/${cs?.id}`)}
                          title="View Details"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          View
                        </button>

                        {isPurchaseRole && (currentStatus === 'Draft' || currentStatus === 'Pending') && (
                          <button
                            className="text-xs px-2.5 py-1.5 text-white font-medium rounded transition-colors bg-blue-600 hover:bg-blue-700 shadow-sm"
                            onClick={() => handleReview(cs!.id)}
                          >
                            Review
                          </button>
                        )}
                        {isMDOrAdmin && currentStatus === 'Reviewed' && (
                          <button
                            className="text-xs px-2.5 py-1.5 text-white font-medium rounded transition-colors bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                            onClick={() => handleApprove(cs!.id)}
                          >
                            Approve
                          </button>
                        )}
                        {isPurchaseRole && currentStatus === 'Approved' && (
                          <button
                            className="text-xs px-2.5 py-1.5 text-white font-medium rounded transition-colors bg-teal-600 hover:bg-teal-700 shadow-sm"
                            onClick={() => navigate(`/dashboard/cs/${cs?.id}/create-po`)}
                          >
                            + PO
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-[12px] text-slate-500 flex justify-between items-center">
            <span>Showing <span className="font-semibold text-slate-700">{filteredCS.length}</span> of <span className="font-semibold text-slate-700">{csList.length}</span> comparative statements</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSListPage;

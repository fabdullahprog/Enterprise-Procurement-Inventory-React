// src/pages/dashboard/ApprovedRequisitionsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requisitionApi } from '../../api/requisitionApi';
import { useAuth } from '../../context/AuthContext';
import { PurchaseRequisition } from '../../types';

const ApprovedRequisitionsPage = () => {
  const { hasPermission, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      // Get all requisitions and filter approved ones
      const response = await requisitionApi.getAllRequisitions(1, 100);
      const data = response.data || response;
      // Filter only approved requisitions that haven't been processed yet
      const approved = data.filter((r: PurchaseRequisition) =>
        r.status === 'Approved' || r.status === 'RFQSent'
      );
      setRequisitions(approved);
    } catch (error) {
      console.error('Error loading approved requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRFQ = (requisitionId: number) => {
    // Navigate to RFQ creation page with requisition ID
    navigate(`/dashboard/create-rfq/${requisitionId}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'rfqsent':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const filteredRequisitions = requisitions.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.requisitionNumber.toLowerCase().includes(term) ||
      r.departmentName?.toLowerCase().includes(term) ||
      r.status.toLowerCase().includes(term)
    );
  });

  const approvedCount = requisitions.filter((r) => r.status === 'Approved').length;
  const rfqSentCount = requisitions.filter((r) => r.status === 'RFQSent').length;

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Approved Requisitions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create RFQ (Request for Quotation) for approved requisitions
        </p>
      </div>

      {/* Status Summary Bar */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            ✅ {approvedCount}
          </span>
          <span className="text-slate-500">Approved</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            📧 {rfqSentCount}
          </span>
          <span className="text-slate-500">RFQ Sent</span>
        </div>
        <div className="flex-1" />
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search PR number, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-[13px] pl-8 pr-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 w-64 bg-white"
          />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <button
          onClick={loadRequisitions}
          className="text-xs px-3 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
          title="Refresh"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-teal-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading approved requisitions...
          </div>
        </div>
      ) : filteredRequisitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3 className="text-base font-semibold text-slate-600 mb-1">No approved requisitions</h3>
          <p className="text-sm text-slate-400">There are no approved requisitions waiting for RFQ creation</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left w-10">#</th>
                  <th className="px-3 py-2.5 text-left">PR Number</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5 text-center">Date</th>
                  <th className="px-3 py-2.5 text-center">Required By</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-left">Approved By</th>
                  <th className="th-action w-36 px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequisitions.map((req, index) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap text-[13px]">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap text-[13px]">
                      {req.requisitionNumber}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap text-[13px]">
                      {req.departmentName || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap text-[13px]">
                      {new Date(req.requisitionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap text-[13px]">
                      {new Date(req.requiredByDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(req.status)}`}
                      >
                        {req.status === 'Approved' ? '✅' : '📧'} {req.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 cell-truncate text-[13px]" title={req.approvedByName || req.approvedByEmail || ''}>
                      {req.approvedByName || req.approvedByEmail || '—'}
                    </td>
                    <td className="td-action w-36 px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {req.status === 'Approved' && (
                          <button
                            type="button"
                            className="text-xs px-2.5 py-1.5 text-white font-medium rounded transition-colors bg-teal-600 hover:bg-teal-700 flex items-center gap-1"
                            onClick={() => handleCreateRFQ(req.id)}
                            title="Generate RFQ"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="12" y1="18" x2="12" y2="12" />
                              <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                            Generate RFQ
                          </button>
                        )}
                        {req.status === 'RFQSent' && (
                          <button
                            type="button"
                            className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                            onClick={() => navigate(`/dashboard/rfqs`)}
                            title="View RFQ"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            View RFQ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 text-[12px] text-slate-500">
            Showing <strong className="text-slate-700">{filteredRequisitions.length}</strong> of{' '}
            <strong className="text-slate-700">{requisitions.length}</strong> requisitions
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedRequisitionsPage;

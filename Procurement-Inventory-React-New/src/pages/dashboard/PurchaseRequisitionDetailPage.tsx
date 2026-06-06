// src/pages/dashboard/PurchaseRequisitionDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { purchaseApi, PurchaseRequisition } from '../../api/purchaseApi';
import { useAuth } from '../../context/AuthContext';
import {
  StatsHeader,
  ViewSection,
  Badge,
  COLORS
} from '../../components/form';

const PurchaseRequisitionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [requisition, setRequisition] = useState<PurchaseRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (id) {
      loadRequisition();
    }
  }, [id]);

  const loadRequisition = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseApi.getRequisitionById(Number(id));
      console.log('📋 Purchase Requisition Detail:', data);
      console.log('📋 Status:', data.status, '| Lowercase:', data.status?.toLowerCase());
      console.log('📋 Is Approved?', data.status?.toLowerCase() === 'approved');
      setRequisition(data);
    } catch (err: any) {
      console.error('❌ Error loading requisition:', err);
      setError(err.response?.data?.message || 'Failed to load requisition details');
    } finally {
      setLoading(false);
    }
   };

  const handleCreateRFQ = () => {
    navigate('/dashboard/procurement/create-rfq', {
      state: {
        prId: requisition!.id,
        prNumber: requisition!.requisitionNumber,
        items: requisition!.items || []
      }
    });
  };

  const canApproveReject = roles.some(r => ['PurchaseManager', 'Admin', 'Manager'].includes(r));
  const statusLower = requisition?.status?.toLowerCase() || '';

  const handleApprove = async () => {
    if (!id || !confirm('Are you sure you want to approve this Purchase Requisition?')) return;
    try {
      setActionLoading('approve');
      await purchaseApi.approveRequisition(Number(id));
      alert('✅ Purchase Requisition approved successfully!');
      await loadRequisition();
    } catch (err: any) {
      console.error('Error approving:', err);
      alert(err.response?.data?.message || 'Failed to approve requisition');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return;
    try {
      setActionLoading('reject');
      await purchaseApi.rejectRequisition(Number(id), reason);
      alert('❌ Purchase Requisition rejected.');
      await loadRequisition();
    } catch (err: any) {
      console.error('Error rejecting:', err);
      alert(err.response?.data?.message || 'Failed to reject requisition');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const s = status.toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'rejected') return 'danger';
    if (s === 'rfqsent') return 'info';
    if (s === 'pocreated') return 'success';
    return 'info';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading requisition details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !requisition) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 text-sm mb-4">{error || 'Requisition not found'}</p>
          <button
            onClick={() => navigate('/dashboard/purchase/requisitions')}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pb-24">
      <StatsHeader
        accentColor={COLORS.PURCHASE}
        icon="📋"
        title={`Purchase Requisition: ${requisition.requisitionNumber}`}
        subtitle="View requisition details and create RFQ"
        stats={[
          { label: 'Items', value: requisition.items?.length || 0 },
          { label: 'Status', value: requisition.status },
          { label: 'Department', value: requisition.departmentName || 'N/A' }
        ]}
      />

      {/* Requisition Info */}
      <ViewSection title="Requisition Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              PR Number
            </label>
            <p className="text-[14px] font-medium text-gray-900">{requisition.requisitionNumber}</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <Badge variant={getStatusVariant(requisition.status)}>{requisition.status}</Badge>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <p className="text-[14px] text-gray-700">{requisition.departmentName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Requested By
            </label>
            <p className="text-[14px] text-gray-700">{requisition.requestedByName || requisition.requestedByEmail || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Requisition Date
            </label>
            <p className="text-[14px] text-gray-700">{new Date(requisition.requisitionDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Required By Date
            </label>
            <p className="text-[14px] text-gray-700">{new Date(requisition.requiredByDate).toLocaleDateString()}</p>
          </div>
          {requisition.sourceRequisitionId && (
            <div className="col-span-full">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Source
              </label>
              <p className="text-[14px] text-blue-600">
                Forwarded from Store (Employee Requisition ID: {requisition.sourceRequisitionId})
              </p>
            </div>
          )}
          {requisition.notes && (
            <div className="col-span-full">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Notes
              </label>
              <p className="text-[14px] text-gray-700">{requisition.notes}</p>
            </div>
          )}
        </div>
      </ViewSection>

      {/* Items Table */}
      <ViewSection title="Requisition Items">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Required Qty</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requisition.items && requisition.items.length > 0 ? (
                requisition.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-gray-900">{item.productName || 'N/A'}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 text-center">{item.requiredQuantity}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{item.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ViewSection>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/purchase/requisitions')}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-[13px] font-medium rounded-md hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to List
            </button>

            <button
              onClick={() => window.open(`/dashboard/pr-print/${requisition.id}`, '_blank')}
              className="px-5 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[13px] font-medium rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Requisition
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mr-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Status:</span>
              <Badge variant={getStatusVariant(requisition.status)}>{requisition.status}</Badge>
            </div>

            {/* Approve / Reject — only for Pending + authorized roles */}
            {statusLower === 'pending' && canApproveReject && (
              <>
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-[13px] font-medium rounded-md transition-colors shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                </button>
              </>
            )}

            {/* Create RFQ — only for Approved */}
            {statusLower === 'approved' && (
              <button
                onClick={handleCreateRFQ}
                className="px-5 py-2.5 text-white text-[13px] font-medium rounded-md transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                style={{ backgroundColor: COLORS.PURCHASE }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                Create RFQ
              </button>
            )}

            {/* Rejected indicator */}
            {statusLower === 'rejected' && (
              <div className="px-4 py-2 bg-red-50 text-red-700 text-[13px] font-medium rounded-md flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Rejected
              </div>
            )}

            {/* RFQ already sent indicator */}
            {statusLower === 'rfqsent' && (
              <div className="px-4 py-2 bg-blue-50 text-blue-700 text-[13px] font-medium rounded-md flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                RFQ Already Sent
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequisitionDetailPage;

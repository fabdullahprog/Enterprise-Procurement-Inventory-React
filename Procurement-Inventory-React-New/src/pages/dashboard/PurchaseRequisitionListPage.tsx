// src/pages/dashboard/PurchaseRequisitionListPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseApi, PurchaseRequisition } from '../../api/purchaseApi';
import {
  StatsHeader,
  FilterBar,
  FilterField,
  Badge,
  COLORS
} from '../../components/form';

const PurchaseRequisitionListPage = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRequisitions();
  }, []);

  useEffect(() => {
    filterRequisitions();
  }, [requisitions, searchTerm, statusFilter]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseApi.getRequisitions();
      console.log('📋 Purchase Requisitions loaded:', data);
      setRequisitions(data);
    } catch (err: any) {
      console.error('❌ Error loading purchase requisitions:', err);
      setError(err.response?.data?.message || 'Failed to load purchase requisitions');
    } finally {
      setLoading(false);
    }
  };

  const filterRequisitions = () => {
    let filtered = [...requisitions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.requisitionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredRequisitions(filtered);
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'success';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'rejected') return 'danger';
    if (statusLower === 'rfqsent') return 'info';
    if (statusLower === 'pocreated') return 'success';
    return 'info';
  };

  const handleCreateRFQ = (requisitionId: number) => {
    // Navigate to detail page where user can create RFQ
    navigate(`/dashboard/purchase/requisitions/${requisitionId}`);
  };

  const handleViewDetails = (requisitionId: number) => {
    navigate(`/dashboard/purchase/requisitions/${requisitionId}`);
  };

  const stats = {
    total: requisitions.length,
    pending: requisitions.filter(r => r.status.toLowerCase() === 'pending').length,
    approved: requisitions.filter(r => r.status.toLowerCase() === 'approved').length,
    rfqSent: requisitions.filter(r => r.status.toLowerCase() === 'rfqsent').length
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading purchase requisitions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadRequisitions}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <StatsHeader
        accentColor={COLORS.PURCHASE}
        icon="📋"
        title="Purchase Requisitions"
        subtitle="Manage purchase requisitions and create RFQs"
        stats={[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Approved', value: stats.approved },
          { label: 'RFQ Sent', value: stats.rfqSent }
        ]}
      />

      <FilterBar onSearch={filterRequisitions} onReset={() => { setSearchTerm(''); setStatusFilter('all'); }}>
        <FilterField label="Search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PR number, department, or requester..."
            className="w-full px-3 py-2 border-[0.5px] border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </FilterField>
        <FilterField label="Status">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border-[0.5px] border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rfqsent">RFQ Sent</option>
            <option value="pocreated">PO Created</option>
            <option value="rejected">Rejected</option>
          </select>
        </FilterField>
      </FilterBar>

      {filteredRequisitions.length === 0 ? (
        <div className="bg-white rounded-lg border-[0.5px] border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Purchase Requisitions Found</h3>
          <p className="text-sm text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No requisitions match your filters' 
              : 'No purchase requisitions available'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-gray-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr>
                  <th className="w-10 px-3 py-2.5 text-left">#</th>
                  <th className="px-3 py-2.5 text-left">PR Number</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5 text-left">Requested By</th>
                  <th className="px-3 py-2.5">Items</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Created Date</th>
                  <th className="th-action w-36 px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.map((req, index) => (
                  <tr key={req.id}>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {req.requisitionNumber}
                        </span>
                        {req.sourceRequisitionId && (
                          <span className="text-[11px] text-blue-600">
                            Forwarded from Store
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 cell-truncate" title={req.departmentName || 'N/A'}>
                      {req.departmentName || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 cell-truncate" title={req.requestedByName || req.requestedByEmail || 'N/A'}>
                      {req.requestedByName || req.requestedByEmail || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold">
                        {req.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <Badge variant={getStatusVariant(req.status)}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      {new Date(req.requisitionDate).toLocaleDateString()}
                    </td>
                    <td className="td-action w-36 px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => window.open(`/dashboard/pr-print/${req.id}`, '_blank')}
                          className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                        >
                          Print
                        </button>
                        <button
                          onClick={() => handleViewDetails(req.id)}
                          className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          View
                        </button>
                        {req.status.toLowerCase() === 'approved' && (
                          <button
                            onClick={() => handleCreateRFQ(req.id)}
                            className="text-xs px-2.5 py-1.5 text-white font-medium rounded transition-colors"
                            style={{ backgroundColor: COLORS.PURCHASE }}
                          >
                            Create RFQ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequisitionListPage;

// src/pages/dashboard/DeptHeadRequisitionsPage.tsx
import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeRequisitionApi, EmployeeRequisition } from '../../api/employeeRequisitionApi';
import {
  StatsHeader,
  FilterBar,
  FilterField,
  Badge,
  COLORS
} from '../../components/form';

const DeptHeadRequisitionsPage = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<EmployeeRequisition[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<EmployeeRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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
      const response = await employeeRequisitionApi.getAllRequisitions();
      const data = response.data || response;
      // Filter only pending requisitions for dept head
      const pending = data
        .filter((r: EmployeeRequisition) =>
          r.status?.toLowerCase() === 'pending_dept_head' || r.status?.toLowerCase() === 'submitted'
        )
        .map((r: EmployeeRequisition) => ({
          ...r,
          // Department Head pending list must not expose stock data
          items: (r.items || []).map((item) => ({
            id: item.id,
            itemId: item.itemId,
            itemName: item.itemName,
            requiredQty: item.requiredQty,
            remarks: item.remarks
          }))
        }));
      setRequisitions(pending);
    } catch (err: any) {
      console.error('Error loading requisitions:', err);
      setError(err.response?.data?.message || 'Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  const filterRequisitions = () => {
    let filtered = [...requisitions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.requisitionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedByEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredRequisitions(filtered);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/dashboard/requisitions/${id}`);
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApprove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Approve this requisition?\n\nThis will forward it to the Store Department.')) {
      return;
    }
    try {
      await employeeRequisitionApi.approveRequisition(id);
      alert('✅ Requisition approved and forwarded to Store!');
      await loadRequisitions();
    } catch (err: any) {
      console.error('Error approving:', err);
      alert(err.response?.data?.message || 'Failed to approve requisition');
    }
  };

  const handleReject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Reject this requisition?')) {
      return;
    }
    try {
      await employeeRequisitionApi.deleteRequisition(id);
      alert('✅ Requisition rejected successfully!');
      await loadRequisitions();
    } catch (err: any) {
      console.error('Error rejecting:', err);
      alert(err.response?.data?.message || 'Failed to reject requisition');
    }
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending_dept_head':
      case 'submitted':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending_dept_head': return 'Pending';
      case 'submitted': return 'Submitted';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading pending requisitions...</p>
          </div>
        </div>
      </div>
    );
  };

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
        accentColor={COLORS.REQUISITION}
        icon="✅"
        title="Department Head - Pending Approvals"
        subtitle="Review and approve employee requisitions from your department"
        stats={[
          { label: 'Total Pending', value: requisitions.length },
          { label: 'New Requests', value: requisitions.filter(r => r.status.toLowerCase() === 'submitted' || r.status.toLowerCase() === 'pending_dept_head').length },
          { label: 'Ready to Review', value: requisitions.filter(r => r.status.toLowerCase() === 'submitted' || r.status.toLowerCase() === 'pending_dept_head').length },
          { label: 'Filtered', value: filteredRequisitions.length }
        ]}
      />

      <FilterBar onSearch={filterRequisitions} onReset={() => { setSearchTerm(''); setStatusFilter('all'); }}>
        <FilterField label="Search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by REQ#, department, or requester..."
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
            <option value="submitted">Submitted</option>
            <option value="pending_dept_head">Pending</option>
          </select>
        </FilterField>
      </FilterBar>

      {filteredRequisitions.length === 0 ? (
        <div className="bg-white rounded-lg border-[0.5px] border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Requisitions</h3>
          <p className="text-sm text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No requisitions match your filters' 
              : 'All requisitions have been processed'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left w-12"></th>
                  <th className="px-3 py-2.5 text-left">REQ Number</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5 text-left">Requested By</th>
                  <th className="px-3 py-2.5">Items</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="th-action w-44 px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.map((req) => {
                  const isExpanded = expandedRows.has(req.id);
                  return (
                    <Fragment key={req.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                        <td className="px-3 py-2.5 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(req.id)}
                            className="w-6 h-6 inline-flex items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors"
                            title={isExpanded ? 'Collapse items' : 'Expand items'}
                            aria-label={isExpanded ? 'Collapse requisition row' : 'Expand requisition row'}
                          >
                            {isExpanded ? '▾' : '▸'}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(req.id)}
                            className="text-left text-purple-600 hover:text-purple-800"
                          >
                            {req.requisitionNo}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={req.departmentName || 'N/A'}>
                          {req.departmentName || 'N/A'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={req.requestedByName || req.requestedByEmail}>
                          {req.requestedByName || req.requestedByEmail}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <Badge variant="info">{req.items?.length || 0} items</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-center whitespace-nowrap">
                          {new Date(req.createdDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <Badge variant={getStatusColor(req.status)}>
                            {getStatusLabel(req.status)}
                          </Badge>
                        </td>
                        <td className="td-action w-44 px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(req.id);
                              }}
                              className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                              View
                            </button>
                            {req.canApprove && (
                              <button
                                onClick={(e) => handleApprove(req.id, e)}
                                className="text-xs px-2.5 py-1.5 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
                              >
                                ✓ Approve
                              </button>
                            )}
                            <button
                              onClick={(e) => handleReject(req.id, e)}
                              className="text-xs px-2.5 py-1.5 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
                              <div className="px-3 py-2 border-b border-slate-200 text-[12px] font-semibold text-slate-700">
                                Items for {req.requisitionNo}
                              </div>
                              {req.items && req.items.length > 0 ? (
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Item Name</th>
                                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Required Qty</th>
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {req.items.map((item) => (
                                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-3 py-2.5 text-[13px] text-slate-800 font-medium cell-truncate">{item.itemName}</td>
                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                          <Badge variant="info">{item.requiredQty}</Badge>
                                        </td>
                                        <td className="px-3 py-2.5 text-[13px] text-slate-700 cell-truncate">{item.remarks || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="px-3 py-4 text-[13px] text-slate-500">No items available for this requisition.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptHeadRequisitionsPage;

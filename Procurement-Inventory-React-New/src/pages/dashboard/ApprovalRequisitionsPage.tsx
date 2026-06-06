// src/pages/dashboard/ApprovalRequisitionsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requisitionApi } from '../../api/requisitionApi';
import { useAuth } from '../../context/AuthContext';
import { PurchaseRequisition, RequisitionItem } from '../../types';
import {
  StatsHeader,
  FilterBar,
  FilterField,
  Badge,
  COLORS
} from '../../components/form';

const ApprovalRequisitionsPage = () => {
  const { hasPermission, isAdmin, roles } = useAuth();
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Check if user is DepartmentHead (should see Employee Requisitions)
  const isDeptHead = roles.includes('DepartmentHead');

  useEffect(() => {
    // Check if user has approval permission
    if (!hasPermission('requisition:approve') && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    // If DepartmentHead, redirect to Employee Requisition page
    if (isDeptHead && !isAdmin) {
      navigate('/dashboard/dept-head-approvals');
      return;
    }
    
    loadRequisitions();
  }, []);

  useEffect(() => {
    filterRequisitions();
  }, [requisitions, searchTerm, statusFilter]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const response = await requisitionApi.getRequisitionsForApproval(1, 100);
      const data = response.data || response;
      setRequisitions(data);
    } catch (error) {
      console.error('Error loading requisitions for approval:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequisitions = () => {
    let filtered = [...requisitions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    navigate(`/dashboard/purchase-requisitions/${id}`);
  };

  const handleApprove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Approve this requisition?')) return;
    try {
      await requisitionApi.approveRequisition(id);
      alert('✅ Requisition approved successfully!');
      await loadRequisitions();
    } catch (error: any) {
      console.error('Error approving requisition:', error);
      alert(error?.response?.data?.message || 'Error approving requisition');
    }
  };

  const handleReject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    try {
      await requisitionApi.rejectRequisition(id, { reason });
      alert('✅ Requisition rejected successfully!');
      await loadRequisitions();
    } catch (error: any) {
      console.error('Error rejecting requisition:', error);
      alert(error?.response?.data?.message || 'Error rejecting requisition');
    }
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rfqsent': return 'info';
      case 'pocreated': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading requisitions for approval...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <StatsHeader
        accentColor={COLORS.PURCHASE}
        icon="✅"
        title="Requisitions for Approval"
        subtitle="Review and approve purchase requisitions from your department"
        stats={[
          { label: 'Total Pending', value: requisitions.length },
          { label: 'Pending', value: requisitions.filter(r => r.status.toLowerCase() === 'pending').length },
          { label: 'Approved', value: requisitions.filter(r => r.status.toLowerCase() === 'approved').length },
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
            className="w-full px-3 py-2 border-[0.5px] border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </FilterField>
        <FilterField label="Status">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border-[0.5px] border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </FilterField>
      </FilterBar>

      {filteredRequisitions.length === 0 ? (
        <div className="bg-white rounded-lg border-[0.5px] border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Requisitions</h3>
          <p className="text-sm text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No requisitions match your filters' 
              : 'There are no requisitions waiting for your approval'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-gray-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left">REQ Number</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5 text-left">Requested By</th>
                  <th className="px-3 py-2.5">Created</th>
                  <th className="px-3 py-2.5">Required By</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="th-action w-44 px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.map((req) => (
                  <tr
                    key={req.id}
                    className="cursor-pointer"
                    onClick={() => handleViewDetails(req.id)}
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                      {req.requisitionNumber}
                    </td>
                    <td className="px-3 py-2.5 cell-truncate" title={req.departmentName || 'N/A'}>
                      {req.departmentName || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 cell-truncate" title={req.requestedByName || req.requestedByEmail}>
                      {req.requestedByName || req.requestedByEmail}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      {new Date(req.requisitionDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      {new Date(req.requiredByDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <Badge variant={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="td-action w-44 px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(req.id)}
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
                        {req.canReject && (
                          <button
                            onClick={(e) => handleReject(req.id, e)}
                            className="text-xs px-2.5 py-1.5 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            ✕ Reject
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

export default ApprovalRequisitionsPage;

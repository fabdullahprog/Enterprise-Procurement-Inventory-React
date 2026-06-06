// src/pages/dashboard/MyRequisitionsPage.tsx
import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeRequisitionApi, EmployeeRequisition } from '../../api/employeeRequisitionApi';
import { masterDataApi } from '../../api/masterDataApi';
import { useAuth } from '../../context/AuthContext';
import { Department } from '../../types';
import {
  StatsHeader,
  FilterBar,
  FilterField,
  Input,
  Select,
  Badge,
  COLORS
} from '../../components/form';

const MyRequisitionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Data states
  const [requisitions, setRequisitions] = useState<EmployeeRequisition[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<EmployeeRequisition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [prNumber, setPrNumber] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    forwarded: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requisitions, prNumber, statusFilter, departmentFilter, dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqResponse, deptResponse] = await Promise.all([
        employeeRequisitionApi.getMyRequisitions(),
        masterDataApi.getDepartments()
      ]);
      
      const reqData = reqResponse.data || reqResponse;
      const deptData = deptResponse.data || deptResponse;
      
      console.log('📋 Employee Requisitions loaded:', reqData);
      
      setRequisitions(reqData);
      setDepartments(deptData);
      calculateStats(reqData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: EmployeeRequisition[]) => {
    setStats({
      total: data.length,
      draft: data.filter(r => r.status.toLowerCase() === 'draft').length,
      submitted: data.filter(r => r.status.toLowerCase() === 'submitted').length,
      approved: data.filter(r => r.status.toLowerCase() === 'approved').length,
      forwarded: data.filter(r => r.status.toLowerCase() === 'forwarded').length
    });
  };

  const applyFilters = () => {
    let filtered = [...requisitions];

    // Requisition Number filter
    if (prNumber.trim()) {
      filtered = filtered.filter(r => 
        r.requisitionNo.toLowerCase().includes(prNumber.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(r => 
        r.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(r => 
        r.departmentId === parseInt(departmentFilter)
      );
    }

    // Date From filter
    if (dateFrom) {
      filtered = filtered.filter(r => 
        new Date(r.createdDate) >= new Date(dateFrom)
      );
    }

    // Date To filter
    if (dateTo) {
      filtered = filtered.filter(r => 
        new Date(r.createdDate) <= new Date(dateTo)
      );
    }

    setFilteredRequisitions(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleClear = () => {
    setPrNumber('');
    setStatusFilter('');
    setDepartmentFilter('');
    setDateFrom('');
    setDateTo('');
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

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusLabel = statusLower === 'revised' ? 'Revise' : status;
    switch (statusLower) {
      case 'draft': return <Badge variant="default">{statusLabel}</Badge>;
      case 'revised': return <Badge variant="danger">{statusLabel}</Badge>;
      case 'submitted': return <Badge variant="warning">{statusLabel}</Badge>;
      case 'approved': return <Badge variant="success">{statusLabel}</Badge>;
      case 'forwarded': return <Badge variant="info">{statusLabel}</Badge>;
      default: return <Badge>{statusLabel}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading requisitions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <StatsHeader
        accentColor={COLORS.REQUISITION}
        icon="📋"
        title="My Requisitions"
        subtitle="View and manage your employee requisitions"
        stats={[
          { label: 'Total', value: stats.total },
          { label: 'Draft', value: stats.draft },
          { label: 'Submitted', value: stats.submitted },
          { label: 'Approved', value: stats.approved }
        ]}
      />

      <FilterBar
        onSearch={handleSearch}
        onReset={handleClear}
      >
        <FilterField label="REQ Number">
          <Input
            value={prNumber}
            onChange={(e) => setPrNumber(e.target.value)}
            placeholder="Search..."
          />
        </FilterField>

        <FilterField label="Status">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="forwarded">Forwarded</option>
          </Select>
        </FilterField>

        <FilterField label="Department">
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label="Date From">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </FilterField>

        <FilterField label="Date To">
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </FilterField>

        <FilterField label="Show">
          <Select
            value={pageSize.toString()}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </FilterField>
      </FilterBar>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-600">
            Showing {filteredRequisitions.length} of {requisitions.length} requisitions
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/create-employee-requisition')}
          className="px-4 py-2 text-white text-sm font-medium rounded-md transition-colors"
          style={{ backgroundColor: COLORS.REQUISITION }}
        >
          + New Employee Requisition
        </button>
      </div>

      {/* Table */}
      {filteredRequisitions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No requisitions found</h3>
          <p className="text-sm text-gray-600 mb-4">Try adjusting your filters or create a new requisition</p>
          <button
            onClick={() => navigate('/dashboard/create-employee-requisition')}
            className="px-4 py-2 text-white text-sm font-medium rounded-md"
            style={{ backgroundColor: COLORS.REQUISITION }}
          >
            Create Requisition
          </button>
        </div>
      ) : (
        <div className="bg-white border-[0.5px] border-gray-300 rounded-lg overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left w-12"></th>
                  <th className="px-3 py-2.5 text-left">REQ Number</th>
                  <th className="px-3 py-2.5 text-left">Date</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5">Items</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">Requested By</th>
                  <th className="th-action w-20 px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.slice(0, pageSize).map((req) => {
                  const isExpanded = expandedRows.has(req.id);
                  return (
                    <Fragment key={req.id}>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleRowExpansion(req.id)}
                            className="w-6 h-6 inline-flex items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors"
                            title={isExpanded ? 'Collapse items' : 'Expand items'}
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            {isExpanded ? '▾' : '▸'}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-purple-600 whitespace-nowrap">{req.requisitionNo}</td>
                        <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{new Date(req.createdDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={req.departmentName}>{req.departmentName}</td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <Badge variant="info">{req.items?.length || 0} items</Badge>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                        <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={req.requestedByName || req.requestedByEmail}>{req.requestedByName || req.requestedByEmail}</td>
                        <td className="td-action w-20 px-3 py-2.5 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(req.id)}
                            className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title="View Details"
                          >
                            View
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="rounded-md border border-slate-200 bg-white">
                              <div className="px-3 py-2 border-b border-slate-200 text-[12px] font-semibold text-slate-700">
                                Items for {req.requisitionNo}
                              </div>
                              {req.items && req.items.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Item</th>
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
                                </div>
                              ) : (
                                <div className="px-3 py-4 text-[13px] text-slate-500">No items found for this requisition.</div>
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

export default MyRequisitionsPage;

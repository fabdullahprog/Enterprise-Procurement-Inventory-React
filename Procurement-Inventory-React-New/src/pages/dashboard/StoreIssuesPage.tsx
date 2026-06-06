// src/pages/dashboard/StoreIssuesPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeIssueApi, StoreIssue } from '../../api/storeIssueApi';
import './my-requisitions.css';

const StoreIssuesPage = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<StoreIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<StoreIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [requisitionNo, setRequisitionNo] = useState('');
  const [issueTypeFilter, setIssueTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    full: 0,
    partial: 0,
    forwarded: 0
  });

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, requisitionNo, issueTypeFilter, statusFilter, dateFrom, dateTo]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeIssueApi.getIssues();
      const data = response.data || response;
      setIssues(data);
      calculateStats(data);
    } catch (err: any) {
      console.error('Error loading issues:', err);
      setError(err.response?.data?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: StoreIssue[]) => {
    setStats({
      total: data.length,
      full: data.filter(i => i.issueType.toLowerCase() === 'full').length,
      partial: data.filter(i => i.issueType.toLowerCase() === 'partial').length,
      forwarded: data.filter(i => i.status.toLowerCase() === 'forwarded_to_purchase').length
    });
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (requisitionNo.trim()) {
      filtered = filtered.filter(i => 
        i.requisitionNo?.toLowerCase().includes(requisitionNo.toLowerCase())
      );
    }

    if (issueTypeFilter) {
      filtered = filtered.filter(i => 
        i.issueType.toLowerCase() === issueTypeFilter.toLowerCase()
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(i => 
        i.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(i => 
        new Date(i.issuedAt) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(i => 
        new Date(i.issuedAt) <= new Date(dateTo)
      );
    }

    setFilteredIssues(filtered);
  };

  const handleClear = () => {
    setRequisitionNo('');
    setIssueTypeFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const getIssueTypeBadge = (issueType: string) => {
    const type = issueType.toLowerCase();
    switch (type) {
      case 'full': return 'badge-approved';
      case 'partial': return 'badge-pending';
      case 'forwarded': return 'badge-rfq';
      default: return 'badge-default';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'issued': return 'badge-approved';
      case 'forwarded_to_purchase': return 'badge-rfq';
      default: return 'badge-default';
    }
  };

  if (loading) {
    return (
      <div className="my-requisitions-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading store issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-requisitions-page">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={loadIssues} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requisitions-page">
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card stat-total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Issues</div>
        </div>
        <div className="stat-card stat-approved">
          <div className="stat-value">{stats.full}</div>
          <div className="stat-label">Full Issues</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-value">{stats.partial}</div>
          <div className="stat-label">Partial Issues</div>
        </div>
        <div className="stat-card stat-rfq">
          <div className="stat-value">{stats.forwarded}</div>
          <div className="stat-label">Forwarded</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-row-top">
          <div className="filter-group">
            <label>Requisition Number</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Search..."
              value={requisitionNo}
              onChange={(e) => setRequisitionNo(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Issue Type</label>
            <select
              className="filter-select"
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full">Full</option>
              <option value="partial">Partial</option>
              <option value="forwarded">Forwarded</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="issued">Issued</option>
              <option value="forwarded_to_purchase">Forwarded to Purchase</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              className="filter-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              className="filter-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-row-bottom">
          <div className="filter-actions">
            <button className="btn-search" onClick={applyFilters}>
              Search
            </button>
            <button className="btn-clear" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header-section">
        <div className="header-left">
          <h1 className="page-title">Store Issues History</h1>
          <p className="page-subtitle">View all product issues and forwards</p>
        </div>
        <div className="header-right">
          <button 
            className="btn-new-requisition"
            onClick={() => navigate('/dashboard/store/pending-requisitions')}
          >
            ← Back to Pending
          </button>
        </div>
      </div>

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No issues found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left w-12">#</th>
                  <th className="px-3 py-2.5 text-left">Requisition No</th>
                  <th className="px-3 py-2.5 text-left">Item Name</th>
                  <th className="px-3 py-2.5 text-center">Required Qty</th>
                  <th className="px-3 py-2.5 text-center">Issued Qty</th>
                  <th className="px-3 py-2.5 text-center">Issue Type</th>
                  <th className="px-3 py-2.5 text-left">Issued By</th>
                  <th className="px-3 py-2.5 text-center">Issued Date</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.map((issue, index) => (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">{issue.requisitionNo}</td>
                    <td className="px-3 py-2.5 text-slate-800 cell-truncate" title={issue.itemName}>{issue.itemName}</td>
                    <td className="px-3 py-2.5 text-center text-slate-700 whitespace-nowrap">{issue.requiredQty}</td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <strong className="text-slate-900">{issue.issuedQty}</strong>
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className={`status-badge ${getIssueTypeBadge(issue.issueType)}`}>
                        {issue.issueType}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={issue.issuedByName}>{issue.issuedByName}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap">{new Date(issue.issuedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className={`status-badge ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={issue.remarks || '-'}>{issue.remarks || '-'}</td>
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

export default StoreIssuesPage;

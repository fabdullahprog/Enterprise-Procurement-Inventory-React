// src/pages/dashboard/RFQQuotationsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import { useAuth } from '../../context/AuthContext';
import './rfq-quotations.css';

interface Quotation {
  id: number;
  quotationNumber: string;
  quotationDate: string;
  totalBDTAmount: number;
  deliveryDays: number;
  supplierName: string;
  status: string;
}

const RFQQuotationsPage = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { roles } = useAuth();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPurchaseRole = roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager'].includes(r));

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
    loadQuotations();
  }, [rfqId]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rfqApi.getQuotationsByRFQ(Number(rfqId));
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quotations');
      console.error('Error loading quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Selected': 'status-selected',
      'Rejected': 'status-rejected',
    };
    return colors[status] || 'status-default';
  };

  const getLowestPrice = () => {
    if (quotations.length === 0) return 0;
    return Math.min(...quotations.map(q => q.totalBDTAmount));
  };

  if (loading) {
    return (
      <div className="rfq-quotations-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rfq-quotations-page">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={loadQuotations} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const lowestPrice = getLowestPrice();

  return (
    <div className="rfq-quotations-page page-enter">
      <div className="page-header">
        <div>
          <h1>Supplier Quotations</h1>
          <p>RFQ #{rfqId}</p>
        </div>
        <div className="header-actions">
          {isPurchaseRole && (
            <>
              <button
                onClick={() => navigate(`/dashboard/rfq/${rfqId}/submit-quotation`)}
                className="btn btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Quotation
              </button>
              {quotations.length > 0 && (
                <button
                  onClick={() => navigate(`/dashboard/rfq/${rfqId}/create-cs`)}
                  className="btn btn-primary"
                >
                  Create Comparative Statement
                </button>
              )}
            </>
          )}
          <button onClick={() => navigate('/dashboard/rfqs')} className="btn btn-secondary">
            Back to RFQs
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {quotations.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <h3>No Quotations Yet</h3>
          <p>No suppliers have submitted quotations for this RFQ</p>
          {isPurchaseRole && (
            <button
              onClick={() => navigate(`/dashboard/rfq/${rfqId}/submit-quotation`)}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Submit First Quotation
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(79, 142, 247, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Quotations</span>
                <span className="stat-value">{quotations.length}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Lowest Price</span>
                <span className="stat-value">{lowestPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(251, 146, 60, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Avg Delivery</span>
                <span className="stat-value">
                  {Math.round(quotations.reduce((sum, q) => sum + q.deliveryDays, 0) / quotations.length)} days
                </span>
              </div>
            </div>
          </div>

          {/* Quotations Table */}
          <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mt-6">
            <div className="w-full overflow-x-auto relative">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr>
                    <th className="px-3 py-2.5 text-left">Quotation #</th>
                    <th className="px-3 py-2.5 text-left">Supplier</th>
                    <th className="px-3 py-2.5 text-center">Date</th>
                    <th className="px-3 py-2.5 text-right">Total Amount (BDT)</th>
                    <th className="px-3 py-2.5 text-center">Delivery Days</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="th-action w-24 px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map(quotation => (
                    <tr key={quotation.id} className={`hover:bg-slate-50/50 transition-colors ${quotation.totalBDTAmount === lowestPrice ? 'bg-emerald-50/30' : ''}`}>
                      <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                        {quotation.quotationNumber}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 cell-truncate" title={quotation.supplierName}>
                        {quotation.supplierName}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap">
                        {new Date(quotation.quotationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <span className="font-semibold text-slate-900">
                          {quotation.totalBDTAmount.toLocaleString()}
                        </span>
                        {quotation.totalBDTAmount === lowestPrice && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Lowest</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-700 whitespace-nowrap">
                        {quotation.deliveryDays} days
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`status-badge ${getStatusColor(quotation.status)}`}>
                          {quotation.status}
                        </span>
                      </td>
                      <td className="td-action w-24 px-3 py-2.5 whitespace-nowrap">
                        <button
                          className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 w-full"
                          onClick={() => navigate(`/dashboard/quotation/${quotation.id}`)}
                          title="View Details"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RFQQuotationsPage;

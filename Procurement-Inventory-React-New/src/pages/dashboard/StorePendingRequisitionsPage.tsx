// src/pages/dashboard/StorePendingRequisitionsPage.tsx
import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeIssueApi } from '../../api/storeIssueApi';
import IssueProductModal from '../../components/store/IssueProductModal';
import './my-requisitions.css';

interface RequisitionItem {
  itemId: number;
  itemName: string;
  category?: string | null;
  categoryName?: string | null;
  requiredQty: number;
  currentStock: number;
  liveStockCount?: number;
  remarks?: string;
}

// Revert to original behavior: ignore any backend stock calculations.
// This page intentionally shows `0` available units again.
const getLiveStock = (_item: RequisitionItem) => 0;

interface PendingRequisition {
  id: number;
  requisitionNo: string;
  items: RequisitionItem[];
  requestedBy: number;
  requestedByName?: string;
  departmentId: number;
  departmentName?: string;
  status: string;
  notes?: string;
  forwardedAt?: string;
  createdDate: string;
}

const StorePendingRequisitionsPage = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<PendingRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [issueTarget, setIssueTarget] = useState<PendingRequisition | null>(null);

  // ---- Selection helpers ----
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === requisitions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requisitions.map((r) => r.id)));
    }
  };

  // ---- Consolidated PR: merge items across selected requisitions ----
  const handleCreateConsolidatedPR = () => {
    const selected = requisitions.filter((r) => selectedIds.has(r.id));
    if (selected.length === 0) return;

    // Collect all deficit items, then merge duplicates by productId
    const mergedMap = new Map<number, { productId: number; productName: string; quantity: number; remarks: string }>();

    for (const req of selected) {
      for (const item of req.items) {
        const shortage = item.requiredQty - getLiveStock(item);
        if (shortage <= 0) continue;

        const existing = mergedMap.get(item.itemId);
        if (existing) {
          existing.quantity += shortage;
          // Append unique remarks
          if (item.remarks && !existing.remarks.includes(item.remarks)) {
            existing.remarks = existing.remarks
              ? `${existing.remarks}; ${item.remarks}`
              : item.remarks;
          }
        } else {
          mergedMap.set(item.itemId, {
            productId: item.itemId,
            productName: item.itemName,
            quantity: shortage,
            remarks: item.remarks || '',
          });
        }
      }
    }

    const mergedItems = Array.from(mergedMap.values());
    if (mergedItems.length === 0) return;

    const refNumbers = selected.map((r) => r.requisitionNo).join(', ');

    navigate('/dashboard/create-requisition', {
      state: {
        fromRequisition: refNumbers,
        sourceRequisitionIds: selected.map(r => r.id),
        items: mergedItems,
        notes: `Consolidated PR from: ${refNumbers}`,
      },
    });
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeIssueApi.getPendingRequisitions();
      
      // DEBUG: Log the full raw response
      console.log('=== STORE PENDING REQUISITIONS DEBUG ===');
      console.log('FULL RAW RESPONSE:', JSON.stringify(response, null, 2));
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      console.log('Has success field?', 'success' in response);
      console.log('Has data field?', 'data' in response);
      console.log('========================================');
      
      // Response is { success: true, data: [...] }
      console.log('📦 Pending Requisitions - Raw response:', response);
      const requisitionsData = response.data || [];
      console.log('📦 Pending Requisitions - Data array:', requisitionsData);
      setRequisitions(requisitionsData);
    } catch (err: any) {
      console.error('❌ Error loading requisitions:', err);
      setError(err.response?.data?.message || 'Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = (requisitionId: number) => {
    navigate(`/dashboard/store/issue/${requisitionId}`);
  };

  const toggleRowExpansion = (requisitionId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(requisitionId)) {
        next.delete(requisitionId);
      } else {
        next.add(requisitionId);
      }
      return next;
    });
  };


  const handleCheckStock = async (productId: number, productName: string) => {
    try {
      const response = await storeIssueApi.checkStock(productId);
      const data = response.data || response;
      
      let message = `📦 Stock Information for ${productName}\n\n`;
      message += `Available Stock: ${data.availableStock} units\n\n`;
      
      if (data.inventoryDetails && data.inventoryDetails.length > 0) {
        message += 'Storage Locations:\n';
        data.inventoryDetails.forEach((inv: any) => {
          message += `  • Location ${inv.storageLocationId}: ${inv.availableQuantity} units (Batch ${inv.batchId})\n`;
        });
      } else {
        message += 'No stock available in any location.';
      }
      
      alert(message);
    } catch (err: any) {
      console.error('Error checking stock:', err);
      alert('Failed to check stock');
    }
  };

  // Calculate stats based on requisitions (not items)
  const totalRequisitions = requisitions.length;
  
  // Stock Available = requisitions where ALL items have sufficient stock
  const stockAvailable = requisitions.filter((req) =>
    req.items.every((item) => getLiveStock(item) >= item.requiredQty)
  ).length;

  const stockUnavailable = requisitions.filter((req) =>
    req.items.some((item) => getLiveStock(item) < item.requiredQty)
  ).length;

  if (loading) {
    return (
      <div className="my-requisitions-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading pending requisitions...</p>
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
          <button onClick={loadRequisitions} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="my-requisitions-page">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="header-left">
          <h1 className="page-title">Store - Pending Requisitions</h1>
          <p className="page-subtitle">Requisitions forwarded from department heads</p>
        </div>
        <div className="header-right">
          <button 
            className="btn-new-requisition"
            onClick={() => navigate('/dashboard/store/issues')}
          >
            📋 View Issue History
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="stats-cards">
        <div className="stat-card stat-total">
          <div className="stat-value">{totalRequisitions}</div>
          <div className="stat-label">Pending Requisitions</div>
        </div>
        <div className="stat-card stat-approved">
          <div className="stat-value">{requisitions.reduce((sum, req) => sum + req.items.length, 0)}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-value">{stockAvailable}</div>
          <div className="stat-label">Stock Available</div>
        </div>
        <div className="stat-card stat-rejected">
          <div className="stat-value">{stockUnavailable}</div>
          <div className="stat-label">Stock Unavailable</div>
        </div>
      </div>

      {/* Requisitions Table */}
      {requisitions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No pending requisitions</h3>
          <p>All requisitions have been processed</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mt-6">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={requisitions.length > 0 && selectedIds.size === requisitions.length}
                      onChange={toggleSelectAll}
                      title="Select all"
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left w-12"></th>
                  <th className="px-3 py-2.5 text-left">Req Number</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5 text-left">Requested By</th>
                  <th className="px-3 py-2.5">Items Count</th>
                  <th className="px-3 py-2.5">Forwarded Date</th>
                  <th className="th-action w-56 px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => {
                  const hasAllStock = req.items.every((item) => getLiveStock(item) >= item.requiredQty);
                  const hasPartialStock = req.items.some((item) => getLiveStock(item) >= item.requiredQty);
                  const hasNoStock = req.items.every((item) => getLiveStock(item) < item.requiredQty);
                  const hasStockDeficit = req.items.some((item) => getLiveStock(item) < item.requiredQty);
                  const isExpanded = expandedRows.has(req.id);
                  
                  return (
                    <Fragment key={req.id}>
                      <tr className={`${selectedIds.has(req.id) ? 'bg-purple-50/60' : 'hover:bg-slate-50/50'} transition-colors border-b border-slate-100`}>
                        <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(req.id)}
                            onChange={() => toggleSelect(req.id)}
                            className="w-4 h-4 accent-purple-600 cursor-pointer"
                          />
                        </td>
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
                          <span className="text-slate-900">{req.requisitionNo}</span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={req.departmentName || 'N/A'}>
                          {req.departmentName || 'N/A'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 cell-truncate" title={req.requestedByName || 'N/A'}>
                          {req.requestedByName || 'N/A'}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap text-slate-700">
                          <strong className="text-slate-900">{req.items.length}</strong> items
                          {hasAllStock && ' ✅'}
                          {hasPartialStock && !hasAllStock && ' ⚠️'}
                          {hasNoStock && ' ❌'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-center whitespace-nowrap">
                          {req.forwardedAt 
                            ? new Date(req.forwardedAt).toLocaleDateString()
                            : new Date(req.createdDate).toLocaleDateString()
                          }
                        </td>
                        <td className="td-action w-56 px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100"
                              onClick={() => handleIssue(req.id)}
                              title="View Details & Issue"
                            >
                              👁️ View
                            </button>
                            <button
                              className="text-xs px-2.5 py-1.5 text-white font-medium rounded transition-colors"
                              onClick={() => setIssueTarget(req)}
                              title="Issue products from this requisition"
                              style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                            >
                              📤 Issue
                            </button>
                            <button
                              className={`text-xs px-2.5 py-1.5 font-medium rounded transition-colors border ${hasStockDeficit ? 'border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'}`}
                              onClick={() => {
                                const deficitItems = req.items
                                  .filter((item) => getLiveStock(item) < item.requiredQty)
                                  .map((item) => ({
                                    productId: item.itemId,
                                    productName: item.itemName,
                                    quantity: item.requiredQty - getLiveStock(item),
                                    remarks: item.remarks || '',
                                  }));

                                if (deficitItems.length > 0) {
                                  navigate('/dashboard/create-requisition', {
                                    state: {
                                      fromRequisition: req.requisitionNo,
                                      requisitionId: req.id,
                                      sourceRequisitionIds: [req.id],
                                      items: deficitItems,
                                      notes: req.notes || '',
                                    },
                                  });
                                }
                              }}
                              disabled={!hasStockDeficit}
                              title={
                                hasStockDeficit
                                  ? 'Create Purchase Requisition for stock shortages'
                                  : 'All items have sufficient stock; forwarding is not required'
                              }
                            >
                              ➡️ Create PR
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
                              {req.items?.length ? (
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Product Name</th>
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Requested</th>
                                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Available</th>
                                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {req.items.map((item) => {
                                      const live = getLiveStock(item);
                                      const deficit = live < item.requiredQty;
                                      return (
                                        <tr
                                          key={`${req.id}-${item.itemId}`}
                                          className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors${deficit ? ' bg-red-50/30' : ''}`}
                                        >
                                          <td className="px-3 py-2.5 text-[13px] text-slate-800 font-medium cell-truncate">{item.itemName}</td>
                                          <td className="px-3 py-2.5 text-[13px] text-slate-700 cell-truncate">
                                            {item.categoryName ?? item.category ?? 'N/A'}
                                          </td>
                                          <td className="px-3 py-2.5 text-[13px] text-center whitespace-nowrap">{item.requiredQty}</td>
                                          <td
                                            className={`px-3 py-2.5 text-[13px] text-center whitespace-nowrap font-semibold${
                                              deficit ? ' text-red-600' : ' text-emerald-600'
                                            }`}
                                          >
                                            {live}
                                          </td>
                                          <td className="px-3 py-2.5 text-[13px] text-slate-700 cell-truncate">{item.remarks || '—'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
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

      {/* Floating Consolidated PR Bar */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderTop: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{ backgroundColor: '#7c3aed', color: '#fff' }}
              >
                {selectedIds.size}
              </span>
              <span className="text-white text-sm font-medium">
                requisition{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-purple-300 hover:text-white text-xs ml-1 underline underline-offset-2 transition-colors"
              >
                Clear
              </button>
            </div>
            <button
              onClick={handleCreateConsolidatedPR}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: '#fff',
                boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.6)';
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(124,58,237,0.4)';
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              🛒 Create Consolidated PR
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Issue Product Modal */}
    {issueTarget && (
      <IssueProductModal
        requisition={issueTarget}
        onClose={() => setIssueTarget(null)}
        onSuccess={() => {
          setIssueTarget(null);
          loadRequisitions();
        }}
      />
    )}
    </>
  );
};

export default StorePendingRequisitionsPage;

// src/pages/dashboard/IssueProductPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeIssueApi, StockInfo, PendingRequisition, RequisitionItem } from '../../api/storeIssueApi';
import './requisition.css';

// Revert to original behavior: ignore any backend stock calculations for now.
// This page intentionally shows `0` available units again.
const getLiveStock = (_item: RequisitionItem) => 0;

const IssueProductPage = () => {
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const navigate = useNavigate();

  const [requisition, setRequisition] = useState<PendingRequisition | null>(null);
  const [currentItem, setCurrentItem] = useState<RequisitionItem | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [issuedQty, setIssuedQty] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [requisitionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await storeIssueApi.getPendingRequisitionById(Number(requisitionId));
      const reqData = response.data;

      if (!reqData?.items?.length) {
        throw new Error('Requisition not found or has no items');
      }

      setRequisition(reqData);

      const firstItem = reqData.items[0];
      setCurrentItem(firstItem);

      const requiredQty = firstItem.requiredQty || 0;
      const live = getLiveStock(firstItem);

      if (live >= requiredQty) {
        setIssuedQty(requiredQty);
      } else if (live > 0) {
        setIssuedQty(live);
      } else {
        setIssuedQty(0);
      }

      try {
        const stockResponse = await storeIssueApi.checkStock(firstItem.itemId);
        setStockInfo(stockResponse.data);
      } catch {
        setStockInfo({
          productId: firstItem.itemId,
          productName: firstItem.itemName,
          availableStock: live,
          inventoryDetails: [],
        });
      }
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requisition || !currentItem) return;

    const available = getLiveStock(currentItem);

    if (issuedQty <= 0) {
      alert('Issued quantity must be greater than 0');
      return;
    }

    if (issuedQty > available) {
      alert(`Cannot issue ${issuedQty} units. Only ${available} units available in stock.`);
      return;
    }

    if (issuedQty > currentItem.requiredQty) {
      alert(`Cannot issue more than required quantity (${currentItem.requiredQty} units).`);
      return;
    }

    const issueType = issuedQty >= currentItem.requiredQty ? 'FULL' : 'PARTIAL';
    const confirmMsg = `Issue ${issuedQty} units of ${currentItem.itemName}?\n\nIssue Type: ${issueType}\nRequisition: ${requisition.requisitionNo}`;

    if (!confirm(confirmMsg)) return;

    try {
      setSubmitting(true);
      const response = await storeIssueApi.issueProduct({
        requisitionId: Number(requisitionId),
        issuedQty,
        remarks: remarks || undefined,
      });

      alert(
        `✅ ${response.message}\n\nIssued: ${response.data.issuedQuantity} units\nType: ${response.data.issueType}\nRemaining: ${response.data.remainingQuantity} units\nStatus: ${response.data.requisitionStatus}`
      );
      navigate('/dashboard/store/pending-requisitions');
    } catch (err: any) {
      console.error('Error issuing product:', err);
      alert(err.response?.data?.message || 'Failed to issue product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/store/pending-requisitions');
  };

  const handleForwardToPurchase = () => {
    if (!requisition) return;

    // Collect ALL items with a stock deficit
    const deficitItems = (requisition.items ?? [])
      .filter((item) => getLiveStock(item) < item.requiredQty)
      .map((item) => ({
        productId: item.itemId,
        productName: item.itemName,
        quantity: item.requiredQty - getLiveStock(item),
        remarks: item.remarks || '',
      }));

    if (deficitItems.length === 0) return;

    navigate('/dashboard/create-requisition', {
      state: {
        fromRequisition: requisition.requisitionNo,
        requisitionId: Number(requisitionId),
        items: deficitItems,
        notes: requisition.notes || '',
      },
    });
  };

  if (loading) {
    return (
      <div className="create-requisition page-enter">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading requisition...</p>
        </div>
      </div>
    );
  }

  if (error || !requisition || !currentItem) {
    return (
      <div className="create-requisition page-enter">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error || 'Requisition not found'}</p>
          <button onClick={handleCancel} className="btn btn-secondary">
            Back to Pending Requisitions
          </button>
        </div>
      </div>
    );
  }

  const items = requisition.items ?? [];
  const totalMissingUnits = items.reduce((sum, item) => {
    const short = item.requiredQty - getLiveStock(item);
    return sum + (short > 0 ? short : 0);
  }, 0);

  const hasStockDeficit = items.some((i) => getLiveStock(i) < i.requiredQty);
  const hasAnyZeroLive = items.some((i) => getLiveStock(i) === 0);

  const liveFirst = getLiveStock(currentItem);
  const maxIssueQty = Math.min(currentItem.requiredQty, liveFirst);
  const canIssue = liveFirst > 0;

  return (
    <div className="create-requisition page-enter">
      <div className="page-header">
        <h1>Issue Product</h1>
        <p>Issue product from store inventory</p>
      </div>

      {/* Requisition Info */}
      <div className="form-section">
        <h2>Requisition Details</h2>
        <div className="requisition-info-grid">
          <div className="info-field">
            <label>Requisition Number</label>
            <div className="info-value">{requisition.requisitionNo}</div>
          </div>
          <div className="info-field">
            <label>Primary line item</label>
            <div className="info-value">{currentItem.itemName}</div>
          </div>
          <div className="info-field">
            <label>Required Quantity (first line)</label>
            <div className="info-value">{currentItem.requiredQty} units</div>
          </div>
          <div className="info-field">
            <label>Department</label>
            <div className="info-value">{requisition.departmentName}</div>
          </div>
          <div className="info-field">
            <label>Requested By</label>
            <div className="info-value">{requisition.requestedByName || 'N/A'}</div>
          </div>
          <div className="info-field">
            <label>Status</label>
            <div className="info-value">
              <span className="status-badge badge-pending">{requisition.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock table */}
      <div className="form-section">
        <h2>Stock Availability</h2>
        <div className="summary-section card stock-availability-wrap">
          <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mt-2">
            <div className="w-full overflow-x-auto relative">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Item Name</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Requested Qty</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Available Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const live = getLiveStock(item);
                    const deficit = live < item.requiredQty;
                    return (
                      <tr key={`${item.itemId}-${item.itemName}`} className={`hover:bg-slate-50/50 transition-colors ${deficit ? 'bg-red-50/30' : ''}`}>
                        <td className="px-3 py-2.5 text-[13px] text-slate-800 font-medium cell-truncate">{item.itemName}</td>
                        <td className="px-3 py-2.5 text-[13px] text-slate-600">{item.categoryName ?? item.category ?? '—'}</td>
                        <td className="px-3 py-2.5 text-[13px] text-slate-700 text-center">{item.requiredQty}</td>
                        <td className={`px-3 py-2.5 text-[13px] text-center font-semibold ${deficit ? 'text-red-600' : 'text-emerald-600'}`}>{live}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalMissingUnits > 0 && (
            <div className="stock-missing-summary" role="status">
              <strong>Shortfall:</strong> {totalMissingUnits} unit(s) missing in total (sum of requested minus available,
              per line).
            </div>
          )}

          {stockInfo?.inventoryDetails && stockInfo.inventoryDetails.length > 0 && (
            <div className="inventory-details">
              <h4>Storage locations (first line item)</h4>
              {stockInfo.inventoryDetails.map((inv, idx) => {
                const locParts: string[] = [];
                if (inv.warehouseId) locParts.push(`WH #${inv.warehouseId}`);
                if (inv.floorId) locParts.push(`FL #${inv.floorId}`);
                if (inv.binId) locParts.push(`Bin #${inv.binId}`);
                const locLabel = locParts.length > 0 ? locParts.join(' ➔ ') : 'Unassigned';
                return (
                  <div key={idx} className="summary-row">
                    <span>
                      Location: {locLabel} (Batch {inv.batchId}):
                    </span>
                    <strong>{inv.availableQuantity} units</strong>
                  </div>
                );
              })}
            </div>
          )}

          {hasAnyZeroLive && (
            <div className="alert alert-error">
              ⚠️ No stock available! Please forward this requisition to purchase department.
            </div>
          )}
        </div>
      </div>

      {/* Issue Form */}
      {canIssue && (
        <form onSubmit={handleSubmit} className="requisition-form">
          <div className="form-section">
            <h2>Issue Details</h2>

            <div className="form-group">
              <label>Issued Quantity *</label>
              <input
                type="number"
                value={issuedQty}
                onChange={(e) => setIssuedQty(Number(e.target.value))}
                min={1}
                max={maxIssueQty}
                required
                disabled={submitting}
              />
              <small className="form-hint">
                Maximum: {maxIssueQty} units (Available: {liveFirst}, Required: {currentItem.requiredQty})
                {issuedQty >= currentItem.requiredQty && ' - Full Issue'}
                {issuedQty > 0 && issuedQty < currentItem.requiredQty && ' - Partial Issue'}
              </small>
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes about this issue..."
                rows={3}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="summary-section card">
            <h3>Issue Summary</h3>
            <div className="summary-row">
              <span>Issue Type:</span>
              <strong>{issuedQty >= currentItem.requiredQty ? 'FULL' : 'PARTIAL'}</strong>
            </div>
            <div className="summary-row">
              <span>Quantity to Issue:</span>
              <strong>{issuedQty} units</strong>
            </div>
            <div className="summary-row">
              <span>Remaining Quantity:</span>
              <strong>{currentItem.requiredQty - issuedQty} units</strong>
            </div>
            <div className="summary-row">
              <span>Stock After Issue:</span>
              <strong>{liveFirst - issuedQty} units</strong>
            </div>
          </div>

          <div className="form-actions form-actions-split">
            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </button>
            <div className="form-actions-right">
              <button
                type="button"
                className="btn btn-warning"
                onClick={handleForwardToPurchase}
                disabled={submitting || !hasStockDeficit}
                title={!hasStockDeficit ? 'Forward is available when at least one line is short on stock.' : undefined}
              >
                {submitting ? 'Forwarding...' : 'Forward to Purchase Department'}
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Issuing...' : 'Issue Product'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!canIssue && (
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={submitting}>
            Back
          </button>
          <button
            type="button"
            className="btn btn-warning"
            onClick={handleForwardToPurchase}
            disabled={submitting || !hasStockDeficit}
            title={!hasStockDeficit ? 'All lines have enough stock; forwarding is not needed.' : undefined}
          >
            {submitting ? 'Forwarding...' : 'Forward to Purchase Department'}
          </button>
        </div>
      )}
    </div>
  );
};

export default IssueProductPage;

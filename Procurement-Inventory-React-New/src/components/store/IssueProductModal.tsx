// src/components/store/IssueProductModal.tsx
import { useState, useEffect, useCallback } from 'react';
import { storeIssueApi, StockInfo } from '../../api/storeIssueApi';

// ──── Types ────
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

interface PendingRequisition {
  id: number;
  requisitionNo: string;
  items: RequisitionItem[];
  requestedByName?: string;
  departmentName?: string;
  status: string;
  notes?: string;
}

interface InventoryOption {
  key: string;
  batchId: number;
  batchNumber: string;
  warehouseId?: number;
  floorId?: number;
  zoneId?: number;
  aisleId?: number;
  rackId?: number;
  shelfId?: number;
  binId?: number;
  locationLabel: string;
  expiryDate?: string;
  availableQuantity: number;
}

interface SelectedStockState {
  batchId: number;
  warehouseId?: number;
  floorId?: number;
  binId?: number;
  zoneId?: number;
  aisleId?: number;
  rackId?: number;
  shelfId?: number;
}

interface ItemIssueState {
  itemId: number;
  selectedOptionKey: string;
  selectedStock?: SelectedStockState;
  issueQty: number;
  options: InventoryOption[];
  totalAvailable: number;
  loadingStock: boolean;
  error?: string;
}

interface IssueProductModalProps {
  requisition: PendingRequisition;
  onClose: () => void;
  onSuccess: () => void;
}

// ──── Styles ────
const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    position: 'relative' as const,
    width: '95%',
    maxWidth: '900px',
    maxHeight: '90vh',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    color: '#fff',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
  },
  headerSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    marginTop: '4px',
  },
  closeBtn: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  body: {
    padding: '20px 24px',
    overflowY: 'auto' as const,
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#64748b',
    borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle' as const,
  },
  select: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    background: '#fff',
    color: '#1e293b',
  },
  input: {
    width: '80px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    textAlign: 'center' as const,
  },
  inputError: {
    borderColor: '#ef4444',
    background: '#fef2f2',
  },
  badge: (color: string) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    background: color === 'green' ? '#dcfce7' : color === 'red' ? '#fef2f2' : '#fef9c3',
    color: color === 'green' ? '#166534' : color === 'red' ? '#991b1b' : '#854d0e',
  }),
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc',
  },
  btnCancel: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSubmit: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
    transition: 'all 0.2s',
  },
  btnSubmitDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(100,116,139,0.3)',
    borderTopColor: '#64748b',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  summaryCard: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  },
  summaryItem: {
    flex: '1 1 120px',
    padding: '12px 16px',
    borderRadius: '10px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '2px',
  },
};

// ──── Component ────
const IssueProductModal: React.FC<IssueProductModalProps> = ({
  requisition,
  onClose,
  onSuccess,
}) => {
  const [itemStates, setItemStates] = useState<ItemIssueState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Load batch and location data for all items
  const loadBatchData = useCallback(async () => {
    const initial: ItemIssueState[] = requisition.items.map((item) => ({
      itemId: item.itemId,
      selectedOptionKey: '',
      issueQty: 0,
      options: [],
      totalAvailable: 0,
      loadingStock: true,
    }));
    setItemStates(initial);

    const updated = await Promise.all(
      requisition.items.map(async (item) => {
        try {
          const res = await storeIssueApi.checkStock(item.itemId);
          const details = res.data.inventoryDetails || [];
          
          const options: InventoryOption[] = details
            .filter((d) => d.availableQuantity > 0)
            .map((d) => {
              // Build clean hierarchical label
              const locParts: string[] = [];
              if (d.warehouseId) locParts.push(`Warehouse #${d.warehouseId}`);
              if (d.floorId) locParts.push(`Floor #${d.floorId}`);
              if (d.zoneId) locParts.push(`Zone #${d.zoneId}`);
              if (d.binId) locParts.push(`Bin #${d.binId}`);
              const locationLabel = locParts.length > 0 ? locParts.join(' ➔ ') : 'Unassigned';

              // Unique key
              const key = `batch-${d.batchId}-wh-${d.warehouseId || 0}-floor-${d.floorId || 0}-bin-${d.binId || 0}`;

              return {
                key,
                batchId: d.batchId,
                batchNumber: d.batchNumber || `Batch #${d.batchId}`,
                warehouseId: d.warehouseId,
                floorId: d.floorId,
                zoneId: d.zoneId,
                aisleId: d.aisleId,
                rackId: d.rackId,
                shelfId: d.shelfId,
                binId: d.binId,
                locationLabel,
                expiryDate: d.expiryDate,
                availableQuantity: d.availableQuantity,
              };
            });

          const defaultOpt = options.length === 1 ? options[0] : null;
          return {
            itemId: item.itemId,
            selectedOptionKey: defaultOpt ? defaultOpt.key : '',
            selectedStock: defaultOpt ? {
              batchId: defaultOpt.batchId,
              warehouseId: defaultOpt.warehouseId,
              floorId: defaultOpt.floorId,
              binId: defaultOpt.binId,
              zoneId: defaultOpt.zoneId,
              aisleId: defaultOpt.aisleId,
              rackId: defaultOpt.rackId,
              shelfId: defaultOpt.shelfId,
            } : undefined,
            issueQty: defaultOpt
              ? Math.min(defaultOpt.availableQuantity, item.requiredQty)
              : 0,
            options,
            totalAvailable: res.data.availableStock,
            loadingStock: false,
          } as ItemIssueState;
        } catch {
          return {
            itemId: item.itemId,
            selectedOptionKey: '',
            issueQty: 0,
            options: [],
            totalAvailable: 0,
            loadingStock: false,
            error: 'Failed to load stock',
          } as ItemIssueState;
        }
      })
    );

    setItemStates(updated);
  }, [requisition.items]);

  useEffect(() => {
    loadBatchData();
  }, [loadBatchData]);

  // Handle option selection change
  const handleOptionChange = (itemId: number, key: string) => {
    setItemStates((prev) =>
      prev.map((s) => {
        if (s.itemId !== itemId) return s;
        const opt = s.options.find((o) => o.key === key);
        const reqItem = requisition.items.find((i) => i.itemId === itemId);
        const maxQty = Math.min(opt?.availableQuantity || 0, reqItem?.requiredQty || 0);
        return {
          ...s,
          selectedOptionKey: key,
          selectedStock: opt ? {
            batchId: opt.batchId,
            warehouseId: opt.warehouseId,
            floorId: opt.floorId,
            binId: opt.binId,
            zoneId: opt.zoneId,
            aisleId: opt.aisleId,
            rackId: opt.rackId,
            shelfId: opt.shelfId,
          } : undefined,
          issueQty: opt ? maxQty : 0
        };
      })
    );
  };

  // Handle quantity change
  const handleQtyChange = (itemId: number, qty: number) => {
    setItemStates((prev) =>
      prev.map((s) => (s.itemId === itemId ? { ...s, issueQty: qty } : s))
    );
  };

  // Validate a single item
  const getItemError = (state: ItemIssueState): string | null => {
    if (state.issueQty <= 0 && state.selectedOptionKey) return 'Qty must be > 0';
    const opt = state.options.find((o) => o.key === state.selectedOptionKey);
    if (opt && state.issueQty > opt.availableQuantity)
      return `Max ${opt.availableQuantity} in location/batch`;
    const reqItem = requisition.items.find((i) => i.itemId === state.itemId);
    if (reqItem && state.issueQty > reqItem.requiredQty)
      return `Max ${reqItem.requiredQty} required`;
    return null;
  };

  // Count items that will be issued
  const issuableItems = itemStates.filter(
    (s) => s.selectedOptionKey && s.issueQty > 0 && !getItemError(s)
  );

  const canSubmit = issuableItems.length > 0 && !submitting;

  // Submit all issuable items
  const handleSubmit = async () => {
    if (!canSubmit) return;

    const confirmMsg = `Issue ${issuableItems.length} item(s) from requisition ${requisition.requisitionNo}?`;
    if (!confirm(confirmMsg)) return;

    try {
      setSubmitting(true);

      // Helper function for required numerical values:
      // ensures they are strictly positive numbers, falls back to 0 (so backend model validation fires normally)
      const cleanRequiredNum = (val: any): number => {
        if (val === undefined || val === null || val === '') return 0;
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      };

      // Helper function for optional/nullable fields on the C# DTO:
      // parses value to number if > 0, otherwise maps to null explicitly so ASP.NET Core binds it as null
      const cleanOptionalNum = (val: any): number | null => {
        if (val === undefined || val === null || val === '') return null;
        const num = Number(val);
        return isNaN(num) || num <= 0 ? null : num;
      };

      // Issue items sequentially (backend handles one item at a time currently)
      for (const item of issuableItems) {
        const selectedOpt = item.selectedStock;
        if (!selectedOpt || !selectedOpt.batchId) {
          throw new Error('No valid batch and location option selected');
        }

        const reqItem = requisition.items.find(i => i.itemId === item.itemId);
        const reqQty = reqItem?.requiredQty || 0;
        const computedIssueType = item.issueQty >= reqQty ? "full" : "partial";

        // Construct payload perfectly aligned with StoreIssueRequestDto.cs
        const payload = {
          requisitionId: cleanRequiredNum(requisition.id),
          issuedQty: cleanRequiredNum(item.issueQty),
          issueType: computedIssueType,
          remarks: remarks || null,
          warehouseId: cleanOptionalNum(selectedOpt.warehouseId),
          floorId: cleanOptionalNum(selectedOpt.floorId),
          zoneId: cleanOptionalNum(selectedOpt.zoneId),
          aisleId: cleanOptionalNum(selectedOpt.aisleId),
          rackId: cleanOptionalNum(selectedOpt.rackId),
          shelfId: cleanOptionalNum(selectedOpt.shelfId),
          binId: cleanOptionalNum(selectedOpt.binId),
          batchId: cleanOptionalNum(selectedOpt.batchId)
        };

        console.log('Dispatching strict store issue DTO payload:', JSON.stringify(payload));

        const res = await storeIssueApi.issueProduct(payload);

        if (res.success === false) {
          throw new Error(res.message || 'Deduction failed');
        }
      }

      alert(
        `✅ Successfully issued ${issuableItems.length} item(s) from ${requisition.requisitionNo}`
      );
      onSuccess();
    } catch (err: any) {
      console.error('Error issuing products:', err);

      // Extract and log detailed validation errors from .NET
      if (err.response?.data?.errors) {
        console.error('--- DETAILED .NET VALIDATION ERRORS ---');
        console.error(JSON.stringify(err.response.data.errors, null, 2));
        console.error('---------------------------------------');

        const errorMsgs = Object.entries(err.response.data.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join('\n');
        alert(`❌ Validation Error(s):\n${errorMsgs}`);
      } else {
        alert(err.response?.data?.message || err.message || 'Failed to issue products');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const fmtDate = (d?: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Check if any batch is expired
  const isExpired = (d?: string) => {
    if (!d) return false;
    return new Date(d) < new Date();
  };

  const isLoading = itemStates.some((s) => s.loadingStock);
  const totalRequested = requisition.items.reduce((sum, i) => sum + i.requiredQty, 0);
  const totalIssuing = issuableItems.reduce((sum, s) => sum + s.issueQty, 0);

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Spin keyframe injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>📦 Issue Products — {requisition.requisitionNo}</h2>
          <p style={styles.headerSub}>
            {requisition.departmentName || 'N/A'} • Requested by {requisition.requestedByName || 'N/A'}
          </p>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)')}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Summary Cards */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Total Items</div>
              <div style={styles.summaryValue}>{requisition.items.length}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Total Requested</div>
              <div style={styles.summaryValue}>{totalRequested}</div>
            </div>
            <div style={{ ...styles.summaryItem, borderColor: '#86efac' }}>
              <div style={styles.summaryLabel}>Issuing</div>
              <div style={{ ...styles.summaryValue, color: '#059669' }}>{totalIssuing}</div>
            </div>
          </div>

          {/* Items Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Req. Qty</th>
                <th style={styles.th}>Batch</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Available</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Issue Qty</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requisition.items.map((item) => {
                const state = itemStates.find((s) => s.itemId === item.itemId);
                const selectedOption = state?.options.find(
                  (o) => o.key === state.selectedOptionKey
                );
                const error = state ? getItemError(state) : null;

                return (
                  <tr key={item.itemId}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.itemName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {item.categoryName ?? item.category ?? ''}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: 600 }}>
                      {item.requiredQty}
                    </td>
                    <td style={styles.td}>
                      {state?.loadingStock ? (
                        <div style={styles.spinner} />
                      ) : state?.options.length === 0 ? (
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                          No stock
                        </span>
                      ) : (
                        <select
                          style={styles.select}
                          value={state?.selectedOptionKey || ''}
                          onChange={(e) =>
                            handleOptionChange(item.itemId, e.target.value)
                          }
                        >
                          <option value="">— Select Batch & Location —</option>
                          {state?.options.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.batchNumber} | {opt.locationLabel} (Avail: {opt.availableQuantity})
                              {opt.expiryDate ? ` | Exp: ${fmtDate(opt.expiryDate)}` : ''}
                              {isExpired(opt.expiryDate) ? ' ⚠️ EXPIRED' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        textAlign: 'center',
                        fontWeight: 600,
                        color: (state?.totalAvailable || 0) > 0 ? '#059669' : '#ef4444',
                      }}
                    >
                      {state?.loadingStock ? '...' : state?.totalAvailable ?? 0}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {state?.selectedOptionKey ? (
                        <input
                          type="number"
                          min={0}
                          max={Math.min(
                            selectedOption?.availableQuantity || 0,
                            item.requiredQty
                          )}
                          value={state?.issueQty || 0}
                          onChange={(e) =>
                            handleQtyChange(item.itemId, parseInt(e.target.value) || 0)
                          }
                          style={{
                            ...styles.input,
                            ...(error ? styles.inputError : {}),
                          }}
                        />
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                      {error && (
                        <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>
                          {error}
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {state?.loadingStock ? (
                        <div style={styles.spinner} />
                      ) : (state?.totalAvailable || 0) === 0 ? (
                        <span style={styles.badge('red')}>No Stock</span>
                      ) : state?.selectedOptionKey && state.issueQty > 0 && !error ? (
                        <span style={styles.badge('green')}>Ready</span>
                      ) : (
                        <span style={styles.badge('yellow')}>Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Remarks */}
          <div style={{ marginTop: '16px' }}>
            <label
              style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}
            >
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add issue remarks..."
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {issuableItems.length} of {requisition.items.length} item(s) ready to issue
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={styles.btnCancel}
              onClick={onClose}
              onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = '#f1f5f9')}
              onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = '#fff')}
            >
              Cancel
            </button>
            <button
              style={{
                ...styles.btnSubmit,
                ...(!canSubmit ? styles.btnSubmitDisabled : {}),
              }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              onMouseEnter={(e) => {
                if (canSubmit)
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {submitting ? 'Issuing...' : `✅ Submit Issue (${issuableItems.length} items)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueProductModal;

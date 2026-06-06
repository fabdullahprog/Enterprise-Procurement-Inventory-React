// src/pages/dashboard/CreateCSPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';

/* ── Backend-aligned interfaces ── */
interface QuotationItem {
  id: number;
  productId: number;
  productName: string;
  offeredQuantity: number;
  unitPrice: number;
  totalPrice: number;
  bdtAmount: number;
}

interface QuotationDetail {
  id: number;
  quotationNumber: string;
  supplierName: string;
  supplierId?: number;
  totalBDTAmount: number;
  deliveryDays: number;
  notes?: string;
  paymentTerms?: string;
  validUntil?: string;
  items: QuotationItem[];
}

interface ProductRow {
  productId: number;
  productName: string;
  cells: (QuotationItem | undefined)[];
  lowestIdx: number;
}

/* ── Utility: lowest unit-price index per product row ── */
function getLowestPriceIdx(cells: (QuotationItem | undefined)[]): number {
  let idx = -1, low = Infinity;
  cells.forEach((c, i) => { if (c && c.unitPrice < low) { low = c.unitPrice; idx = i; } });
  return idx;
}

/* ── Component ── */
const CreateCSPage = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState<QuotationDetail[]>([]);
  const [selectedSupplierIdx, setSelectedSupplierIdx] = useState<number>(-1);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: Fetch quotation summaries from byrfq, then detail per quotation ──
  useEffect(() => { fetchData(); }, [rfqId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // GET /api/SupplierQuotation/byrfq/{rfqId}  → summary list (no items)
      const summaries = await rfqApi.getQuotationsByRFQ(Number(rfqId));
      if (!Array.isArray(summaries) || summaries.length === 0) {
        setError('No quotations found for this RFQ. Suppliers must submit quotations first.');
        return;
      }

      // GET /api/SupplierQuotation/{id}  → full detail with items array
      const detailed: QuotationDetail[] = await Promise.all(
        summaries.map((s: any) => rfqApi.getQuotationById(s?.id || 0))
      );

      // Guard: ensure items actually loaded
      const valid = detailed.filter(d => d.items && d.items.length > 0);
      if (valid.length === 0) {
        setError('Quotations exist but contain no line-items. Please check supplier submissions.');
        return;
      }

      setQuotations(valid);
      // Auto-select the supplier with the overall lowest total
      const lowestTotalIdx = valid.reduce((best, q, i) =>
        q.totalBDTAmount < valid[best].totalBDTAmount ? i : best, 0);
      setSelectedSupplierIdx(lowestTotalIdx);
    } catch (err: any) {
      console.error('CS fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load quotation data');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Build matrix rows ──
  const productRows: ProductRow[] = useMemo(() => {
    if (!quotations.length) return [];
    const map = new Map<number, string>();
    quotations.forEach(q => q.items.forEach(i => map.set(i.productId, i.productName)));
    return Array.from(map.entries()).map(([pid, pname]) => {
      const cells = quotations.map(q => q.items.find(i => i.productId === pid));
      return { productId: pid, productName: pname, cells, lowestIdx: getLowestPriceIdx(cells) };
    });
  }, [quotations]);

  // ── Totals ──
  const supplierTotals = useMemo(() =>
    quotations.map((_, sIdx) =>
      productRows.reduce((sum, r) => sum + (r.cells[sIdx]?.bdtAmount ?? 0), 0)
    ), [quotations, productRows]);

  // ── Submit: Create CS (backend auto-generates rows), then select-suppliers ──
  const handleSubmit = async () => {
    if (selectedSupplierIdx < 0) { setError('Please select a winning supplier'); return; }
    try {
      setSubmitting(true);
      setError(null);

      // Extract winning supplier defensively
      const winningQuotation = quotations[selectedSupplierIdx];
      const chosenSupplierId = winningQuotation?.supplierId || 0;

      // Filter Invalid Data: Filter out any rows where QuotationId === 0 or ProductId === 0
      const validItems = winningQuotation?.items?.filter(item => {
        const qId = item?.id || (item as any)?.quotationId || (item as any)?.quotation?.id || 0;
        const pId = item?.productId || 0;
        return qId !== 0 && pId !== 0;
      }) || [];

      // Defensive Mapping: Do NOT assume nested objects exist. Use strict optional chaining and zero-fallbacks.
      const payload: any = {
        rfqId: Number(rfqId),
        remarks: remarks || undefined,
        supplierRows: validItems.map(item => ({
          quotationId: item?.id || (item as any)?.quotationId || (item as any)?.quotation?.id || 0,
          productId: item?.productId || 0,
          supplierId: chosenSupplierId,
          unitPrice: item?.unitPrice || 0,
          offeredQuantity: item?.offeredQuantity || 0
        })),
        csItems: validItems.map(item => ({
          productId: item?.productId || 0,
          selectedQuotationItemId: item?.id || (item as any)?.quotationId || (item as any)?.quotation?.id || 0
        }))
      };

      // Pre-Submit Logging (CRITICAL)
      console.log("Final CS Payload:", payload);

      // POST API Call
      const csResult = await rfqApi.createCS(payload);
      const csId: number = csResult?.data?.id || csResult?.id || 0;

      if (csId > 0) {
        // The backend auto-generates entries. Fetch them to select the winners.
        const csDetail = await rfqApi.getCSById(csId);
        const rawRows: any[] = csDetail?.supplierRows || [];
        const validRows = rawRows.filter(r => r !== null && r !== undefined);

        let selectedRowIds: number[] = [];

        if (chosenSupplierId !== 0) {
          selectedRowIds = validRows
            .filter((r: any) => {
              const rSupplierId = r?.supplierId || r?.quotation?.supplierId || 0;
              return rSupplierId === chosenSupplierId;
            })
            .map((r: any) => r?.id || r?.quotationId || r?.quotation?.id || 0)
            .filter(id => id !== 0);
        }

        if (selectedRowIds.length > 0) {
          await rfqApi.selectCSSuppliers(csId, { selectedRowIds, remarks: remarks || undefined });
        }
      }

      navigate('/dashboard/comparative-statements', {
        state: { message: 'Comparative Statement created successfully!' },
      });
    } catch (error: any) {
      // Detailed Error Catching
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to create Comparative Statement';
      
      console.error('Final CS Payload Error:', errorMsg, error);
      
      if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('already exists')) {
        navigate('/dashboard/comparative-statements', {
          state: { message: 'A Comparative Statement already exists for this RFQ.' },
        });
        return;
      }
      
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
      setSubmitting(false);
    }
  };

  /* ── Render: Loading / Error ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-7 w-7 text-teal-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading quotations for RFQ #{rfqId}...
        </div>
      </div>
    );
  }

  if (error && !quotations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-base font-semibold text-red-700 mb-2">Cannot Build Matrix</h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate(`/dashboard/rfq/${rfqId}/quotations`)}
            className="text-xs px-4 py-2 font-medium rounded border border-slate-200 text-slate-600 hover:bg-slate-100">
            ← Back to Quotations
          </button>
        </div>
      </div>
    );
  }

  /* ── Render: Matrix ── */
  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(`/dashboard/rfq/${rfqId}/quotations`)}
            className="text-slate-400 hover:text-slate-700 transition-colors" title="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-slate-900">Create Comparative Statement</h1>
        </div>
        <p className="text-sm text-slate-500">
          Compare supplier quotations side-by-side. Cells highlighted in
          <span className="inline-flex items-center ml-1 gap-1 px-1.5 py-0.5 rounded bg-green-100 border border-green-400 text-green-700 text-[11px] font-medium">green</span>
          &nbsp;have the lowest unit price for that product.
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* ── MATRIX TABLE ── */}
      <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mb-5">
        <div className="w-full overflow-x-auto">
          <table className="w-full" style={{ minWidth: `${280 + quotations.length * 200}px` }}>
            <thead>
              <tr>
                <th className="px-3 py-2.5 text-left w-48 bg-slate-50/95 sticky left-0 z-20"
                  style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }}>Product</th>
                <th className="px-3 py-2.5 text-center w-16 bg-slate-50/95">Qty</th>
                {quotations.map((q, idx) => (
                  <th key={q?.id || idx} className="px-3 py-2.5 text-center bg-slate-50/95" style={{ minWidth: '180px' }}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[12px] font-bold text-slate-800 normal-case tracking-normal">{q.supplierName}</span>
                      <span className="text-[10px] text-slate-400 font-normal normal-case">
                        {q.quotationNumber} · {q.deliveryDays}d
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {productRows.map((row) => (
                <tr key={row?.productId || Math.random()}>
                  <td className="px-3 py-2.5 font-medium text-[13px] text-slate-900 whitespace-nowrap sticky left-0 z-10 bg-white"
                    style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }}>{row.productName}</td>
                  <td className="px-3 py-2.5 text-center text-[13px] text-slate-600">
                    {row.cells.find(c => c)?.offeredQuantity ?? '—'}
                  </td>
                  {row.cells.map((cell, sIdx) => {
                    const isLowest = sIdx === row.lowestIdx;
                    if (!cell) return <td key={sIdx} className="px-3 py-2.5 text-center text-[12px] text-slate-300 italic">N/A</td>;
                    return (
                      <td key={sIdx} className={`px-3 py-2.5 text-center ${isLowest ? 'bg-green-100 border-l-2 border-r-2 border-green-400' : ''}`}>
                        <div className="text-[13px] font-semibold text-slate-800">{cell.unitPrice.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-400">Total: {cell.bdtAmount.toLocaleString()}</div>
                        {(cell as any).remarks && (
                          <div className="mt-1 text-[10px] text-slate-500 italic flex items-start justify-center gap-1 leading-tight">
                            <svg className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span className="text-left line-clamp-2" title={(cell as any).remarks}>{(cell as any).remarks}</span>
                          </div>
                        )}
                        {(cell as any).notes && !(cell as any).remarks && (
                          <div className="mt-1 text-[10px] text-slate-500 italic flex items-start justify-center gap-1 leading-tight">
                            <svg className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span className="text-left line-clamp-2" title={(cell as any).notes}>{(cell as any).notes}</span>
                          </div>
                        )}
                        {isLowest && <div className="text-[9px] font-bold text-green-600 uppercase mt-1">★ Lowest</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* Footer: Totals + Select Winner */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                <td className="px-3 py-2.5 font-bold text-[12px] text-slate-700 uppercase tracking-wider sticky left-0 z-10 bg-slate-50/95"
                  style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }} colSpan={2}>Grand Total</td>
                {supplierTotals.map((total, idx) => (
                  <td key={idx} className="px-3 py-2.5 text-center">
                    <span className="text-[13px] font-bold text-slate-800">{total.toLocaleString()}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-200 bg-white">
                <td className="px-3 py-3 font-semibold text-[12px] text-slate-700 uppercase tracking-wider sticky left-0 z-10 bg-white"
                  style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }} colSpan={2}>Terms &amp; Conditions</td>
                {quotations.map((q, idx) => (
                  <td key={idx} className="px-3 py-3 text-left align-top">
                    <div className="flex flex-col gap-1.5 bg-slate-50 border border-slate-200 rounded-md p-3 mt-2 shadow-sm">
                      
                      <div className="flex items-center">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 w-16 shrink-0 flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                          Deliv.
                        </span>
                        <span className="text-xs font-medium text-slate-700">{q.deliveryDays} days</span>
                      </div>

                      {q.paymentTerms && (
                        <div className="flex items-center">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 w-16 shrink-0 flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            Pay.
                          </span>
                          <span className="text-xs font-medium text-slate-700 truncate" title={q.paymentTerms}>{q.paymentTerms}</span>
                        </div>
                      )}

                      {q.validUntil && (
                        <div className="flex items-center">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 w-16 shrink-0 flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Valid
                          </span>
                          <span className="text-xs font-medium text-slate-700">{q.validUntil}</span>
                        </div>
                      )}

                      {q.notes && (
                        <div className="border-t border-slate-200 pt-1 mt-1 flex items-start gap-1">
                          <svg className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                          <span className="italic text-[11px] text-slate-500 line-clamp-2" title={q.notes}>{q.notes}</span>
                        </div>
                      )}

                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-200 bg-slate-50/60">
                <td className="px-3 py-3 font-semibold text-[12px] text-slate-700 uppercase tracking-wider sticky left-0 z-10 bg-slate-50/80"
                  style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }} colSpan={2}>Select Winning Supplier</td>
                {quotations.map((_, idx) => (
                  <td key={idx} className="px-3 py-3 text-center">
                    <label className="flex items-center justify-center gap-2 cursor-pointer group">
                      <input type="radio" name="winner" checked={selectedSupplierIdx === idx}
                        onChange={() => setSelectedSupplierIdx(idx)} disabled={submitting}
                        className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500" />
                      <span className={`text-[11px] font-semibold ${selectedSupplierIdx === idx ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {selectedSupplierIdx === idx ? '✓ Selected' : 'Select'}
                      </span>
                    </label>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── SUMMARY + SUBMIT ── */}
      <div className="bg-white rounded-lg border-[0.5px] border-slate-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider">Summary</h3>
            <div className="flex justify-between text-[13px]"><span className="text-slate-500">Products</span><span className="font-semibold">{productRows.length}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-slate-500">Suppliers</span><span className="font-semibold">{quotations.length}</span></div>
            {selectedSupplierIdx >= 0 && (
              <div className="flex justify-between text-[13px] pt-2 border-t border-slate-100">
                <span className="text-slate-700 font-medium">Selected Total</span>
                <span className="font-bold text-teal-700 text-[15px]">{supplierTotals[selectedSupplierIdx]?.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider">Winner</h3>
            {selectedSupplierIdx >= 0 ? (
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                <div className="text-sm font-semibold text-teal-800">{quotations[selectedSupplierIdx].supplierName}</div>
                <div className="text-[12px] text-teal-600 mt-0.5">{quotations[selectedSupplierIdx].quotationNumber} · {quotations[selectedSupplierIdx].deliveryDays} days delivery</div>
              </div>
            ) : (
              <p className="text-[13px] text-slate-400 italic">No supplier selected yet</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider">Remarks</h3>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} maxLength={500}
              placeholder="General remarks (optional)..." disabled={submitting}
              className="text-[13px] w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
          <button type="button" onClick={() => navigate(`/dashboard/rfq/${rfqId}/quotations`)}
            className="text-xs px-4 py-2 font-medium rounded border border-slate-200 text-slate-600 hover:bg-slate-100" disabled={submitting}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting || selectedSupplierIdx < 0}
            className="text-xs px-5 py-2 text-white font-semibold rounded transition-all bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-sm hover:shadow disabled:opacity-50">
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating CS...
              </span>
            ) : 'Create Comparative Statement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCSPage;

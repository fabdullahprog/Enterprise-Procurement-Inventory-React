// src/pages/dashboard/SubmitQuotationPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import { masterDataApi } from '../../api/masterDataApi';
import { Supplier, Currency } from '../../types';
import './submit-quotation.css';

interface RFQDetail {
  id: number;
  rfqNumber: string;
  rfqDate: string;
  quotationDeadline: string;
  status: string;
  notes?: string;
  requisitionNumber?: string;
  items?: Array<{
    productId: number;
    productName: string;
    requiredQuantity: number;
  }>;
  suppliers?: Array<{
    id: number;
    name: string;
    contactPerson?: string;
  }>;
}

interface QuotationItem {
  productId: number;
  productName: string;
  requiredQuantity: number;
  offeredQuantity: number;
  unitPrice: number;
  remarks?: string;
}

const SubmitQuotationPage = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { items?: any[] } | null;

  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | undefined>();
  const [deliveryDays, setDeliveryDays] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');
  const [supplierQuoteRef, setSupplierQuoteRef] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('Cash');
  const [validUntil, setValidUntil] = useState<string>('');
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [rfqId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rfqData, suppliersData, currenciesData, existingQuotations] = await Promise.all([
        rfqApi.getRFQById(Number(rfqId)),
        masterDataApi.getSuppliers(),
        masterDataApi.getCurrencies(),
        rfqApi.getQuotationsByRFQ(Number(rfqId))
      ]);

      setRfq(rfqData);
      
      const submittedSupplierIds = new Set(
        Array.isArray(existingQuotations) 
          ? existingQuotations.map((q: any) => q.supplierId) 
          : []
      );
      
      const assignedSupplierIds = new Set(rfqData.suppliers?.map((s: any) => s.id) || []);
      
      setSuppliers(
        suppliersData.filter(
          (s: Supplier) => s.isActive && assignedSupplierIds.has(s.id) && !submittedSupplierIds.has(s.id)
        )
      );
      setCurrencies(currenciesData.filter((c: Currency) => c.isActive));

      // Initialize quotation items from RFQ or Location State
      const sourceItems = rfqData.items || state?.items;
      
      if (sourceItems && sourceItems.length > 0) {
        setQuotationItems(
          sourceItems.map((item: any) => ({
            productId: item.productId,
            productName: item.productName || item.product?.name,
            requiredQuantity: item.requiredQuantity,
            offeredQuantity: item.requiredQuantity,
            unitPrice: 0,
            remarks: '',
          }))
        );
      } else {
        // Fallback: If neither API nor location state has items, we might need to fetch them from requisition,
        // but for now, we just log a warning. The user expects location.state or API to have them.
        console.warn("No items found in RFQ data or location state.");
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...quotationItems];
    updated[index] = { ...updated[index], [field]: value };
    setQuotationItems(updated);
  };

  const calculateTotal = () => {
    return quotationItems.reduce((sum, item) => sum + (item.offeredQuantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      setError('Please select a supplier');
      return;
    }

    if (deliveryDays < 1) {
      setError('Delivery days must be at least 1');
      return;
    }

    if (!validUntil) {
      setError('Please select a validity date');
      return;
    }

    if (quotationItems.some(item => item.unitPrice <= 0)) {
      setError('All items must have a valid unit price');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formattedNotes = [
        notes,
        supplierQuoteRef ? `Ref: ${supplierQuoteRef}` : '',
        `Payment: ${paymentTerms}`,
        `Valid Until: ${validUntil}`
      ].filter(Boolean).join(' | ');

      await rfqApi.submitQuotation({
        rfqId: Number(rfqId),
        supplierId: selectedSupplierId,
        currencyId: selectedCurrencyId,
        deliveryDays,
        notes: formattedNotes,
        supplierQuoteRef,
        paymentTerms,
        validUntil,
        items: quotationItems.map(item => ({
          productId: item.productId,
          offeredQuantity: item.offeredQuantity,
          unitPrice: item.unitPrice,
          remarks: item.remarks,
        })),
      } as any);

      navigate(`/dashboard/rfq/${rfqId}/quotations`, {
        state: { message: 'Quotation submitted successfully' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quotation');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="submit-quotation-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !rfq) {
    return (
      <div className="submit-quotation-page">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/dashboard/rfqs')} className="btn btn-secondary">
            Back to RFQs
          </button>
        </div>
      </div>
    );
  }

  if (!rfq) return null;

  return (
    <div className="submit-quotation-page">
      <div className="page-header">
        <h1>Submit Quotation</h1>
        <p className="page-subtitle">RFQ: {rfq.rfqNumber}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="quotation-content">
        {/* RFQ Summary */}
        <div className="rfq-summary-card">
          <h2>RFQ Details</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">RFQ Number:</span>
              <span className="value">{rfq.rfqNumber}</span>
            </div>
            <div className="summary-item">
              <span className="label">Requisition:</span>
              <span className="value">{(rfq as any).requisition?.requisitionNumber || rfq.requisitionNumber || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="label">RFQ Date:</span>
              <span className="value">{new Date(rfq.rfqDate).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Deadline:</span>
              <span className="value">{new Date(rfq.quotationDeadline).toLocaleDateString()}</span>
            </div>
          </div>
          {rfq.notes && (
            <div className="notes-section">
              <strong>Notes:</strong>
              <p>{rfq.notes}</p>
            </div>
          )}
        </div>

        {/* Quotation Form */}
        <form onSubmit={handleSubmit} className="quotation-form-card">
          <h2>Quotation Details</h2>

          {/* Supplier Selection */}
          <div className="form-group">
            <label htmlFor="supplier" className="form-label required">
              Supplier
            </label>
            <select
              id="supplier"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
              required
              disabled={submitting}
            >
              <option value={0}>Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.contactPerson}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            {/* Currency */}
            <div className="form-group">
              <label htmlFor="currency" className="form-label">
                Currency (Optional)
              </label>
              <select
                id="currency"
                value={selectedCurrencyId || ''}
                onChange={(e) => setSelectedCurrencyId(e.target.value ? Number(e.target.value) : undefined)}
                disabled={submitting}
              >
                <option value="">BDT (Default)</option>
                {currencies.map(currency => (
                  <option key={currency.id} value={currency.id}>
                    {currency.currencyCode} - {currency.currencyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Quote Ref. No */}
            <div className="form-group">
              <label htmlFor="supplierQuoteRef" className="form-label">
                Supplier Quote Ref. No
              </label>
              <input
                type="text"
                id="supplierQuoteRef"
                value={supplierQuoteRef}
                onChange={(e) => setSupplierQuoteRef(e.target.value)}
                placeholder="Optional"
                disabled={submitting}
              />
            </div>

            {/* Payment Terms */}
            <div className="form-group">
              <label htmlFor="paymentTerms" className="form-label required">
                Payment Terms
              </label>
              <select
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="Cash">Cash</option>
                <option value="Advance">Advance</option>
                <option value="15 Days Credit">15 Days Credit</option>
                <option value="30 Days Credit">30 Days Credit</option>
              </select>
            </div>

            {/* Valid Until */}
            <div className="form-group">
              <label htmlFor="validUntil" className="form-label required">
                Valid Until
              </label>
              <input
                type="date"
                id="validUntil"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Delivery Days */}
            <div className="form-group">
              <label htmlFor="deliveryDays" className="form-label required">
                Delivery Days
              </label>
              <input
                type="number"
                id="deliveryDays"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                min={1}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Quotation Items */}
          <div className="form-group">
            <label className="form-label required">Quotation Items</label>
            <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mt-2">
              <div className="w-full overflow-x-auto relative">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Product Name</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Required Qty</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Offered Qty</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Unit Price</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Remarks / Brand</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotationItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-[13px] text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">📦</span>
                            <span>No items found. The RFQ may not have linked requisition items.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                    quotationItems.map((item, index) => (
                      <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-2.5 text-[13px] text-slate-800 font-medium cell-truncate">{item.productName}</td>
                        <td className="px-3 py-2.5 text-[13px] text-slate-700 text-center">{item.requiredQuantity}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            value={item.offeredQuantity}
                            onChange={(e) => handleItemChange(index, 'offeredQuantity', Number(e.target.value))}
                            min={1}
                            required
                            disabled={submitting}
                            className="w-20 px-2 py-1 text-[13px] border-[0.5px] border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            min={0}
                            step={0.01}
                            required
                            disabled={submitting}
                            className="w-24 px-2 py-1 text-[13px] border-[0.5px] border-slate-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-left">
                          <input
                            type="text"
                            value={item.remarks || ''}
                            onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                            placeholder="Optional"
                            disabled={submitting}
                            className="w-32 px-2 py-1 text-[13px] border-[0.5px] border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-[13px] text-slate-900 font-semibold text-right whitespace-nowrap">
                          {(item.offeredQuantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td colSpan={5} className="px-3 py-3 text-right text-[13px] text-slate-700"><strong>Grand Total:</strong></td>
                      <td className="px-3 py-3 text-[14px] text-purple-700 font-bold text-right whitespace-nowrap">{calculateTotal().toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Additional information..."
              disabled={submitting}
            />
            <p className="char-count">{notes.length}/500 characters</p>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/rfq/${rfqId}/quotations`)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuotationPage;

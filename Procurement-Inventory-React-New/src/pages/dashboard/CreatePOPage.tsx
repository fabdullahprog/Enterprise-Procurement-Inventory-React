// src/pages/dashboard/CreatePOPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import './create-po.css';

interface POItemData {
  productId: number;
  productName: string;
  orderedQuantity: number;
  supplierRate: number;
}

interface POFromCSResponse {
  supplierName: string;
  supplierId: number;
  supplierAddress: string;
  supplierContact: string;
  csNumber: string;
  totalBDTAmount: number;
  itemsData: POItemData[];
  poRequest: {
    comparativeStatementId: number;
    orderDate: string;
    expectedDeliveryDate: string;
    deliveryAddress?: string;
    paymentTerms?: string;
    notes?: string;
    items: {
      productId: number;
      orderedQuantity: number;
      supplierRate: number;
      poRate: number;
    }[];
  };
}

const CreatePOPage = () => {
  const { csId } = useParams<{ csId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [supplierInfo, setSupplierInfo] = useState<{
    name: string; id: number; address: string; contact: string;
  } | null>(null);
  const [csNumber, setCsNumber] = useState('');
  const [itemsData, setItemsData] = useState<POItemData[]>([]);

  // PO Rate state per product
  const [poRates, setPoRates] = useState<{ [productId: number]: number }>({});

  // Master fields
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');

  // Financial
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (csId) fetchPOData();
  }, [csId]);

  const fetchPOData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: POFromCSResponse = await rfqApi.getFromCS(Number(csId));

      setSupplierInfo({
        name: data.supplierName,
        id: data.supplierId,
        address: data.supplierAddress,
        contact: data.supplierContact,
      });
      setCsNumber(data.csNumber);
      setItemsData(data.itemsData || []);

      // Initialize PO Rates — default to Supplier Rate
      const initialRates: { [key: number]: number } = {};
      (data.itemsData || []).forEach((item) => {
        initialRates[item.productId] = item.supplierRate;
      });
      setPoRates(initialRates);

      // Default delivery date
      if (data.poRequest?.expectedDeliveryDate) {
        const d = new Date(data.poRequest.expectedDeliveryDate);
        setExpectedDeliveryDate(d.toISOString().split('T')[0]);
      }
      if (data.poRequest?.orderDate) {
        const d = new Date(data.poRequest.orderDate);
        setPoDate(d.toISOString().split('T')[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load PO data from CS.');
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (productId: number, val: string) => {
    const value = parseFloat(val);
    setPoRates((prev) => ({ ...prev, [productId]: isNaN(value) ? 0 : value }));
  };

  // ── Computed values ──
  const subTotal = itemsData.reduce((sum, item) => {
    const rate = poRates[item.productId] ?? 0;
    return sum + rate * item.orderedQuantity;
  }, 0);

  const grandTotal = subTotal + tax - discount;

  const negotiatedSavings = itemsData.reduce((sum, item) => {
    const rate = poRates[item.productId] ?? 0;
    return sum + (item.supplierRate - rate) * item.orderedQuantity;
  }, 0);

  const hasRateError = itemsData.some(
    (item) => (poRates[item.productId] ?? 0) > item.supplierRate
  );

  const isFormValid = !hasRateError && expectedDeliveryDate.length > 0 && itemsData.length > 0;

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const parsedCsId = parseInt(csId as string, 10);
    if (!parsedCsId || isNaN(parsedCsId)) {
      setError('Invalid Comparative Statement ID. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      comparativeStatementId: parsedCsId,
      orderDate: new Date(poDate).toISOString(),
      expectedDeliveryDate: new Date(expectedDeliveryDate).toISOString(),
      deliveryAddress: deliveryAddress || undefined,
      paymentTerms: paymentTerms || undefined,
      notes: notes || undefined,
      items: itemsData.map((item) => ({
        productId: item.productId,
        orderedQuantity: item.orderedQuantity,
        supplierRate: item.supplierRate,
        poRate: poRates[item.productId] ?? 0,
      })),
    };

    console.log('📦 PO Payload:', JSON.stringify(payload, null, 2));

    try {
      const res = await rfqApi.createPO(payload);
      alert(res.message || 'Purchase Order created successfully!');
      navigate('/dashboard/purchase-orders');
    } catch (err: any) {
      const errMsg = err.response?.data?.message
        || err.response?.data?.title
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || 'Failed to submit Purchase Order.';
      console.error('❌ PO Submit Error:', err.response?.data);
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / Error states ──
  if (loading) {
    return (
      <div className="create-po-container animate-fade-in">
        <div className="po-loading">
          <svg className="spin-icon" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading PO data from Comparative Statement...</span>
        </div>
      </div>
    );
  }

  if (error && !itemsData.length) {
    return (
      <div className="create-po-container animate-fade-in">
        <div className="po-error-alert">{error}</div>
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="create-po-container animate-fade-in">
      {/* ── Header ── */}
      <div className="po-header-section">
        <div className="po-header-left">
          <h1 className="po-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Create Purchase Order
          </h1>
          <p className="po-subtitle">
            Generating PO from CS: <strong>{csNumber}</strong>
          </p>
        </div>
      </div>

      {error && <div className="po-error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="po-form-layout">
        {/* ── Top Grid: Supplier + Master Details ── */}
        <div className="po-top-grid">
          <div className="po-card supplier-card">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Supplier Information
            </h3>
            <div className="po-info-grid">
              <span className="info-label">Name</span>
              <span className="info-value">{supplierInfo?.name || '—'}</span>
              <span className="info-label">Contact</span>
              <span className="info-value">{supplierInfo?.contact || '—'}</span>
              <span className="info-label">Address</span>
              <span className="info-value">{supplierInfo?.address || '—'}</span>
            </div>
          </div>

          <div className="po-card details-card">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              PO Master Details
            </h3>
            <div className="form-group-grid">
              <div className="form-group">
                <label htmlFor="po-date">PO Date *</label>
                <input
                  id="po-date"
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  readOnly
                  className="po-input read-only-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="po-delivery-date">Expected Delivery Date *</label>
                <input
                  id="po-delivery-date"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="po-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="po-payment-terms">Payment Terms</label>
                <input
                  id="po-payment-terms"
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., Net 30, Cash on Delivery"
                  className="po-input"
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="po-delivery-address">Delivery Address</label>
                <textarea
                  id="po-delivery-address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter complete delivery address"
                  className="po-input po-textarea"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Line Items Data Grid ── */}
        <div className="po-card grid-card">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Line Items
          </h3>
          <div className="po-table-container">
            <table className="po-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-right">Supplier Rate (BDT)</th>
                  <th className="text-center">PO Rate (BDT)</th>
                  <th className="text-right">Line Total (BDT)</th>
                  <th className="text-right">Savings (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {itemsData.map((item, idx) => {
                  const currentPORate = poRates[item.productId] ?? 0;
                  const isError = currentPORate > item.supplierRate;
                  const lineTotal = currentPORate * item.orderedQuantity;
                  const lineSaving = (item.supplierRate - currentPORate) * item.orderedQuantity;

                  return (
                    <tr key={item.productId} className={isError ? 'row-error' : ''}>
                      <td className="text-center text-slate">{idx + 1}</td>
                      <td className="font-medium">{item.productName}</td>
                      <td className="text-center">{item.orderedQuantity}</td>
                      <td className="text-right text-slate">
                        {item.supplierRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center">
                        <div className="po-rate-input-wrapper">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentPORate || ''}
                            onChange={(e) => handleRateChange(item.productId, e.target.value)}
                            className={`po-rate-input ${isError ? 'input-error' : ''}`}
                          />
                          {isError && (
                            <span className="error-tooltip">
                              ⚠ Rate exceeds Supplier Rate!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right font-semibold">
                        {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`text-right font-semibold ${lineSaving > 0 ? 'text-green' : lineSaving < 0 ? 'text-red' : ''}`}>
                        {lineSaving > 0 ? '+' : ''}{lineSaving.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasRateError && (
            <div className="rate-error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <strong>Validation Error:</strong> One or more PO Rates exceed the Supplier Rate. Please correct before submitting.
            </div>
          )}
        </div>

        {/* ── Bottom Grid: Terms + Financial Summary ── */}
        <div className="po-bottom-grid">
          <div className="po-card terms-card">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Terms &amp; Conditions
            </h3>
            <textarea
              id="po-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or terms and conditions for this Purchase Order..."
              className="po-input po-textarea full-height"
            />
          </div>

          <div className="po-card summary-card">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Financial Summary
            </h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Sub Total</span>
                <span className="summary-value"> {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row input-row">
                <label htmlFor="po-tax">Tax / VAT (+)</label>
                <input
                  id="po-tax"
                  type="number"
                  step="0.01"
                  value={tax || ''}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="po-small-input"
                  placeholder="0.00"
                />
              </div>
              <div className="summary-row input-row">
                <label htmlFor="po-discount">Discount (−)</label>
                <input
                  id="po-discount"
                  type="number"
                  step="0.01"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="po-small-input"
                  placeholder="0.00"
                />
              </div>

              <div className="summary-divider" />

              <div className="summary-row grand-total">
                <span>Grand Total</span>
                <span> {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-divider" />

              <div className={`kpi-savings-block ${negotiatedSavings > 0 ? 'positive' : negotiatedSavings < 0 ? 'negative' : 'neutral'}`}>
                <div className="kpi-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  Negotiated Savings
                </div>
                <div className="kpi-value">
                   {negotiatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="po-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard/comparative-statements')}
                className="btn-secondary"
              >
                ← Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!isFormValid || submitting}
              >
                {submitting ? (
                  <>
                    <svg className="spin-icon-sm" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Confirm & Generate PO'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePOPage;

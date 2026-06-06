// src/pages/dashboard/QuotationDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import { FileText, Calendar, Building2, Package, ArrowLeft, Tag, Truck } from 'lucide-react';

interface QuotationDetail {
  id: number;
  quotationNumber: string;
  quotationDate: string;
  totalBDTAmount: number;
  deliveryDays: number;
  notes?: string;
  supplierQuoteRef?: string;
  paymentTerms?: string;
  validUntil?: string;
  supplierId: number;
  supplierName: string;
  status: string;
  rfqId: number;
  rfqNumber: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    offeredQuantity: number;
    unitPrice: number;
    totalPrice: number;
    bdtAmount: number;
    remarks?: string;
  }>;
}

const QuotationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadQuotationDetails(parseInt(id));
    }
  }, [id]);

  const loadQuotationDetails = async (quotationId: number) => {
    try {
      setLoading(true);
      setError(null);
      // Assuming rfqApi.getQuotationById exists. If not, it will throw an error.
      const data = await rfqApi.getQuotationById(quotationId);
      let parsedQuoteRef = data.supplierQuoteRef;
      let parsedPaymentTerms = data.paymentTerms;
      let parsedValidUntil = data.validUntil;
      let cleanedNotes = data.notes || '';

      if (data.notes) {
        const parts = data.notes.split(' | ');
        const notesParts: string[] = [];

        parts.forEach((part: string) => {
          if (part.startsWith('Ref: ')) {
            parsedQuoteRef = part.substring(5);
          } else if (part.startsWith('Payment: ')) {
            parsedPaymentTerms = part.substring(9);
          } else if (part.startsWith('Valid Until: ')) {
            parsedValidUntil = part.substring(13);
          } else {
            notesParts.push(part);
          }
        });

        cleanedNotes = notesParts.join(' | ');
      }

      setQuotation({
        ...data,
        supplierQuoteRef: parsedQuoteRef || 'N/A',
        paymentTerms: parsedPaymentTerms || 'N/A',
        validUntil: parsedValidUntil || '',
        notes: cleanedNotes
      });
    } catch (err: any) {
      console.error('Error loading quotation details:', err);
      setError(err.response?.data?.message || 'Failed to load Quotation details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Selected': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Quotation details...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <p>{error || 'Failed to load data.'}</p>
          <button onClick={() => navigate(-1)} className="text-red-700 underline font-medium text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/dashboard/rfq/${quotation.rfqId}/quotations`)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Back to Quotations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{quotation.quotationNumber}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(quotation.status)}`}>
                {quotation.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Supplier Quotation Details</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-indigo-50 rounded text-indigo-600"><Building2 className="w-5 h-5" /></div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Supplier</p>
            <p className="font-semibold text-[14px] text-slate-800 truncate" title={quotation.supplierName}>
              {quotation.supplierName}
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded text-blue-600"><Calendar className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Date Submitted</p>
            <p className="font-semibold text-[14px] text-slate-800">{new Date(quotation.quotationDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-emerald-50 rounded text-emerald-600"><Tag className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Amount (BDT)</p>
            <p className="font-semibold text-[14px] text-slate-800">{quotation.totalBDTAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-amber-50 rounded text-amber-600"><Truck className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Delivery Time</p>
            <p className="font-semibold text-[14px] text-slate-800">{quotation.deliveryDays} Days</p>
          </div>
        </div>
      </div>

      {/* Terms & Metadata */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" /> Terms & References
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">RFQ Reference</span>
            <span className="text-[13px] text-slate-800 font-medium">{quotation.rfqNumber || `#${quotation.rfqId}`}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier Ref</span>
            <span className="text-[13px] text-slate-800 font-medium">{quotation.supplierQuoteRef || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Terms</span>
            <span className="text-[13px] text-slate-800 font-medium">{quotation.paymentTerms || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valid Until</span>
            <span className="text-[13px] text-slate-800 font-medium">
              {(() => {
                if (!quotation.validUntil || quotation.validUntil === 'N/A') return 'N/A';
                const d = new Date(quotation.validUntil);
                return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
              })()}
            </span>
          </div>
        </div>
        {quotation.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Remarks</span>
            <p className="text-[13px] text-slate-700 bg-slate-50 p-3 rounded">{quotation.notes}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500" />
            Quoted Items
          </h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {quotation.items.length} Items
          </span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total Price</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotation.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-medium text-slate-800">{item.productName || `Product #${item.productId}`}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 text-center">{item.offeredQuantity}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-slate-700 text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-bold text-indigo-700 text-right">{item.totalPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-500 italic">{item.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td colSpan={3} className="py-3 px-4 text-right text-[12px] font-bold text-slate-600 uppercase tracking-wider">
                  Grand Total
                </td>
                <td className="py-3 px-4 text-[14px] font-bold text-slate-900 text-right">
                  {quotation.totalBDTAmount.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailPage;

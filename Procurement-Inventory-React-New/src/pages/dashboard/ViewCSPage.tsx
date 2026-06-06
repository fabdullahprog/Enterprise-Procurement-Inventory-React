import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import { ArrowLeft, CheckCircle2, Package, FileText, Calendar, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CSDetail {
  id: number;
  csNumber: string;
  csDate: string;
  status: string;
  totalBDTAmount: number;
  remarks?: string;
  approvedAt?: string;
  rfqId: number;
  rfqNumber?: string;
  createdByEmail?: string;
  items: CSItem[];
  supplierRows: CSSupplierRow[];
}

interface CSItem {
  id: number;
  productId: number;
  productName: string;
  selectedQuotationItemId: number;
  unitPrice: number;
  offeredQuantity: number;
  totalPrice: number;
  bdtAmount: number;
  supplierId: number;
  supplierName?: string;
  remarks?: string;
  isSelected: boolean;
}

interface CSSupplierRow {
  id: number;
  productId: number;
  productName: string;
  supplierId: number;
  supplierName: string;
  offeredQuantity: number;
  unitPrice: number;
  totalPrice: number;
  bdtAmount: number;
  deliveryDays: number;
  isSelected: boolean;
  selectionRemarks?: string;
}

const ViewCSPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [cs, setCs] = useState<CSDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { roles } = useAuth();
  const isPurchaseRole = roles.some(r => ['Admin', 'PurchaseOfficer', 'PurchaseManager'].includes(r));

  useEffect(() => {
    if (id) {
      loadCSDetails(parseInt(id));
    }
  }, [id]);

  const loadCSDetails = async (csId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rfqApi.getCSById(csId);
      setCs(data);
    } catch (err: any) {
      console.error('Error loading CS details:', err);
      setError(err.response?.data?.message || 'Failed to load Comparative Statement details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Reviewed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'POCreated': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Comparative Statement details...</p>
      </div>
    );
  }

  if (error || !cs) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <p>{error || 'Failed to load data.'}</p>
          <button onClick={() => navigate('/dashboard/comparative-statements')} className="text-red-700 underline font-medium text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Group supplier rows by product to build the matrix, with robust fallback for nested data
  const productsMap = new Map<number, { productId: number; productName: string; suppliers: CSSupplierRow[] }>();
  const allSupplierIds = new Set<number>();
  const supplierNames = new Map<number, string>();

  cs.supplierRows?.forEach(row => {
    // Robust fallback: if flat fields are missing, try nested quotation data
    const nestedItem = (row as any).quotation?.quotationItems?.[0];
    const nestedProduct = nestedItem?.product;
    
    const resolvedProductId = row.productId || nestedProduct?.id || nestedItem?.productId || 0;
    const resolvedProductName = row.productName || nestedProduct?.name || 'Unknown Product';

    if (!productsMap.has(resolvedProductId)) {
      productsMap.set(resolvedProductId, {
        productId: resolvedProductId,
        productName: resolvedProductName,
        suppliers: []
      });
    }
    productsMap.get(resolvedProductId)?.suppliers.push(row);
    allSupplierIds.add(row.supplierId);
    if (row.supplierName || (row as any).supplier?.name) {
      supplierNames.set(row.supplierId, row.supplierName || (row as any).supplier?.name);
    }
  });

  const uniqueSuppliers = Array.from(allSupplierIds).map(id => ({
    id,
    name: supplierNames.get(id) || `Supplier #${id}`
  }));

  const isApproved = cs.status === 'Approved';
  const winningSupplierId = isApproved ? cs.supplierRows?.find(r => r.isSelected)?.supplierId : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/comparative-statements')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{cs.csNumber}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(cs.status)}`}>
                {cs.status === 'POCreated' ? 'PO Created' : cs.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Comparative Statement Details</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-indigo-50 rounded text-indigo-600"><FileText className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">RFQ Reference</p>
            <p className="font-semibold text-slate-800">{cs.rfqNumber || `#${cs.rfqId}`}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded text-blue-600"><Calendar className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Date Created</p>
            <p className="font-semibold text-slate-800">{new Date(cs.csDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-emerald-50 rounded text-emerald-600"><Building2 className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Total Amount (BDT)</p>
            <p className="font-semibold text-slate-800">{cs.totalBDTAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-purple-50 rounded text-purple-600"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Approval Status</p>
            <p className="font-semibold text-slate-800">
              {cs.approvedAt ? new Date(cs.approvedAt).toLocaleDateString() : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            Comparison Matrix
          </h2>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full" style={{ minWidth: `${280 + uniqueSuppliers.length * 200}px` }}>
            <thead>
              <tr>
                <th className="px-3 py-2.5 text-left w-48 bg-slate-50/95 sticky left-0 z-20"
                  style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }}>Product</th>
                <th className="px-3 py-2.5 text-center w-16 bg-slate-50/95">Qty</th>
                {uniqueSuppliers.map((supplier) => {
                  const isWinningColumn = isApproved && supplier.id === winningSupplierId;
                  return (
                    <th key={supplier.id} className={`px-3 py-2.5 text-center ${isWinningColumn ? 'bg-emerald-100 border-x-2 border-t-2 border-emerald-400 shadow-sm' : 'bg-slate-50/95'}`} style={{ minWidth: '180px' }}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[12px] font-bold normal-case tracking-normal ${isWinningColumn ? 'text-emerald-800' : 'text-slate-800'}`}>
                          {supplier.name}
                        </span>
                        {isWinningColumn && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-200/50 px-2 py-0.5 rounded-full mt-1">
                            Winning Supplier
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {Array.from(productsMap.values()).map((product) => {
                const cells = uniqueSuppliers.map(supplier => product.suppliers.find(s => s.supplierId === supplier.id));
                let lowestIdx = -1;
                let lowestPrice = Infinity;
                cells.forEach((cell, idx) => {
                  if (cell && cell.unitPrice < lowestPrice) {
                    lowestPrice = cell.unitPrice;
                    lowestIdx = idx;
                  }
                });

                return (
                  <tr key={product.productId} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-medium text-[13px] text-slate-900 whitespace-nowrap sticky left-0 z-10 bg-white"
                      style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }}>
                      {product.productName}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[13px] text-slate-600">
                      {cells.find(c => c)?.offeredQuantity ?? '—'}
                    </td>
                    {cells.map((cell, sIdx) => {
                      const supplierId = uniqueSuppliers[sIdx].id;
                      const isWinningColumn = isApproved && supplierId === winningSupplierId;
                      const isLowest = sIdx === lowestIdx && !isWinningColumn;
                      
                      if (!cell) return <td key={sIdx} className={`px-3 py-2.5 text-center text-[12px] text-slate-300 italic ${isWinningColumn ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>N/A</td>;
                      
                      return (
                        <td key={sIdx} className={`px-3 py-2.5 text-center ${isWinningColumn ? 'bg-emerald-50/50 border-x-2 border-emerald-400' : isLowest ? 'bg-green-100 border-l-2 border-r-2 border-green-400' : ''}`}>
                          <div className={`text-[13px] font-semibold ${isWinningColumn ? 'text-emerald-900' : 'text-slate-800'}`}>{cell.unitPrice?.toLocaleString() ?? '0'}</div>
                          <div className={`text-[11px] ${isWinningColumn ? 'text-emerald-600' : 'text-slate-400'}`}>Total: {cell.bdtAmount?.toLocaleString() ?? '0'}</div>
                          
                          {cell.deliveryDays > 0 && (
                            <div className={`mt-1 text-[10px] italic flex items-center justify-center gap-1 ${isWinningColumn ? 'text-emerald-600' : 'text-slate-500'}`}>
                              <span className="text-left">Delivery: {cell.deliveryDays}d</span>
                            </div>
                          )}
                          
                          {isLowest && <div className="text-[9px] font-bold text-green-600 uppercase mt-1">★ Lowest</div>}
                          
                          {cell.isSelected && !isWinningColumn && (
                            <div className="mt-2 flex items-center justify-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3" /> Selected
                            </div>
                          )}
                          
                          {cell.isSelected && cell.selectionRemarks && (
                            <div className={`mt-1 text-[10px] text-center italic leading-tight ${isWinningColumn ? 'text-emerald-700' : 'text-emerald-600'}`}>
                              "{cell.selectionRemarks}"
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                <td className="px-3 py-2.5 font-bold text-[12px] text-slate-700 uppercase tracking-wider sticky left-0 z-10 bg-slate-50/95"
                  style={{ boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }} colSpan={2}>Grand Total</td>
                {uniqueSuppliers.map((supplier) => {
                  const isWinningColumn = isApproved && supplier.id === winningSupplierId;
                  const total = Array.from(productsMap.values()).reduce((sum, p) => {
                    const cell = p.suppliers.find(s => s.supplierId === supplier.id);
                    return sum + (cell?.bdtAmount ?? 0);
                  }, 0);
                  return (
                    <td key={supplier.id} className={`px-3 py-2.5 text-center ${isWinningColumn ? 'bg-emerald-100 border-x-2 border-b-2 border-emerald-400 shadow-sm' : ''}`}>
                      <span className={`text-[13px] font-bold ${isWinningColumn ? 'text-emerald-900' : 'text-slate-800'}`}>{total.toLocaleString()}</span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Remarks Section */}
      {cs.remarks && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">CS Remarks</h3>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">{cs.remarks}</p>
        </div>
      )}

      {/* Generate PO Action (Approved Mode) */}
      {isApproved && isPurchaseRole && (
        <div className="flex justify-end mt-6">
          <button 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-colors disabled:opacity-50"
            onClick={() => {
              // TODO: Navigate to Generate PO page or open modal
              navigate(`/dashboard/purchase-orders/create?csId=${cs.id}`);
            }}
          >
            <Package className="w-5 h-5" />
            Generate Purchase Order
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewCSPage;

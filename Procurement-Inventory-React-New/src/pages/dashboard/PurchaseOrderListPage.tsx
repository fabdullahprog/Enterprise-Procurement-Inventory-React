// src/pages/dashboard/PurchaseOrderListPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfqApi } from '../../api/rfqApi';
import { useAuth } from '../../context/AuthContext';
import { GoodsReceiptModal } from '../../components/GoodsReceiptModal';

interface POItem {
  id: number;
  productId: number;
  productName: string;
  orderedQuantity: number;
  supplierRate: number;
  poRate: number;
  totalPrice: number;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  orderDate: string;
  status: string;
  totalBDTAmount: number;
  expectedDeliveryDate?: string;
  supplierName?: string;
  supplierAddress?: string;
  supplierContact?: string;
  csNumber?: string;
  deliveryAddress?: string;
  paymentTerms?: string;
  notes?: string;
  createdByEmail?: string;
  items?: POItem[];
}

const PurchaseOrderListPage = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // UI States
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);

  const isPurchaseRole = roles.some((r) =>
    ['PurchaseOfficer', 'PurchaseManager'].includes(r)
  );
  const isStoreRole = roles.some((r) =>
    ['StoreManager', 'WarehouseManager'].includes(r)
  );
  const isMDOrAdmin = roles.some((r) => ['Admin', 'MD'].includes(r));

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rfqApi.getAllPOs();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load Purchase Orders');
      console.error('Error loading POs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewPO = async (id: number) => {
    try {
      setProcessingAction(true);
      const data = await rfqApi.getPOById(id);
      setSelectedPO(data);
      setIsViewModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load PO details');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSubmitPO = async (id: number) => {
    if (!confirm('Submit this PO for approval?')) return;
    try {
      setProcessingAction(true);
      await rfqApi.submitPO(id);
      loadOrders();
      if (selectedPO?.id === id) setIsViewModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit PO');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleApprovePO = async (id: number) => {
    if (!confirm('Approve this Purchase Order?')) return;
    try {
      setProcessingAction(true);
      await rfqApi.approvePO(id);
      loadOrders();
      if (selectedPO?.id === id) setIsViewModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve PO');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectPO = async () => {
    if (!selectedPO || !rejectReason.trim()) return;
    try {
      setProcessingAction(true);
      await rfqApi.rejectPO(selectedPO.id, rejectReason);
      loadOrders();
      setIsViewModalOpen(false);
      setIsRejecting(false);
      setRejectReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject PO');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReceiveGoodsClick = (po: PurchaseOrder) => {
    setReceivingPO(po);
    setIsReceiptModalOpen(true);
  };
  
  const handleReceiptSuccess = () => {
    setIsReceiptModalOpen(false);
    setReceivingPO(null);
    loadOrders();
    alert('Goods successfully received and inventoried!');
  };

  const handleSendPO = async (id: number) => {
    if (!confirm('Send this PO to the supplier?')) return;
    try {
      setProcessingAction(true);
      await rfqApi.sendPO(id);
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send PO');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'PendingApproval':
      case 'Submitted':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Received':
        return 'bg-teal-50 text-teal-700 border border-teal-200';
      case 'Sent':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const filteredOrders = orders.filter((po) => {
    const matchesSearch =
      !searchTerm.trim() ||
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.csNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats - Mapped PendingApproval to Submitted for KPI count
  const stats = {
    total: orders.length,
    draft: orders.filter((o) => o.status === 'Draft').length,
    submitted: orders.filter((o) => o.status === 'Submitted' || o.status === 'PendingApproval').length,
    approved: orders.filter((o) => o.status === 'Approved').length,
    sent: orders.filter((o) => o.status === 'Sent').length,
  };

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track purchase orders generated from approved comparative statements
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700 bg-slate-50 border-slate-200' },
          { label: 'Draft', value: stats.draft, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Pending', value: stats.submitted, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Sent', value: stats.sent, color: 'text-blue-700 bg-blue-50 border-blue-200' },
        ].map((s) => (
          <div key={s.label} className={`px-3 py-2 rounded-lg border text-center transition-all hover:shadow-sm ${s.color}`}>
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-[11px] font-medium uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search PO#, supplier, CS#..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-[13px] pl-8 pr-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 w-full bg-white shadow-sm"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-[13px] px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-white shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="PendingApproval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Sent">Sent</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button
          onClick={loadOrders}
          className="text-xs px-3 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 bg-white shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-400 p-3 mb-4 flex items-center justify-between shadow-sm rounded-r-md">
          <div className="flex items-center gap-2 text-rose-800 text-sm">
            <span>⚠️</span> {error}
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-bold text-lg">×</button>
        </div>
      )}

      {/* Table */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-teal-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="font-medium">Fetching Purchase Orders...</span>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="3" x2="12" y2="7" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-600 mb-1">No purchase orders found</h3>
          <p className="text-sm text-slate-400 max-w-xs text-center">
            {orders.length === 0
              ? 'Purchase orders will appear here once created from approved Comparative Statements.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left w-12 text-slate-500 font-semibold text-[12px] uppercase tracking-wider"></th>
                  <th className="px-3 py-3 text-left text-slate-500 font-semibold text-[12px] uppercase tracking-wider">PO Number</th>
                  <th className="px-3 py-3 text-left text-slate-500 font-semibold text-[12px] uppercase tracking-wider">Supplier</th>
                  <th className="px-3 py-3 text-center text-slate-500 font-semibold text-[12px] uppercase tracking-wider">Order Date</th>
                  <th className="px-3 py-3 text-right text-slate-500 font-semibold text-[12px] uppercase tracking-wider">Total Amount</th>
                  <th className="px-3 py-3 text-center text-slate-500 font-semibold text-[12px] uppercase tracking-wider">Delivery</th>
                  <th className="px-3 py-3 text-center text-slate-500 font-semibold text-[12px] uppercase tracking-wider">Status</th>
                  <th className="th-action w-44 px-4 py-3 text-center text-slate-500 font-semibold text-[12px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((po, index) => {
                  const isExpanded = expandedRows.has(po.id);
                  return (
                    <>
                      <tr 
                        key={po.id} 
                        className={`hover:bg-teal-50/30 transition-colors group ${isExpanded ? 'bg-teal-50/20' : ''}`}
                      >
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => toggleRow(po.id)}
                            className={`p-1 rounded-md transition-all ${isExpanded ? 'bg-teal-100 text-teal-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                          >
                            <svg 
                              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap text-[13.5px]">
                          {po.poNumber}
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">CS: {po.csNumber || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-700 cell-truncate text-[13px]" title={po.supplierName}>
                          <div className="font-semibold">{po.supplierName || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{po.createdByEmail}</div>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600 whitespace-nowrap text-[13px]">
                          {po.orderDate ? new Date(po.orderDate).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          }) : '—'}
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap text-[13px]">
                          <span className="font-bold text-slate-900">{(po.totalBDTAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600 whitespace-nowrap text-[13px]">
                          {po.expectedDeliveryDate ? (
                            <div className="flex flex-col items-center">
                               <span className="font-medium text-slate-700">
                                 {new Date(po.expectedDeliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                               </span>
                               <span className="text-[10px] text-slate-400">
                                 {new Date(po.expectedDeliveryDate).getFullYear()}
                               </span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusBadgeClass(po.status)}`}
                          >
                            {po.status === 'PendingApproval' ? 'PENDING' : po.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="td-action w-44 px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              className="text-xs px-3 py-1.5 font-bold rounded-lg transition-all border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 bg-white shadow-sm"
                              onClick={() => handleViewPO(po.id)}
                              disabled={processingAction}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>



                            {isPurchaseRole && po.status === 'Draft' && (
                              <button
                                className="text-xs px-3 py-1.5 text-white font-bold rounded-lg transition-all bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
                                onClick={() => handleSubmitPO(po.id)}
                                disabled={processingAction}
                              >
                                Submit
                              </button>
                            )}

                            {isPurchaseRole && po.status === 'Approved' && (
                              <button
                                className="text-xs px-3 py-1.5 text-white font-bold rounded-lg transition-all bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-100"
                                onClick={() => handleSendPO(po.id)}
                                disabled={processingAction}
                              >
                                Send
                              </button>
                            )}

                            {isStoreRole && (po.status === 'Sent' || po.status === 'Approved') && (
                              <button
                                className="text-xs px-3 py-1.5 text-white font-bold rounded-lg transition-all bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-100 flex items-center gap-1"
                                onClick={() => handleReceiveGoodsClick(po)}
                                disabled={processingAction}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Receive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Expansion Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={8} className="px-12 py-4">
                            <div className="bg-white rounded-lg border border-slate-200 shadow-inner overflow-hidden">
                              <table className="w-full text-[12px]">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Product Name</th>
                                    <th className="px-4 py-2 text-center">Quantity</th>
                                    <th className="px-4 py-2 text-right">PO Rate</th>
                                    <th className="px-4 py-2 text-right">Line Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {po.items && po.items.length > 0 ? (
                                    po.items.map(item => (
                                      <tr key={item.id} className="hover:bg-slate-50/30">
                                        <td className="px-4 py-2.5 font-medium text-slate-700">{item.productName}</td>
                                        <td className="px-4 py-2.5 text-center">{item.orderedQuantity}</td>
                                        <td className="px-4 py-2.5 text-right text-slate-500">{item.poRate.toLocaleString()}</td>
                                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">{item.totalPrice.toLocaleString()}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={4} className="px-4 py-4 text-center text-slate-400 italic">No line items available</td>
                                    </tr>
                                  )}
                                </tbody>
                                <tfoot className="bg-slate-50/30 font-bold border-t border-slate-100">
                                  <tr>
                                    <td colSpan={3} className="px-4 py-2 text-right text-slate-500">Grand Total:</td>
                                    <td className="px-4 py-2 text-right text-teal-700">{po.totalBDTAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex justify-between items-center">
            <div>
              Showing <strong className="text-slate-700">{filteredOrders.length}</strong> of{' '}
              <strong className="text-slate-700">{orders.length}</strong> purchase orders
            </div>
            <div className="flex gap-4">
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Pending</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Approved</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Sent</span>
            </div>
          </div>
        </div>
      )}

      {/* PO View Modal */}
      {isViewModalOpen && selectedPO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Purchase Order Details</h2>
                  <p className="text-xs text-slate-500">Document No: <span className="font-mono font-semibold">{selectedPO.poNumber}</span></p>
                </div>
              </div>
              <button 
                onClick={() => { setIsViewModalOpen(false); setIsRejecting(false); }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              {/* Document Header */}
              <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-50 border-dashed">
                 <div>
                    <h3 className="text-2xl font-black text-teal-700 mb-1">PURCHASE ORDER</h3>
                    <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadgeClass(selectedPO.status)}`}>
                       {selectedPO.status}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">Date: {selectedPO.orderDate ? new Date(selectedPO.orderDate).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Expected Delivery: {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</div>
                 </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-8 mb-10">
                 <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Supplier Details</h4>
                    <div className="space-y-1">
                       <p className="text-base font-bold text-slate-900">{selectedPO.supplierName}</p>
                       <p className="text-sm text-slate-600 leading-relaxed">{selectedPO.supplierAddress || 'No address provided'}</p>
                       <p className="text-sm text-slate-600">Contact: {selectedPO.supplierContact || 'N/A'}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Delivery Address</h4>
                    <div className="space-y-1">
                       <p className="text-sm font-semibold text-slate-700">Ship To:</p>
                       <p className="text-sm text-slate-600 leading-relaxed">{selectedPO.deliveryAddress || 'Standard Warehouse Delivery'}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Shipment & Commercials</h4>
                    <div className="space-y-1">
                       <p className="text-sm text-slate-600"><span className="font-semibold text-slate-700">Mode of Shipment:</span> SEA</p>
                       <p className="text-sm text-slate-600"><span className="font-semibold text-slate-700">Trade Term:</span> CFR Chattogram, Bangladesh</p>
                       <p className="text-sm text-slate-600 mt-2"><span className="font-semibold text-slate-700">Payment Term:</span> {selectedPO.paymentTerms || 'LC At Sight'}</p>
                    </div>
                 </div>
              </div>

              {/* Line Items */}
              <div className="mb-10">
                 <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2 mb-4">Line Items</h4>
                 <table className="w-full">
                    <thead>
                       <tr className="bg-slate-50 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3 text-left rounded-l-lg">Product Description</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Unit Rate</th>
                          <th className="px-4 py-3 text-right rounded-r-lg">Total Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {selectedPO.items?.map((item, idx) => (
                          <tr key={item.id} className="text-sm">
                             <td className="px-4 py-4">
                                <div className="font-bold text-slate-800">{item.productName}</div>
                                <div className="text-[10px] text-slate-400">ID: PRD-{item.productId}</div>
                             </td>
                             <td className="px-4 py-4 text-center font-medium text-slate-600">{item.orderedQuantity}</td>
                             <td className="px-4 py-4 text-right text-slate-600">{item.poRate.toLocaleString()}</td>
                             <td className="px-4 py-4 text-right font-bold text-slate-900">{item.totalPrice.toLocaleString()}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end border-t-2 border-slate-100 pt-6">
                 <div className="w-80 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Sub Total</span>
                       <span className="text-slate-800 font-semibold">{selectedPO.totalBDTAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Service Charge (+)</span>
                       <span className="text-slate-800 font-semibold text-amber-600">0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Additional Charge (+)</span>
                       <span className="text-slate-800 font-semibold text-amber-600">0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Deduction (-)</span>
                       <span className="text-slate-800 font-semibold text-emerald-600">0.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                       <span className="text-lg font-black text-slate-900">Grand Total</span>
                       <span className="text-xl font-black text-teal-700">{selectedPO.totalBDTAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-xl">
                 <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4">Official Terms & Conditions</h4>
                 <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                    <li><strong>Country of Origin:</strong> Goods must be authentic and originate from the declared manufacturing country.</li>
                    <li><strong>HS Code:</strong> Proper HS codes must be declared on the commercial invoice for smooth customs clearance.</li>
                    <li><strong>Shipment Date:</strong> Delivery must be initiated strictly on or before the agreed expected delivery date.</li>
                    <li><strong>Quality Assurance:</strong> Any items failing the GRN quality check will be returned at the supplier's expense.</li>
                 </ul>
              </div>

              {/* Notes */}
              {selectedPO.notes && (
                <div className="mt-12 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                   <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2">Internal Notes / Terms</h4>
                   <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedPO.notes}"</p>
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                 <button 
                   onClick={() => window.open(`/dashboard/po-print/${selectedPO.id}`, '_blank')} 
                   className="flex items-center gap-2 px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-100"
                 >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print Document
                 </button>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Close
                </button>
                
                {isMDOrAdmin && selectedPO.status === 'PendingApproval' && !isRejecting && (
                  <>
                    <button 
                      onClick={() => setIsRejecting(true)}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-lg shadow-rose-100 flex items-center gap-2"
                      disabled={processingAction}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprovePO(selectedPO.id)}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                      disabled={processingAction}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approve Order
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Rejection Overlay */}
            {isRejecting && (
               <div className="absolute inset-0 bg-white z-[110] flex items-center justify-center p-8 animate-in slide-in-from-bottom duration-300">
                  <div className="w-full max-w-md">
                     <h3 className="text-xl font-black text-slate-900 mb-2">Rejection Reason</h3>
                     <p className="text-sm text-slate-500 mb-6">Please provide a reason why this Purchase Order is being rejected. This will be visible to the Purchase Officer.</p>
                     <textarea 
                        className="w-full h-32 p-4 border-2 border-slate-100 rounded-2xl focus:border-rose-400 outline-none transition-all mb-6 resize-none"
                        placeholder="Type rejection reason here..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                     ></textarea>
                     <div className="flex gap-4">
                        <button 
                          onClick={() => setIsRejecting(false)}
                          className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                        >
                           Go Back
                        </button>
                        <button 
                          onClick={handleRejectPO}
                          disabled={!rejectReason.trim() || processingAction}
                          className="flex-1 py-3 font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all shadow-xl shadow-rose-100"
                        >
                           Confirm Rejection
                        </button>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* GRN Receipt Modal */}
      {isReceiptModalOpen && receivingPO && (
        <GoodsReceiptModal 
           purchaseOrder={receivingPO} 
           onClose={() => { setIsReceiptModalOpen(false); setReceivingPO(null); }}
           onSuccess={handleReceiptSuccess}
        />
      )}

      {/* Global CSS for Print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .fixed.inset-0, .fixed.inset-0 * { visibility: visible; }
          .fixed.inset-0 { position: absolute; left: 0; top: 0; }
          .modal-footer, .modal-header button, .rejection-overlay { display: none !important; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: fadeIn 0.2s ease-out; }
        .zoom-in-95 { animation: zoomIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default PurchaseOrderListPage;

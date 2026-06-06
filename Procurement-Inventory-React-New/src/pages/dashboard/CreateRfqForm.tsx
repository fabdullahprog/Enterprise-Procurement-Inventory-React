// src/pages/dashboard/CreateRfqForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { rfqApi, supplierApi, Supplier } from '../../api/purchaseApi';
import {
  StatsHeader,
  FormSection,
  FieldGroup,
  Input,
  Textarea,
  FormActions,
  COLORS
} from '../../components/form';

interface PRItem {
  id: number;
  productId: number;
  productName?: string;
  requiredQuantity: number;
  remarks?: string;
}

interface LocationState {
  prId: number;
  prNumber: string;
  items: PRItem[];
}

const CreateRfqForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supplierSearch, setSupplierSearch] = useState('');

  const todayISO = new Date().toISOString().split('T')[0];
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 7);

  const [formData, setFormData] = useState({
    rfqDate: todayISO,
    submissionDeadline: defaultDeadline.toISOString().split('T')[0],
    terms: '',
    deliveryLocation: 'Central Warehouse'
  });

  useEffect(() => {
    if (!state?.prId) {
      navigate('/dashboard/purchase/requisitions');
      return;
    }
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierApi.getAll();
      setSuppliers(data.filter(s => s.isActive));
    } catch (err: any) {
      console.error('Error loading suppliers:', err);
      setError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierToggle = (supplierId: number) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredSuppliers;
    const allSelected = filtered.every(s => selectedSuppliers.includes(s.id));
    if (allSelected) {
      setSelectedSuppliers(prev => prev.filter(id => !filtered.some(s => s.id === id)));
    } else {
      setSelectedSuppliers(prev => [...new Set([...prev, ...filtered.map(s => s.id)])]);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    (s.contactPerson?.toLowerCase() || '').includes(supplierSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return;

    if (selectedSuppliers.length === 0) {
      setError('Please select at least one supplier');
      return;
    }
    if (!formData.submissionDeadline) {
      setError('Please set a submission deadline');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const rfqResponse = await rfqApi.createRFQ({
        requisitionId: state.prId,
        quotationDeadline: formData.submissionDeadline,
        notes: formData.terms ? `${formData.terms}\nDelivery Location: ${formData.deliveryLocation}` : `Delivery Location: ${formData.deliveryLocation}`,
        deliveryLocation: formData.deliveryLocation // sending it explicitly as well in case the API supports it natively
      } as any);

      await rfqApi.sendToSuppliers(rfqResponse.id, {
        supplierIds: selectedSuppliers
      });

      alert(`RFQ Created Successfully!\nRFQ Number: ${rfqResponse.number}\nSent to ${selectedSuppliers.length} supplier(s)`);
      navigate('/dashboard/rfqs');
    } catch (err: any) {
      console.error('Error creating RFQ:', err);
      setError(err.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  if (!state?.prId) return null;

  const items = state.items || [];

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-slate-500 text-[13px]">Loading suppliers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <StatsHeader
        accentColor={COLORS.PURCHASE}
        icon="📄"
        title="Create Request for Quotation"
        subtitle={`Sourcing suppliers for PR: ${state.prNumber}`}
        stats={[
          { label: 'Reference PR', value: state.prNumber },
          { label: 'Items', value: items.length },
          { label: 'Suppliers Selected', value: selectedSuppliers.length },
          { label: 'Deadline', value: formData.submissionDeadline || '—' }
        ]}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 flex items-start justify-between mt-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 text-[13px] font-medium">Error</p>
              <p className="text-red-600 text-[13px]">{error}</p>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xl font-bold">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 md:p-8 mt-6">

        {/* ─── Master Info ─── */}
        <FormSection icon="ℹ️" title="RFQ Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FieldGroup label="RFQ Reference">
              <Input value="Auto Generated" readOnly />
            </FieldGroup>
            <FieldGroup label="Reference PR No.">
              <Input value={state.prNumber} readOnly />
            </FieldGroup>
            <FieldGroup label="RFQ Date">
              <Input type="date" value={formData.rfqDate} readOnly />
            </FieldGroup>
            <FieldGroup label="Submission Deadline" required>
              <Input
                type="date"
                value={formData.submissionDeadline}
                min={todayISO}
                onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Delivery Location">
              <Input
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                placeholder="e.g. Central Warehouse"
              />
            </FieldGroup>
          </div>
        </FormSection>

        {/* ─── Supplier Selection ─── */}
        <FormSection
          icon="🏢"
          title="Supplier Selection"
          headerAction={
            <span className="text-[12px] font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              {selectedSuppliers.length} selected
            </span>
          }
        >
          {/* Search & Select All */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search suppliers by name or contact..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-[13px] border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-2 text-[12px] font-medium text-teal-700 border border-teal-300 rounded-md hover:bg-teal-50 transition-colors whitespace-nowrap"
            >
              {filteredSuppliers.every(s => selectedSuppliers.includes(s.id)) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Supplier List */}
          <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-slate-100">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => {
                const isSelected = selectedSuppliers.includes(supplier.id);
                return (
                  <label
                    key={supplier.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSupplierToggle(supplier.id)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 truncate">{supplier.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {[supplier.contactPerson, supplier.email, supplier.phone].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="flex-shrink-0 text-teal-600 text-[11px] font-medium bg-teal-100 px-2 py-0.5 rounded-full">
                        ✓ Selected
                      </span>
                    )}
                  </label>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-slate-500 text-[13px]">
                {supplierSearch ? 'No suppliers match your search' : 'No active suppliers found'}
              </div>
            )}
          </div>
        </FormSection>

        {/* ─── Items Grid (auto-filled, read-only) ─── */}
        <FormSection icon="📦" title={`Requisition Items (${items.length})`}>
          <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mt-2">
            <div className="w-full overflow-x-auto relative">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-12 px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">#</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Product Name</th>
                    <th className="w-20 px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Unit</th>
                    <th className="w-28 px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Req. Qty</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-[13px] text-slate-600 text-center">{index + 1}</td>
                      <td className="px-3 py-2.5 text-[13px] font-medium text-slate-800 cell-truncate" title={item.productName || ''}>{item.productName || 'N/A'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">Pcs</span>
                      </td>
                      <td className="px-3 py-2.5 text-[13px] text-slate-900 text-center font-medium">{item.requiredQuantity}</td>
                      <td className="px-3 py-2.5 text-[13px] text-slate-500 cell-truncate">{item.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 italic">
            ℹ️ Items are auto-populated from PR {state.prNumber}. No pricing columns — suppliers will provide their own quotations.
          </p>
        </FormSection>

        {/* ─── Terms & Conditions ─── */}
        <FormSection icon="📝" title="Terms & Conditions">
          <FieldGroup label="Notes to Suppliers">
            <Textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={4}
              placeholder="Enter delivery terms, payment conditions, or any special instructions for suppliers..."
            />
          </FieldGroup>
          <p className="text-[11px] text-slate-400 italic">These notes will be sent along with the RFQ to all selected suppliers.</p>
        </FormSection>

        <FormActions
          onDiscard={() => navigate(-1)}
          discardLabel="Cancel"
          submitLabel={submitting ? 'Creating RFQ...' : `Create & Send RFQ to ${selectedSuppliers.length} Supplier(s)`}
          isSubmitting={submitting}
          accentColor={COLORS.PURCHASE}
        />
      </form>
    </div>
  );
};

export default CreateRfqForm;

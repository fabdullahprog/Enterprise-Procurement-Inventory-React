// src/pages/dashboard/EmployeeRequisitionDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employeeRequisitionApi, EmployeeRequisition } from '../../api/employeeRequisitionApi';
import axiosInstance from '../../api/axiosInstance';
import {
  StatusBanner,
  FormSection,
  ViewSection,
  ViewField,
  DynamicTable,
  Badge,
  COLORS,
  TableColumn,
  FieldGroup,
  Input,
  Select,
  Textarea
} from '../../components/form';

interface Category {
  id: number;
  name: string;
  categoryName?: string;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  currentStock: number;
  unitName?: string;
  itemCategoryId: number;
}

interface EditableItem {
  id?: number;
  categoryId?: number;
  itemId: number;
  itemName: string;
  requiredQty: number;
  currentStock?: number;
  remarks?: string;
}

const EmployeeRequisitionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, roles } = useAuth();

  const [requisition, setRequisition] = useState<EmployeeRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editedItems, setEditedItems] = useState<EditableItem[]>([]);
  const [editedNotes, setEditedNotes] = useState('');

  const requisitionId = id ? parseInt(id) : 0;
  const isDeptHead = roles.includes('DepartmentHead') || roles.includes('Admin');

  useEffect(() => {
    if (requisitionId) {
      loadRequisition();
    }
  }, [requisitionId]);

  const loadRequisition = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeRequisitionApi.getRequisitionById(requisitionId);
      
      // Backend might return { success: true, data: {...} } or just the data
      const data = response.data || response;
      
      console.log('📋 API Response:', response);
      console.log('📋 Extracted data:', data);
      
      if (!data || !data.id) {
        throw new Error('Invalid requisition data received');
      }
      
      setRequisition(data);
    } catch (err: any) {
      console.error('❌ Error loading requisition:', err);
      console.error('❌ Error response:', err.response);
      setError(err.response?.data?.message || err.message || 'Failed to load requisition details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!requisition) return;
    
    if (!window.confirm('Submit this requisition to Department Head?')) return;

    try {
      setSubmitting(true);
      await employeeRequisitionApi.submitRequisition(requisitionId);
      alert('✅ Requisition submitted successfully!');
      loadRequisition();
    } catch (err: any) {
      console.error('Error submitting:', err);
      alert(err.response?.data?.message || 'Failed to submit requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!requisition) return;
    
    if (!window.confirm('Approve this requisition and forward to Store?')) return;

    try {
      setSubmitting(true);
      await employeeRequisitionApi.approveRequisition(requisitionId);
      alert('✅ Requisition approved and forwarded to Store!');
      loadRequisition();
    } catch (err: any) {
      console.error('Error approving:', err);
      alert(err.response?.data?.message || 'Failed to approve requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!requisition) return;

    // Dept Head revise is notes-only
    if (isDeptHead) {
      setEditedNotes(requisition.notes || '');
      setIsEditing(true);
      return;
    }

    // Employee revised edit: load categories and products
    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        axiosInstance.get('/api/ItemCategory'),
        axiosInstance.get('/api/Product')
      ]);
      
      const categoriesData = (categoriesResponse.data || []).map((c: any) => ({
        id: c.itemCategoryId || c.id,
        name: c.categoryName || c.name,
        isActive: c.isActive !== false
      })).filter((c: Category) => c.isActive);
      
      const productsData = (productsResponse.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        currentStock: p.currentStock || 0,
        unitName: p.unitName || 'Pcs',
        itemCategoryId: p.itemCategoryId
      }));
      
      setCategories(categoriesData);
      setProducts(productsData);
      
      // Map existing items
      const mappedItems = (requisition.items || []).map(item => {
        const product = productsData.find((p: Product) => p.id === item.itemId);
        return {
          id: item.id,
          itemId: item.itemId,
          itemName: item.itemName,
          requiredQty: item.requiredQty,
          currentStock: item.currentStock,
          remarks: item.remarks || '',
          categoryId: product?.itemCategoryId || 0
        };
      });
      
      setEditedItems(mappedItems);
      setEditedNotes(requisition.notes || '');
      setIsEditing(true);
    } catch (err) {
      console.error('Error loading data for edit:', err);
      alert('Failed to load data for editing');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedItems([]);
    setEditedNotes('');
  };

  const handleSaveEdit = async () => {
    if (!requisition) return;

    try {
      setSubmitting(true);

      if (isDeptHead) {
        await employeeRequisitionApi.reviseRequisition(requisitionId, {
          notes: editedNotes
        });
        alert('✅ Requisition revise successfully!');
      } else {
        const validItems = editedItems.filter(item => item.itemId > 0 && item.requiredQty > 0);
        if (validItems.length === 0) {
          alert('Please add at least one item');
          return;
        }

        const payload = {
          requiredByDate: requisition.requiredByDate,
          notes: editedNotes,
          items: validItems.map(item => ({
            itemId: item.itemId,
            itemName: item.itemName?.trim(),
            requiredQty: item.requiredQty,
            currentStock: item.currentStock || 0,
            remarks: item.remarks || ''
          }))
        };

        await employeeRequisitionApi.updateRevisedRequisition(requisitionId, payload);
        alert('✅ Requisition updated and sent back to Department Head successfully!');
        navigate('/dashboard/requisitions');
        return;
      }

      setIsEditing(false);
      await loadRequisition();
    } catch (err: any) {
      console.error('Error revising requisition:', err);
      console.error('Error response body:', err?.response?.data);
      alert(err.response?.data?.message || 'Failed to revise requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryChange = (index: number, categoryId: number) => {
    const newItems = [...editedItems];
    newItems[index] = {
      ...newItems[index],
      categoryId: categoryId,
      itemId: 0,
      itemName: ''
    };
    setEditedItems(newItems);
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...editedItems];
      newItems[index] = {
        ...newItems[index],
        itemId: product.id,
        itemName: product.name,
        currentStock: product.currentStock,
        categoryId: product.itemCategoryId
      };
      setEditedItems(newItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...editedItems];
    newItems[index].requiredQty = quantity;
    setEditedItems(newItems);
  };

  const handleRemarksChange = (index: number, remarks: string) => {
    const newItems = [...editedItems];
    newItems[index].remarks = remarks;
    setEditedItems(newItems);
  };

  const addItem = () => {
    setEditedItems([...editedItems, {
      itemId: 0,
      itemName: '',
      requiredQty: 1,
      remarks: '',
      categoryId: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (editedItems.length > 1) {
      setEditedItems(editedItems.filter((_, i) => i !== index));
    }
  };

  const handleDelete = async () => {
    if (!requisition) return;
    
    if (!window.confirm('Are you sure you want to reject this requisition?')) return;

    try {
      setSubmitting(true);
      await employeeRequisitionApi.deleteRequisition(requisitionId);
      alert('✅ Requisition rejected successfully!');
      navigate('/dashboard/dept-head-approvals');
    } catch (err: any) {
      console.error('Error rejecting:', err);
      alert(err.response?.data?.message || 'Failed to reject requisition');
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'draft': return '#6B7280';
      case 'submitted': return '#F59E0B';
      case 'pending_dept_head': return '#F59E0B';
      case 'approved': return '#22C55E';
      case 'forwarded': return '#3B82F6';
      case 'forwarded_to_store': return '#3B82F6';
      case 'rejected': return '#EF4444';
      case 'revised': return '#EF4444';
      default: return COLORS.REQUISITION;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending_dept_head': return 'Pending Dept Head';
      case 'forwarded_to_store': return 'Forwarded to Store';
      case 'revised': return 'Revise';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading requisition details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !requisition) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 text-sm mb-4">{error || 'Requisition not found'}</p>
          <button
            onClick={() => navigate('/dashboard/requisitions')}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            ← Back to My Requisitions
          </button>
        </div>
      </div>
    );
  }

  // Hide stock from this requisition view for employee revise/edit flow
  const showStockColumn = false;
  const isRequester = requisition.requestedBy === user?.id;
  const statusLower = requisition.status.toLowerCase();
  const canEmployeeEditRevised = !isDeptHead && isRequester && statusLower === 'revised';
  const canEmployeeSubmit = !isDeptHead && isRequester && statusLower === 'draft';
  const isDeptHeadReviseView = isDeptHead && statusLower === 'revised';

  // Define table columns for items
  const itemColumns: TableColumn[] = isEditing ? [
    {
      key: 'categoryId',
      label: 'Category',
      width: '200px',
      render: (value, row, index) => {
        const product = products.find(p => p.id === row.itemId);
        const categoryId = value || product?.itemCategoryId || 0;
        
        return (
          <Select
            value={categoryId}
            onChange={(e) => handleCategoryChange(index, parseInt(e.target.value))}
          >
            <option value={0}>-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        );
      }
    },
    {
      key: 'itemId',
      label: 'Product',
      width: '300px',
      render: (value, row, index) => {
        const categoryId = row.categoryId || products.find(p => p.id === row.itemId)?.itemCategoryId || 0;
        const filteredProducts = categoryId ? products.filter(p => p.itemCategoryId === categoryId) : [];
        
        return (
          <Select
            value={value}
            onChange={(e) => handleProductChange(index, parseInt(e.target.value))}
            disabled={!categoryId}
          >
            <option value={0}>-- Select Product --</option>
            {filteredProducts.map(prod => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </Select>
        );
      }
    },
    ...(showStockColumn ? [{
      key: 'currentStock',
      label: 'Stock',
      width: '100px',
      align: 'center' as const,
      render: (value: number) => <Badge variant={value > 0 ? 'success' : 'danger'}>{value || 0}</Badge>
    }] : []),
    {
      key: 'requiredQty',
      label: 'Quantity',
      width: '120px',
      render: (value, row, index) => (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
          min="1"
        />
      )
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value, row, index) => (
        <Input
          value={value || ''}
          onChange={(e) => handleRemarksChange(index, e.target.value)}
          placeholder="Optional..."
        />
      )
    }
  ] : [
    {
      key: 'itemName',
      label: 'Product',
      width: '300px'
    },
    ...(showStockColumn ? [{
      key: 'currentStock',
      label: 'Stock',
      width: '100px',
      align: 'center' as const,
      render: (value: number) => {
        const stock = value || 0;
        return <Badge variant={stock > 0 ? 'success' : 'danger'}>{stock}</Badge>;
      }
    }] : []),
    {
      key: 'requiredQty',
      label: 'Quantity',
      width: '100px',
      align: 'center' as const,
      render: (value) => <Badge variant="info">{value}</Badge>
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value) => value || '—'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <StatusBanner
        status={getStatusLabel(requisition.status)}
        color={getStatusColor(requisition.status)}
        icon="📝"
        metadata={[
          { label: 'REQ Number', value: requisition.requisitionNo },
          { label: 'Created Date', value: new Date(requisition.createdDate).toLocaleDateString() },
          { label: 'Created By', value: requisition.requestedByName || requisition.requestedByEmail || 'N/A' }
        ]}
      />

      {/* Revision Reason Alert — shown when Dept Head sent requisition back for revision */}
      {statusLower === 'revised' && requisition.notes && (
        <div
          className="mb-5 rounded-lg border px-4 py-3.5 flex items-start gap-3"
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#FDE68A',
          }}
        >
          {/* Warning icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="#D97706"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p
              className="text-sm font-semibold mb-0.5"
              style={{ color: '#92400E' }}
            >
              Reason for Revision
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#B45309' }}
            >
              {requisition.notes}
            </p>
          </div>
        </div>
      )}

      {isEditing ? (
        // EDIT MODE
        <div>
          <FormSection icon="ℹ️" title="Requisition Information">
            <ViewSection columns={3}>
              <ViewField label="Requisition Number" value={requisition.requisitionNo} />
              <ViewField label="Department" value={requisition.departmentName} />
              <ViewField label="Status" value={<Badge variant="warning">{getStatusLabel(requisition.status)}</Badge>} />
            </ViewSection>
            
            <div className="mt-4">
              <FieldGroup label="Notes">
                <Textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes..."
                />
              </FieldGroup>
            </div>
          </FormSection>

          {!isDeptHead && (
            <FormSection
              icon="📦"
              title="Edit Items"
              headerAction={
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 text-[13px] font-medium rounded-md border-[0.5px] transition-colors hover:bg-purple-50"
                  style={{
                    borderColor: COLORS.REQUISITION,
                    color: COLORS.REQUISITION
                  }}
                >
                  + Add Item
                </button>
              }
            >
              <DynamicTable
                columns={itemColumns}
                data={editedItems}
                onRowRemove={removeItem}
                minRows={1}
              />
            </FormSection>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-gray-200 mt-6">
            <button
              onClick={handleCancelEdit}
              disabled={submitting}
              className="px-5 py-2.5 border-[0.5px] border-gray-300 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={submitting}
              className="px-5 py-2.5 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
              style={{ backgroundColor: COLORS.REQUISITION }}
            >
              {submitting ? (isDeptHead ? 'Revising...' : 'Saving...') : (isDeptHead ? 'Revise' : '💾 Save Changes')}
            </button>
          </div>
        </div>
      ) : (
        // VIEW MODE
        <div>
          <FormSection icon="ℹ️" title="Requisition Information">
        <ViewSection columns={3}>
          <ViewField label="Requisition Number" value={requisition.requisitionNo} />
          <ViewField label="Department" value={requisition.departmentName} />
          <ViewField 
            label="Status" 
            value={
              <Badge 
                variant={
                  requisition.status.toLowerCase() === 'approved' ? 'success' :
                  requisition.status.toLowerCase() === 'draft' ? 'default' :
                  requisition.status.toLowerCase() === 'rejected' ? 'danger' :
                  requisition.status.toLowerCase() === 'revised' ? 'danger' :
                  'warning'
                }
              >
                {getStatusLabel(requisition.status)}
              </Badge>
            } 
          />
          <ViewField 
            label="Created Date" 
            value={new Date(requisition.createdDate).toLocaleDateString()} 
          />
          <ViewField 
            label="Required By Date" 
            value={requisition.requiredByDate ? new Date(requisition.requiredByDate).toLocaleDateString() : '—'} 
          />
          <ViewField label="Requested By" value={requisition.requestedByName || requisition.requestedByEmail} />
          
          {requisition.submittedAt && (
            <ViewField 
              label="Submitted At" 
              value={new Date(requisition.submittedAt).toLocaleString()} 
            />
          )}
          {requisition.approvedAt && (
            <ViewField 
              label="Approved At" 
              value={new Date(requisition.approvedAt).toLocaleString()} 
            />
          )}
          {requisition.forwardedAt && (
            <ViewField 
              label="Forwarded At" 
              value={new Date(requisition.forwardedAt).toLocaleString()} 
            />
          )}
          
          {requisition.notes && (
            <ViewField label="Notes" value={requisition.notes} span={3} />
          )}
        </ViewSection>
      </FormSection>

      {!isDeptHeadReviseView && (
        <FormSection icon="📦" title={`Requisition Items (${requisition.items?.length || 0})`}>
          {requisition.items && requisition.items.length > 0 ? (
            <DynamicTable
              columns={itemColumns}
              data={requisition.items}
              readOnly
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No items in this requisition
            </div>
          )}
        </FormSection>
      )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-5 border-t border-gray-200 mt-6">
            <button
              onClick={() => navigate('/dashboard/requisitions')}
              className="px-5 py-2.5 border-[0.5px] border-gray-300 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              ← Back to My Requisitions
            </button>
            
            {!isDeptHeadReviseView && isDeptHead && (requisition.status === 'pending_dept_head' || requisition.status === 'revised') && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  disabled={submitting}
                  className="px-5 py-2.5 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: `${COLORS.REQUISITION}20`,
                    color: COLORS.REQUISITION,
                    border: `0.5px solid ${COLORS.REQUISITION}40`
                  }}
                >
                  ✏️ Revise
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-green-600 text-white text-[13px] font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ✓ Approve & Forward
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-5 py-2.5 border-[0.5px] border-red-300 text-red-600 text-[13px] font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            )}

            {!isDeptHead && (
              <div className="flex items-center gap-3">
                {canEmployeeEditRevised && (
                  <button
                    onClick={handleEdit}
                    disabled={submitting}
                    className="px-5 py-2.5 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: `${COLORS.REQUISITION}20`,
                      color: COLORS.REQUISITION,
                      border: `0.5px solid ${COLORS.REQUISITION}40`
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}
                {canEmployeeSubmit && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-5 py-2.5 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
                    style={{ backgroundColor: COLORS.REQUISITION }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Requisition'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRequisitionDetailPage;

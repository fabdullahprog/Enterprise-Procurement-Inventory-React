// src/components/requisitions/RequisitionDetail.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requisitionApi } from '../../api/requisitionApi';
import { PurchaseRequisition, RequisitionItem } from '../../types';
import {
  StatusBanner,
  FormSection,
  ViewSection,
  ViewField,
  DynamicTable,
  Badge,
  ActionButton,
  COLORS,
  TableColumn,
  FieldGroup,
  Input,
  Select,
  Textarea
} from '../form';
import axiosInstance from '../../api/axiosInstance';

interface RequisitionDetailProps {
  requisitionId: number;
  onBack: () => void;
  isDeptHead?: boolean;
  isPurchaseManager?: boolean;
}

interface Product {
  id: number;
  name: string;
  currentStock: number;
  unitName?: string;
  itemCategoryId: number;
}

interface EditableItem {
  id: number;
  productId: number;
  productName: string;
  requiredQuantity: number;
  remarks?: string;
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
  categoryName?: string;
  isActive: boolean;
}

const RequisitionDetail: React.FC<RequisitionDetailProps> = ({
  requisitionId,
  onBack,
  isDeptHead,
  isPurchaseManager
}) => {
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState<PurchaseRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit form state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editedItems, setEditedItems] = useState<EditableItem[]>([]);
  const [editedNotes, setEditedNotes] = useState('');

  useEffect(() => {
    loadRequisition();
  }, [requisitionId]);

  const loadRequisition = async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      // Load requisition details
      const data = await requisitionApi.getRequisitionById(requisitionId);
      console.log('📋 Loaded requisition:', data);
      console.log('📋 Raw response structure:', JSON.stringify(data, null, 2));
      
      // Check if items are nested in data.data or data itself
      let requisitionData = data;
      if (data.data && typeof data.data === 'object') {
        requisitionData = data.data;
        console.log('📋 Found nested data:', requisitionData);
      }
      
      // Ensure items array exists
      if (!requisitionData.items) {
        requisitionData.items = [];
      }
      
      console.log('📦 Final items in requisition:', requisitionData.items);
      console.log('📦 Final items count:', requisitionData.items?.length || 0);
      
      setRequisition(requisitionData);
    } catch (err: any) {
      console.error('❌ Error loading requisition:', err);
      setError(err.response?.data?.message || 'Failed to load requisition details');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/Product');
      const productsData = (response.data || []).map((p: any) => ({
        id: p.id || p.productId,
        name: p.name || p.productName,
        currentStock: p.currentStock || p.stockQuantity || 0,
        unitName: p.unitName || p.unit?.nameOfUnit || 'Pcs',
        itemCategoryId: p.itemCategoryId || p.categoryId
      }));
      setProducts(productsData.filter((p: Product) => p.id));
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/ItemCategory');
      const categoriesData = (response.data || []).map((c: any) => ({
        id: c.itemCategoryId || c.id || c.categoryId,
        name: c.categoryName || c.name || c.itemCategoryName,
        categoryName: c.categoryName || c.name,
        isActive: c.isActive !== false
      }));
      setCategories(categoriesData.filter((c: Category) => c.isActive));
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleEditClick = async () => {
    if (!requisition) return;
    
    // Load products and categories for dropdown
    const [productsResponse, categoriesResponse] = await Promise.all([
      axiosInstance.get('/api/Product'),
      axiosInstance.get('/api/ItemCategory')
    ]);
    
    // Map products
    const productsData = (productsResponse.data || []).map((p: any) => ({
      id: p.id || p.productId,
      name: p.name || p.productName,
      currentStock: p.currentStock || p.stockQuantity || 0,
      unitName: p.unitName || p.unit?.nameOfUnit || 'Pcs',
      itemCategoryId: p.itemCategoryId || p.categoryId
    })).filter((p: Product) => p.id);
    
    // Map categories
    const categoriesData = (categoriesResponse.data || []).map((c: any) => ({
      id: c.itemCategoryId || c.id || c.categoryId,
      name: c.categoryName || c.name || c.itemCategoryName,
      categoryName: c.categoryName || c.name,
      isActive: c.isActive !== false
    })).filter((c: Category) => c.isActive);
    
    setProducts(productsData);
    setCategories(categoriesData);
    
    // Initialize edit form with current data
    const mappedItems = (requisition.items || []).map(item => {
      // Find product to get categoryId
      const product = productsData.find((p: Product) => p.id === item.productId);
      return {
        id: item.id || 0,
        productId: item.productId,
        productName: item.productName,
        requiredQuantity: item.requiredQuantity,
        remarks: item.remarks || '',
        categoryId: product?.itemCategoryId || 0
      };
    });
    
    console.log('📝 Initializing edit with items:', mappedItems);
    console.log('📝 Available products:', productsData.length);
    console.log('📝 Available categories:', categoriesData.length);
    
    setEditedItems(mappedItems);
    setEditedNotes(requisition.notes || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedItems([]);
    setEditedNotes('');
  };

  const handleCategoryChange = (index: number, categoryId: number) => {
    const newItems = [...editedItems];
    newItems[index] = {
      ...newItems[index],
      categoryId: categoryId,
      productId: 0,
      productName: ''
    };
    setEditedItems(newItems);
  };

  const handleSaveEdit = async () => {
    if (!requisition) return;
    
    const validItems = editedItems.filter(item => item.productId > 0 && item.requiredQuantity > 0);
    
    if (validItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    try {
      setSubmitting(true);
      setError(undefined);
      
      await requisitionApi.updateRequisition(requisitionId, {
        requiredByDate: requisition.requiredByDate,
        notes: editedNotes,
        items: validItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          requiredQuantity: item.requiredQuantity,
          remarks: item.remarks || ''
        }))
      });
      
      setSuccess('✅ Requisition updated successfully!');
      setIsEditing(false);
      await loadRequisition();
    } catch (err: any) {
      console.error('Error updating requisition:', err);
      setError(err.response?.data?.message || 'Failed to update requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...editedItems];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        productName: product.name,
        requiredQuantity: newItems[index].requiredQuantity || 1,
        categoryId: product.itemCategoryId
      };
      setEditedItems(newItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...editedItems];
    newItems[index].requiredQuantity = quantity;
    setEditedItems(newItems);
  };

  const handleRemarksChange = (index: number, remarks: string) => {
    const newItems = [...editedItems];
    newItems[index].remarks = remarks;
    setEditedItems(newItems);
  };

  const addItem = () => {
    setEditedItems([...editedItems, {
      id: 0,
      productId: 0,
      productName: '',
      requiredQuantity: 1,
      remarks: '',
      categoryId: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (editedItems.length > 1) {
      setEditedItems(editedItems.filter((_, i) => i !== index));
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this requisition?')) return;
    try {
      setSubmitting(true);
      await requisitionApi.approveRequisition(requisitionId);
      setSuccess('✅ Requisition approved successfully!');
      await loadRequisition();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    try {
      setSubmitting(true);
      await requisitionApi.rejectRequisition(requisitionId, { reason });
      setSuccess('✅ Requisition rejected successfully!');
      await loadRequisition();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this requisition?')) return;
    try {
      setSubmitting(true);
      await requisitionApi.deleteRequisition(requisitionId);
      setSuccess('✅ Requisition deleted successfully!');
      setTimeout(() => navigate('/dashboard/requisitions'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete requisition');
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#22C55E';
      case 'rejected': return '#EF4444';
      case 'rfqsent': return '#3B82F6';
      case 'pocreated': return '#22C55E';
      default: return COLORS.PURCHASE;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading requisition details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !requisition) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h2 className="text-gray-800 text-lg font-semibold mb-2">Requisition Not Found</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const canEdit = isDeptHead && requisition.status.toLowerCase() === 'pending';
  const canApprove = isDeptHead && requisition.status.toLowerCase() === 'pending';
  const canReject = isDeptHead && requisition.status.toLowerCase() === 'pending';
  const canDelete = requisition.status.toLowerCase() === 'pending';

  // Define table columns for items
  const itemColumns: TableColumn[] = isEditing ? [
    {
      key: 'categoryId',
      label: 'Category',
      width: '200px',
      render: (value, row, index) => {
        // Get category from product if not set
        const product = products.find(p => p.id === row.productId);
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
      key: 'productId',
      label: 'Product',
      width: '300px',
      render: (value, row, index) => {
        const categoryId = row.categoryId || products.find(p => p.id === row.productId)?.itemCategoryId || 0;
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
    {
      key: 'requiredQuantity',
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
      key: 'productName',
      label: 'Product',
      width: '400px'
    },
    {
      key: 'requiredQuantity',
      label: 'Quantity',
      width: '120px',
      align: 'center',
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
      {(error || success) && (
        <div className={`mb-5 p-4 rounded-lg border ${error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm ${error ? 'text-red-800' : 'text-green-800'}`}>
            {error || success}
          </p>
        </div>
      )}

      <StatusBanner
        status={requisition.status}
        color={getStatusColor(requisition.status)}
        icon="📄"
        metadata={[
          { label: 'REQ Number', value: requisition.requisitionNumber },
          { label: 'Created Date', value: new Date(requisition.requisitionDate).toLocaleDateString() },
          { label: 'Created By', value: requisition.requestedByName || requisition.requestedByEmail || 'N/A' }
        ]}
      />

      {isEditing ? (
        // EDIT MODE
        <>
          <FormSection icon="ℹ️" title="Requisition Information">
            <ViewSection columns={3}>
              <ViewField label="Requisition Number" value={requisition.requisitionNumber} />
              <ViewField label="Department" value={requisition.departmentName || 'N/A'} />
              <ViewField label="Status" value={<Badge variant="warning">{requisition.status}</Badge>} />
              <ViewField label="Requisition Date" value={new Date(requisition.requisitionDate).toLocaleDateString()} />
              <ViewField label="Required By" value={new Date(requisition.requiredByDate).toLocaleDateString()} />
              <ViewField label="Created By" value={requisition.requestedByName || requisition.requestedByEmail || 'N/A'} />
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

          <FormSection
            icon="📦"
            title="Edit Items"
            headerAction={
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 text-[13px] font-medium rounded-md border-[0.5px] transition-colors hover:bg-teal-50"
                style={{
                  borderColor: COLORS.PURCHASE,
                  color: COLORS.PURCHASE
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
              style={{ backgroundColor: COLORS.PURCHASE }}
            >
              {submitting ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </>
      ) : (
        // VIEW MODE
        <>
          <FormSection icon="ℹ️" title="Requisition Information">
            <ViewSection columns={3}>
              <ViewField label="Requisition Number" value={requisition.requisitionNumber} />
              <ViewField label="Department" value={requisition.departmentName || 'N/A'} />
              <ViewField 
                label="Status" 
                value={<Badge variant={requisition.status.toLowerCase() === 'approved' ? 'success' : requisition.status.toLowerCase() === 'rejected' ? 'danger' : 'warning'}>{requisition.status}</Badge>} 
              />
              <ViewField label="Requisition Date" value={new Date(requisition.requisitionDate).toLocaleDateString()} />
              <ViewField label="Required By" value={new Date(requisition.requiredByDate).toLocaleDateString()} />
              <ViewField label="Created By" value={requisition.requestedByName || requisition.requestedByEmail || 'N/A'} />
              
              {requisition.approvedAt && (
                <ViewField label="Approved At" value={new Date(requisition.approvedAt).toLocaleString()} />
              )}
              
              {requisition.notes && (
                <ViewField label="Notes" value={requisition.notes} span={3} />
              )}
            </ViewSection>
          </FormSection>

          <FormSection icon="📦" title={`Items (${requisition.items?.length || 0})`}>
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

          <div className="flex items-center justify-between pt-5 border-t border-gray-200 mt-6">
            <button
              onClick={onBack}
              className="px-5 py-2.5 border-[0.5px] border-gray-300 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              {canEdit && (
                <button
                  onClick={handleEditClick}
                  disabled={submitting}
                  className="px-5 py-2.5 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: `${COLORS.PURCHASE}20`,
                    color: COLORS.PURCHASE,
                    border: `0.5px solid ${COLORS.PURCHASE}40`
                  }}
                >
                  ✏️ Edit / Revise
                </button>
              )}
              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-green-600 text-white text-[13px] font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ✓ Approve
                </button>
              )}
              {canReject && (
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-red-600 text-white text-[13px] font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  ✗ Reject
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-5 py-2.5 border-[0.5px] border-red-300 text-red-600 text-[13px] font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RequisitionDetail;

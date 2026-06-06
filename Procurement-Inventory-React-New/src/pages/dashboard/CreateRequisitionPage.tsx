// src/pages/dashboard/CreateRequisitionPage.tsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requisitionApi } from '../../api/requisitionApi';
import { productApi } from '../../api/productApi';
import { Product, ItemCategory, CreateRequisitionRequest } from '../../types';
import {
  StatsHeader,
  FormSection,
  FieldGroup,
  Input,
  Select,
  Textarea,
  DynamicTable,
  Badge,
  FormActions,
  COLORS,
  TableColumn
} from '../../components/form';

type RequisitionItemForm = {
  categoryId: number;
  productId: number;
  requiredQuantity: number;
  remarks: string;
};

const CreateRequisitionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? null;
  const departmentName = user?.departmentName ?? null;
  
  // Check if coming from a requisition forward
  const fromRequisitionData = location.state as {
    fromRequisition?: string;
    requisitionId?: number;
    sourceRequisitionIds?: number[];
    items?: Array<{ productId: number; productName: string; quantity: number; remarks?: string }>;
    notes?: string;
  } | null;

  const isReadOnly = !!fromRequisitionData?.fromRequisition;
  
  const cartItems = (location.state?.cartItems || []) as Array<{ productId: number; quantity: number }>;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState<{ [key: number]: boolean }>({});

  const todayISO = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    requiredByDate: todayISO,
    notes: fromRequisitionData?.notes || ''
  });
  
  // Initialize items from either cart or forwarded requisition
  const initialItems = useMemo(() => {
    let rawItems: RequisitionItemForm[] = [];
    if (fromRequisitionData?.items && fromRequisitionData.items.length > 0) {
      rawItems = fromRequisitionData.items.map(item => ({
        categoryId: 0,
        productId: item.productId || 0,
        requiredQuantity: item.quantity,
        remarks: item.remarks || ''
      }));
    } else if (cartItems.length > 0) {
      rawItems = cartItems.map(item => ({
        categoryId: 0,
        productId: item.productId,
        requiredQuantity: item.quantity,
        remarks: ''
      }));
    } else {
      return [{
        categoryId: 0,
        productId: 0,
        requiredQuantity: 1,
        remarks: ''
      }];
    }

    // Consolidate duplicates
    const consolidatedMap = new Map<number, RequisitionItemForm>();
    for (const item of rawItems) {
      if (item.productId === 0) {
        continue;
      }
      if (consolidatedMap.has(item.productId)) {
        const existing = consolidatedMap.get(item.productId)!;
        existing.requiredQuantity += item.requiredQuantity;
        if (item.remarks && item.remarks.trim()) {
          existing.remarks = existing.remarks
            ? `${existing.remarks}; ${item.remarks.trim()}`
            : item.remarks.trim();
        }
      } else {
        consolidatedMap.set(item.productId, { ...item });
      }
    }

    const consolidated = Array.from(consolidatedMap.values());
    return consolidated.length > 0 ? consolidated : [{
      categoryId: 0,
      productId: 0,
      requiredQuantity: 1,
      remarks: ''
    }];
  }, []);
  
  const [items, setItems] = useState<RequisitionItemForm[]>(initialItems);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    setItems(prev =>
      prev.map(it => {
        if (it.categoryId || !it.productId) return it;
        const p = products.find(x => x.id === it.productId);
        return p ? { ...it, categoryId: p.itemCategoryId } : it;
      })
    );
  }, [products]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAllProducts(1, 500), // Load all products initially
        productApi.getAllCategories()
      ]);
      setAllProducts(productsRes);
      setProducts(productsRes);
      setCategories(categoriesRes);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Load products by category when category is selected
  const loadProductsByCategory = async (categoryId: number, itemIndex: number) => {
    if (!categoryId) {
      return;
    }

    try {
      setLoadingProducts(prev => ({ ...prev, [itemIndex]: true }));
      const categoryProducts = await productApi.getProductsByCategory(categoryId);
      
      console.log('Loaded products for category', categoryId, ':', categoryProducts);
      console.log('Sample product unit:', categoryProducts[0]?.unitName);
      
      // Update products list with category-specific products
      setProducts(prev => {
        // Remove old products from this category and add new ones
        const otherProducts = prev.filter(p => p.itemCategoryId !== categoryId);
        return [...otherProducts, ...categoryProducts];
      });
    } catch (error) {
      console.error('Error loading products by category:', error);
      alert('Failed to load products for this category');
    } finally {
      setLoadingProducts(prev => ({ ...prev, [itemIndex]: false }));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, patch: Partial<RequisitionItemForm>) => {
    const next = [...items];
    const candidate = { ...next[index], ...patch };

    // If category changed, reset product and load products for that category
    if (patch.categoryId !== undefined && patch.categoryId !== next[index].categoryId) {
      candidate.productId = 0; // Reset product selection
      loadProductsByCategory(patch.categoryId, index);
      next[index] = candidate;
      setItems(next);
      return;
    }

    if (candidate.productId > 0) {
      const existingIndex = next.findIndex((it, i) => i !== index && it.productId === candidate.productId);
      if (existingIndex > -1) {
        // Merge!
        const product = getProduct(candidate.productId);
        const productName = product?.name || 'this product';
        
        // Sum quantity
        const qtyToAdd = candidate.requiredQuantity || 1;
        next[existingIndex].requiredQuantity += qtyToAdd;
        
        // Append remarks
        if (candidate.remarks && candidate.remarks.trim()) {
          const currentRemarks = candidate.remarks.trim();
          const existingRemarks = next[existingIndex].remarks || '';
          if (existingRemarks) {
            next[existingIndex].remarks = `${existingRemarks}; ${currentRemarks}`;
          } else {
            next[existingIndex].remarks = currentRemarks;
          }
        }
        
        // Remove the current row
        const filtered = next.filter((_, i) => i !== index);
        
        // If all items are deleted, make sure there is at least one blank item
        if (filtered.length === 0) {
          filtered.push({
            categoryId: 0,
            productId: 0,
            requiredQuantity: 1,
            remarks: ''
          });
        }
        
        setItems(filtered);
        alert(`Product "${productName}" is already in the list. Its quantity has been added to the existing row.`);
        return;
      }
    }

    next[index] = candidate;
    setItems(next);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddProduct = () => {
    setItems([...items, { categoryId: 0, productId: 0, requiredQuantity: 1, remarks: '' }]);
  };

  const productsByCategory = useMemo(() => {
    const map = new Map<number, Product[]>();
    for (const p of products) {
      const key = p.itemCategoryId ?? 0;
      const bucket = map.get(key);
      if (bucket) bucket.push(p);
      else map.set(key, [p]);
    }
    return map;
  }, [products]);

  const getProduct = (productId: number) => {
    if (!productId) return undefined;
    const product = products.find(p => p.id === productId) || allProducts.find(p => p.id === productId);
    if (product && productId) {
      console.log('Product found:', productId, 'Unit:', product.unitName, 'Full product:', product);
    }
    return product;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!departmentId) {
      alert('Your account has no department assigned. Please contact Manager/Admin.');
      return;
    }
    if (!formData.requiredByDate) {
      alert('Please select a required by date');
      return;
    }
    if (formData.requiredByDate < todayISO) {
      alert('Required By Date must be today or a future date');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product');
      return;
    }
    if (items.some(item => item.categoryId === 0)) {
      alert('Please select a category for all items');
      return;
    }
    if (items.some(item => item.productId === 0)) {
      alert('Please select a product for all items');
      return;
    }
    if (items.some(item => item.requiredQuantity <= 0)) {
      alert('Quantity must be greater than 0');
      return;
    }
    const duplicateProducts = items
      .map(i => i.productId)
      .filter((id, idx, arr) => id > 0 && arr.indexOf(id) !== idx);
    if (duplicateProducts.length > 0) {
      alert('Same product cannot be added multiple times.');
      return;
    }

    const requestData: CreateRequisitionRequest = {
      departmentId: departmentId!, // Required field
      requiredByDate: formData.requiredByDate,
      notes: formData.notes || undefined,
      items: items.map(item => ({
        productId: item.productId,
        requiredQuantity: item.requiredQuantity,
        remarks: item.remarks || undefined
      })),
      sourceRequisitionIds: fromRequisitionData?.sourceRequisitionIds
    };

    try {
      setSubmitting(true);
      const response = await requisitionApi.createRequisition(requestData);
      
      // Backend returns: { message, id, number }
      const requisitionNumber = response?.number || response?.requisitionNumber || response?.data?.number;
      const requisitionId = response?.id || response?.data?.id;
      
      alert(`Requisition ${requisitionNumber || requisitionId} created successfully!`);
      
      if (fromRequisitionData?.sourceRequisitionIds?.length) {
        navigate('/dashboard/store/pending-requisitions', { state: { refresh: true } });
      } else {
        navigate('/dashboard/requisitions', { state: { newRequisitionId: requisitionId } });
      }
    } catch (error: any) {
      console.error('Error creating requisition:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error creating requisition';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.requiredQuantity, 0);
  const estimatedAmount = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + ((product?.price || 0) * item.requiredQuantity);
  }, 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Define table columns
  const tableColumns: TableColumn[] = [
    {
      key: 'categoryId',
      label: 'Category',
      width: '200px',
      render: (value, row, index) => {
        if (isReadOnly) {
          const cat = categories.find(c => c.id === value);
          return <span className="text-gray-800 font-medium px-1">{cat?.name || '—'}</span>;
        }
        return (
          <Select
            value={value}
            onChange={(e) => handleItemChange(index, { categoryId: parseInt(e.target.value) })}
            disabled={loadingProducts[index]}
          >
            <option value={0}>-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
        );
      }
    },
    {
      key: 'productId',
      label: 'Product',
      width: '250px',
      render: (value, row, index) => {
        if (isReadOnly) {
          const prod = getProduct(value);
          return <span className="text-gray-800 font-medium px-1">{prod?.name || '—'}</span>;
        }
        return (
          <Select
            value={value}
            onChange={(e) => handleItemChange(index, { productId: parseInt(e.target.value) })}
            disabled={!row.categoryId || loadingProducts[index]}
          >
            <option value={0}>
              {!row.categoryId ? '-- Select Category First --' : '-- Select Product --'}
            </option>
            {(productsByCategory.get(row.categoryId) ?? []).map(product => {
              const alreadySelected = items.some((it, i) => i !== index && it.productId === product.id);
              return (
                <option key={product.id} value={product.id} disabled={alreadySelected}>
                  {product.name}{alreadySelected ? ' (Already Added)' : ''}
                </option>
              );
            })}
          </Select>
        );
      }
    },
    {
      key: 'productId',
      label: 'Stock',
      width: '100px',
      align: 'center',
      render: (value) => {
        const stock = getProduct(value)?.currentStock ?? 0;
        return <Badge variant={stock > 0 ? 'success' : 'danger'}>{stock}</Badge>;
      }
    },
    {
      key: 'productId',
      label: 'Unit',
      width: '80px',
      align: 'center',
      render: (value) => {
        const p = getProduct(value);
        const unit = p?.unitName || 'Pcs';
        return <Badge>{unit}</Badge>;
      }
    },
    {
      key: 'requiredQuantity',
      label: 'Qty',
      width: '100px',
      render: (value, row, index) => {
        if (isReadOnly) {
          return <span className="text-gray-800 font-semibold px-1">{value}</span>;
        }
        return (
          <Input
            type="number"
            min="1"
            value={value}
            onChange={(e) => handleItemChange(index, { requiredQuantity: parseInt(e.target.value) || 1 })}
          />
        );
      }
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value, row, index) => {
        if (isReadOnly) {
          return <span className="text-gray-600 text-sm px-1">{value || '—'}</span>;
        }
        return (
          <Input
            value={value}
            onChange={(e) => handleItemChange(index, { remarks: e.target.value })}
            placeholder="Optional..."
          />
        );
      }
    }
  ];

  return (
    <div className="w-full">
      <StatsHeader
        accentColor={COLORS.PURCHASE}
        icon="🛒"
        title="Create Purchase Requisition"
        subtitle="Request products for your department"
        stats={[
          { label: 'Total Items', value: totalItems },
          { label: 'Total Quantity', value: totalQuantity },
          { label: 'Estimated Amount', value: `${estimatedAmount.toFixed(2)}` },
          { label: 'Department', value: departmentName || 'N/A' }
        ]}
      />

      {/* Show banner if opened from a requisition */}
      {fromRequisitionData?.fromRequisition && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Creating Purchase Requisition from Employee Requisition
              </h3>
              <p className="text-sm text-blue-700">
                Reference: <strong>{fromRequisitionData.fromRequisition}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Items have been pre-filled from the original requisition. These items are read-only as approved by the department head.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 md:p-8 mt-6">
        <FormSection icon="ℹ️" title="Requisition Details">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FieldGroup label="PR Number">
              <Input value="Auto Generated" readOnly />
            </FieldGroup>

            <FieldGroup label="Requisition Date">
              <Input value={todayISO} readOnly />
            </FieldGroup>

            <FieldGroup label="Department">
              <Input value={departmentName ?? '—'} readOnly />
            </FieldGroup>

            <FieldGroup label="Required By Date" required>
              <Input
                type="date"
                name="requiredByDate"
                value={formData.requiredByDate}
                onChange={handleFormChange}
                min={todayISO}
              />
            </FieldGroup>

            <FieldGroup label="Notes" className="col-span-1 md:col-span-2 lg:col-span-3">
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          icon="📦"
          title="Items"
          headerAction={
            !isReadOnly && (
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-3 py-1.5 text-[13px] font-medium rounded-md border-[0.5px] transition-colors hover:bg-teal-50"
                style={{
                  borderColor: COLORS.PURCHASE,
                  color: COLORS.PURCHASE
                }}
              >
                + Add Product
              </button>
            )
          }
        >
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 mb-4">No items added yet</p>
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-4 py-2 text-white text-sm font-medium rounded-md"
                style={{ backgroundColor: COLORS.PURCHASE }}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <DynamicTable
              columns={tableColumns}
              data={items}
              onRowRemove={handleRemoveItem}
              minRows={0}
              readOnly={isReadOnly}
            />
          )}
        </FormSection>

        <FormActions
          onDiscard={() => navigate('/dashboard/products')}
          onSubmit={undefined}
          submitLabel="Submit Requisition"
          isSubmitting={submitting}
          accentColor={COLORS.PURCHASE}
        />
      </form>
    </div>
  );
};

export default CreateRequisitionPage;

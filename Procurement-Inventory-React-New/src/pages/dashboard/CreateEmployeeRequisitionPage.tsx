// src/pages/dashboard/CreateEmployeeRequisitionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employeeRequisitionApi } from '../../api/employeeRequisitionApi';
import axiosInstance from '../../api/axiosInstance';
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

/** YYYY-MM-DD in local timezone (avoids UTC off-by-one with toISOString()). */
function getLocalDateISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface Category {
  id: number;
  name: string;
  categoryName?: string;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  unitName?: string;
  itemCategoryId: number;
  isActive: boolean;
}

interface RequisitionItem {
  categoryId: number;
  categoryName: string;
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  remarks: string;
}

const CreateEmployeeRequisitionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? null;
  const departmentName = user?.departmentName ?? null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minRequiredByDate = getLocalDateISO();

  const [masterData, setMasterData] = useState({
    requiredByDate: minRequiredByDate,
    notes: ''
  });

  const [items, setItems] = useState<RequisitionItem[]>([
    {
      categoryId: 0,
      categoryName: '',
      productId: 0,
      productName: '',
      unit: '',
      quantity: 1,
      remarks: ''
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting to load data...');
      
      // Direct API calls
      const categoriesResponse = await axiosInstance.get('/api/ItemCategory');
      const productsResponse = await axiosInstance.get('/api/Product');
      
      console.log('📦 Raw Categories Response:', categoriesResponse.data);
      console.log('📦 Raw Products Response:', productsResponse.data);
      
      // Map categories - Backend returns: itemCategoryId, categoryName
      const categoriesData = (categoriesResponse.data || []).map((c: any) => ({
        id: c.itemCategoryId || c.id || c.categoryId,
        name: c.categoryName || c.name || c.itemCategoryName,
        categoryName: c.categoryName || c.name,
        isActive: c.isActive !== false
      }));
      
      // Map products (do not map stock — employees must not see inventory levels)
      const productsData = (productsResponse.data || []).map((p: any) => ({
        id: p.id || p.productId,
        name: p.name || p.productName,
        unitName: p.unitName || p.unit?.nameOfUnit || 'Pcs',
        itemCategoryId: p.itemCategoryId || p.categoryId,
        isActive: p.isActive !== false
      }));
      
      console.log('✅ Mapped Categories:', categoriesData);
      console.log('✅ Mapped Products:', productsData);
      
      const activeCategories = categoriesData.filter((c: Category) => c.isActive);
      const activeProducts = productsData.filter((p: Product) => p.isActive);
      
      console.log('✅ Active Categories:', activeCategories.length);
      console.log('✅ Active Products:', activeProducts.length);
      
      setCategories(activeCategories);
      setAllProducts(activeProducts);
      
      console.log('✅ Data loaded successfully!');
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = (categoryId: number): Product[] => {
    if (!categoryId) return [];
    const filtered = allProducts.filter(p => p.itemCategoryId === categoryId);
    console.log(`🔍 Products for category ${categoryId}:`, filtered);
    return filtered;
  };

  const handleCategoryChange = (index: number, categoryId: number) => {
    console.log('📝 Category changed:', categoryId);
    const category = categories.find(c => c.id === categoryId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      categoryId: categoryId,
      categoryName: category?.name || category?.categoryName || '',
      productId: 0,
      productName: '',
      unit: ''
    };
    setItems(newItems);
  };

  const handleProductChange = (index: number, productId: number) => {
    console.log('📝 Product changed:', productId);
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      console.log('✅ Product found:', product);
      const newItems = [...items];
      
      // Check if product already exists in another row
      const existingItemIndex = newItems.findIndex((item, i) => i !== index && item.productId === productId);
      
      if (existingItemIndex > -1) {
        const qtyToAdd = newItems[index].quantity || 1;
        newItems[existingItemIndex].quantity += qtyToAdd;
        
        // Append remarks
        if (newItems[index].remarks && newItems[index].remarks.trim()) {
          const currentRemarks = newItems[index].remarks.trim();
          const existingRemarks = newItems[existingItemIndex].remarks || '';
          if (existingRemarks) {
            newItems[existingItemIndex].remarks = `${existingRemarks}; ${currentRemarks}`;
          } else {
            newItems[existingItemIndex].remarks = currentRemarks;
          }
        }
        
        // Remove current row
        const filteredItems = newItems.filter((_, i) => i !== index);
        
        // If all items are deleted, make sure there is at least one blank item
        if (filteredItems.length === 0) {
          filteredItems.push({
            categoryId: 0,
            categoryName: '',
            productId: 0,
            productName: '',
            unit: '',
            quantity: 1,
            remarks: ''
          });
        }
        
        setItems(filteredItems);
        alert(`Product "${product.name}" is already in the list. Its quantity has been added to the existing row.`);
      } else {
        newItems[index] = {
          ...newItems[index],
          productId: product.id,
          productName: product.name,
          unit: product.unitName || 'Pcs'
        };
        setItems(newItems);
      }
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const handleRemarksChange = (index: number, remarks: string) => {
    const newItems = [...items];
    newItems[index].remarks = remarks;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      categoryId: 0,
      categoryName: '',
      productId: 0,
      productName: '',
      unit: '',
      quantity: 1,
      remarks: ''
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departmentId) {
      setError('You must be assigned to a department');
      return;
    }

    const validItems = items.filter(item => item.productId > 0 && item.quantity > 0);
    
    if (validItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    if (masterData.requiredByDate < minRequiredByDate) {
      setError('Required by date cannot be in the past');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Step 1: Create ONE requisition with multiple items
      const createResponse = await employeeRequisitionApi.createRequisition({
        departmentId: departmentId,
        requiredByDate: masterData.requiredByDate,
        notes: masterData.notes,
        items: validItems.map(item => ({
          itemId: item.productId,
          itemName: item.productName,
          requiredQty: item.quantity,
          remarks: item.remarks
        }))
      });

      // Get the created requisition ID
      const requisitionId = createResponse.data?.data?.id || createResponse.data?.id || createResponse.id;
      
      console.log('📋 Create response:', createResponse);
      console.log('📋 Extracted requisition ID:', requisitionId);

      // Step 2: Automatically submit to Department Head
      if (requisitionId) {
        try {
          await employeeRequisitionApi.submitRequisition(requisitionId);
          alert(`✅ Employee Requisition created and submitted successfully!\n\n${validItems.length} item(s) added\nStatus: Submitted to Department Head`);
        } catch (submitErr) {
          console.error('Error auto-submitting:', submitErr);
          alert(`✅ Requisition created with ${validItems.length} item(s)!\n\n⚠️ Could not auto-submit. Please submit manually from "My Requisitions"`);
        }
      } else {
        console.error('❌ Could not extract requisition ID from response');
        alert(`✅ Employee Requisition created successfully with ${validItems.length} item(s)!`);
      }

      navigate('/dashboard/requisitions');
    } catch (err: any) {
      console.error('Error creating requisition:', err);
      setError(err.response?.data?.message || 'Failed to create requisition');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading categories and products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!departmentId) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Department Not Assigned</h2>
          <p className="text-red-600 text-sm mb-4">You must be assigned to a department to create requisitions.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            Go to Dashboard
          </button>
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
      render: (value, row, index) => (
        <Select
          value={value}
          onChange={(e) => handleCategoryChange(index, parseInt(e.target.value))}
        >
          <option value={0}>-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name || cat.categoryName}
            </option>
          ))}
        </Select>
      )
    },
    {
      key: 'productId',
      label: 'Product',
      width: '250px',
      render: (value, row, index) => (
        <Select
          value={value}
          onChange={(e) => handleProductChange(index, parseInt(e.target.value))}
          disabled={!row.categoryId}
        >
          <option value={0}>-- Select Product --</option>
          {getProductsByCategory(row.categoryId).map(prod => (
            <option key={prod.id} value={prod.id}>
              {prod.name}
            </option>
          ))}
        </Select>
      )
    },
    {
      key: 'unit',
      label: 'Unit',
      width: '80px',
      align: 'center',
      render: (value) => <Badge>{value || 'Pcs'}</Badge>
    },
    {
      key: 'quantity',
      label: 'Qty',
      width: '100px',
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
          value={value}
          onChange={(e) => handleRemarksChange(index, e.target.value)}
          placeholder="Optional..."
        />
      )
    }
  ];

  return (
    <div className="w-full">
      <StatsHeader
        accentColor={COLORS.REQUISITION}
        icon="📝"
        title="Create Employee Requisition"
        subtitle="Request items from store for your department"
        stats={[
          { label: 'Categories', value: categories.length },
          { label: 'Products', value: allProducts.length },
          { label: 'Items Added', value: items.filter(i => i.productId > 0).length },
          { label: 'Department', value: departmentName || 'N/A' }
        ]}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 text-sm font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 md:p-8 mt-6">
        <FormSection icon="ℹ️" title="Requisition Info">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FieldGroup label="Requisition Number">
              <Input value="Auto Generated" readOnly />
            </FieldGroup>

            <FieldGroup label="Requisition Date">
              <Input value={new Date().toLocaleDateString()} readOnly />
            </FieldGroup>

            <FieldGroup label="Department">
              <Input value={departmentName || 'N/A'} readOnly />
            </FieldGroup>

            <FieldGroup label="Required By Date" required>
              <Input
                type="date"
                min={minRequiredByDate}
                value={masterData.requiredByDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setMasterData({
                    ...masterData,
                    requiredByDate: v < minRequiredByDate ? minRequiredByDate : v
                  });
                }}
              />
            </FieldGroup>

            <FieldGroup label="Notes" className="col-span-1 md:col-span-2 lg:col-span-3">
              <Textarea
                value={masterData.notes}
                onChange={(e) => setMasterData({ ...masterData, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes or remarks..."
              />
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          icon="📋"
          title="Requisition Items"
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
            columns={tableColumns}
            data={items}
            onRowRemove={removeItem}
            minRows={1}
          />
          <p className="text-[11px] text-gray-500 mt-3">
            💡 At least one item is required. Select category first, then product will be filtered.
          </p>
        </FormSection>

        <FormActions
          onDiscard={() => navigate('/dashboard/requisitions')}
          submitLabel="Submit Requisition"
          isSubmitting={submitting}
          accentColor={COLORS.REQUISITION}
        />
      </form>
    </div>
  );
};

export default CreateEmployeeRequisitionPage;

// src/components/form/FormExamples.tsx
// EXAMPLES: How to use the Universal Form Design System

import React, { useState } from 'react';
import {
  StatsHeader,
  FormSection,
  FieldGroup,
  Input,
  Select,
  Textarea,
  Toggle,
  DynamicTable,
  Badge,
  ViewSection,
  ViewField,
  StatusBanner,
  FilterBar,
  FilterField,
  FormActions,
  ActionButton,
  COLORS,
  TableColumn
} from './index';

// ============================================
// EXAMPLE 1: MASTER FORM (Add/Edit Product)
// ============================================
export const MasterFormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    isActive: true,
    description: ''
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StatsHeader
        accentColor={COLORS.INVENTORY}
        icon="📦"
        title="Add New Product"
        subtitle="Create a new product in the inventory"
        stats={[
          { label: 'Total Products', value: '1,234' },
          { label: 'Active', value: '1,180' },
          { label: 'Low Stock', value: '45' },
          { label: 'Out of Stock', value: '9' }
        ]}
      />

      <form>
        <FormSection icon="ℹ️" title="Product Information">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Product Name" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </FieldGroup>

            <FieldGroup label="Category" required>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="1">Electronics</option>
                <option value="2">Groceries</option>
              </Select>
            </FieldGroup>

            <FieldGroup label="Price" required>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </FieldGroup>

            <FieldGroup label="Initial Stock">
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </FieldGroup>

            <FieldGroup label="Status">
              <div className="flex items-center gap-3 pt-2">
                <Toggle
                  checked={formData.isActive}
                  onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <span className="text-[13px] text-gray-700">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </FieldGroup>

            <FieldGroup label="Description" className="col-span-2">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Product description..."
              />
            </FieldGroup>
          </div>
        </FormSection>

        <FormActions
          onDiscard={() => console.log('Discard')}
          onSaveDraft={() => console.log('Save Draft')}
          onSubmit={() => console.log('Submit')}
          accentColor={COLORS.INVENTORY}
        />
      </form>
    </div>
  );
};

// ============================================
// EXAMPLE 2: MASTER-DETAIL FORM (Requisition)
// ============================================
export const MasterDetailFormExample = () => {
  const [items, setItems] = useState([
    { category: '', product: '', stock: 0, unit: '', qty: 1, remarks: '' }
  ]);

  const columns: TableColumn[] = [
    {
      key: 'category',
      label: 'Category',
      width: '200px',
      render: (value, row, index) => (
        <Select
          value={value}
          onChange={(e) => {
            const newItems = [...items];
            newItems[index].category = e.target.value;
            setItems(newItems);
          }}
        >
          <option value="">Select Category</option>
          <option value="1">Electronics</option>
          <option value="2">Groceries</option>
        </Select>
      )
    },
    {
      key: 'product',
      label: 'Product',
      width: '250px',
      render: (value, row, index) => (
        <Select
          value={value}
          onChange={(e) => {
            const newItems = [...items];
            newItems[index].product = e.target.value;
            setItems(newItems);
          }}
        >
          <option value="">Select Product</option>
          <option value="1">Product A</option>
          <option value="2">Product B</option>
        </Select>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      width: '100px',
      align: 'center',
      render: (value) => <Badge variant="info">{value}</Badge>
    },
    {
      key: 'unit',
      label: 'Unit',
      width: '80px',
      align: 'center',
      render: (value) => <Badge>{value || 'Pcs'}</Badge>
    },
    {
      key: 'qty',
      label: 'Quantity',
      width: '100px',
      render: (value, row, index) => (
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const newItems = [...items];
            newItems[index].qty = parseInt(e.target.value) || 1;
            setItems(newItems);
          }}
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
          onChange={(e) => {
            const newItems = [...items];
            newItems[index].remarks = e.target.value;
            setItems(newItems);
          }}
          placeholder="Optional..."
        />
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <StatsHeader
        accentColor={COLORS.REQUISITION}
        icon="📝"
        title="Create Employee Requisition"
        subtitle="Request items from store"
        stats={[
          { label: 'My Requisitions', value: '12' },
          { label: 'Pending', value: '3' },
          { label: 'Approved', value: '8' },
          { label: 'Rejected', value: '1' }
        ]}
      />

      <form>
        <FormSection icon="ℹ️" title="Requisition Info">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Requisition Number">
              <Input value="Auto Generated" readOnly />
            </FieldGroup>

            <FieldGroup label="Department">
              <Input value="IT Department" readOnly />
            </FieldGroup>

            <FieldGroup label="Required By Date" required>
              <Input type="date" />
            </FieldGroup>

            <FieldGroup label="Notes" className="col-span-2">
              <Textarea rows={2} placeholder="Additional notes..." />
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          icon="📋"
          title="Requisition Items"
          headerAction={
            <button
              type="button"
              onClick={() => setItems([...items, { category: '', product: '', stock: 0, unit: '', qty: 1, remarks: '' }])}
              className="px-3 py-1.5 text-[13px] font-medium rounded-md border-[0.5px] transition-colors"
              style={{
                borderColor: COLORS.REQUISITION,
                color: COLORS.REQUISITION,
                backgroundColor: 'transparent'
              }}
            >
              + Add Item
            </button>
          }
        >
          <DynamicTable
            columns={columns}
            data={items}
            onRowRemove={(index) => setItems(items.filter((_, i) => i !== index))}
            minRows={1}
          />
        </FormSection>

        <FormActions
          onDiscard={() => console.log('Discard')}
          onSubmit={() => console.log('Submit')}
          submitLabel="Submit Requisition"
          accentColor={COLORS.REQUISITION}
        />
      </form>
    </div>
  );
};

// ============================================
// EXAMPLE 3: VIEW / DETAILS FORM
// ============================================
export const ViewFormExample = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <StatusBanner
        status="Approved"
        color={COLORS.REQUISITION}
        icon="✓"
        metadata={[
          { label: 'Requisition No', value: 'REQ-2026-0001' },
          { label: 'Created Date', value: '2026-05-10' },
          { label: 'Created By', value: 'John Doe' }
        ]}
      />

      <FormSection icon="ℹ️" title="Requisition Information">
        <ViewSection columns={3}>
          <ViewField label="Requisition Number" value="REQ-2026-0001" />
          <ViewField label="Department" value="IT Department" />
          <ViewField label="Required By" value="2026-05-15" />
          <ViewField label="Status" value={<Badge variant="success">Approved</Badge>} />
          <ViewField label="Submitted At" value="2026-05-10 10:30 AM" />
          <ViewField label="Approved At" value="2026-05-10 14:45 PM" />
          <ViewField label="Notes" value="Urgent requirement for new laptops" span={3} />
        </ViewSection>
      </FormSection>

      <FormSection icon="📋" title="Requisition Items">
        <DynamicTable
          columns={[
            { key: 'product', label: 'Product' },
            { key: 'stock', label: 'Stock', align: 'center', render: (v) => <Badge variant="info">{v}</Badge> },
            { key: 'unit', label: 'Unit', align: 'center', render: (v) => <Badge>{v}</Badge> },
            { key: 'qty', label: 'Quantity', align: 'center' },
            { key: 'remarks', label: 'Remarks' }
          ]}
          data={[
            { product: 'Laptop Dell XPS 15', stock: 5, unit: 'Pcs', qty: 3, remarks: 'For new employees' },
            { product: 'Mouse Logitech MX', stock: 20, unit: 'Pcs', qty: 3, remarks: '' }
          ]}
          readOnly
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200 mt-6">
        <ActionButton label="Reject" variant="danger" onClick={() => console.log('Reject')} />
        <ActionButton label="Revise" variant="warning" onClick={() => console.log('Revise')} />
        <ActionButton label="Approve" variant="success" onClick={() => console.log('Approve')} icon="✓" />
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 4: FILTER / SEARCH FORM
// ============================================
export const FilterFormExample = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <FilterBar
        onSearch={() => console.log('Search')}
        onReset={() => console.log('Reset')}
        onExport={() => console.log('Export')}
      >
        <FilterField label="Requisition No">
          <Input placeholder="Search..." />
        </FilterField>

        <FilterField label="Status">
          <Select>
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </Select>
        </FilterField>

        <FilterField label="Department">
          <Select>
            <option value="">All Departments</option>
            <option value="1">IT</option>
            <option value="2">HR</option>
          </Select>
        </FilterField>

        <FilterField label="Date From">
          <Input type="date" />
        </FilterField>

        <FilterField label="Date To">
          <Input type="date" />
        </FilterField>
      </FilterBar>

      {/* Table or list content here */}
    </div>
  );
};

# Universal Form Design System

A comprehensive, reusable form design system for the Supershop Management System. Inspired by Shopify Admin's clean enterprise layout with dashboard-style stats headers.

## 📦 Components

### 1. **StatsHeader**
Colored header with title, subtitle, status badge, and stat chips.

```tsx
<StatsHeader
  accentColor={COLORS.REQUISITION}
  icon="📝"
  title="Create Employee Requisition"
  subtitle="Request items from store"
  statusBadge={{ label: 'Draft', color: '#6B7280' }}
  stats={[
    { label: 'Total', value: '12' },
    { label: 'Pending', value: '3' }
  ]}
/>
```

### 2. **FormSection**
Card wrapper with header and body for grouping form fields.

```tsx
<FormSection 
  icon="ℹ️" 
  title="Product Information"
  headerAction={<button>+ Add</button>}
>
  {/* Form fields here */}
</FormSection>
```

### 3. **FieldGroup + Inputs**
Consistent label + input styling with validation support.

```tsx
<FieldGroup label="Product Name" required error="Name is required">
  <Input 
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter name"
  />
</FieldGroup>

<FieldGroup label="Category">
  <Select value={category} onChange={...}>
    <option value="">Select</option>
  </Select>
</FieldGroup>

<FieldGroup label="Description">
  <Textarea rows={3} />
</FieldGroup>

<FieldGroup label="Active Status">
  <Toggle checked={isActive} onChange={setIsActive} />
</FieldGroup>
```

### 4. **DynamicTable**
Table with add/remove rows, auto-fill, and custom cell rendering.

```tsx
const columns: TableColumn[] = [
  {
    key: 'product',
    label: 'Product',
    width: '250px',
    render: (value, row, index) => (
      <Select value={value} onChange={...}>
        <option>Select Product</option>
      </Select>
    )
  },
  {
    key: 'stock',
    label: 'Stock',
    align: 'center',
    render: (value) => <Badge variant="info">{value}</Badge>
  }
];

<DynamicTable
  columns={columns}
  data={items}
  onRowRemove={(index) => removeItem(index)}
  minRows={1}
/>
```

### 5. **ViewSection** (Read-only)
Grid layout for displaying label:value pairs in view/details forms.

```tsx
<ViewSection columns={3}>
  <ViewField label="Requisition No" value="REQ-2026-0001" />
  <ViewField label="Status" value={<Badge variant="success">Approved</Badge>} />
  <ViewField label="Notes" value="Urgent" span={3} />
</ViewSection>

<StatusBanner
  status="Approved"
  color={COLORS.REQUISITION}
  icon="✓"
  metadata={[
    { label: 'Created By', value: 'John Doe' },
    { label: 'Date', value: '2026-05-10' }
  ]}
/>
```

### 6. **FilterBar**
Horizontal filter row for list/report pages.

```tsx
<FilterBar
  onSearch={() => search()}
  onReset={() => reset()}
  onExport={() => exportData()}
>
  <FilterField label="Status">
    <Select>
      <option value="">All</option>
    </Select>
  </FilterField>
  
  <FilterField label="Date From">
    <Input type="date" />
  </FilterField>
</FilterBar>
```

### 7. **FormActions**
Bottom action buttons with consistent styling.

```tsx
<FormActions
  onDiscard={() => navigate('/back')}
  onSaveDraft={() => saveDraft()}
  onSubmit={() => submit()}
  isSubmitting={loading}
  accentColor={COLORS.REQUISITION}
/>

// For view forms:
<ActionButton 
  label="Approve" 
  variant="success" 
  icon="✓"
  onClick={approve} 
/>
```

## 🎨 Color Palette

```tsx
import { COLORS } from './components/form';

COLORS.REQUISITION  // #534AB7 - Purple
COLORS.PURCHASE     // #1D9E75 - Teal
COLORS.SALES        // #BA7517 - Amber
COLORS.CUSTOMER     // #D85A30 - Coral
COLORS.EMPLOYEE     // #D85A30 - Coral
COLORS.INVENTORY    // #185FA5 - Blue
COLORS.STOCK        // #185FA5 - Blue
COLORS.REPORTS      // #5F5E5A - Gray
COLORS.QUALITY      // #7C3AED - Violet
COLORS.SUPPLIER     // #059669 - Emerald
COLORS.DELIVERY     // #2563EB - Blue
COLORS.RETURN       // #DC2626 - Red
COLORS.DAMAGE       // #EA580C - Orange
COLORS.STORE        // #0891B2 - Cyan
COLORS.RFQ          // #8B5CF6 - Purple
COLORS.CS           // #10B981 - Green
```

## 📋 Form Types

### 1. MASTER FORM
For adding/editing master data (Product, Category, Supplier, etc.)

**Structure:**
- StatsHeader (accent color)
- FormSection (single info card)
- FormActions (Discard | Save Draft | Submit)

### 2. MASTER-DETAIL FORM
For transactions (Requisition, Purchase, Sales, etc.)

**Structure:**
- StatsHeader (accent color)
- FormSection (Info fields)
- FormSection (DynamicTable for items)
- FormActions (Discard | Save Draft | Submit)

### 3. VIEW / DETAILS FORM
For viewing submitted records (read-only)

**Structure:**
- StatusBanner (colored status at top)
- FormSection (ViewSection with label:value grid)
- FormSection (DynamicTable read-only)
- ActionButtons (Approve, Reject, etc.)

### 4. FILTER / SEARCH FORM
For report pages and list pages

**Structure:**
- FilterBar (horizontal inline filters)
- Table or list content

## 🚀 Usage Example

See `FormExamples.tsx` for complete working examples of all form types.

## 📐 Design Rules

- **Inputs:** 0.5px border, 6px radius, 13px font
- **Labels:** 11px, font-weight 500, uppercase
- **Section Cards:** White bg, 0.5px border, 10px radius
- **Stats Header:** Solid accent, 10px radius, semi-transparent stat chips
- **Read-only:** Gray bg, muted text, not-allowed cursor
- **Focus:** Accent color border

## 🔧 Customization

All components accept `className` prop for additional styling:

```tsx
<FormSection className="mb-8">
  <FieldGroup className="col-span-2">
    <Input className="font-mono" />
  </FieldGroup>
</FormSection>
```

## 📱 Responsive

All components are responsive and work on mobile/tablet/desktop. Use Tailwind's responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <FieldGroup label="Field 1">
    <Input />
  </FieldGroup>
</div>
```

## ✅ Best Practices

1. **Always use FieldGroup** for consistent label + input styling
2. **Pick the right accent color** from COLORS for each module
3. **Use Badge** for status, stock, unit display
4. **Use ViewSection** for read-only data, not disabled inputs
5. **Keep table columns focused** - don't overcrowd
6. **Use FormActions** for consistent button placement
7. **Add helpful hints** using the `hint` prop in FieldGroup

## 🎯 Migration Guide

To migrate existing forms:

1. Import components: `import { StatsHeader, FormSection, ... } from '../../components/form'`
2. Replace page header with `<StatsHeader>`
3. Wrap sections in `<FormSection>`
4. Replace inputs with `<FieldGroup>` + `<Input/Select/Textarea>`
5. Replace tables with `<DynamicTable>`
6. Replace bottom buttons with `<FormActions>`
7. Remove old CSS files

Example: See `CreateEmployeeRequisitionPage.tsx` for a complete migration.

# 🎨 Universal Form Design System - Implementation Guide

## ✅ What Was Done

### 1. Created Reusable Components (`src/components/form/`)
- ✅ **StatsHeader** - Colored header with stats chips
- ✅ **FormSection** - Card wrapper for form sections
- ✅ **FieldGroup + Inputs** - Consistent label + input styling
- ✅ **DynamicTable** - Table with add/remove rows
- ✅ **ViewSection** - Read-only label:value grid
- ✅ **FilterBar** - Horizontal filter row
- ✅ **FormActions** - Bottom action buttons
- ✅ **Badge** - Status/stock/unit display
- ✅ **COLORS** - Accent color palette

### 2. Migrated First Form
- ✅ **CreateEmployeeRequisitionPage** - Now uses the new design system
- Removed old CSS dependencies
- Applied master-detail form pattern
- Uses COLORS.REQUISITION (#534AB7 - Purple)

## 🚀 How to Apply to Other Forms

### Step 1: Import Components

```tsx
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
} from '../../components/form';
```

### Step 2: Choose Accent Color

```tsx
// Pick from COLORS based on module:
const accentColor = COLORS.PURCHASE;    // For purchase forms
const accentColor = COLORS.SALES;       // For sales forms
const accentColor = COLORS.INVENTORY;   // For inventory forms
const accentColor = COLORS.CUSTOMER;    // For customer forms
// etc.
```

### Step 3: Replace Page Structure

#### BEFORE (Old Style):
```tsx
<div className="create-page">
  <div className="page-header">
    <h1>Create Product</h1>
  </div>
  
  <div className="form-section">
    <div className="section-header">
      <h2>Product Info</h2>
    </div>
    <div className="section-body">
      <div className="form-group">
        <label>Product Name</label>
        <input className="form-control" />
      </div>
    </div>
  </div>
  
  <div className="form-actions">
    <button className="btn btn-secondary">Cancel</button>
    <button className="btn btn-primary">Submit</button>
  </div>
</div>
```

#### AFTER (New Design System):
```tsx
<div className="max-w-7xl mx-auto p-6">
  <StatsHeader
    accentColor={COLORS.INVENTORY}
    icon="📦"
    title="Create Product"
    subtitle="Add a new product to inventory"
    stats={[
      { label: 'Total Products', value: '1,234' },
      { label: 'Active', value: '1,180' }
    ]}
  />

  <form onSubmit={handleSubmit}>
    <FormSection icon="ℹ️" title="Product Info">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Product Name" required>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </FieldGroup>
      </div>
    </FormSection>

    <FormActions
      onDiscard={() => navigate('/back')}
      onSubmit={undefined}
      submitLabel="Create Product"
      accentColor={COLORS.INVENTORY}
    />
  </form>
</div>
```

## 📋 Forms to Migrate

### Priority 1 (Transaction Forms - Master-Detail):
1. ✅ **CreateEmployeeRequisitionPage** - DONE
2. ⏳ **CreateRequisitionPage** - Purchase Requisition (use COLORS.PURCHASE)
3. ⏳ **CreateRFQPage** - RFQ Form (use COLORS.RFQ)
4. ⏳ **CreateCSPage** - Comparative Statement (use COLORS.CS)
5. ⏳ **SubmitQuotationPage** - Quotation (use COLORS.SUPPLIER)
6. ⏳ **IssueProductPage** - Store Issue (use COLORS.STORE)

### Priority 2 (Master Forms):
7. ⏳ **ProductsPage** - Add/Edit Product (use COLORS.INVENTORY)
8. ⏳ **UserManagementPage** - Add/Edit User (use COLORS.EMPLOYEE)
9. ⏳ **RoleManagerPage** - Role Management (use COLORS.EMPLOYEE)

### Priority 3 (View/Details Forms):
10. ⏳ **RequisitionDetailPage** - View Requisition (use StatusBanner + ViewSection)
11. ⏳ **RFQQuotationsPage** - View RFQ Details
12. ⏳ **CSListPage** - View CS Details

### Priority 4 (List/Filter Forms):
13. ⏳ **MyRequisitionsPage** - Add FilterBar
14. ⏳ **RFQListPage** - Add FilterBar
15. ⏳ **StoreIssuesPage** - Add FilterBar
16. ⏳ **ApprovalRequisitionsPage** - Add FilterBar

## 🎯 Quick Migration Checklist

For each form:

- [ ] Import form components
- [ ] Choose accent color from COLORS
- [ ] Replace page wrapper with `<div className="max-w-7xl mx-auto p-6">`
- [ ] Add StatsHeader at top
- [ ] Wrap sections in FormSection
- [ ] Replace all inputs with FieldGroup + Input/Select/Textarea
- [ ] Replace tables with DynamicTable
- [ ] Replace bottom buttons with FormActions
- [ ] Remove old CSS imports
- [ ] Test form functionality
- [ ] Test responsive design

## 📐 Design Patterns

### Pattern 1: Master Form (Single Entity)
```tsx
<StatsHeader accentColor={color} title="..." stats={[...]} />
<FormSection title="Info">
  <FieldGroup><Input /></FieldGroup>
  <FieldGroup><Select /></FieldGroup>
  <FieldGroup><Toggle /></FieldGroup>
</FormSection>
<FormActions onDiscard onSaveDraft onSubmit />
```

### Pattern 2: Master-Detail Form (Transaction)
```tsx
<StatsHeader accentColor={color} title="..." stats={[...]} />
<FormSection title="Info">
  <FieldGroup><Input /></FieldGroup>
</FormSection>
<FormSection title="Items" headerAction={<button>+ Add</button>}>
  <DynamicTable columns={[...]} data={items} />
</FormSection>
<FormActions onDiscard onSubmit />
```

### Pattern 3: View/Details Form (Read-only)
```tsx
<StatusBanner status="Approved" color={color} metadata={[...]} />
<FormSection title="Info">
  <ViewSection columns={3}>
    <ViewField label="..." value="..." />
  </ViewSection>
</FormSection>
<FormSection title="Items">
  <DynamicTable columns={[...]} data={items} readOnly />
</FormSection>
<div className="flex justify-end gap-3">
  <ActionButton label="Approve" variant="success" />
</div>
```

### Pattern 4: Filter/List Form
```tsx
<FilterBar onSearch onReset onExport>
  <FilterField label="Status">
    <Select>...</Select>
  </FilterField>
  <FilterField label="Date">
    <Input type="date" />
  </FilterField>
</FilterBar>
{/* Table or list content */}
```

## 🎨 Color Usage Guide

| Module | Color | Hex |
|--------|-------|-----|
| Employee Requisition | Purple | #534AB7 |
| Purchase Requisition | Teal | #1D9E75 |
| Sales | Amber | #BA7517 |
| Customer/Employee | Coral | #D85A30 |
| Inventory/Stock | Blue | #185FA5 |
| Reports | Gray | #5F5E5A |
| Quality Check | Violet | #7C3AED |
| Supplier | Emerald | #059669 |
| Delivery | Blue | #2563EB |
| Return | Red | #DC2626 |
| Damage | Orange | #EA580C |
| Store | Cyan | #0891B2 |
| RFQ | Purple | #8B5CF6 |
| CS | Green | #10B981 |

## 📚 Examples

See `src/components/form/FormExamples.tsx` for complete working examples of:
- Master Form (Product)
- Master-Detail Form (Requisition)
- View/Details Form (Approved Requisition)
- Filter/Search Form (List Page)

## 🔧 Troubleshooting

### Issue: Components not found
**Solution:** Make sure you're importing from `'../../components/form'` (adjust path based on your file location)

### Issue: Styles not applying
**Solution:** Ensure Tailwind CSS is configured and running. The design system uses Tailwind utility classes.

### Issue: Table not rendering correctly
**Solution:** Check that your `TableColumn[]` array has proper `key`, `label`, and `render` functions.

### Issue: Colors not showing
**Solution:** Import `COLORS` from the form components and use inline styles for accent colors.

## ✅ Testing Checklist

After migrating a form:
- [ ] Form loads without errors
- [ ] All fields are editable/read-only as expected
- [ ] Validation works
- [ ] Submit/Save/Discard buttons work
- [ ] Table add/remove rows work (if applicable)
- [ ] Responsive on mobile/tablet
- [ ] Accent color matches module
- [ ] Stats header shows correct data
- [ ] No console errors

## 🎉 Benefits

✅ **Consistent Design** - All forms look professional and uniform
✅ **Faster Development** - Reusable components save time
✅ **Easy Maintenance** - Update one component, all forms benefit
✅ **Better UX** - Familiar patterns across the app
✅ **Responsive** - Works on all screen sizes
✅ **Accessible** - Proper labels, focus states, ARIA attributes
✅ **Type-Safe** - Full TypeScript support

## 📞 Need Help?

Check the examples in `FormExamples.tsx` or refer to the migrated `CreateEmployeeRequisitionPage.tsx` for a complete real-world implementation.

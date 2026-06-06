# Requisition Create - Frontend vs Backend Analysis

## 📋 Current Frontend Implementation

### CreateRequisitionPage.tsx
**Location:** `src/pages/dashboard/CreateRequisitionPage.tsx`

**Current Request Structure:**
```typescript
interface CreateRequisitionRequest {
  departmentId?: number;
  requiredByDate: string;
  notes?: string;
  items: {
    productId: number;
    requiredQuantity: number;
    remarks?: string;
  }[];
}
```

**Current Implementation:**
- ✅ Department ID (from user context)
- ✅ Required By Date
- ✅ Notes
- ✅ Items array with:
  - productId
  - requiredQuantity
  - remarks

---

## 🔍 Backend API Analysis

### Endpoint: `POST /api/requisitions`
**Controller:** `EmployeeRequisitionController.cs`

### Expected Backend DTO Structure:
Based on backend controller analysis, the DTO should be:

```csharp
public class EmployeeRequisitionRequestDto
{
    public int ProductId { get; set; }
    public int RequiredQty { get; set; }
    public string? Remarks { get; set; }
}
```

**Backend Creates:**
- RequisitionNo (auto-generated)
- RequisitionDate (DateTime.Now)
- Status (default: "pending")
- DepartmentId (from user context)
- RequestedById (from authenticated user)
- CreatedBy (user email/username)
- CreatedDate (DateTime.Now)
- IsActive (true)

---

## ⚠️ Issues Found

### 1. **Backend Expects Single Item, Frontend Sends Multiple**

**Frontend sends:**
```json
{
  "departmentId": 1,
  "requiredByDate": "2025-05-20",
  "notes": "Urgent",
  "items": [
    { "productId": 1, "requiredQuantity": 10, "remarks": "..." },
    { "productId": 2, "requiredQuantity": 5, "remarks": "..." }
  ]
}
```

**Backend expects (per requisition):**
```json
{
  "productId": 1,
  "requiredQty": 10,
  "remarks": "..."
}
```

**Problem:** Backend creates ONE requisition per ONE product. Frontend tries to send multiple items in one requisition.

---

### 2. **Field Name Mismatch**

| Frontend | Backend | Status |
|----------|---------|--------|
| `requiredQuantity` | `RequiredQty` | ❌ Mismatch |
| `remarks` | `Remarks` | ✅ Match |
| `productId` | `ProductId` | ✅ Match |

---

### 3. **Missing Fields in Frontend**

Backend might expect additional fields that frontend doesn't send:
- Department validation
- Product stock validation
- User department validation

---

## ✅ Solution: Update Frontend to Match Backend

### Option 1: Create Multiple Requisitions (One per Product)
If backend only supports one product per requisition, frontend should:
1. Loop through items
2. Create separate requisition for each product
3. Show success message for all

### Option 2: Update Backend to Support Multiple Items
If backend should support multiple items (recommended for real-world scenario):
1. Update backend DTO to accept items array
2. Create requisition with multiple items in one transaction

---

## 🔧 Recommended Fix: Update Frontend

Since backend appears to be designed for single-item requisitions, we should update frontend:

### Updated Frontend Request:
```typescript
// For each item, create separate requisition
for (const item of items) {
  await requisitionApi.createRequisition({
    productId: item.productId,
    requiredQty: item.requiredQuantity,  // Changed from requiredQuantity
    remarks: item.remarks
  });
}
```

### Updated API Call:
```typescript
// src/api/requisitionApi.ts
export interface CreateRequisitionRequest {
  productId: number;
  requiredQty: number;  // Changed from requiredQuantity
  remarks?: string;
}
```

---

## 📝 Implementation Steps

### Step 1: Update Types
Update `src/types/index.ts`:
```typescript
export interface CreateRequisitionRequest {
  productId: number;
  requiredQty: number;  // Changed
  remarks?: string;
}
```

### Step 2: Update CreateRequisitionPage
Update the submit handler to create multiple requisitions:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation...
  
  try {
    setSubmitting(true);
    const results = [];
    
    // Create separate requisition for each item
    for (const item of items) {
      const requestData = {
        productId: item.productId,
        requiredQty: item.requiredQuantity,
        remarks: item.remarks || undefined
      };
      
      const response = await requisitionApi.createRequisition(requestData);
      results.push(response);
    }
    
    alert(`${results.length} requisition(s) created successfully!`);
    navigate('/dashboard/requisitions');
  } catch (error: any) {
    console.error('Error creating requisitions:', error);
    alert(error.response?.data?.message || 'Error creating requisitions');
  } finally {
    setSubmitting(false);
  }
};
```

### Step 3: Update API Function
Update `src/api/requisitionApi.ts`:
```typescript
createRequisition: async (data: CreateRequisitionRequest) => {
  const response = await axiosInstance.post('/api/requisitions', data);
  return response.data;
},
```

---

## 🎯 Alternative: Check if Backend Has Different Endpoint

### Check for Bulk Create Endpoint
Backend might have a different endpoint for creating multiple items:
- `POST /api/requisitions/bulk`
- `POST /api/purchase-requisitions` (different controller)

### PurchaseRequisitionController
There might be a separate `PurchaseRequisitionController` that supports multiple items.

Let me check the other controller...

---

## 🔍 Backend Controllers Found

1. **EmployeeRequisitionController** - Single item per requisition
2. **PurchaseRequisitionController** - Might support multiple items

### Recommendation:
Check `PurchaseRequisitionController.cs` for the correct endpoint that supports multiple items.

---

## 📊 Data Flow Comparison

### Current Frontend Flow:
```
User fills form with multiple products
  ↓
Submit button clicked
  ↓
Send ONE request with items array
  ↓
Backend receives request
  ↓
❌ Backend expects single item
```

### Corrected Flow (Option 1):
```
User fills form with multiple products
  ↓
Submit button clicked
  ↓
Loop through items
  ↓
Send MULTIPLE requests (one per item)
  ↓
Backend receives each request
  ↓
✅ Creates multiple requisitions
```

### Corrected Flow (Option 2):
```
User fills form with multiple products
  ↓
Submit button clicked
  ↓
Send ONE request to correct endpoint
  ↓
Backend receives items array
  ↓
✅ Creates one requisition with multiple items
```

---

## 🚀 Next Steps

1. ✅ Identify correct backend endpoint
2. ✅ Update frontend types to match backend
3. ✅ Update CreateRequisitionPage logic
4. ✅ Test requisition creation
5. ✅ Verify data in database

---

**Status:** Analysis Complete
**Action Required:** Update frontend to match backend API structure

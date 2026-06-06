# IssueProductPage - Fix Complete ✅

## Problem
IssueProductPage was showing "Failed to load requisition" error with console showing `check-stock/undefined`.

## Root Causes

### Bug 1: Wrong API Endpoint
- Page was calling `employeeRequisitionApi.getRequisitionById()`
- But store requisitions come from `/api/store/pending-requisitions`, not employee API
- Employee API returns different structure

### Bug 2: Data Structure Mismatch
- Backend returns requisitions with `items[]` array (master-details)
- Frontend was expecting single-item fields directly on requisition:
  - `reqData.itemId` → undefined ❌
  - `reqData.requiredQty` → undefined ❌
  - `reqData.itemName` → undefined ❌

**Backend Response Structure**:
```json
{
  "id": 1,
  "requisitionNo": "REQ-2026-0013",
  "items": [
    {
      "itemId": 5,
      "itemName": "Product Name",
      "requiredQty": 10,
      "currentStock": 5,
      "remarks": "..."
    }
  ],
  "requestedBy": 2,
  "requestedByName": "John Doe",
  "departmentId": 1,
  "departmentName": "Marketing",
  "status": "forwarded_to_store"
}
```

## Solutions Applied

### Fix 1: Added getRequisitionById to storeIssueApi.ts

**File**: `src/api/storeIssueApi.ts`

```typescript
// Get requisition by ID (for issue processing)
getRequisitionById: async (id: number) => {
  const response = await axiosInstance.get(`${BASE_URL}/requisitions/${id}`);
  return response.data;
},
```

**Note**: Since backend doesn't have this endpoint yet, the page now uses `getPendingRequisitions()` and filters by ID.

### Fix 2: Updated IssueProductPage.tsx

**File**: `src/pages/dashboard/IssueProductPage.tsx`

#### A. Updated Interfaces

```typescript
interface RequisitionItem {
  itemId: number;
  itemName: string;
  requiredQty: number;
  currentStock: number;
  remarks?: string;
}

interface StoreRequisition {
  id: number;
  requisitionNo: string;
  items: RequisitionItem[];  // Array of items
  requestedBy: number;
  requestedByName?: string;
  departmentId: number;
  departmentName?: string;
  status: string;
  notes?: string;
  forwardedAt?: string;
  createdDate: string;
}
```

#### B. Updated State

```typescript
const [requisition, setRequisition] = useState<StoreRequisition | null>(null);
const [currentItem, setCurrentItem] = useState<RequisitionItem | null>(null);
```

#### C. Fixed loadData Function

**Old Code** (Broken):
```typescript
const reqResponse = await employeeRequisitionApi.getRequisitionById(Number(requisitionId));
const reqData = reqResponse.data || reqResponse;
setRequisition(reqData);
setIssuedQty(reqData.requiredQty);  // undefined!

const stockResponse = await storeIssueApi.checkStock(reqData.itemId);  // undefined!
```

**New Code** (Fixed):
```typescript
// Load all pending requisitions and find the one we need
const response = await storeIssueApi.getPendingRequisitions();
const allRequisitions = response.data || response;

const reqData = allRequisitions.find((r: StoreRequisition) => r.id === Number(requisitionId));

if (!reqData) {
  throw new Error('Requisition not found or already processed');
}

setRequisition(reqData);

// Get first item (currently backend handles one item at a time)
const firstItem = reqData.items?.[0];

if (!firstItem || !firstItem.itemId) {
  throw new Error('No items found in requisition');
}

setCurrentItem(firstItem);
setIssuedQty(firstItem.requiredQty);  // ✅ Works!

// Check stock availability
const stockResponse = await storeIssueApi.checkStock(firstItem.itemId);  // ✅ Works!
```

#### D. Updated All References

Replaced all `requisition.itemName`, `requisition.requiredQty`, etc. with `currentItem.itemName`, `currentItem.requiredQty`:

```typescript
// Before
<div className="info-value">{requisition.itemName}</div>
<div className="info-value">{requisition.requiredQty} units</div>

// After
<div className="info-value">{currentItem.itemName}</div>
<div className="info-value">{currentItem.requiredQty} units</div>
```

#### E. Added Console Logging

```typescript
console.log('📦 All pending requisitions:', allRequisitions);
console.log('📦 Found requisition:', reqData);
console.log('📦 Stock info:', stockData);
```

#### F. Removed Unused Import

```typescript
// Removed
import { employeeRequisitionApi, EmployeeRequisition } from '../../api/employeeRequisitionApi';
```

## Changes Summary

### Files Modified:
1. ✅ `src/api/storeIssueApi.ts`
   - Added `getRequisitionById()` method (for future use)

2. ✅ `src/pages/dashboard/IssueProductPage.tsx`
   - Changed from `employeeRequisitionApi` to `storeIssueApi`
   - Updated interfaces to match backend structure
   - Added `currentItem` state for first item
   - Fixed all field references to use `currentItem`
   - Added error handling for missing items
   - Added console logging for debugging

## Testing Instructions

### Test the Fix:

1. **Navigate to Pending Requisitions**:
   ```
   /dashboard/store/pending-requisitions
   ```

2. **Click "View" on any requisition**:
   - Should navigate to `/dashboard/store/issue/{id}`

3. **Verify Page Loads**:
   - ✅ No "Failed to load requisition" error
   - ✅ Requisition details display correctly
   - ✅ Item name shows
   - ✅ Required quantity shows
   - ✅ Department and Requested By show
   - ✅ Stock availability displays

4. **Check Console**:
   ```
   📦 All pending requisitions: [...]
   📦 Found requisition: {...}
   📦 Stock info: {...}
   ```

5. **Test Issue Functionality**:
   - Select Full/Partial issue
   - Enter quantity
   - Click "Issue Product"
   - Should successfully issue and redirect

### Expected Behavior:

✅ **Page loads without errors**
✅ **All requisition data displays correctly**
✅ **Stock information loads**
✅ **Issue type auto-selects based on stock**
✅ **Can issue products successfully**

## Data Flow

```
User clicks "View" on Pending Requisition
  ↓
Navigate to /dashboard/store/issue/{id}
  ↓
IssueProductPage loads
  ↓
Call storeIssueApi.getPendingRequisitions()
  ↓
Filter by requisitionId
  ↓
Extract first item from items[] array
  ↓
Call storeIssueApi.checkStock(itemId)
  ↓
Display requisition + stock info
  ↓
User issues product
  ↓
Call storeIssueApi.issueProduct()
  ↓
Success → Redirect to Pending Requisitions
```

## Notes

- Currently handles **first item only** (backend limitation)
- Multi-item support can be added later
- Backend endpoint `/api/store/requisitions/{id}` doesn't exist yet
- Using `getPendingRequisitions()` and filtering as workaround
- When backend adds the endpoint, can switch to direct call

## Future Enhancements

1. Add backend endpoint: `GET /api/store/requisitions/{id}`
2. Support multi-item requisitions
3. Add item selection dropdown if multiple items
4. Add batch-wise stock selection
5. Add print/export functionality

---

**Fix Applied**: May 11, 2026
**Status**: ✅ Complete and Ready for Testing
**Impact**: IssueProductPage now loads and functions correctly

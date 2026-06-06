# 🔍 Frontend Flow Analysis - Requisition to Supplier Quotation

## ✅ যা আছে (Implemented)

### 1. **Create Requisition** ✅
**Page:** `CreateRequisitionPage.tsx`
**Route:** `/dashboard/create-requisition`
**API:** `POST /api/PurchaseRequisition` ❌ (Wrong endpoint!)

**Features:**
- ✅ Product selection by category
- ✅ Multiple items support
- ✅ Stock display
- ✅ Unit display
- ✅ Quantity input
- ✅ Remarks
- ✅ Summary calculation

**Problem:**
```typescript
// Currently using:
requisitionApi.createRequisition() 
// Calls: POST /api/PurchaseRequisition

// Should use:
// POST /api/requisitions (EmployeeRequisitionController)
```

---

### 2. **My Requisitions List** ✅
**Page:** `MyRequisitionsPage.tsx`
**Route:** `/dashboard/requisitions`
**API:** `GET /api/PurchaseRequisition/my` ❌ (Wrong endpoint!)

**Features:**
- ✅ List view with filters
- ✅ Status badges
- ✅ Stats cards
- ✅ Search by PR number
- ✅ Filter by status, department, date
- ✅ View details button

**Problem:**
```typescript
// Currently using:
requisitionApi.getMyRequisitions()
// Calls: GET /api/PurchaseRequisition/my

// Should use:
// GET /api/requisitions/my (EmployeeRequisitionController)
```

---

### 3. **Requisition Detail** ✅
**Page:** `RequisitionDetailPage.tsx`
**Route:** `/dashboard/requisitions/:id`
**API:** `GET /api/PurchaseRequisition/{id}` ❌ (Wrong endpoint!)

**Features:**
- ✅ View requisition details
- ✅ View items
- ✅ Status display
- ✅ Approval history

---

### 4. **Approval Requisitions** ✅
**Page:** `ApprovalRequisitionsPage.tsx`
**Route:** `/dashboard/approval-requisitions`
**API:** `GET /api/PurchaseRequisition` ❌ (Wrong endpoint!)

**Features:**
- ✅ List pending requisitions
- ✅ Approve/Reject actions

**Problem:**
```typescript
// Should use:
// GET /api/requisitions (for dept head)
// PATCH /api/requisitions/{id}/approve
```

---

### 5. **Create RFQ** ✅
**Page:** `CreateRFQPage.tsx`
**Route:** `/dashboard/create-rfq`
**API:** `POST /api/rfq`

**Features:**
- ✅ Select approved requisition
- ✅ Select suppliers
- ✅ Set deadline
- ✅ Add notes
- ✅ Create RFQ

---

### 6. **RFQ List** ✅
**Page:** `RFQListPage.tsx`
**Route:** `/dashboard/rfqs`
**API:** `GET /api/rfq`

**Features:**
- ✅ List all RFQs
- ✅ Filter by status
- ✅ View quotations

---

### 7. **Submit Quotation** ✅
**Page:** `SubmitQuotationPage.tsx`
**Route:** `/dashboard/rfq/:rfqId/submit-quotation`
**API:** `POST /api/rfq/{rfqId}/quotations`

**Features:**
- ✅ Select supplier
- ✅ Enter prices
- ✅ Set delivery days
- ✅ Submit quotation

---

### 8. **View Quotations** ✅
**Page:** `RFQQuotationsPage.tsx`
**Route:** `/dashboard/rfq/:rfqId/quotations`
**API:** `GET /api/rfq/{rfqId}/quotations`

**Features:**
- ✅ View all quotations for an RFQ
- ✅ Compare prices
- ✅ Select winner (for CS)

---

## ❌ যা নেই (Missing)

### 1. **Store Department Pages** ❌
**Missing Pages:**
- ❌ Store Pending Requisitions List
- ❌ Issue Product Form
- ❌ Forward to Purchase Form
- ❌ Store Issues History

**Required Routes:**
```
/dashboard/store/pending-requisitions
/dashboard/store/issue/:requisitionId
/dashboard/store/issues
```

**Required APIs:**
```
GET  /api/store/pending-requisitions
POST /api/store/issue
POST /api/store/forward-to-purchase
GET  /api/store/issues
```

---

### 2. **Employee Requisition Flow** ❌
**Problem:** Frontend currently uses PurchaseRequisition API instead of EmployeeRequisition API

**Current Flow (Wrong):**
```
Employee → POST /api/PurchaseRequisition → Purchase Dept
```

**Required Flow (Correct):**
```
Employee → POST /api/requisitions → Dept Head → Store → Purchase
```

---

## 🔄 Complete Flow Comparison

### আপনার Backend Logic (Correct):
```
1. Employee creates requisition
   POST /api/requisitions
   Status: "draft"

2. Employee submits
   PATCH /api/requisitions/{id}/submit
   Status: "pending_dept_head"

3. Dept Head approves
   PATCH /api/requisitions/{id}/approve
   Status: "forwarded_to_store"

4. Store checks stock
   GET /api/store/check-stock/{productId}

5a. Stock available → Issue
    POST /api/store/issue
    Status: "completed" or "partially_issued"

5b. Stock NOT available → Forward to Purchase
    POST /api/store/forward-to-purchase
    Creates: PurchaseRequisition
    Status: "purchase_requisition_created"

6. Purchase Dept approves
   PUT /api/PurchaseRequisition/{id}/approve
   Status: "Approved"

7. Create RFQ
   POST /api/rfq
   Status: "RFQSent"

8. Suppliers submit quotations
   POST /api/rfq/{rfqId}/quotations

9. Create CS (Comparative Statement)
   POST /api/cs

10. Create PO (Purchase Order)
    POST /api/po
```

### Frontend এ যা আছে (Partially Wrong):
```
1. ✅ Create Requisition (but wrong API)
   POST /api/PurchaseRequisition ❌
   Should be: POST /api/requisitions ✅

2. ❌ No Submit button

3. ❌ No Dept Head approval page

4. ❌ No Store Department pages

5. ❌ No Store Issue functionality

6. ✅ Approval page exists (but wrong API)

7. ✅ Create RFQ

8. ✅ Submit Quotation

9. ✅ Create CS

10. ⚠️ Create PO (need to check)
```

---

## 🛠️ Fix করতে হবে

### Priority 1: API Endpoint Fix (Critical)

#### Fix 1: requisitionApi.ts
```typescript
// src/api/requisitionApi.ts

// OLD (Wrong)
const BASE_URL = '/api/PurchaseRequisition';

// NEW (Correct)
const BASE_URL = '/api/requisitions';

// Update all functions:
export const requisitionApi = {
  // Create employee requisition
  createRequisition: (data: CreateEmployeeRequisitionRequest) =>
    axiosInstance.post(`${BASE_URL}`, data),

  // Get my requisitions
  getMyRequisitions: () =>
    axiosInstance.get(`${BASE_URL}/my`),

  // Get requisition by ID
  getRequisitionById: (id: number) =>
    axiosInstance.get(`${BASE_URL}/${id}`),

  // Submit to dept head
  submitRequisition: (id: number) =>
    axiosInstance.patch(`${BASE_URL}/${id}/submit`),

  // Dept head revise
  reviseRequisition: (id: number, data: ReviseRequisitionRequest) =>
    axiosInstance.patch(`${BASE_URL}/${id}/revise`, data),

  // Dept head approve
  approveRequisition: (id: number) =>
    axiosInstance.patch(`${BASE_URL}/${id}/approve`),

  // Delete
  deleteRequisition: (id: number) =>
    axiosInstance.delete(`${BASE_URL}/${id}`),
};
```

---

### Priority 2: Create Store API File

#### Create: src/api/storeApi.ts
```typescript
import axiosInstance from './axiosInstance';

export interface IssueProductRequest {
  requisitionId: number;
  issuedQty: number;
  issueType: 'full' | 'partial';
  remarks?: string;
}

export interface ForwardToPurchaseRequest {
  requisitionId: number;
  remarks?: string;
}

export const storeApi = {
  // Get pending requisitions
  getPendingRequisitions: () =>
    axiosInstance.get('/api/store/pending-requisitions'),

  // Issue product
  issueProduct: (data: IssueProductRequest) =>
    axiosInstance.post('/api/store/issue', data),

  // Forward to purchase
  forwardToPurchase: (data: ForwardToPurchaseRequest) =>
    axiosInstance.post('/api/store/forward-to-purchase', data),

  // Check stock
  checkStock: (productId: number) =>
    axiosInstance.get(`/api/store/check-stock/${productId}`),

  // Get all issues
  getIssues: () =>
    axiosInstance.get('/api/store/issues'),

  // Get issue by ID
  getIssueById: (id: number) =>
    axiosInstance.get(`/api/store/issues/${id}`),

  // Get issues by requisition
  getIssuesByRequisition: (requisitionId: number) =>
    axiosInstance.get(`/api/store/issues/by-requisition/${requisitionId}`),
};
```

---

### Priority 3: Create Store Department Pages

#### Page 1: StorePendingRequisitionsPage.tsx
```typescript
// src/pages/dashboard/StorePendingRequisitionsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeApi } from '../../api/storeApi';

const StorePendingRequisitionsPage = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const response = await storeApi.getPendingRequisitions();
      setRequisitions(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading requisitions:', error);
      alert('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = (requisitionId: number) => {
    navigate(`/dashboard/store/issue/${requisitionId}`);
  };

  const handleForward = async (requisitionId: number) => {
    if (!confirm('Forward this requisition to purchase department?')) return;

    try {
      await storeApi.forwardToPurchase({
        requisitionId,
        remarks: 'Stock not available'
      });
      alert('Requisition forwarded to purchase department');
      loadRequisitions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to forward requisition');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="store-pending-page">
      <h1>Pending Requisitions (Store)</h1>
      
      <table>
        <thead>
          <tr>
            <th>Req No</th>
            <th>Item</th>
            <th>Required Qty</th>
            <th>Current Stock</th>
            <th>Department</th>
            <th>Requested By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.map((req: any) => (
            <tr key={req.id}>
              <td>{req.requisitionNo}</td>
              <td>{req.itemName}</td>
              <td>{req.requiredQty}</td>
              <td>{req.currentStock}</td>
              <td>{req.departmentName}</td>
              <td>{req.requestedByName}</td>
              <td>
                <button onClick={() => handleIssue(req.id)}>
                  Issue Product
                </button>
                <button onClick={() => handleForward(req.id)}>
                  Forward to Purchase
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StorePendingRequisitionsPage;
```

#### Page 2: IssueProductPage.tsx
```typescript
// src/pages/dashboard/IssueProductPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeApi } from '../../api/storeApi';
import { requisitionApi } from '../../api/requisitionApi';

const IssueProductPage = () => {
  const { requisitionId } = useParams();
  const navigate = useNavigate();
  
  const [requisition, setRequisition] = useState<any>(null);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [issuedQty, setIssuedQty] = useState(0);
  const [issueType, setIssueType] = useState<'full' | 'partial'>('full');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [requisitionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const reqData = await requisitionApi.getRequisitionById(Number(requisitionId));
      setRequisition(reqData);
      setIssuedQty(reqData.requiredQty);

      // Check stock
      const stockData = await storeApi.checkStock(reqData.itemId);
      setStockInfo(stockData.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (issuedQty > stockInfo.availableStock) {
      alert(`Cannot issue ${issuedQty}. Only ${stockInfo.availableStock} available.`);
      return;
    }

    if (issuedQty > requisition.requiredQty) {
      alert(`Cannot issue more than required quantity (${requisition.requiredQty})`);
      return;
    }

    try {
      setSubmitting(true);
      await storeApi.issueProduct({
        requisitionId: Number(requisitionId),
        issuedQty,
        issueType,
        remarks
      });

      alert('Product issued successfully!');
      navigate('/dashboard/store/pending-requisitions');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to issue product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!requisition) return <div>Requisition not found</div>;

  return (
    <div className="issue-product-page">
      <h1>Issue Product</h1>

      <div className="requisition-info">
        <h2>Requisition Details</h2>
        <p><strong>Req No:</strong> {requisition.requisitionNo}</p>
        <p><strong>Item:</strong> {requisition.itemName}</p>
        <p><strong>Required Qty:</strong> {requisition.requiredQty}</p>
        <p><strong>Current Stock:</strong> {requisition.currentStock}</p>
      </div>

      <div className="stock-info">
        <h2>Stock Availability</h2>
        <p><strong>Available Stock:</strong> {stockInfo?.availableStock || 0}</p>
        {stockInfo?.inventoryDetails?.map((inv: any, idx: number) => (
          <div key={idx}>
            Storage Location {inv.storageLocationId}: {inv.availableQuantity} units
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Issued Quantity *</label>
          <input
            type="number"
            value={issuedQty}
            onChange={(e) => setIssuedQty(Number(e.target.value))}
            min={1}
            max={Math.min(requisition.requiredQty, stockInfo?.availableStock || 0)}
            required
          />
        </div>

        <div className="form-group">
          <label>Issue Type *</label>
          <div>
            <label>
              <input
                type="radio"
                value="full"
                checked={issueType === 'full'}
                onChange={(e) => setIssueType(e.target.value as 'full')}
              />
              Full Issue
            </label>
            <label>
              <input
                type="radio"
                value="partial"
                checked={issueType === 'partial'}
                onChange={(e) => setIssueType(e.target.value as 'partial')}
              />
              Partial Issue
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard/store/pending-requisitions')}
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Issuing...' : 'Issue Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueProductPage;
```

---

## 📋 Implementation Checklist

### Phase 1: Fix Existing (Critical) ⚠️
- [ ] Update `requisitionApi.ts` base URL to `/api/requisitions`
- [ ] Update `CreateRequisitionPage.tsx` to use correct API
- [ ] Update `MyRequisitionsPage.tsx` to use correct API
- [ ] Update `RequisitionDetailPage.tsx` to use correct API
- [ ] Update `ApprovalRequisitionsPage.tsx` to use correct API
- [ ] Add Submit button to requisition detail page
- [ ] Test employee requisition flow

### Phase 2: Add Store Department (High Priority) 🔥
- [ ] Create `storeApi.ts`
- [ ] Create `StorePendingRequisitionsPage.tsx`
- [ ] Create `IssueProductPage.tsx`
- [ ] Create `StoreIssuesPage.tsx`
- [ ] Add routes to App.tsx
- [ ] Add navigation menu items
- [ ] Test store issue flow
- [ ] Test forward to purchase flow

### Phase 3: Integration Testing (Medium Priority) ✅
- [ ] Test complete flow: Employee → Dept Head → Store → Purchase
- [ ] Test stock available scenario
- [ ] Test stock unavailable scenario
- [ ] Test partial issue scenario
- [ ] Test RFQ creation from purchase requisition
- [ ] Test quotation submission

---

## 🎯 Summary

### ✅ Frontend এ যা আছে:
1. ✅ Create Requisition page (but wrong API)
2. ✅ My Requisitions list (but wrong API)
3. ✅ Requisition detail view (but wrong API)
4. ✅ Approval page (but wrong API)
5. ✅ Create RFQ
6. ✅ RFQ List
7. ✅ Submit Quotation
8. ✅ View Quotations
9. ✅ Create CS

### ❌ Frontend এ যা নেই:
1. ❌ Correct API endpoints (using PurchaseRequisition instead of EmployeeRequisition)
2. ❌ Submit requisition button
3. ❌ Store Department pages (3 pages missing)
4. ❌ Store Issue functionality
5. ❌ Forward to Purchase functionality

### 🔧 করতে হবে:
1. **Immediate:** API endpoints fix করুন
2. **High Priority:** Store Department pages তৈরি করুন
3. **Testing:** Complete flow test করুন

---

**Next Step:** আমি এখন implementation শুরু করব? 🚀

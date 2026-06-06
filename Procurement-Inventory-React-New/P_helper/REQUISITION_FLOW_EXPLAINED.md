# 📋 Requisition Flow - Complete Explanation

## 🔄 আপনার API তে Requisition এর সম্পূর্ণ Flow

---

## 1️⃣ **Requisition Creation (Employee/User)**

### Step 1: Employee Requisition তৈরি করে

**Who:** Employee (যেকোনো user যার department assigned আছে)

**Endpoint:** `POST /api/PurchaseRequisition`

**Request:**
```json
{
  "departmentId": 1,
  "requiredByDate": "2026-05-20",
  "notes": "Urgent requirement for store",
  "items": [
    {
      "productId": 10,
      "requiredQuantity": 5,
      "remarks": "Need fresh stock"
    },
    {
      "productId": 15,
      "requiredQuantity": 10,
      "remarks": "For display"
    }
  ]
}
```

**Backend Creates:**
```csharp
var requisition = new PurchaseRequisition
{
    RequisitionNumber = "PR-2026-001",  // Auto-generated
    RequisitionDate = DateTime.Now,      // Today's date
    Status = "Pending",                  // Initial status
    RequiredByDate = dto.RequiredByDate,
    Notes = dto.Notes,
    DepartmentId = dto.DepartmentId,
    RequestedById = currentUserId,       // From authenticated user
    IsActive = true,
    CreatedBy = user.Email,
    CreatedDate = DateTime.Now
};

// Add items
foreach (var itemDto in dto.Items)
{
    requisition.RequisitionItems.Add(new RequisitionItem
    {
        ProductId = itemDto.ProductId,
        RequiredQuantity = itemDto.RequiredQuantity,
        Remarks = itemDto.Remarks,
        IsActive = true,
        CreatedBy = user.Email,
        CreatedDate = DateTime.Now
    });
}
```

**Response:**
```json
{
  "message": "Requisition created successfully",
  "id": 1,
  "number": "PR-2026-001"
}
```

**Database State:**
```
PurchaseRequisitions Table:
- Id: 1
- RequisitionNumber: PR-2026-001
- Status: Pending
- DepartmentId: 1
- RequestedById: 5
- RequiredByDate: 2026-05-20

RequisitionItems Table:
- Id: 1, RequisitionId: 1, ProductId: 10, RequiredQuantity: 5
- Id: 2, RequisitionId: 1, ProductId: 15, RequiredQuantity: 10
```

---

## 2️⃣ **View My Requisitions (Employee)**

### Step 2: Employee তার requisitions দেখে

**Who:** Employee (যে create করেছে)

**Endpoint:** `GET /api/PurchaseRequisition`

**Backend Logic:**
```csharp
// Backend automatically filters by user role
var requisitions = await _requisitionRepo.GetAllAsync();

// If user is Employee (not Admin/DeptHead)
requisitions = requisitions.Where(r => r.RequestedById == currentUserId);

return requisitions;
```

**Response:**
```json
[
  {
    "id": 1,
    "requisitionNumber": "PR-2026-001",
    "requisitionDate": "2026-05-09",
    "status": "Pending",
    "requiredByDate": "2026-05-20",
    "departmentId": 1,
    "departmentName": "Store & Warehouse",
    "requestedById": 5,
    "requestedByEmail": "employee@example.com",
    "items": [
      {
        "id": 1,
        "productId": 10,
        "productName": "Aarong Full Cream Milk 1L",
        "requiredQuantity": 5,
        "remarks": "Need fresh stock"
      },
      {
        "id": 2,
        "productId": 15,
        "productName": "Pran Mango Juice 1L",
        "requiredQuantity": 10,
        "remarks": "For display"
      }
    ]
  }
]
```

---

## 3️⃣ **Department Head Approval**

### Step 3: Department Head requisition approve/reject করে

**Who:** Department Head (same department এর)

**View Pending Requisitions:**
`GET /api/PurchaseRequisition`

**Backend Logic:**
```csharp
// If user is Department Head
var userDepartmentId = user.DepartmentId;
requisitions = requisitions.Where(r => 
    r.DepartmentId == userDepartmentId && 
    r.Status == "Pending"
);
```

**Response:** Same structure, but filtered by department

---

### Step 3A: Approve Requisition

**Endpoint:** `PUT /api/PurchaseRequisition/{id}/approve`

**Request:** (Optional)
```json
{
  "approvalNotes": "Approved for urgent need"
}
```

**Backend Updates:**
```csharp
requisition.Status = "Approved";  // or "DeptHeadApproved"
requisition.ApprovedById = currentUserId;
requisition.ApprovedAt = DateTime.Now;
requisition.ApprovalNotes = dto.ApprovalNotes;
requisition.UpdatedBy = user.Email;
requisition.UpdatedDate = DateTime.Now;
```

**Database State:**
```
PurchaseRequisitions Table:
- Id: 1
- Status: Approved  ← Changed
- ApprovedById: 3
- ApprovedAt: 2026-05-09 10:30:00
```

---

### Step 3B: Reject Requisition

**Endpoint:** `PUT /api/PurchaseRequisition/{id}/reject`

**Request:**
```json
{
  "reason": "Budget not available this month"
}
```

**Backend Updates:**
```csharp
requisition.Status = "Rejected";
requisition.RejectionReason = dto.Reason;
requisition.RejectedById = currentUserId;
requisition.RejectedAt = DateTime.Now;
```

**Database State:**
```
PurchaseRequisitions Table:
- Id: 1
- Status: Rejected  ← Changed
- RejectionReason: "Budget not available this month"
```

---

## 4️⃣ **Purchase Department - Create RFQ**

### Step 4: Purchase Department approved requisition থেকে RFQ তৈরি করে

**Who:** Purchase Manager/Officer

**View Approved Requisitions:**
`GET /api/PurchaseRequisition`

**Backend filters:**
```csharp
requisitions = requisitions.Where(r => r.Status == "Approved");
```

**Create RFQ:**
`POST /api/RequestForQuotation`

**Request:**
```json
{
  "requisitionId": 1,
  "quotationDeadline": "2026-05-15",
  "notes": "Please provide best rates"
}
```

**Backend Creates:**
```csharp
var rfq = new RequestForQuotation
{
    RFQNumber = "RFQ-2026-001",  // Auto-generated
    RFQDate = DateTime.Now,
    Status = "Sent",
    QuotationDeadline = dto.QuotationDeadline,
    Notes = dto.Notes,
    RequisitionId = dto.RequisitionId,
    CreatedById = currentUserId,
    IsActive = true,
    CreatedBy = user.Email,
    CreatedDate = DateTime.Now
};

// Copy items from requisition
var requisition = await _requisitionRepo.GetByIdAsync(dto.RequisitionId);
foreach (var item in requisition.RequisitionItems)
{
    rfq.RFQItems.Add(new RFQItem
    {
        ProductId = item.ProductId,
        RequiredQuantity = item.RequiredQuantity,
        IsActive = true
    });
}

// Update requisition status
requisition.Status = "RFQSent";
```

**Database State:**
```
PurchaseRequisitions Table:
- Id: 1
- Status: RFQSent  ← Changed

RequestForQuotations Table:
- Id: 1
- RFQNumber: RFQ-2026-001
- Status: Sent
- RequisitionId: 1
- QuotationDeadline: 2026-05-15

RFQItems Table:
- Id: 1, RFQId: 1, ProductId: 10, RequiredQuantity: 5
- Id: 2, RFQId: 1, ProductId: 15, RequiredQuantity: 10
```

---

## 5️⃣ **Supplier Quotation Submission**

### Step 5: Suppliers RFQ এর জন্য quotation submit করে

**Who:** Suppliers (multiple suppliers can submit)

**Endpoint:** `POST /api/SupplierQuotation`

**Request:**
```json
{
  "rfqId": 1,
  "supplierId": 5,
  "currencyId": 1,
  "deliveryDays": 7,
  "notes": "Best quality products",
  "items": [
    {
      "productId": 10,
      "offeredQuantity": 5,
      "unitPrice": 115.00
    },
    {
      "productId": 15,
      "offeredQuantity": 10,
      "unitPrice": 85.00
    }
  ]
}
```

**Backend Creates:**
```csharp
var quotation = new SupplierQuotation
{
    QuotationNumber = "SQ-2026-001",  // Auto-generated
    QuotationDate = DateTime.Now,
    Status = "Pending",
    RFQId = dto.RFQId,
    SupplierId = dto.SupplierId,
    CurrencyId = dto.CurrencyId,
    DeliveryDays = dto.DeliveryDays,
    Notes = dto.Notes,
    IsActive = true
};

decimal totalAmount = 0;
foreach (var itemDto in dto.Items)
{
    var item = new QuotationItem
    {
        ProductId = itemDto.ProductId,
        OfferedQuantity = itemDto.OfferedQuantity,
        UnitPrice = itemDto.UnitPrice,
        TotalPrice = itemDto.OfferedQuantity * itemDto.UnitPrice
    };
    quotation.QuotationItems.Add(item);
    totalAmount += item.TotalPrice;
}

quotation.TotalAmount = totalAmount;
```

**Database State:**
```
SupplierQuotations Table:
- Id: 1, QuotationNumber: SQ-2026-001, RFQId: 1, SupplierId: 5
- Id: 2, QuotationNumber: SQ-2026-002, RFQId: 1, SupplierId: 6
- Id: 3, QuotationNumber: SQ-2026-003, RFQId: 1, SupplierId: 7

QuotationItems Table:
- Multiple items for each quotation with different prices
```

---

## 6️⃣ **Comparative Statement (CS) Creation**

### Step 6: Purchase Department quotations compare করে CS তৈরি করে

**Who:** Purchase Manager

**View Quotations for RFQ:**
`GET /api/SupplierQuotation/byrfq/{rfqId}`

**Create CS:**
`POST /api/ComparativeStatement`

**Request:**
```json
{
  "rfqId": 1,
  "remarks": "Selected based on best price and quality",
  "items": [
    {
      "productId": 10,
      "selectedQuotationItemId": 5,  // From Supplier A
      "remarks": "Best price"
    },
    {
      "productId": 15,
      "selectedQuotationItemId": 12,  // From Supplier B
      "remarks": "Better quality"
    }
  ]
}
```

**Backend Creates:**
```csharp
var cs = new ComparativeStatement
{
    CSNumber = "CS-2026-001",  // Auto-generated
    CSDate = DateTime.Now,
    Status = "Draft",
    RFQId = dto.RFQId,
    Remarks = dto.Remarks,
    CreatedById = currentUserId,
    IsActive = true
};

decimal totalAmount = 0;
foreach (var itemDto in dto.Items)
{
    var quotationItem = await _quotationItemRepo.GetByIdAsync(itemDto.SelectedQuotationItemId);
    
    var csItem = new CSItem
    {
        ProductId = itemDto.ProductId,
        SelectedQuotationItemId = itemDto.SelectedQuotationItemId,
        SupplierId = quotationItem.Quotation.SupplierId,
        UnitPrice = quotationItem.UnitPrice,
        Quantity = quotationItem.OfferedQuantity,
        TotalPrice = quotationItem.TotalPrice,
        Remarks = itemDto.Remarks
    };
    cs.CSItems.Add(csItem);
    totalAmount += csItem.TotalPrice;
}

cs.TotalAmount = totalAmount;
```

**Database State:**
```
ComparativeStatements Table:
- Id: 1
- CSNumber: CS-2026-001
- Status: Draft
- RFQId: 1
- TotalAmount: 1425.00

CSItems Table:
- Id: 1, CSId: 1, ProductId: 10, SupplierId: 5, UnitPrice: 115, Quantity: 5
- Id: 2, CSId: 1, ProductId: 15, SupplierId: 6, UnitPrice: 85, Quantity: 10
```

---

## 7️⃣ **CS Review & Approval**

### Step 7A: Review CS

**Who:** Purchase Manager

**Endpoint:** `PUT /api/ComparativeStatement/{id}/review`

**Backend Updates:**
```csharp
cs.Status = "Reviewed";
cs.ReviewedById = currentUserId;
cs.ReviewedAt = DateTime.Now;
```

---

### Step 7B: Approve CS

**Who:** Managing Director / Admin

**Endpoint:** `PUT /api/ComparativeStatement/{id}/approve`

**Backend Updates:**
```csharp
cs.Status = "Approved";
cs.ApprovedById = currentUserId;
cs.ApprovedAt = DateTime.Now;
```

**Database State:**
```
ComparativeStatements Table:
- Id: 1
- Status: Approved  ← Changed
- ApprovedById: 1
- ApprovedAt: 2026-05-10 14:00:00
```

---

## 8️⃣ **Purchase Order (PO) Creation**

### Step 8: Approved CS থেকে PO তৈরি করা হয়

**Who:** Purchase Manager

**Endpoint:** `POST /api/PurchaseOrder`

**Request:**
```json
{
  "comparativeStatementId": 1,
  "expectedDeliveryDate": "2026-05-17",
  "deliveryAddress": "Main Warehouse, Dhaka",
  "paymentTerms": "Net 30 days",
  "notes": "Please deliver as per schedule"
}
```

**Backend Creates:**
```csharp
var cs = await _csRepo.GetByIdAsync(dto.ComparativeStatementId);

// Group items by supplier (one PO per supplier)
var itemsBySupplier = cs.CSItems.GroupBy(i => i.SupplierId);

foreach (var supplierGroup in itemsBySupplier)
{
    var po = new PurchaseOrder
    {
        PONumber = GeneratePONumber(),  // PO-2026-001
        PODate = DateTime.Now,
        Status = "Draft",
        SupplierId = supplierGroup.Key,
        CSId = cs.Id,
        ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
        DeliveryAddress = dto.DeliveryAddress,
        PaymentTerms = dto.PaymentTerms,
        Notes = dto.Notes,
        CreatedById = currentUserId,
        IsActive = true
    };

    decimal totalAmount = 0;
    foreach (var csItem in supplierGroup)
    {
        var poItem = new POItem
        {
            ProductId = csItem.ProductId,
            Quantity = csItem.Quantity,
            UnitPrice = csItem.UnitPrice,
            TotalPrice = csItem.TotalPrice
        };
        po.POItems.Add(poItem);
        totalAmount += poItem.TotalPrice;
    }

    po.TotalAmount = totalAmount;
    await _poRepo.AddAsync(po);
}

// Update CS status
cs.Status = "POCreated";

// Update Requisition status
var rfq = await _rfqRepo.GetByIdAsync(cs.RFQId);
var requisition = await _requisitionRepo.GetByIdAsync(rfq.RequisitionId);
requisition.Status = "POCreated";
```

**Database State:**
```
PurchaseOrders Table:
- Id: 1, PONumber: PO-2026-001, Status: Draft, SupplierId: 5
- Id: 2, PONumber: PO-2026-002, Status: Draft, SupplierId: 6

POItems Table:
- Multiple items for each PO

PurchaseRequisitions Table:
- Id: 1, Status: POCreated  ← Changed

ComparativeStatements Table:
- Id: 1, Status: POCreated  ← Changed
```

---

## 9️⃣ **PO Approval & Sending**

### Step 9A: Submit PO for Approval

**Endpoint:** `PUT /api/PurchaseOrder/{id}/submit`

**Backend:**
```csharp
po.Status = "Submitted";
```

---

### Step 9B: Approve PO

**Who:** Managing Director / Admin

**Endpoint:** `PUT /api/PurchaseOrder/{id}/approve`

**Backend:**
```csharp
po.Status = "Approved";
po.ApprovedById = currentUserId;
po.ApprovedAt = DateTime.Now;
```

---

### Step 9C: Send PO to Supplier

**Endpoint:** `PUT /api/PurchaseOrder/{id}/send`

**Backend:**
```csharp
po.Status = "Sent";
po.SentToSupplierAt = DateTime.Now;

// Send email/notification to supplier (optional)
await _emailService.SendPOToSupplier(po);
```

**Database State:**
```
PurchaseOrders Table:
- Id: 1, Status: Sent  ← Changed
- SentToSupplierAt: 2026-05-10 16:00:00
```

---

## 🔟 **Goods Receipt Note (GRN) - NEW API**

### Step 10: Supplier থেকে পণ্য receive করা

**Who:** Store Manager / Warehouse Staff

**Endpoint:** `POST /api/GRN`

**Request:**
```json
{
  "purchaseOrderId": 1,
  "receivedDate": "2026-05-17",
  "storeId": 1,
  "remarks": "All items received in good condition",
  "items": [
    {
      "poItemId": 1,
      "productId": 10,
      "receivedQuantity": 5,
      "batchNumber": "BATCH-001",
      "expiryDate": "2027-05-17",
      "remarks": "Fresh stock"
    }
  ]
}
```

**Backend Creates:**
```csharp
var grn = new GRN
{
    GRNNumber = "GRN-2026-001",  // Auto-generated
    PurchaseOrderId = dto.PurchaseOrderId,
    ReceivedDate = dto.ReceivedDate,
    StoreId = dto.StoreId,
    Status = "Draft",
    Remarks = dto.Remarks,
    CreatedById = currentUserId,
    IsActive = true
};

foreach (var itemDto in dto.Items)
{
    var grnItem = new GRNItem
    {
        POItemId = itemDto.POItemId,
        ProductId = itemDto.ProductId,
        ReceivedQuantity = itemDto.ReceivedQuantity,
        BatchNumber = itemDto.BatchNumber,
        ExpiryDate = itemDto.ExpiryDate,
        Remarks = itemDto.Remarks
    };
    grn.GRNItems.Add(grnItem);
}
```

---

## 1️⃣1️⃣ **Quality Check - NEW API**

### Step 11: Received পণ্যের quality check করা

**Who:** Quality Inspector

**Endpoint:** `POST /api/QualityCheck`

**Request:**
```json
{
  "grnId": 1,
  "productId": 10,
  "inspectionDate": "2026-05-17",
  "inspectedQuantity": 5,
  "remarks": "All items passed inspection",
  "checklistItems": [
    {
      "checkParameter": "Packaging",
      "expectedValue": "Intact",
      "actualValue": "Intact",
      "status": "Pass"
    },
    {
      "checkParameter": "Expiry Date",
      "expectedValue": "> 6 months",
      "actualValue": "12 months",
      "status": "Pass"
    }
  ]
}
```

**Complete QC:**
`PATCH /api/QualityCheck/{id}/complete`

```json
{
  "passedQuantity": 5,
  "failedQuantity": 0,
  "remarks": "All items passed"
}
```

---

## 1️⃣2️⃣ **Accept GRN & Update Inventory - NEW API**

### Step 12: QC pass হলে GRN accept করা এবং inventory update

**Endpoint:** `PATCH /api/GRN/{id}/accept`

**Backend:**
```csharp
// Update GRN status
grn.Status = "Accepted";
grn.AcceptedById = currentUserId;
grn.AcceptedAt = DateTime.Now;

// Update Inventory
foreach (var grnItem in grn.GRNItems)
{
    var inventory = await _inventoryRepo.GetByProductAndStore(
        grnItem.ProductId, 
        grn.StoreId
    );
    
    if (inventory == null)
    {
        inventory = new Inventory
        {
            ProductId = grnItem.ProductId,
            StoreId = grn.StoreId,
            CurrentStock = 0
        };
        await _inventoryRepo.AddAsync(inventory);
    }
    
    // Increase stock
    inventory.CurrentStock += grnItem.ReceivedQuantity;
    inventory.LastUpdated = DateTime.Now;
    
    // Create stock movement record
    var movement = new StockMovement
    {
        MovementType = "GRN",
        ProductId = grnItem.ProductId,
        ToStoreId = grn.StoreId,
        Quantity = grnItem.ReceivedQuantity,
        MovementDate = DateTime.Now,
        ReferenceType = "GRN",
        ReferenceId = grn.Id
    };
    await _movementRepo.AddAsync(movement);
}

// Update PO status
var po = await _poRepo.GetByIdAsync(grn.PurchaseOrderId);
po.Status = "Received";
```

**Database State:**
```
GRN Table:
- Id: 1, Status: Accepted  ← Changed

Inventory Table:
- ProductId: 10, StoreId: 1, CurrentStock: 405  ← Increased by 5

StockMovements Table:
- New record: GRN receipt of 5 units

PurchaseOrders Table:
- Id: 1, Status: Received  ← Changed
```

---

## 📊 Complete Flow Summary

```
1. Employee creates Requisition
   ↓ Status: Pending
   
2. Department Head reviews
   ↓ Approves → Status: Approved
   ↓ Rejects → Status: Rejected (END)
   
3. Purchase Dept creates RFQ
   ↓ Status: RFQSent
   
4. Suppliers submit Quotations
   ↓ Multiple quotations received
   
5. Purchase Dept creates CS
   ↓ Compares quotations
   ↓ Status: Draft
   
6. Purchase Manager reviews CS
   ↓ Status: Reviewed
   
7. MD/Admin approves CS
   ↓ Status: Approved
   
8. Purchase Dept creates PO
   ↓ Status: Draft
   ↓ Requisition Status: POCreated
   
9. MD/Admin approves PO
   ↓ Status: Approved
   
10. Send PO to Supplier
    ↓ Status: Sent
    
11. Receive Goods (GRN)
    ↓ Status: Draft
    
12. Quality Check
    ↓ Pass/Fail inspection
    
13. Accept GRN
    ↓ Status: Accepted
    ↓ Inventory Updated
    ↓ PO Status: Received
    
✅ COMPLETE!
```

---

## 🎯 Status Transitions

### Requisition Statuses:
1. **Pending** - Created, waiting for approval
2. **Approved** - Dept Head approved
3. **Rejected** - Dept Head rejected
4. **RFQSent** - RFQ created
5. **POCreated** - PO created
6. **Cancelled** - Cancelled by user/admin

### RFQ Statuses:
1. **Sent** - Sent to suppliers
2. **QuotationReceived** - Quotations received
3. **Closed** - RFQ closed

### Quotation Statuses:
1. **Pending** - Submitted by supplier
2. **Selected** - Selected in CS
3. **Rejected** - Not selected

### CS Statuses:
1. **Draft** - Created
2. **Reviewed** - Reviewed by manager
3. **Approved** - Approved by MD
4. **POCreated** - PO created

### PO Statuses:
1. **Draft** - Created
2. **Submitted** - Submitted for approval
3. **Approved** - Approved by MD
4. **Sent** - Sent to supplier
5. **Received** - Goods received (GRN accepted)
6. **Cancelled** - Cancelled

### GRN Statuses:
1. **Draft** - Created
2. **Received** - Goods received
3. **QualityChecked** - QC done
4. **Accepted** - Accepted, inventory updated
5. **Rejected** - Rejected due to quality issues

---

**Generated:** ${new Date().toLocaleString('bn-BD')}
**Complete Flow:** ✅ Explained
**Total Steps:** 13

# 🔍 আপনার API Logic Analysis

## ✅ যা আছে (Implemented):

### 1. **Employee Requisition Creation** ✅
**Controller:** `EmployeeRequisitionController`
**Endpoint:** `POST /api/requisitions`

**Features:**
- ✅ Item name থাকে
- ✅ Current stock auto-fetch করে inventory থেকে
- ✅ Department wise requisition
- ✅ Status: "draft"

```csharp
// Auto-fetch current stock from inventory
var inventories = await _inventoryRepo.GetByProductIdAsync(dto.ItemId);
int currentStock = inventories.Sum(i => i.AvailableQuantity);

var requisition = new Requisition
{
    ItemName = dto.ItemName,
    RequiredQty = dto.RequiredQty,
    CurrentStock = currentStock,  // ✅ Stock info included
    RequestedBy = int.Parse(userId),
    DepartmentId = dto.DepartmentId,
    Status = "draft"
};
```

---

### 2. **Department Head - Revise Requisition** ✅
**Endpoint:** `PATCH /api/requisitions/{id}/revise`

**Features:**
- ✅ Dept head can revise
- ✅ Can change item, quantity
- ✅ Re-fetches current stock
- ✅ Status changes to "revised"

```csharp
// Only dept_head of same department can revise
if (requisition.Status != "pending_dept_head")
    return BadRequest("Only pending requisitions can be revised");

// Re-fetch current stock
var inventories = await _inventoryRepo.GetByProductIdAsync(dto.ItemId.Value);
requisition.CurrentStock = inventories.Sum(i => i.AvailableQuantity);

requisition.Status = "revised";
```

---

### 3. **Department Head - Approve & Forward to Store** ✅
**Endpoint:** `PATCH /api/requisitions/{id}/approve`

**Features:**
- ✅ Dept head approves
- ✅ Forwards to store department
- ✅ Status: "forwarded_to_store"

```csharp
if (requisition.Status != "pending_dept_head" && requisition.Status != "revised")
    return BadRequest("Only pending or revised requisitions can be approved");

requisition.Status = "forwarded_to_store";  // ✅ Forwarded to store
requisition.ApprovedAt = DateTime.Now;
requisition.ForwardedAt = DateTime.Now;
```

---

## ❌ যা নেই (Missing):

### 4. **Store Department - Issue Product** ❌
**Missing Endpoint:** `POST /api/store/issue` or `POST /api/requisitions/{id}/issue`

**Required Features:**
- ❌ Store dept head দেখবে forwarded requisitions
- ❌ Stock check করবে
- ❌ Partial/Full issue করতে পারবে
- ❌ Issue করার পর inventory থেকে stock কমবে

**Required Logic:**
```csharp
// MISSING - Need to implement
[HttpPost("{id}/issue")]
public async Task<IActionResult> IssueProduct(int id, IssueProductDto dto)
{
    var requisition = await _requisitionRepo.GetByIdAsync(id);
    
    if (requisition.Status != "forwarded_to_store")
        return BadRequest("Only forwarded requisitions can be issued");
    
    // Check stock availability
    var inventory = await _inventoryRepo.GetByProductIdAsync(requisition.ItemId);
    int availableStock = inventory.Sum(i => i.AvailableQuantity);
    
    if (availableStock <= 0)
    {
        // Stock not available - need to create purchase requisition
        requisition.Status = "stock_not_available";
        return Ok(new { 
            message = "Stock not available. Purchase requisition needed.",
            availableStock = 0
        });
    }
    
    // Issue product (partial or full)
    int issuedQty = Math.Min(dto.IssuedQuantity, availableStock);
    
    // Create store issue record
    var storeIssue = new StoreIssue
    {
        RequisitionId = requisition.Id,
        ProductId = requisition.ItemId,
        IssuedQuantity = issuedQty,
        IssuedBy = currentUserId,
        IssuedDate = DateTime.Now,
        IssueType = issuedQty >= requisition.RequiredQty ? "Full" : "Partial"
    };
    await _storeIssueRepo.AddAsync(storeIssue);
    
    // Reduce inventory
    await _inventoryRepo.ReduceStock(requisition.ItemId, issuedQty);
    
    // Update requisition status
    if (issuedQty >= requisition.RequiredQty)
        requisition.Status = "completed";
    else
        requisition.Status = "partially_issued";
    
    return Ok(new { 
        message = "Product issued successfully",
        issuedQuantity = issuedQty,
        remainingQuantity = requisition.RequiredQty - issuedQty
    });
}
```

---

### 5. **Store Department - Create Purchase Requisition** ❌
**Missing Endpoint:** `POST /api/purchase-requisitions/from-employee-requisition`

**Required Features:**
- ❌ যখন stock না থাকে, তখন employee requisition থেকে purchase requisition create করবে
- ❌ Purchase dept এ forward করবে

**Required Logic:**
```csharp
// MISSING - Need to implement
[HttpPost("from-employee-requisition/{employeeReqId}")]
public async Task<IActionResult> CreateFromEmployeeRequisition(int employeeReqId)
{
    var empReq = await _empRequisitionRepo.GetByIdAsync(employeeReqId);
    
    if (empReq.Status != "stock_not_available")
        return BadRequest("Can only create purchase requisition when stock not available");
    
    // Create purchase requisition
    var purchaseReq = new PurchaseRequisition
    {
        RequisitionNumber = GeneratePRNumber(),
        RequisitionDate = DateTime.Now,
        Status = "Pending",
        RequiredByDate = DateTime.Now.AddDays(7),
        DepartmentId = empReq.DepartmentId,
        RequestedById = currentUserId,
        Notes = $"Created from Employee Requisition: {empReq.RequisitionNo}",
        SourceEmployeeRequisitionId = empReq.Id  // Link to employee req
    };
    
    // Add item
    purchaseReq.RequisitionItems.Add(new RequisitionItem
    {
        ProductId = empReq.ItemId,
        RequiredQuantity = empReq.RequiredQty,
        Remarks = $"Stock not available. Required for: {empReq.ItemName}"
    });
    
    await _purchaseReqRepo.AddAsync(purchaseReq);
    
    // Update employee requisition
    empReq.Status = "purchase_requisition_created";
    empReq.PurchaseRequisitionId = purchaseReq.Id;
    
    return Ok(new { 
        message = "Purchase requisition created successfully",
        purchaseRequisitionId = purchaseReq.Id,
        purchaseRequisitionNumber = purchaseReq.RequisitionNumber
    });
}
```

---

### 6. **Purchase Department - Approve Purchase Requisition** ⚠️ Partial
**Existing Endpoint:** `PUT /api/PurchaseRequisition/{id}/approve`

**Status:** ✅ আছে, কিন্তু employee requisition link নেই

**Need to enhance:**
```csharp
// After approving purchase requisition
if (purchaseReq.SourceEmployeeRequisitionId.HasValue)
{
    var empReq = await _empReqRepo.GetByIdAsync(purchaseReq.SourceEmployeeRequisitionId.Value);
    empReq.Status = "purchase_approved";
}
```

---

## 📊 Complete Flow Comparison:

### আপনার চাহিদা:
```
1. Employee → Requisition (with stock info) → Dept Head
   ✅ IMPLEMENTED
   
2. Dept Head → Revise/Approve → Store Dept
   ✅ IMPLEMENTED
   
3. Store Dept → Check Stock
   ├─ Stock Available → Issue Product (Partial/Full)
   │  ❌ NOT IMPLEMENTED
   │
   └─ Stock NOT Available → Create Purchase Requisition
      ❌ NOT IMPLEMENTED
      
4. Purchase Dept → Approve Purchase Requisition
   ⚠️ PARTIALLY IMPLEMENTED (needs link to employee req)
   
5. Purchase Dept → Create RFQ → Suppliers
   ✅ IMPLEMENTED
```

---

## 🎯 Missing Entities/Tables:

### 1. **StoreIssue** Entity ❌
```csharp
public class StoreIssue : BaseEntity
{
    public int RequisitionId { get; set; }
    public Requisition Requisition { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; }
    
    public int IssuedQuantity { get; set; }
    public string IssueType { get; set; }  // "Full" or "Partial"
    
    public int IssuedBy { get; set; }
    public DateTime IssuedDate { get; set; }
    
    public string? Remarks { get; set; }
}
```

### 2. **Link between Employee Requisition & Purchase Requisition** ❌
```csharp
// Add to PurchaseRequisition entity
public int? SourceEmployeeRequisitionId { get; set; }
public Requisition? SourceEmployeeRequisition { get; set; }
```

---

## 🛠️ Implementation Required:

### Priority 1: Store Issue Functionality

**Files to Create:**
1. `StoreIssue.cs` entity
2. `StoreIssueController.cs`
3. `IStoreIssueRepository.cs` & implementation
4. `StoreIssueDto.cs`

**Endpoints to Add:**
```
POST   /api/store/issue/{requisitionId}
GET    /api/store/issues
GET    /api/store/issues/{id}
GET    /api/store/pending-requisitions  // forwarded_to_store status
```

---

### Priority 2: Purchase Requisition from Employee Requisition

**Files to Modify:**
1. `PurchaseRequisition.cs` - Add SourceEmployeeRequisitionId
2. `PurchaseRequisitionController.cs` - Add new endpoint
3. `Requisition.cs` - Add PurchaseRequisitionId

**Endpoints to Add:**
```
POST   /api/purchase-requisitions/from-employee-requisition/{empReqId}
GET    /api/purchase-requisitions/by-employee-requisition/{empReqId}
```

---

### Priority 3: Enhanced Status Flow

**New Statuses Needed:**

**Employee Requisition:**
- draft
- pending_dept_head
- revised
- forwarded_to_store
- **stock_available** ← NEW
- **stock_not_available** ← NEW
- **partially_issued** ← NEW
- **fully_issued** ← NEW
- **purchase_requisition_created** ← NEW
- **purchase_approved** ← NEW
- **completed** ← NEW

---

## 📝 Implementation Steps:

### Step 1: Create StoreIssue Entity & Table
```sql
CREATE TABLE StoreIssues (
    Id INT PRIMARY KEY IDENTITY,
    RequisitionId INT NOT NULL,
    ProductId INT NOT NULL,
    IssuedQuantity INT NOT NULL,
    IssueType NVARCHAR(20) NOT NULL,  -- 'Full' or 'Partial'
    IssuedBy INT NOT NULL,
    IssuedDate DATETIME NOT NULL,
    Remarks NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME NOT NULL,
    UpdatedBy NVARCHAR(100),
    UpdatedDate DATETIME,
    FOREIGN KEY (RequisitionId) REFERENCES EmployeeRequisition(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
```

### Step 2: Add Link Column to PurchaseRequisition
```sql
ALTER TABLE PurchaseRequisition
ADD SourceEmployeeRequisitionId INT NULL,
    FOREIGN KEY (SourceEmployeeRequisitionId) REFERENCES EmployeeRequisition(Id);
```

### Step 3: Add Link Column to EmployeeRequisition
```sql
ALTER TABLE EmployeeRequisition
ADD PurchaseRequisitionId INT NULL,
    FOREIGN KEY (PurchaseRequisitionId) REFERENCES PurchaseRequisition(Id);
```

---

## 🎯 Summary:

### ✅ আপনার API তে আছে (50%):
1. ✅ Employee requisition creation with stock info
2. ✅ Department head revise
3. ✅ Department head approve & forward to store
4. ✅ Purchase requisition management
5. ✅ RFQ creation & management

### ❌ আপনার API তে নেই (50%):
1. ❌ Store department issue product functionality
2. ❌ Partial/Full issue tracking
3. ❌ Stock availability check before issue
4. ❌ Create purchase requisition from employee requisition
5. ❌ Link between employee req & purchase req

---

## 🚀 Next Steps:

আমি এখন আপনার জন্য **missing functionality implement** করতে পারি:

1. **StoreIssue Entity & Controller** তৈরি করব
2. **Issue Product API** implement করব
3. **Purchase Requisition from Employee Requisition** link করব
4. **Frontend pages** তৈরি করব store issue এর জন্য

**আপনি কি চান আমি এগুলো implement করে দিই?** 🎯

---

**Generated:** ${new Date().toLocaleString('bn-BD')}
**Analysis:** ✅ Complete
**Implementation Required:** 50%

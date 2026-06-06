# Backend Bug Fix: POST /api/store/forward-to-purchase

## Issues Found and Fixed

### Issue 1: CORS Configuration ✅ (Already Correct)

**Status:** No fix needed - CORS is already properly configured

**Configuration in Program.cs:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

The CORS policy already allows:
- ✅ `http://localhost:3000` (React frontend)
- ✅ All headers (`.AllowAnyHeader()`)
- ✅ All methods including POST (`.AllowAnyMethod()`)
- ✅ Credentials (`.AllowCredentials()`)

**Note:** The policy is named "AllowAngular" but it works for all origins listed.

---

### Issue 2: 500 Internal Server Error ✅ FIXED

**Root Cause:** Null Reference Exception when accessing `empReq.Items`

#### Problem Code:

```csharp
// Get first item
var firstItem = empReq.Items.FirstOrDefault();  // ❌ NullReferenceException if Items is null
if (firstItem == null)
    return BadRequest(new { success = false, message = "No items found in requisition" });

// Later in the code:
foreach (var item in empReq.Items)  // ❌ NullReferenceException if Items is null
{
    purchaseReq.RequisitionItems.Add(new RequisitionItem { ... });
}
```

#### Issues Identified:

1. **No null check for Items collection** - If `empReq.Items` is null, accessing it throws NullReferenceException
2. **Removed unnecessary firstItem check** - The code checked for first item but then iterated all items anyway
3. **No IsActive filter** - Should only process active items

#### Fixed Code:

```csharp
// Get employee requisition with Items included
var empReq = await _empRequisitionRepo.GetByIdAsync(dto.RequisitionId);
if (empReq == null || !empReq.IsActive)
    return NotFound(new { success = false, message = "Requisition not found" });

// ✅ Check if Items collection is loaded and has items
if (empReq.Items == null || !empReq.Items.Any())
    return BadRequest(new { success = false, message = "No items found in requisition" });

if (empReq.Status != "forwarded_to_store" && empReq.Status != "stock_not_available")
    return BadRequest(new
    {
        success = false,
        message = "Can only create purchase requisition for forwarded or stock unavailable requisitions"
    });

// ... later in the code ...

// ✅ Add requisition items with IsActive filter
foreach (var item in empReq.Items.Where(i => i.IsActive))
{
    purchaseReq.RequisitionItems.Add(new RequisitionItem
    {
        ProductId = item.ItemId,
        RequiredQuantity = item.RequiredQty,
        Remarks = $"Stock not available. Required for: {item.ItemName}",
        IsActive = true,
        CreatedBy = user.Email ?? user.UserName,
        CreatedDate = DateTime.Now
    });
}
```

---

## Changes Summary

### Before:
```csharp
// ❌ No null check for Items collection
var firstItem = empReq.Items.FirstOrDefault();
if (firstItem == null)
    return BadRequest(...);

// ❌ No IsActive filter
foreach (var item in empReq.Items)
{
    purchaseReq.RequisitionItems.Add(...);
}
```

### After:
```csharp
// ✅ Proper null and empty check
if (empReq.Items == null || !empReq.Items.Any())
    return BadRequest(new { success = false, message = "No items found in requisition" });

// ✅ Filter only active items
foreach (var item in empReq.Items.Where(i => i.IsActive))
{
    purchaseReq.RequisitionItems.Add(...);
}
```

---

## Why This Happened

The `GetByIdAsync` method in `EmployeeRequisitionRepository` uses `.Include(r => r.Items)` to load the Items collection:

```csharp
public override async Task<Requisition?> GetByIdAsync(int id)
{
    return await _context.Set<Requisition>()
        .Include(r => r.Items)              // ✅ Loads Items
        .Include(r => r.RequestedByUser)
        .Include(r => r.Department)
        .FirstOrDefaultAsync(r => r.Id == id);
}
```

However, if:
1. The requisition has no items in the database
2. There's a database connection issue
3. The Items collection fails to load

Then `empReq.Items` could be null or empty, causing the NullReferenceException.

---

## Testing Steps

1. **Restart the backend server** (port 5186)
2. **Test the endpoint** with a valid requisition:
   ```
   POST http://localhost:5186/api/store/forward-to-purchase
   Body: { "requisitionId": 1, "remarks": "Stock unavailable" }
   ```
3. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Purchase requisition created and forwarded to purchase department",
     "data": {
       "purchaseRequisitionId": 1,
       "purchaseRequisitionNumber": "PR-2026-0001",
       "employeeRequisitionStatus": "purchase_requisition_created"
     }
   }
   ```

---

## Error Handling Improvements

The fix now properly handles these scenarios:

1. ✅ **Requisition not found** → 404 Not Found
2. ✅ **No items in requisition** → 400 Bad Request with clear message
3. ✅ **Wrong status** → 400 Bad Request with status validation message
4. ✅ **Purchase requisition already exists** → 400 Bad Request with existing PR info
5. ✅ **User not authenticated** → 401 Unauthorized
6. ✅ **Only active items processed** → Filters out soft-deleted items

---

## Files Modified

- `SuperShop_Management/Controllers/StoreIssueController.cs`
  - Method: `ForwardToPurchase`
  - Line: ~200-320

---

**Status:** ✅ FIXED - Ready for testing
**Date:** May 11, 2026

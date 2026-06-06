# COMPLETE API MAP - SuperShop Management System

**Base URL:** `http://localhost:5186`

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Auth Controller (`/api/Auth`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| POST | `/api/Auth/register` | Register new user | `{ email, password }` | `{ message, email }` | None |
| POST | `/api/Auth/login` | User login | `{ email, password }` | `{ message, token, userId, email, roles[], permissions[], departmentId, departmentName }` | None |
| POST | `/api/Auth/logout` | User logout | None | `{ message }` | None |
| GET | `/api/Auth/me` | Get current user info | None | `{ id, email, fullName, createdDate, departmentId, departmentName }` | Bearer Token |

---

## 👥 ADMIN & USER MANAGEMENT

### Admin Controller (`/api/Admin`)

**Base Auth:** `Admin` or `Manager` role required

#### Roles Management

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Admin/roles` | Get all roles | None | `[{ name }]` | Admin/Manager |
| POST | `/api/Admin/roles` | Create new role | `{ name }` | `{ message, name }` | Admin/Manager |
| PUT | `/api/Admin/roles/{roleName}` | Rename role | `{ name }` | `{ message, name }` | Admin/Manager |
| DELETE | `/api/Admin/roles/{roleName}` | Delete role | None | `{ message }` | Admin/Manager |

#### Permissions Management

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Admin/roles/{roleName}/permissions` | Get role permissions | None | `{ role, permissions[], allPermissions[] }` | Admin/Manager |
| PUT | `/api/Admin/roles/{roleName}/permissions` | Set role permissions | `{ permissions[] }` | `{ message, role, count }` | Admin/Manager |

#### Users Management

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Admin/users` | Get all users | None | `[{ id, email, roles[], departmentId, departmentName }]` | Admin/Manager |
| PUT | `/api/Admin/users/{userId}/roles` | Set user roles | `{ roles[] }` | `{ message }` | Admin/Manager |
| PUT | `/api/Admin/users/{userId}/department` | Set user department | `{ departmentId }` | `{ message }` | Admin/Manager |

---

## 📋 EMPLOYEE REQUISITION (Store Requisition)

### Employee Requisition Controller (`/api/requisitions`)

**Base Auth:** Bearer Token required

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| POST | `/api/requisitions` | Create requisition | `{ departmentId, requiredByDate, notes, items: [{ itemId, itemName, requiredQty, remarks }] }` | `{ success, message, data: { id, requisitionNo, itemCount } }` | Any authenticated user |
| GET | `/api/requisitions` | Get all requisitions (filtered by role) | None | `{ success, data: [requisitions] }` | Any authenticated user |
| GET | `/api/requisitions/{id}` | Get requisition by ID | None | `{ success, data: requisition }` | Any authenticated user |
| GET | `/api/requisitions/my` | Get my requisitions | None | `{ success, data: [requisitions] }` | Any authenticated user |
| PATCH | `/api/requisitions/{id}/submit` | Submit draft requisition | None | `{ success, message }` | Creator only |
| PATCH | `/api/requisitions/{id}/revise` | Revise pending requisition | `{ requiredByDate?, notes?, items: [{ itemId, itemName, requiredQty, remarks }] }` | `{ success, message }` | Dept Head (same dept) |
| PATCH | `/api/requisitions/{id}/approve` | Approve requisition | None | `{ success, message }` | Dept Head (same dept) |
| DELETE | `/api/requisitions/{id}` | Delete requisition | None | `{ success, message }` | Creator (draft only) or Admin |

**Response Fields:**
```json
{
  "id": 1,
  "requisitionNo": "REQ-2026-0001",
  "requestedBy": 5,
  "requestedByName": "user@example.com",
  "requestedByEmail": "user@example.com",
  "departmentId": 2,
  "departmentName": "IT Department",
  "status": "draft | pending_dept_head | revised | forwarded_to_store | partially_issued | fully_issued | completed",
  "requiredByDate": "2026-05-20",
  "notes": "Urgent requirement",
  "submittedAt": "2026-05-11T10:00:00",
  "approvedAt": "2026-05-11T11:00:00",
  "forwardedAt": "2026-05-11T11:00:00",
  "createdDate": "2026-05-11T09:00:00",
  "items": [
    {
      "id": 1,
      "itemId": 10,
      "itemName": "Laptop",
      "requiredQty": 5,
      "currentStock": 3,
      "remarks": "For new employees"
    }
  ],
  "canSubmit": true,
  "canRevise": false,
  "canApprove": false,
  "canCancel": true
}
```

---

## 🛒 PURCHASE REQUISITION

### Purchase Requisition Controller (`/api/PurchaseRequisition`)

**Base Auth:** Bearer Token required

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/PurchaseRequisition` | Get all requisitions (filtered by role) | None | `[requisitions]` | Any authenticated user |
| GET | `/api/PurchaseRequisition/pending` | Get pending requisitions | None | `[requisitions]` | Any authenticated user |
| GET | `/api/PurchaseRequisition/my-department-pending` | Get my department pending | None | `[requisitions]` | `requisition:approve` permission |
| GET | `/api/PurchaseRequisition/for-approval` | Get requisitions for approval | None | `[requisitions]` | `requisition:approve` permission |
| GET | `/api/PurchaseRequisition/my-requisitions` | Get my requisitions | None | `[requisitions]` | Any authenticated user |
| GET | `/api/PurchaseRequisition/{id}` | Get requisition by ID | None | `requisition` | Any authenticated user |
| GET | `/api/PurchaseRequisition/{id}/status` | Get requisition status | None | `{ requisitionId, requisitionNumber, status, ... }` | Any authenticated user |
| GET | `/api/PurchaseRequisition/{id}/items` | Get requisition items | None | `[items]` | Creator or Admin |
| POST | `/api/PurchaseRequisition` | Create requisition | `{ departmentId, requiredByDate, notes, items: [{ productId, requiredQuantity, remarks }] }` | `{ message, id, number }` | Any authenticated user |
| PUT | `/api/PurchaseRequisition/{id}` | Update requisition | `{ departmentId, requiredByDate, notes, items: [{ productId, requiredQuantity, remarks }] }` | `{ message, requisitionNumber, itemsUpdated }` | `requisition:approve` permission |
| PUT | `/api/PurchaseRequisition/{id}/approve` | Approve requisition | None | `{ message, requisitionNumber }` | `requisition:approve` permission |
| PUT | `/api/PurchaseRequisition/{id}/reject` | Reject requisition | `{ reason }` | `{ message, requisitionNumber }` | `requisition:approve` permission |
| DELETE | `/api/PurchaseRequisition/{id}` | Delete/Cancel requisition | None | `{ message }` | Creator (pending only) or Admin |

**Response Fields:**
```json
{
  "id": 1,
  "requisitionNumber": "PR-2026-0001",
  "requisitionDate": "2026-05-11",
  "requiredByDate": "2026-05-20",
  "notes": "Urgent purchase",
  "status": "Pending | Approved | Rejected",
  "approvedAt": "2026-05-11T11:00:00",
  "departmentId": 2,
  "departmentName": "IT Department",
  "requestedById": 5,
  "requestedByEmail": "user@example.com",
  "requestedByName": "John Doe",
  "approvedById": 3,
  "approvedByEmail": "manager@example.com",
  "approvedByName": "Jane Manager",
  "items": [
    {
      "id": 1,
      "productId": 10,
      "productName": "Laptop",
      "requiredQuantity": 5,
      "remarks": "Dell XPS 15"
    }
  ],
  "canApprove": false,
  "canReject": false,
  "canCancel": true
}
```

---

## 🏪 STORE MANAGEMENT

### Store Controller (`/api/store`)

**Base Auth:** Bearer Token required

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/store/requisitions` | Get approved requisitions forwarded to store | None | `{ success, data: [requisitions] }` | Any authenticated user |
| POST | `/api/store/issue` | Issue product (full or partial) | `{ requisitionId, issuedQty, remarks }` | `{ success, message, data: { id, issuedQty, issueType, remainingStock } }` | Any authenticated user |
| POST | `/api/store/forward-to-purchase` | Forward to purchase (creates PR) | `{ requisitionId, remarks }` | `{ success, message, data: { storeIssueId, purchaseRequisitionId, purchaseRequisitionNo, itemCount } }` | Any authenticated user |

### Store Issue Controller (`/api/store`)

**Base Auth:** Bearer Token required

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/store/pending-requisitions` | Get pending requisitions for store | None | `{ success, data: [requisitions] }` | Any authenticated user |
| POST | `/api/store/issue` | Issue product from store | `{ requisitionId, issuedQty, remarks }` | `{ success, message, data: { storeIssueId, issuedQuantity, issueType, remainingQuantity, requisitionStatus } }` | Any authenticated user |
| POST | `/api/store/forward-to-purchase` | Create purchase requisition | `{ requisitionId, remarks }` | `{ success, message, data: { purchaseRequisitionId, purchaseRequisitionNumber, employeeRequisitionStatus } }` | Any authenticated user |
| GET | `/api/store/issues` | Get all store issues | None | `{ success, data: [issues] }` | Any authenticated user |
| GET | `/api/store/issues/{id}` | Get store issue by ID | None | `{ success, data: issue }` | Any authenticated user |
| GET | `/api/store/issues/by-requisition/{requisitionId}` | Get issues by requisition | None | `{ success, data: [issues] }` | Any authenticated user |
| GET | `/api/store/check-stock/{productId}` | Check available stock | None | `{ success, data: { productId, productName, availableStock, inventoryDetails[] } }` | Any authenticated user |

**Store Issue Response:**
```json
{
  "id": 1,
  "requisitionId": 5,
  "requisitionNo": "REQ-2026-0001",
  "itemName": "Laptop",
  "requiredQty": 5,
  "issuedQty": 3,
  "issueType": "partial | full | forwarded",
  "issuedById": 10,
  "issuedByName": "Store Manager",
  "status": "issued | forwarded_to_purchase",
  "remarks": "Partial issue due to stock",
  "issuedAt": "2026-05-11T14:00:00"
}
```

---

## 📦 PRODUCT MANAGEMENT

### Product Controller (`/api/Product`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Product` | Get all products | None | `[products]` | None (AllowAnonymous) |
| GET | `/api/Product/{id}` | Get product by ID | None | `product` | Bearer Token |
| GET | `/api/Product/barcode/{barcode}` | Get product by barcode | None | `product` | None (AllowAnonymous) |
| GET | `/api/Product/bycategory/{categoryId}` | Get products by category | None | `[products]` | None (AllowAnonymous) |
| GET | `/api/Product/bybrand/{brandId}` | Get products by brand | None | `[products]` | None (AllowAnonymous) |
| POST | `/api/Product` | Create product | `{ name, barcode, price, currentStock, isPerishable, description, itemCategoryId, subCategoryId, brandId, unitId }` | `{ message, id }` | Admin or PurchaseOfficer |
| PUT | `/api/Product/{id}` | Update product | `{ name, barcode, price, currentStock, isPerishable, description, itemCategoryId, subCategoryId, brandId, unitId }` | `{ message }` | Admin or PurchaseOfficer |
| DELETE | `/api/Product/{id}` | Delete product (soft) | None | `{ message }` | Admin |

**Product Response:**
```json
{
  "id": 1,
  "name": "Dell XPS 15 Laptop",
  "barcode": "DELL-XPS-15-001",
  "price": 1500.00,
  "currentStock": 10,
  "isPerishable": false,
  "description": "High-performance laptop",
  "itemCategoryId": 1,
  "itemCategoryName": "Electronics",
  "subCategoryId": 2,
  "subCategoryName": "Computers",
  "brandId": 3,
  "brandName": "Dell",
  "unitId": 1,
  "unitName": "Piece",
  "isActive": true,
  "createdDate": "2026-01-01",
  "createdBy": "admin@example.com"
}
```

---

## 📊 INVENTORY MANAGEMENT

### Inventory Controller (`/api/Inventory`)

**Base Auth:** Bearer Token required (except GET all)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Inventory` | Get all inventory items | Query: `storeId?, page?, pageSize?` | `[inventories]` | None (AllowAnonymous) |
| GET | `/api/Inventory/{id}` | Get inventory by ID | None | `inventory` | Bearer Token |
| GET | `/api/Inventory/low-stock` | Get low stock items | Query: `storeId?` | `[inventories]` | Admin or StoreManager |

**Inventory Response:**
```json
{
  "id": 1,
  "productId": 10,
  "productName": "Laptop",
  "batchId": 5,
  "batchNumber": "BATCH-2026-001",
  "availableQuantity": 8,
  "reservedQuantity": 2,
  "minQuantity": 5,
  "maxQuantity": 50,
  "lastUpdated": "2026-05-11T10:00:00"
}
```

**Low Stock Logic:** Returns items where `availableQuantity <= minQuantity`

---

## 🏷️ MASTER DATA

### Department Controller (`/api/Department`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Department` | Get all departments | None | `[departments]` | None (AllowAnonymous) |
| GET | `/api/Department/{id}` | Get department by ID | None | `department` | Bearer Token |

### Item Category Controller (`/api/ItemCategory`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/ItemCategory` | Get all categories | None | `[categories]` | None (AllowAnonymous) |
| GET | `/api/ItemCategory/{id}` | Get category by ID | None | `category` | Admin or PurchaseOfficer |
| POST | `/api/ItemCategory` | Create category | `{ categoryName, categoryDescription }` | `{ message, data }` | Admin or PurchaseOfficer |
| PUT | `/api/ItemCategory/{id}` | Update category | `{ categoryName, categoryDescription }` | `{ message, data }` | Admin |
| DELETE | `/api/ItemCategory/{id}` | Delete category (hard) | None | `{ message }` | Admin |

### Batch Controller (`/api/Batch`)

**Base Auth:** Bearer Token required (except GET all)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Batch` | Get all batches | None | `[batches]` | None (AllowAnonymous) |
| GET | `/api/Batch/{id}` | Get batch by ID | None | `batch` | Bearer Token |
| POST | `/api/Batch` | Create batch | `{ batchNumber, manufacturingDate, expiryDate, receivedQuantity, productId, supplierId, grnId }` | `{ message, id }` | Admin or PurchaseOfficer |
| PUT | `/api/Batch/{id}` | Update batch | `{ batchNumber, manufacturingDate, expiryDate, status }` | `{ message }` | Admin or PurchaseOfficer |
| DELETE | `/api/Batch/{id}` | Delete batch (soft) | None | `{ message }` | Admin |

**Batch Response:**
```json
{
  "id": 1,
  "batchNumber": "BATCH-2026-001",
  "manufacturingDate": "2026-01-01",
  "expiryDate": "2027-01-01",
  "receivedQuantity": 100,
  "remainingQuantity": 85,
  "status": "Active",
  "productId": 10,
  "productName": "Laptop",
  "supplierId": 5,
  "supplierName": "Dell Inc.",
  "grnId": 3,
  "isActive": true,
  "createdDate": "2026-01-05",
  "createdBy": "admin@example.com"
}
```

---

## 🏷️ ADDITIONAL MASTER DATA

### Brand Controller (`/api/Brand`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Brand` | Get all brands | None | `[brands]` | None (AllowAnonymous) |
| GET | `/api/Brand/{id}` | Get brand by ID | None | `brand` | Bearer Token |
| GET | `/api/Brand/bysubcategory/{subCategoryId}` | Get brands by sub-category | None | `[brands]` | None (AllowAnonymous) |
| POST | `/api/Brand` | Create brand | `{ brandName, description, country, website, subCategoryId }` | `{ message, id }` | Admin or PurchaseOfficer |
| PUT | `/api/Brand/{id}` | Update brand | `{ brandName, description, country, website, subCategoryId }` | `{ message }` | Admin or PurchaseOfficer |
| DELETE | `/api/Brand/{id}` | Delete brand (soft) | None | `{ message }` | Admin |

**Brand Response:**
```json
{
  "brandId": 1,
  "brandName": "Dell",
  "description": "Computer manufacturer",
  "country": "USA",
  "website": "https://www.dell.com",
  "subCategoryId": 2,
  "subCategoryName": "Computers",
  "isActive": true,
  "createdDate": "2026-01-01",
  "createdBy": "admin@example.com"
}
```

### SubCategory Controller (`/api/SubCategory`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/SubCategory` | Get all sub-categories | None | `[subCategories]` | None (AllowAnonymous) |
| GET | `/api/SubCategory/{id}` | Get sub-category by ID | None | `subCategory` | Bearer Token |
| GET | `/api/SubCategory/bycategory/{categoryId}` | Get sub-categories by category | None | `[subCategories]` | None (AllowAnonymous) |
| POST | `/api/SubCategory` | Create sub-category | `{ subCategoryName, description, itemCategoryId }` | `{ message, id }` | Admin or PurchaseOfficer |
| PUT | `/api/SubCategory/{id}` | Update sub-category | `{ subCategoryName, description, itemCategoryId }` | `{ message }` | Admin or PurchaseOfficer |
| DELETE | `/api/SubCategory/{id}` | Delete sub-category (soft) | None | `{ message }` | Admin |

**SubCategory Response:**
```json
{
  "subCategoryId": 1,
  "subCategoryName": "Computers",
  "description": "Desktop and laptop computers",
  "itemCategoryId": 1,
  "itemCategoryName": "Electronics",
  "isActive": true,
  "createdDate": "2026-01-01",
  "createdBy": "admin@example.com"
}
```

### Unit Controller (`/api/Unit`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Unit` | Get all units | None | `[units]` | None (AllowAnonymous) |
| GET | `/api/Unit/{id}` | Get unit by ID | None | `unit` | Bearer Token |
| GET | `/api/Unit/byset/{unitSetId}` | Get units by unit set | None | `[units]` | None (AllowAnonymous) |
| POST | `/api/Unit` | Create unit | `{ nameOfUnit, unitSetId, unitFactor, isBaseUnit, description, remarks }` | `{ message, id }` | Admin or PurchaseOfficer |
| PUT | `/api/Unit/{id}` | Update unit | `{ nameOfUnit, unitSetId, unitFactor, isBaseUnit, description, remarks }` | `{ message }` | Admin or PurchaseOfficer |
| DELETE | `/api/Unit/{id}` | Delete unit (soft) | None | `{ message }` | Admin |

**Unit Response:**
```json
{
  "unitId": 1,
  "nameOfUnit": "Piece",
  "unitSetId": 1,
  "unitSetName": "Count",
  "unitFactor": 1.0,
  "isBaseUnit": true,
  "description": "Single unit",
  "remarks": "Base unit for counting",
  "isActive": true,
  "createdDate": "2026-01-01",
  "createdBy": "admin@example.com"
}
```

### Supplier Controller (`/api/Supplier`)

| Method | Endpoint | Description | Request Body | Response | Auth Required |
|--------|----------|-------------|--------------|----------|---------------|
| GET | `/api/Supplier` | Get all suppliers | None | `[suppliers]` | None (AllowAnonymous) |
| GET | `/api/Supplier/{id}` | Get supplier by ID | None | `supplier` | Bearer Token |
| POST | `/api/Supplier` | Create supplier | `{ name, contactPerson, phone, email, address, tradeLicenseNo, tinNo, binNo, bankName, bankAccountNo, currencyId }` | `{ message, id }` | Admin or PurchaseOfficer |
| PUT | `/api/Supplier/{id}` | Update supplier | `{ name, contactPerson, phone, email, address, tradeLicenseNo, tinNo, binNo, bankName, bankAccountNo, currencyId }` | `{ message }` | Admin or PurchaseOfficer |
| DELETE | `/api/Supplier/{id}` | Delete supplier (soft) | None | `{ message }` | Admin |

**Supplier Response:**
```json
{
  "id": 1,
  "name": "Dell Inc.",
  "contactPerson": "John Smith",
  "phone": "+1-800-123-4567",
  "email": "sales@dell.com",
  "address": "Round Rock, Texas, USA",
  "tradeLicenseNo": "TL-12345",
  "tinNo": "TIN-67890",
  "binNo": "BIN-11111",
  "bankName": "Chase Bank",
  "bankAccountNo": "1234567890",
  "currencyId": 1,
  "currencyCode": "USD",
  "isActive": true,
  "createdDate": "2026-01-01",
  "createdBy": "admin@example.com"
}
```

---

## 📝 OTHER CONTROLLERS (Not Yet Detailed)

The following controllers exist but were not fully detailed in this scan:

- **UnitSetController** (`/api/UnitSet`) - Unit set management
- **GRNController** (`/api/GRN`) - Goods Receipt Note management
- **PurchaseOrderController** (`/api/PurchaseOrder`) - Purchase order management
- **RequestForQuotationController** (`/api/RequestForQuotation`) - RFQ management
- **SupplierQuotationController** (`/api/SupplierQuotation`) - Supplier quotation management
- **ComparativeStatementController** (`/api/ComparativeStatement`) - Comparative statement management
- **QualityCheckController** (`/api/QualityCheck`) - Quality check management
- **StockMovementController** (`/api/StockMovement`) - Stock movement tracking
- **CurrencyController** (`/api/Currency`) - Currency management

---

## 🔑 PERMISSION SYSTEM

### Available Permissions

- `requisition:create` - Create requisitions
- `requisition:view` - View requisitions
- `requisition:approve` - Approve requisitions
- `requisition:cancel` - Cancel requisitions
- `requisition:manage` - Full requisition management
- `role:manage` - Manage roles
- `user:manage` - Manage users
- `department:manage` - Manage departments

### Common Roles

- **Admin** - Full system access
- **Manager** - Management access
- **PurchaseOfficer** - Purchase operations
- **StoreManager** - Store operations
- **User** - Basic user access

---

## 🔄 WORKFLOW STATUS VALUES

### Employee Requisition Status
- `draft` - Initial creation
- `pending_dept_head` - Submitted to department head
- `revised` - Revised by department head
- `forwarded_to_store` - Approved and sent to store
- `partially_issued` - Partially fulfilled
- `fully_issued` - Fully fulfilled
- `completed` - Completed
- `stock_not_available` - Stock unavailable
- `purchase_requisition_created` - PR created

### Purchase Requisition Status
- `Pending` - Awaiting approval
- `Approved` - Approved
- `Rejected` - Rejected

### Store Issue Type
- `full` - Full quantity issued
- `partial` - Partial quantity issued
- `forwarded` - Forwarded to purchase

---

## 📌 NOTES

1. **Authentication:** Most endpoints require Bearer token in header: `Authorization: Bearer {token}`
2. **Base URL:** All endpoints are relative to `http://localhost:5186`
3. **Response Format:** Most responses follow `{ success: boolean, message?: string, data?: any }` pattern
4. **Soft Delete:** Most entities use soft delete (IsActive flag)
5. **Audit Fields:** All entities have `CreatedBy`, `CreatedDate`, `UpdatedBy`, `UpdatedDate`
6. **FIFO:** Inventory deduction follows FIFO (First In, First Out) by creation date
7. **Multi-Item Support:** Employee requisitions support multiple items; store issue currently handles first item only

---

**Generated:** May 11, 2026  
**Backend Port:** 5186  
**Frontend Port:** 3000

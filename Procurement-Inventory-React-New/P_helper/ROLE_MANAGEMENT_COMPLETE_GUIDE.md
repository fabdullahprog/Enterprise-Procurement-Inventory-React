# 🔐 Role Management - Complete Guide

## 📋 সম্পূর্ণ বিবরণ

আপনার SuperShop Management System এ একটি সম্পূর্ণ **Role-Based Access Control (RBAC)** system implement করা আছে। এটি ASP.NET Core Identity ব্যবহার করে তৈরি করা হয়েছে।

---

## 🏗️ Architecture Overview

### Backend (ASP.NET Core)
```
Controllers/
├── AdminController.cs          - Role & User management APIs
└── AuthController.cs           - Login, Register, JWT token

Data/
└── SeedData.cs                 - Initial roles, users, permissions

DTOs/
└── Admin/RoleDtos.cs          - Data transfer objects

Attributes/
└── AuthorizeRolesAttribute.cs - Custom authorization
```

### Frontend (React + TypeScript)
```
api/
└── adminApi.ts                 - API calls for role management

pages/dashboard/
├── RoleManagerPage.tsx         - Role CRUD & assignment
├── RolePermissionsPage.tsx     - Permission management
└── UserManagementPage.tsx      - User list & roles view

context/
└── AuthContext.tsx             - Auth state & role checking
```

---

## 🎯 Core Components

### 1. Backend - AdminController.cs

**Location:** `SuperShop_Management/Controllers/AdminController.cs`

**Authorization:** `[Authorize(Roles = "Admin,Manager")]`

**Endpoints:**

#### Role Management:
```csharp
GET    /api/Admin/roles                      - Get all roles
POST   /api/Admin/roles                      - Create new role
PUT    /api/Admin/roles/{roleName}           - Rename role
DELETE /api/Admin/roles/{roleName}           - Delete role
```

#### Permission Management:
```csharp
GET    /api/Admin/roles/{roleName}/permissions  - Get role permissions
PUT    /api/Admin/roles/{roleName}/permissions  - Set role permissions
```

#### User Management:
```csharp
GET    /api/Admin/users                      - Get all users
PUT    /api/Admin/users/{userId}/roles       - Set user roles
PUT    /api/Admin/users/{userId}/department  - Set user department
```

---

### 2. Backend - SeedData.cs

**Location:** `SuperShop_Management/Data/SeedData.cs`

**Purpose:** Database initialization with default roles, users, and permissions

#### Default Roles Created:
```csharp
string[] roles = { 
    "Admin",              // Full system access
    "Manager",            // Management level access
    "User",               // Basic user
    "Employee",           // Employee requisitions
    "PurchaseOfficer",    // Purchase operations
    "PurchaseManager",    // Purchase management
    "StoreManager",       // Store operations
    "WarehouseManager",   // Warehouse operations
    "DepartmentHead",     // Department approval
    "MD"                  // Managing Director
};
```

#### Default Admin User:
```csharp
Email: admin@supershop.com
Password: Admin@123
Role: Admin
```

#### Default Permissions by Role:

**Admin:**
- requisition:create
- requisition:view
- requisition:approve
- requisition:cancel
- requisition:manage
- role:manage
- user:manage
- department:manage

**Manager:**
- requisition:create
- requisition:view
- requisition:approve
- requisition:manage

**DepartmentHead:**
- requisition:create
- requisition:view
- requisition:approve
- requisition:cancel

**PurchaseManager:**
- requisition:view
- requisition:approve
- requisition:manage
- rfq:create
- rfq:manage
- quotation:create
- cs:create
- po:create

**PurchaseOfficer:**
- requisition:create
- requisition:view
- rfq:create
- quotation:create
- cs:create
- po:create

**StoreManager:**
- requisition:view
- inventory:manage
- stock:manage

**WarehouseManager:**
- inventory:view
- qc:manage
- grn:manage

**MD:**
- requisition:view
- requisition:approve
- cs:approve
- po:approve

**Employee:**
- requisition:create
- requisition:view

**User:**
- requisition:create
- requisition:view

---

### 3. Frontend - adminApi.ts

**Location:** `src/api/adminApi.ts`

**Functions:**

```typescript
// Roles
getRoles()                                    - Get all roles
createRole(name: string)                      - Create new role
renameRole(roleName, name)                    - Rename role
deleteRole(roleName)                          - Delete role

// Permissions
getRolePermissions(roleName)                  - Get role permissions
setRolePermissions(roleName, permissions[])   - Set role permissions

// Users
getUsers()                                    - Get all users
setUserRoles(userId, roles[])                 - Set user roles
setUserDepartment(userId, departmentId)       - Set user department
```

---

### 4. Frontend - RoleManagerPage.tsx

**Location:** `src/pages/dashboard/RoleManagerPage.tsx`

**Route:** `/dashboard/role-manager`

**Access:** Admin, Manager roles only

**Features:**

#### Left Panel:
1. **Role List Table**
   - Shows all roles
   - Delete button (Admin role cannot be deleted)
   - Permission button (navigates to permissions page)

2. **Create New Role**
   - Input field for role name
   - Save button

#### Right Panel:
1. **Add Role to User**
   - Select user dropdown
   - Select role dropdown
   - Assign Role button
   - Department dropdown
   - Assign Department button

2. **List Roles for User**
   - Select user dropdown
   - Get Roles button
   - Shows assigned roles

3. **Remove Role from User**
   - Select user dropdown
   - Select role dropdown
   - Remove Role button

---

### 5. Frontend - RolePermissionsPage.tsx

**Location:** `src/pages/dashboard/RolePermissionsPage.tsx`

**Route:** `/dashboard/role-manager/permissions/{roleName}`

**Access:** Admin, Manager roles only

**Features:**

1. **Controller Permissions Matrix**
   - Table with controllers (Order, Product, ProductCategory)
   - Actions: View, Details, Create, Edit, Delete
   - Checkboxes for each permission

2. **Additional Permissions**
   - Shows extra permissions not in matrix
   - Checkboxes for each permission
   - Examples:
     - requisition:create
     - requisition:view
     - requisition:approve
     - role:manage
     - user:manage
     - etc.

3. **Actions**
   - Save Permissions button
   - Back to Role Manager button

---

### 6. Frontend - UserManagementPage.tsx

**Location:** `src/pages/dashboard/UserManagementPage.tsx`

**Route:** `/dashboard/users`

**Access:** Admin role only

**Features:**

1. **Stats Cards**
   - Total Users
   - Admins count
   - Managers count
   - Employees count

2. **Filters**
   - Search box (by email or name)
   - Role filter dropdown

3. **Users Table**
   - User avatar & name
   - Email
   - Department
   - Roles (with colored badges)
   - Created date

4. **Role Badges**
   - Color-coded by role:
     - Admin: 👑 (purple)
     - Manager: 💼 (blue)
     - DepartmentHead: 🎯 (green)
     - PurchaseOfficer: 📦 (orange)
     - Employee: 👤 (gray)

---

### 7. Frontend - AuthContext.tsx

**Location:** `src/context/AuthContext.tsx`

**Purpose:** Global authentication state management

**State:**
```typescript
{
  user: UserInfo | null
  token: string | null
  roles: string[]
  permissions: string[]
  loading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
}
```

**Functions:**
```typescript
login(email, password)           - Login user
register(email, password)        - Register user
logout()                         - Logout user
hasRole(role)                    - Check if user has role
hasPermission(permission)        - Check if user has permission
```

**Usage Example:**
```typescript
const { roles, hasRole, hasPermission, isAdmin } = useAuth();

// Check role
if (hasRole('Admin')) {
  // Show admin features
}

// Check permission
if (hasPermission('requisition:approve')) {
  // Show approve button
}

// Check if admin
if (isAdmin) {
  // Show admin panel
}
```

---

## 🔄 Complete Workflow

### 1. System Initialization (First Run)

```
Backend Starts
     ↓
SeedData.InitializeIdentityAsync()
     ↓
Create 10 Default Roles
     ↓
Assign Default Permissions to Each Role
     ↓
Create Admin User (admin@supershop.com)
     ↓
Assign Admin Role to Admin User
     ↓
Ready for Use
```

---

### 2. User Login Flow

```
User enters credentials
     ↓
POST /api/Auth/login
     ↓
AuthController validates credentials
     ↓
Get user roles from UserManager
     ↓
Get permissions from role claims
     ↓
Generate JWT token with:
  - User ID
  - Email
  - Roles (as claims)
  - Permissions (as claims)
  - Department ID (if assigned)
     ↓
Return token + user info
     ↓
Frontend stores in localStorage:
  - token
  - user
  - roles
  - permissions
     ↓
AuthContext updates state
     ↓
User redirected to dashboard
```

---

### 3. Role Creation Flow

```
Admin opens Role Manager
     ↓
Clicks "Create New Role"
     ↓
Enters role name (e.g., "Supervisor")
     ↓
Clicks Save
     ↓
POST /api/Admin/roles
     ↓
AdminController.CreateRole()
     ↓
RoleManager.CreateAsync()
     ↓
Role saved to AspNetRoles table
     ↓
Frontend refreshes role list
     ↓
New role appears in list
```

---

### 4. Permission Assignment Flow

```
Admin clicks "Permission" button for a role
     ↓
Navigate to /dashboard/role-manager/permissions/{roleName}
     ↓
GET /api/Admin/roles/{roleName}/permissions
     ↓
AdminController.GetRolePermissions()
     ↓
RoleManager.GetClaimsAsync()
     ↓
Returns current permissions + all available permissions
     ↓
Frontend shows checkboxes
     ↓
Admin selects/deselects permissions
     ↓
Clicks "Save Permissions"
     ↓
PUT /api/Admin/roles/{roleName}/permissions
     ↓
AdminController.SetRolePermissions()
     ↓
Remove all existing permission claims
     ↓
Add new permission claims
     ↓
Saved to AspNetRoleClaims table
     ↓
Success message shown
```

---

### 5. User Role Assignment Flow

```
Admin opens Role Manager
     ↓
Selects user from dropdown
     ↓
Selects role from dropdown
     ↓
Clicks "Assign Role"
     ↓
PUT /api/Admin/users/{userId}/roles
     ↓
AdminController.SetUserRoles()
     ↓
Get current user roles
     ↓
Calculate roles to add/remove
     ↓
UserManager.RemoveFromRolesAsync()
     ↓
UserManager.AddToRolesAsync()
     ↓
Saved to AspNetUserRoles table
     ↓
Frontend refreshes user list
     ↓
User now has new role
```

---

### 6. Department Assignment Flow

```
Admin selects user
     ↓
Selects department
     ↓
Clicks "Assign Department"
     ↓
PUT /api/Admin/users/{userId}/department
     ↓
AdminController.SetUserDepartment()
     ↓
Remove existing DepartmentId claim
     ↓
Add new DepartmentId claim
     ↓
Saved to AspNetUserClaims table
     ↓
User now belongs to department
```

---

## 🗄️ Database Tables

### ASP.NET Identity Tables:

1. **AspNetRoles**
   - Id (int)
   - Name (string) - Role name
   - NormalizedName (string)
   - ConcurrencyStamp (string)

2. **AspNetUsers**
   - Id (int)
   - UserName (string)
   - Email (string)
   - PasswordHash (string)
   - etc.

3. **AspNetUserRoles** (Junction Table)
   - UserId (int) → AspNetUsers.Id
   - RoleId (int) → AspNetRoles.Id

4. **AspNetRoleClaims** (Permissions)
   - Id (int)
   - RoleId (int) → AspNetRoles.Id
   - ClaimType (string) - "permission"
   - ClaimValue (string) - "requisition:create"

5. **AspNetUserClaims** (User-specific claims)
   - Id (int)
   - UserId (int) → AspNetUsers.Id
   - ClaimType (string) - "DepartmentId"
   - ClaimValue (string) - "1"

---

## 🔐 Authorization Examples

### 1. Controller Level Authorization

```csharp
// Only Admin and Manager can access
[Authorize(Roles = "Admin,Manager")]
public class AdminController : ControllerBase
{
    // All endpoints require Admin or Manager role
}

// Only Admin can access
[Authorize(Roles = "Admin")]
public class UserManagementController : ControllerBase
{
    // All endpoints require Admin role
}
```

### 2. Action Level Authorization

```csharp
[HttpPost("requisitions")]
[Authorize] // Any authenticated user
public async Task<IActionResult> CreateRequisition()
{
    // Check permission in code
    var hasPermission = User.HasClaim("permission", "requisition:create");
    if (!hasPermission)
        return Forbid();
    
    // Create requisition
}

[HttpPatch("requisitions/{id}/approve")]
[Authorize(Roles = "DepartmentHead,Manager,Admin")]
public async Task<IActionResult> ApproveRequisition(int id)
{
    // Only DepartmentHead, Manager, or Admin can approve
}
```

### 3. Frontend Route Protection

```typescript
// App.tsx
<Route
  path="/dashboard/role-manager"
  element={
    <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
      <RoleManagerPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard/users"
  element={
    <ProtectedRoute requiredRoles={['Admin']}>
      <UserManagementPage />
    </ProtectedRoute>
  }
/>
```

### 4. Component Level Authorization

```typescript
// DashboardLayout.tsx
{
  label: 'Role Manager',
  to: '/dashboard/role-manager',
  visible: (roles) => roles.some(r => ['Admin', 'Manager'].includes(r)),
  icon: <svg>...</svg>
}

{
  label: 'User Management',
  to: '/dashboard/users',
  visible: (roles) => roles.includes('Admin'),
  icon: <svg>...</svg>
}
```

### 5. Button Level Authorization

```typescript
// RequisitionDetail.tsx
const { hasPermission, hasRole } = useAuth();

const canApprove = hasRole('DepartmentHead') && 
                   hasPermission('requisition:approve') && 
                   requisition.status === 'Pending';

return (
  <>
    {canApprove && (
      <button onClick={handleApprove}>
        Approve
      </button>
    )}
  </>
);
```

---

## 🧪 Testing Guide

### Test 1: Create New Role

1. Login as Admin:
   ```
   Email: admin@supershop.com
   Password: Admin@123
   ```

2. Navigate to Role Manager:
   ```
   Dashboard → Role Manager
   ```

3. Create new role:
   - Enter role name: "Supervisor"
   - Click "Save"
   - ✅ Role appears in list

---

### Test 2: Assign Permissions

1. In Role Manager, find "Supervisor" role

2. Click "Permission" button

3. Select permissions:
   - ☑ requisition:create
   - ☑ requisition:view
   - ☑ requisition:approve

4. Click "Save Permissions"

5. ✅ Success message shown

---

### Test 3: Assign Role to User

1. In Role Manager, go to "Add Role to User" section

2. Select user: employee@supershop.com

3. Select role: Supervisor

4. Click "Assign Role"

5. ✅ Role assigned

6. Verify:
   - Go to User Management
   - Find employee@supershop.com
   - Should show "Supervisor" badge

---

### Test 4: Assign Department

1. In Role Manager, "Add Role to User" section

2. Select user: employee@supershop.com

3. Select department: Sales

4. Click "Assign Department"

5. ✅ Department assigned

6. Verify:
   - Go to User Management
   - Find employee@supershop.com
   - Should show "Sales" in Department column

---

### Test 5: Remove Role

1. In Role Manager, go to "Remove Role from User" section

2. Select user: employee@supershop.com

3. Select role: Employee

4. Click "Remove Role"

5. ✅ Role removed

6. Verify:
   - Go to User Management
   - Find employee@supershop.com
   - "Employee" badge should be gone

---

### Test 6: Check Permissions

1. Login as employee@supershop.com

2. Open browser console (F12)

3. Run:
   ```javascript
   localStorage.getItem('permissions')
   ```

4. Should show:
   ```json
   ["requisition:create","requisition:view","requisition:approve"]
   ```

---

## 📊 Permission List

### Requisition Permissions:
- `requisition:create` - Create requisitions
- `requisition:view` - View requisitions
- `requisition:approve` - Approve requisitions
- `requisition:cancel` - Cancel requisitions
- `requisition:manage` - Full requisition management

### RFQ Permissions:
- `rfq:create` - Create RFQs
- `rfq:manage` - Manage RFQs

### Quotation Permissions:
- `quotation:create` - Create quotations

### CS Permissions:
- `cs:create` - Create comparative statements
- `cs:approve` - Approve comparative statements

### PO Permissions:
- `po:create` - Create purchase orders
- `po:approve` - Approve purchase orders

### Inventory Permissions:
- `inventory:view` - View inventory
- `inventory:manage` - Manage inventory

### Stock Permissions:
- `stock:manage` - Manage stock

### QC Permissions:
- `qc:manage` - Manage quality control

### GRN Permissions:
- `grn:manage` - Manage goods received notes

### Admin Permissions:
- `role:manage` - Manage roles
- `user:manage` - Manage users
- `department:manage` - Manage departments

---

## 🎯 Best Practices

### 1. Role Naming Convention
- Use PascalCase: `DepartmentHead`, `PurchaseOfficer`
- Be descriptive: `StoreManager` not `SM`
- Avoid spaces: `PurchaseManager` not `Purchase Manager`

### 2. Permission Naming Convention
- Use format: `resource:action`
- Examples:
  - `requisition:create`
  - `user:manage`
  - `inventory:view`
- Lowercase only
- Use colon separator

### 3. Security
- Never expose Admin role deletion
- Always validate role exists before assignment
- Check permissions in both frontend and backend
- Use JWT tokens with short expiry
- Store sensitive data in claims, not localStorage

### 4. Performance
- Cache role/permission checks
- Load permissions once at login
- Use role-based routing
- Minimize API calls

---

## 🔧 Troubleshooting

### Issue 1: User can't see menu items

**Cause:** Role not assigned or menu visibility not configured

**Solution:**
1. Check user roles in User Management
2. Check menu visibility in DashboardLayout.tsx
3. Verify role name matches exactly (case-sensitive)

---

### Issue 2: Permission not working

**Cause:** Permission not assigned to role

**Solution:**
1. Go to Role Manager
2. Click "Permission" for the role
3. Check if permission is selected
4. Save permissions
5. User must logout and login again

---

### Issue 3: Can't create role

**Cause:** Role already exists or not authorized

**Solution:**
1. Check if role name already exists
2. Verify you're logged in as Admin or Manager
3. Check browser console for errors
4. Verify backend is running

---

### Issue 4: Department not showing

**Cause:** Department not assigned or claim not set

**Solution:**
1. Go to Role Manager
2. Assign department to user
3. User must logout and login again
4. Check AspNetUserClaims table for DepartmentId claim

---

## 📝 Summary

### Backend:
- ✅ AdminController - 9 endpoints
- ✅ SeedData - 10 roles, default permissions
- ✅ AuthController - Login with roles/permissions
- ✅ Identity tables - Roles, Users, Claims

### Frontend:
- ✅ RoleManagerPage - CRUD roles, assign to users
- ✅ RolePermissionsPage - Manage permissions
- ✅ UserManagementPage - View users and roles
- ✅ AuthContext - Role/permission checking
- ✅ Protected routes - Role-based access

### Features:
- ✅ Create/Delete/Rename roles
- ✅ Assign/Remove roles to/from users
- ✅ Manage permissions per role
- ✅ Assign departments to users
- ✅ View all users with roles
- ✅ Filter users by role
- ✅ Search users
- ✅ Role-based navigation
- ✅ Permission-based features

---

**সব কিছু সম্পূর্ণ এবং কাজ করছে!** 🎉

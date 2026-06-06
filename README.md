# SuperShop Management User Panel

## Project Overview

SuperShop ERP is a React-based user portal for an Enterprise Procurement, Inventory, and Supply Chain Management System. The application enables employees, department heads, store personnel, procurement teams, and administrators to manage requisitions, approvals, inventory, procurement workflows, and operational activities through a centralized platform.

The system integrates with an ASP.NET Core Web API backend and provides secure role-based access to business-critical operations.


### Main Modules

- Employee Requisition Management
- Purchase Requisition & Approval Workflow
- Procurement Management (RFQ, Quotation, Comparative Statement, PO)
- Inventory & Store Management
- Product Catalog Management
- Goods Receipt Management (GRN)
- User & Role Management
- Profile Management

---

## Features

### Authentication & Security

- User Login
- User Registration
- JWT Authentication
- Role-Based Access Control (RBAC)
- Permission-Based Authorization
- Protected Routes
- Automatic Session Validation

### Employee Requisition Management

- Create Employee Requisitions
- Multi-Item Requisition Support
- View My Requisitions
- Requisition Details
- Submit Requisitions
- Requisition Tracking

### Purchase & Procurement

- Purchase Requisitions
- Approval Workflow
- Request for Quotation (RFQ)
- Supplier Quotations
- Comparative Statements (CS)
- Purchase Order (PO) Management

### Inventory & Store Operations

- Stock Overview
- Product Availability Tracking
- Low Stock Monitoring
- Store Issue Management
- Stock Adjustment Operations
- Inventory Visibility

### Product & Catalog Management

- Product Listing
- Product Search
- Category Management
- Subcategory Management
- Product Details

### Goods Receipt Management

- Goods Receipt Note (GRN)
- GRN Tracking
- GRN Printing

### Administration

- User Management
- Role Management
- Permission Management
- Profile Management

### Reporting & Printing

- Purchase Requisition Print
- Purchase Order Print
- GRN Print

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend application framework |
| TypeScript | Strongly typed application development |
| Vite | Development server and build tool |
| Axios | HTTP communication with backend APIs |
| React Router DOM | Client-side routing |
| Tailwind CSS | Utility-first styling framework |
| PostCSS | CSS processing |
| Lucide React | Modern icon library |

---


### Architecture Components

- **Pages**: User-facing screens and workflows
- **Components**: Reusable UI elements
- **Context**: Authentication and authorization state
- **Hooks**: Shared application logic
- **API Services**: Backend communication layer
- **Protected Routes**: Authentication and role-based access control

---

## Installation

### Prerequisites

- Node.js (Latest LTS Recommended)
- npm

### Clone Repository

```bash
git clone <repository-url>
cd Enterprise-Procurement-Inventory-React
```

### Install Dependencies

```bash
npm install
```

---

## Configuration

### API Configuration

The application communicates with the ASP.NET Core backend through Axios.

| Setting | Value |
|----------|---------|
| API Base URL | http://localhost:5186 |
| Authentication | JWT Bearer Token |
| Token Storage | Local Storage |

### Important Files

```text
src/api/axiosInstance.ts
src/context/AuthContext.tsx
src/App.tsx
```

---

## Running the Project

### Development Mode

```bash
npm install
npm run dev
```

Application URL:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Authentication & Authorization

### Authentication Flow

1. User logs in using email and password.
2. Backend validates credentials.
3. JWT token is returned.
4. Token is stored in Local Storage.
5. Axios automatically attaches the token to outgoing requests.
6. Protected routes validate authentication before granting access.

### Authorization

The application supports:

- Role-Based Access Control (RBAC)
- Permission-Based Authorization
- Protected Dashboard Routes
- Unauthorized Access Handling


---

## Application Modules

### Employee Requisition

- Create Employee Requisitions
- View My Requisitions
- Requisition Details
- Requisition Tracking

### Purchase Requisition & Approval

- Purchase Requisition Management
- Approval Workflow
- Department Head Approval
- Purchase Team Review

### Procurement

- RFQ Management
- Supplier Quotations
- Comparative Statements
- Purchase Orders

### Inventory & Store

- Stock Overview
- Inventory Monitoring
- Store Issue Operations
- Product Availability Tracking

### Product Catalog

- Product Management
- Product Search
- Category Browsing
- Product Details

### Goods Receipt

- GRN Management
- GRN Tracking
- Print Support

### Administration

- User Management
- Role Management
- Permission Management
- Profile Management

---

## Project Structure

```text
src/
├── api/
│   ├── axiosInstance.ts
│   ├── authApi.ts
│   ├── employeeRequisitionApi.ts
│   ├── requisitionApi.ts
│   ├── productApi.ts
│   ├── inventoryApi.ts
│   ├── storeApi.ts
│   ├── storeIssueApi.ts
│   ├── rfqApi.ts
│   ├── grnApi.ts
│   ├── adminApi.ts
│   └── masterDataApi.ts
│
├── components/
│   ├── common/
│   ├── form/
│   └── layout/
│
├── context/
│   └── AuthContext.tsx
│
├── hooks/
│
├── pages/
│   ├── auth/
│   ├── dashboard/
│   └── shared/
│
├── App.tsx
├── main.tsx
└── index.css
```

### Folder Description

| Folder | Purpose |
|----------|---------|
| api | Backend API communication |
| components | Reusable UI components |
| context | Authentication and authorization state |
| hooks | Shared application logic |
| pages | Application screens and workflows |
| layout | Dashboard layout and navigation |

---

## Dependencies

### Core Dependencies

- React
- React DOM
- TypeScript
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React

### Development Dependencies

- Vite
- PostCSS
- ESLint
- TypeScript Compiler

---

## Future Improvements

- Centralized notification system
- Enhanced reporting dashboards
- Real-time notifications

---

## Author

### Development Team

- Abdullah Al Foysal
- Shahriar Bin Iqbal
- Sayde Monirul Islam
- Mohammad Sayem
- Tahmina Khanm

---


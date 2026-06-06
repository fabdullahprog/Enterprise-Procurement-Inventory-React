// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useScrollIndicator } from './hooks/useScrollIndicator';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage       from './pages/LandingPage';
import LoginPage        from './pages/auth/LoginPage';
import RegisterPage     from './pages/auth/RegisterPage';
import DashboardHome    from './pages/dashboard/DashboardHome';
import ProfilePage      from './pages/dashboard/ProfilePage';
import ProductsPage     from './pages/dashboard/ProductsPage';
import CreateRequisitionPage from './pages/dashboard/CreateRequisitionPage';
import CreateEmployeeRequisitionPage from './pages/dashboard/CreateEmployeeRequisitionPage';
import MyRequisitionsPage from './pages/dashboard/MyRequisitionsPage';
import RequisitionDetailPage from './pages/dashboard/RequisitionDetailPage';
import EmployeeRequisitionDetailPage from './pages/dashboard/EmployeeRequisitionDetailPage';
import ApprovalRequisitionsPage from './pages/dashboard/ApprovalRequisitionsPage';
import DeptHeadRequisitionsPage from './pages/dashboard/DeptHeadRequisitionsPage';
import ApprovedRequisitionsPage from './pages/dashboard/ApprovedRequisitionsPage';
import CreateRFQPage from './pages/dashboard/CreateRFQPage';
import CreateRfqForm from './pages/dashboard/CreateRfqForm';
import RFQListPage from './pages/dashboard/RFQListPage';
import RFQQuotationsPage from './pages/dashboard/RFQQuotationsPage';
import SubmitQuotationPage from './pages/dashboard/SubmitQuotationPage';
import QuotationDetailPage from './pages/dashboard/QuotationDetailPage';
import CreateCSPage from './pages/dashboard/CreateCSPage';
import CSListPage from './pages/dashboard/CSListPage';
import ViewCSPage from './pages/dashboard/ViewCSPage';
import PurchaseOrderListPage from './pages/dashboard/PurchaseOrderListPage';
import POInvoicePrint from './pages/dashboard/POInvoicePrint';
import GRNInvoicePrint from './pages/dashboard/GRNInvoicePrint';
import PRInvoicePrint from './pages/dashboard/PRInvoicePrint';
import CreatePOPage from './pages/dashboard/CreatePOPage';
import StorePendingRequisitionsPage from './pages/dashboard/StorePendingRequisitionsPage';
import IssueProductPage from './pages/dashboard/IssueProductPage';
import StoreIssuesPage from './pages/dashboard/StoreIssuesPage';
import StockOverviewPage from './pages/dashboard/StockOverviewPage';
import GRNListPage from './pages/dashboard/GRNListPage';
import PurchaseRequisitionListPage from './pages/dashboard/PurchaseRequisitionListPage';
import PurchaseRequisitionDetailPage from './pages/dashboard/PurchaseRequisitionDetailPage';
import UserManagementPage from './pages/dashboard/UserManagementPage';
import RoleManagerPage from './pages/dashboard/RoleManagerPage';
import RolePermissionsPage from './pages/dashboard/RolePermissionsPage';
import { LocationSetupPage } from './pages/dashboard/LocationSetupPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import './styles/global.css';

const AppContent = () => {
  useScrollIndicator();
  
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/"             element={<LandingPage />} />
      <Route path="/home"         element={<LandingPage />} />
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected - User only, Admin blocked */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index                        element={<DashboardHome />} />
        <Route path="profile"               element={<ProfilePage />} />
        <Route path="products"              element={<ProductsPage />} />
        <Route path="create-requisition"    element={<CreateRequisitionPage />} />
        <Route path="create-employee-requisition" element={<CreateEmployeeRequisitionPage />} />
        <Route path="requisitions"          element={<MyRequisitionsPage />} />
        <Route path="requisitions/:id"      element={<EmployeeRequisitionDetailPage />} />
        <Route path="purchase-requisitions/:id" element={<RequisitionDetailPage />} />
        <Route path="approvals"             element={<ApprovalRequisitionsPage />} />
        <Route path="dept-head-approvals"   element={<DeptHeadRequisitionsPage />} />
        <Route path="approved-requisitions" element={<ApprovedRequisitionsPage />} />
        <Route path="create-rfq/:id"        element={<CreateRFQPage />} />
        
        {/* Procurement Routes */}
        <Route path="procurement/create-rfq"         element={<CreateRfqForm />} />
        <Route path="rfqs"                           element={<RFQListPage />} />
        <Route path="rfq/:rfqId/quotations"          element={<RFQQuotationsPage />} />
        <Route path="rfq/:rfqId/submit-quotation"    element={<SubmitQuotationPage />} />
        <Route path="quotation/:id"                  element={<QuotationDetailPage />} />
        <Route path="rfq/:rfqId/create-cs"           element={<CreateCSPage />} />
        <Route path="comparative-statements"         element={<CSListPage />} />
        <Route path="cs/:id"                         element={<ViewCSPage />} />
        <Route path="cs/:csId/create-po"             element={<CreatePOPage />} />
        <Route path="purchase-orders"                element={<PurchaseOrderListPage />} />
        
        {/* Store Department Routes */}
        <Route path="store/pending-requisitions"     element={<StorePendingRequisitionsPage />} />
        <Route path="store/issue/:requisitionId"     element={<IssueProductPage />} />
        <Route path="store/issues"                   element={<StoreIssuesPage />} />
        <Route path="store/stock-overview"           element={<StockOverviewPage />} />
        <Route path="goods-receipt"                   element={<GRNListPage />} />
        
        {/* Purchase Department Routes */}
        <Route path="purchase/requisitions"          element={<PurchaseRequisitionListPage />} />
        <Route path="purchase/requisitions/:id"      element={<PurchaseRequisitionDetailPage />} />
        
        {/* Admin Routes */}
        <Route path="users"                 element={<UserManagementPage />} />
        <Route path="role-manager"          element={<RoleManagerPage />} />
        <Route path="role-manager/permissions/:roleName" element={<RolePermissionsPage />} />
        <Route 
          path="location-setup" 
          element={
            <ProtectedRoute roles={['Admin']}>
              <LocationSetupPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Standalone Protected Routes (No Layout) */}
      <Route
        path="/dashboard/po-print/:id"
        element={
          <ProtectedRoute>
            <POInvoicePrint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/grn-print/:id"
        element={
          <ProtectedRoute>
            <GRNInvoicePrint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/pr-print/:id"
        element={
          <ProtectedRoute>
            <PRInvoicePrint />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*"  element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

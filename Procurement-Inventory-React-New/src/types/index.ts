// src/types/index.ts

// ---- Auth Types ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  userId: number;
  email: string;
  roles: string[];
  permissions?: string[];
  departmentId?: number | null;
  departmentName?: string | null;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface UserInfo {
  id: number;
  email: string;
  departmentId?: number | null;
  departmentName?: string | null;
}

export interface UserResponseDto {
  id: number;
  email: string;
  fullName: string;
  createdDate: string;
  departmentId?: number | null;
  departmentName?: string | null;
  roles?: string[];
}

// ---- Auth Context Type ----
export interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (email: string, password: string, confirmPassword: string) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// ---- Form Types ----
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ---- Product Types ----
export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  currentStock: number;
  isPerishable: boolean;
  description?: string;
  itemCategoryId: number;
  subCategoryId: number;
  isActive: boolean;
  // Optional expanded fields (when API includes joins)
  itemCategoryName?: string;
  subCategoryName?: string;
  brandName?: string;
  unitName?: string;
}

export interface ItemCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  description?: string;
  isActive: boolean;
}

// ---- Requisition Types ----
export type RequisitionStatus = 
  | 'Pending' 
  | 'Approved'
  | 'Rejected' 
  | 'RFQSent' 
  | 'POCreated' 
  | 'Cancelled';

export interface RequisitionItemResponse {
  id: number;
  productId: number;
  productName: string;
  requiredQuantity: number;
  remarks?: string;
  isActive: boolean;
}

export interface PurchaseRequisitionResponse {
  id: number;
  requisitionNumber: string;
  requisitionDate: string;
  status: RequisitionStatus;
  requiredByDate: string;
  notes?: string;
  approvedAt?: string;
  departmentId: number;
  departmentName: string;
  requestedById: number;
  requestedByEmail: string;
  requestedByName?: string;
  approvedById?: number;
  approvedByEmail?: string;
  approvedByName?: string;
  isActive: boolean;
  items: RequisitionItemResponse[];
  canApprove?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
}

export interface PurchaseRequisition extends PurchaseRequisitionResponse {}

export interface RequisitionItem {
  id: number;
  requiredQuantity: number;
  remarks?: string;
  requisitionId: number;
  productId: number;
  product?: Product;
  isActive: boolean;
}

export interface CreateRequisitionRequest {
  departmentId: number;  // Required in backend
  requiredByDate: string;
  notes?: string;
  items: {
    productId: number;
    requiredQuantity: number;
    remarks?: string;
  }[];
  sourceRequisitionIds?: number[];
}

export interface UpdateRequisitionRequest {
  requiredByDate?: string;
  notes?: string;
  items?: {
    productId: number;
    requiredQuantity: number;
    remarks?: string;
  }[];
}

export interface ApproveRequisitionRequest {
  approvalNotes?: string;
}

export interface RejectRequisitionRequest {
  reason: string;
}

export interface Department {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  description?: string;
  departmentEmail?: string;
  departmentPhone?: string;
  location?: string;
  canRequestItem: boolean;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

export interface Currency {
  id: number;
  currencyCode: string;
  currencyName: string;
  conversionRate: number;
  isActive: boolean;
}

// ---- RFQ Types ----
export interface RequestForQuotation {
  id: number;
  rfqNumber: string;
  rfqDate: string;
  quotationDeadline: string;
  status: 'Sent' | 'QuotationReceived' | 'Closed';
  notes?: string;
  requisitionId: number;
  createdById: number;
  isActive: boolean;
  items: RFQItem[];
}

export interface RFQItem {
  productId: number;
  productName: string;
  requiredQuantity: number;
}

export interface SupplierQuotation {
  id: number;
  quotationNumber: string;
  quotationDate: string;
  status: 'Pending' | 'Selected' | 'Rejected';
  totalBDTAmount: number;
  deliveryDays: number;
  notes?: string;
  rfqId: number;
  supplierId: number;
  supplierName: string;
  currencyId?: number;
  items: QuotationItemResponse[];
}

export interface QuotationItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ComparativeStatement {
  id: number;
  csNumber: string;
  csDate: string;
  status: 'Draft' | 'Reviewed' | 'Approved' | 'POCreated';
  totalBDTAmount: number;
  remarks?: string;
  approvedAt?: string;
  rfqId: number;
  createdById: number;
  approvedById?: number;
  items: CSItem[];
}

export interface CSItem {
  rfqItemId: number;
  productName: string;
  requiredQuantity: number;
  selectedSupplierId: number;
  supplierName: string;
  unitPrice: number;
  totalPrice: number;
}

// ---- API Response Types ----
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

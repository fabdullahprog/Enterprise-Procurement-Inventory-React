// src/api/purchaseApi.ts
import axiosInstance from './axiosInstance';

export interface PurchaseRequisitionItem {
  id: number;
  productId: number;
  productName?: string;
  requiredQuantity: number;
  remarks?: string;
}

export interface PurchaseRequisition {
  id: number;
  requisitionNumber: string;
  requisitionDate: string;
  requiredByDate: string;
  status: string;
  notes?: string;
  approvedAt?: string;
  departmentId: number;
  departmentName?: string;
  requestedById: number;
  requestedByEmail?: string;
  requestedByName?: string;
  approvedById?: number;
  approvedByEmail?: string;
  approvedByName?: string;
  sourceRequisitionId?: number; // If forwarded from store
  items: PurchaseRequisitionItem[];
  canApprove?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
}

export interface CreatePurchaseRequisitionRequest {
  departmentId: number;
  requiredByDate: string;
  notes?: string;
  items: {
    productId: number;
    requiredQuantity: number;
    remarks?: string;
  }[];
}

export const purchaseApi = {
  // Get all purchase requisitions
  getRequisitions: async (): Promise<PurchaseRequisition[]> => {
    const response = await axiosInstance.get('/api/PurchaseRequisition');
    console.log('📋 Purchase API - Raw response:', response.data);
    return response.data;
  },

  // Get purchase requisition by ID
  getRequisitionById: async (id: number): Promise<PurchaseRequisition> => {
    const response = await axiosInstance.get(`/api/PurchaseRequisition/${id}`);
    return response.data;
  },

  // Get pending purchase requisitions
  getPendingRequisitions: async (): Promise<PurchaseRequisition[]> => {
    const response = await axiosInstance.get('/api/PurchaseRequisition/pending');
    return response.data;
  },

  // Get my purchase requisitions
  getMyRequisitions: async (): Promise<PurchaseRequisition[]> => {
    const response = await axiosInstance.get('/api/PurchaseRequisition/my-requisitions');
    return response.data;
  },

  // Create purchase requisition
  createRequisition: async (data: CreatePurchaseRequisitionRequest) => {
    const response = await axiosInstance.post('/api/PurchaseRequisition', data);
    return response.data;
  },

  // Approve purchase requisition
  approveRequisition: async (id: number) => {
    const response = await axiosInstance.put(`/api/PurchaseRequisition/${id}/approve`);
    return response.data;
  },

  // Reject purchase requisition
  rejectRequisition: async (id: number, reason?: string) => {
    const response = await axiosInstance.put(`/api/PurchaseRequisition/${id}/reject`, { reason });
    return response.data;
  },

  // Delete/Cancel purchase requisition
  deleteRequisition: async (id: number) => {
    const response = await axiosInstance.delete(`/api/PurchaseRequisition/${id}`);
    return response.data;
  }
};

// RFQ API
export interface RFQRequest {
  requisitionId: number;
  quotationDeadline: string;
  notes?: string;
}

export interface SendRFQRequest {
  supplierIds: number[];
}

export const rfqApi = {
  // Create RFQ from purchase requisition
  createRFQ: async (data: RFQRequest) => {
    const response = await axiosInstance.post('/api/RequestForQuotation', data);
    return response.data;
  },

  // Send RFQ to suppliers
  sendToSuppliers: async (rfqId: number, data: SendRFQRequest) => {
    const response = await axiosInstance.post(`/api/RequestForQuotation/${rfqId}/send`, data);
    return response.data;
  }
};

// Supplier API
export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  tradeLicenseNo?: string;
  tinNo?: string;
  binNo?: string;
  bankName?: string;
  bankAccountNo?: string;
  currencyId?: number;
  currencyCode?: string;
  isActive: boolean;
}

export const supplierApi = {
  // Get all suppliers
  getAll: async (): Promise<Supplier[]> => {
    const response = await axiosInstance.get('/api/Supplier');
    return response.data;
  },

  // Get supplier by ID
  getById: async (id: number): Promise<Supplier> => {
    const response = await axiosInstance.get(`/api/Supplier/${id}`);
    return response.data;
  }
};

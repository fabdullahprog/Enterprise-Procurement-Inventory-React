// src/api/batchApi.ts
import axiosInstance from './axiosInstance';

export interface Batch {
  id: number;
  batchNumber: string;
  productId: number;
  productName?: string;
  storeId?: number;
  storeName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  receivedDate: string;
  receivedQuantity: number;
  currentQuantity: number;
  unitPrice: number;
  totalValue: number;
  supplierId?: number;
  supplierName?: string;
  grnId?: number;
  grnNumber?: string;
  status: 'Active' | 'Expired' | 'Depleted' | 'Quarantined';
  isExpiringSoon: boolean;
  daysToExpiry?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatchRequest {
  batchNumber: string;
  productId: number;
  storeId?: number;
  manufacturingDate?: string;
  expiryDate?: string;
  receivedDate: string;
  receivedQuantity: number;
  unitPrice: number;
  supplierId?: number;
  grnId?: number;
  remarks?: string;
}

export interface UpdateBatchRequest {
  manufacturingDate?: string;
  expiryDate?: string;
  remarks?: string;
}

export interface BatchMovement {
  id: number;
  batchId: number;
  batchNumber?: string;
  movementType: 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment' | 'Return';
  quantity: number;
  balanceAfter: number;
  movementDate: string;
  referenceType?: string;
  referenceId?: number;
  remarks?: string;
}

export const batchApi = {
  // Get all batches
  getAll: async (page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/Batch', { params });
    return response.data;
  },

  // Get batch by ID
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Batch/${id}`);
    return response.data;
  },

  // Get batch by number
  getByNumber: async (batchNumber: string) => {
    const response = await axiosInstance.get(`/api/Batch/bynumber/${batchNumber}`);
    return response.data;
  },

  // Get batches by product
  getByProduct: async (productId: number, storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get(`/api/Batch/byproduct/${productId}`, { params });
    return response.data;
  },

  // Get batches by store
  getByStore: async (storeId: number, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/Batch/bystore/${storeId}`, { params });
    return response.data;
  },

  // Get active batches
  getActive: async (productId?: number, storeId?: number) => {
    const params: any = {};
    if (productId) params.productId = productId;
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Batch/active', { params });
    return response.data;
  },

  // Get expiring batches
  getExpiring: async (days: number = 30, storeId?: number) => {
    const params: any = { days };
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Batch/expiring', { params });
    return response.data;
  },

  // Get expired batches
  getExpired: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Batch/expired', { params });
    return response.data;
  },

  // Get batches by status
  getByStatus: async (status: string, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/Batch/bystatus/${status}`, { params });
    return response.data;
  },

  // Create batch
  create: async (data: CreateBatchRequest) => {
    const response = await axiosInstance.post('/api/Batch', data);
    return response.data;
  },

  // Update batch
  update: async (id: number, data: UpdateBatchRequest) => {
    const response = await axiosInstance.put(`/api/Batch/${id}`, data);
    return response.data;
  },

  // Quarantine batch
  quarantine: async (id: number, reason: string) => {
    const response = await axiosInstance.patch(`/api/Batch/${id}/quarantine`, { reason });
    return response.data;
  },

  // Release from quarantine
  releaseQuarantine: async (id: number, remarks?: string) => {
    const response = await axiosInstance.patch(`/api/Batch/${id}/release-quarantine`, { remarks });
    return response.data;
  },

  // Mark as expired
  markExpired: async (id: number) => {
    const response = await axiosInstance.patch(`/api/Batch/${id}/mark-expired`);
    return response.data;
  },

  // Delete batch
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/Batch/${id}`);
    return response.data;
  },

  // Get batch movements
  getMovements: async (batchId: number, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/Batch/${batchId}/movements`, { params });
    return response.data;
  },

  // Get batch history
  getHistory: async (batchId: number) => {
    const response = await axiosInstance.get(`/api/Batch/${batchId}/history`);
    return response.data;
  },

  // Get expiry alerts
  getExpiryAlerts: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Batch/expiry-alerts', { params });
    return response.data;
  },

  // Search batches
  search: async (keyword: string, storeId?: number) => {
    const params: any = { keyword };
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Batch/search', { params });
    return response.data;
  }
};

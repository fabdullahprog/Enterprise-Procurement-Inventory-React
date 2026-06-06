// src/api/stockMovementApi.ts
import axiosInstance from './axiosInstance';

export interface StockMovement {
  id: number;
  movementNumber: string;
  movementType: 'Transfer' | 'Adjustment' | 'GRN' | 'Issue' | 'Return';
  productId: number;
  productName?: string;
  fromStoreId?: number;
  fromStoreName?: string;
  toStoreId?: number;
  toStoreName?: string;
  quantity: number;
  movementDate: string;
  status: 'Pending' | 'InTransit' | 'Completed' | 'Cancelled';
  requestedBy?: string;
  approvedBy?: string;
  receivedBy?: string;
  remarks?: string;
  referenceType?: string;
  referenceId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStockMovementRequest {
  movementType: 'Transfer' | 'Adjustment' | 'Issue' | 'Return';
  productId: number;
  fromStoreId?: number;
  toStoreId?: number;
  quantity: number;
  movementDate: string;
  remarks?: string;
  referenceType?: string;
  referenceId?: number;
}

export interface UpdateStockMovementRequest {
  quantity?: number;
  movementDate?: string;
  remarks?: string;
}

export interface ApproveStockMovementRequest {
  approvalNotes?: string;
}

export interface ReceiveStockMovementRequest {
  receivedQuantity: number;
  receivedNotes?: string;
}

export const stockMovementApi = {
  // Get all stock movements
  getAll: async (page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/StockMovement', { params });
    return response.data;
  },

  // Get stock movement by ID
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/StockMovement/${id}`);
    return response.data;
  },

  // Get stock movements by product
  getByProduct: async (productId: number, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/StockMovement/byproduct/${productId}`, { params });
    return response.data;
  },

  // Get stock movements by store
  getByStore: async (storeId: number, direction: 'from' | 'to' | 'both' = 'both', page?: number, pageSize?: number) => {
    const params: any = { direction };
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/StockMovement/bystore/${storeId}`, { params });
    return response.data;
  },

  // Get stock movements by type
  getByType: async (movementType: string, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/StockMovement/bytype/${movementType}`, { params });
    return response.data;
  },

  // Get stock movements by status
  getByStatus: async (status: string, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/StockMovement/bystatus/${status}`, { params });
    return response.data;
  },

  // Get pending movements
  getPending: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/StockMovement/pending', { params });
    return response.data;
  },

  // Get in-transit movements
  getInTransit: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/StockMovement/in-transit', { params });
    return response.data;
  },

  // Create stock movement
  create: async (data: CreateStockMovementRequest) => {
    const response = await axiosInstance.post('/api/StockMovement', data);
    return response.data;
  },

  // Update stock movement (Pending status only)
  update: async (id: number, data: UpdateStockMovementRequest) => {
    const response = await axiosInstance.put(`/api/StockMovement/${id}`, data);
    return response.data;
  },

  // Approve stock movement
  approve: async (id: number, data?: ApproveStockMovementRequest) => {
    const response = await axiosInstance.patch(`/api/StockMovement/${id}/approve`, data || {});
    return response.data;
  },

  // Reject stock movement
  reject: async (id: number, reason: string) => {
    const response = await axiosInstance.patch(`/api/StockMovement/${id}/reject`, { reason });
    return response.data;
  },

  // Mark as in-transit
  markInTransit: async (id: number) => {
    const response = await axiosInstance.patch(`/api/StockMovement/${id}/in-transit`);
    return response.data;
  },

  // Receive stock movement
  receive: async (id: number, data: ReceiveStockMovementRequest) => {
    const response = await axiosInstance.patch(`/api/StockMovement/${id}/receive`, data);
    return response.data;
  },

  // Cancel stock movement
  cancel: async (id: number, reason: string) => {
    const response = await axiosInstance.patch(`/api/StockMovement/${id}/cancel`, { reason });
    return response.data;
  },

  // Delete stock movement (Pending status only)
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/StockMovement/${id}`);
    return response.data;
  },

  // Get movement history for a product
  getProductHistory: async (productId: number, fromDate?: string, toDate?: string) => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get(`/api/StockMovement/product/${productId}/history`, { params });
    return response.data;
  },

  // Get movement statistics
  getStatistics: async (storeId?: number, fromDate?: string, toDate?: string) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/api/StockMovement/statistics', { params });
    return response.data;
  }
};

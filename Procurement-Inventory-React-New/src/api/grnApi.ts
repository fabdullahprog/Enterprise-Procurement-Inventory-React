// src/api/grnApi.ts
import axiosInstance from './axiosInstance';

export interface GRN {
  id: number;
  grnNumber: string;
  purchaseOrderId: number;
  purchaseOrderNumber?: string;
  supplierId: number;
  supplierName?: string;
  receivedDate: string;
  receivedBy?: string;
  storeId?: number;
  storeName?: string;
  status: 'Draft' | 'Received' | 'QualityChecked' | 'Accepted' | 'Rejected' | 'Approved' | 'PendingStoreApproval';
  totalAmount?: number;
  remarks?: string;
  items?: GRNItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GRNItem {
  id: number;
  grnId: number;
  productId: number;
  productName?: string;
  poItemId: number;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  totalAmount: number;
  batchNumber?: string;
  expiryDate?: string;
  remarks?: string;
}

export interface CreateGRNRequest {
  purchaseOrderId: number;
  receivedDate: string;
  storeId?: number;
  remarks?: string;
  items: {
    poItemId: number;
    productId: number;
    receivedQuantity: number;
    batchNumber?: string;
    expiryDate?: string;
    remarks?: string;
  }[];
}

export interface UpdateGRNRequest {
  receivedDate?: string;
  storeId?: number;
  remarks?: string;
  items?: {
    id?: number;
    poItemId: number;
    productId: number;
    receivedQuantity: number;
    acceptedQuantity?: number;
    rejectedQuantity?: number;
    batchNumber?: string;
    expiryDate?: string;
    remarks?: string;
  }[];
}

export interface ApproveGRNItemDto {
  grnItemId: number;
  acceptedQuantity: number;
}

export interface ApproveGRNDto {
  warehouseId?: number;
  floorId?: number;
  zoneId?: number;
  aisleId?: number;
  rackId?: number;
  shelfId?: number;
  binId?: number;
  items: ApproveGRNItemDto[];
}

export interface DirectReceiveRequest {
  purchaseOrderId: number;
  warehouseId?: number;
  floorId?: number;
  zoneId?: number;
  aisleId?: number;
  rackId?: number;
  shelfId?: number;
  binId?: number;
  notes?: string;
  items: {
    poItemId: number;
    receivedQuantity: number;
    acceptedQuantity: number;
  }[];
}

export interface AcceptGRNRequest {
  remarks?: string;
}

export const grnApi = {
  // Get all GRNs
  getAll: async (page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/GRN', { params });
    return response.data;
  },

  // Get GRN by ID
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/GRN/${id}`);
    return response.data;
  },

  // Get GRNs by Purchase Order
  getByPurchaseOrder: async (poId: number) => {
    const response = await axiosInstance.get(`/api/GRN/bypurchaseorder/${poId}`);
    return response.data;
  },

  // Get GRN items
  getItems: async (grnId: number) => {
    const response = await axiosInstance.get(`/api/GRN/${grnId}/items`);
    return response.data;
  },

  // Create new GRN
  create: async (data: CreateGRNRequest) => {
    const response = await axiosInstance.post('/api/GRN', data);
    return response.data;
  },

  // Update GRN (Draft status only)
  update: async (id: number, data: UpdateGRNRequest) => {
    const response = await axiosInstance.put(`/api/GRN/${id}`, data);
    return response.data;
  },

  // Submit GRN for quality check
  submit: async (id: number) => {
    const response = await axiosInstance.patch(`/api/GRN/${id}/submit`);
    return response.data;
  },

  // Approve GRN (with QC and location data)
  approve: async (id: number, data: ApproveGRNDto) => {
    const response = await axiosInstance.patch(`/api/GRN/${id}/approve`, data);
    return response.data;
  },

  // Direct Receive (Single transaction for Create + Submit + Approve + Inventory)
  directReceive: async (data: DirectReceiveRequest) => {
    const response = await axiosInstance.post('/api/GRN/direct-receive', data);
    return response.data;
  },

  // Reject GRN
  reject: async (id: number, reason: string) => {
    const response = await axiosInstance.patch(`/api/GRN/${id}/reject`, { reason });
    return response.data;
  },

  // Delete GRN (Draft status only)
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/GRN/${id}`);
    return response.data;
  },

  // Get GRNs by status
  getByStatus: async (status: string, page?: number, pageSize?: number) => {
    const params: any = { status };
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/GRN/bystatus', { params });
    return response.data;
  },

  // Get pending GRNs for quality check
  getPendingQualityCheck: async () => {
    const response = await axiosInstance.get('/api/GRN/pending-quality-check');
    return response.data;
  }
};

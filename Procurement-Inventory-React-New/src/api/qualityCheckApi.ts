// src/api/qualityCheckApi.ts
import axiosInstance from './axiosInstance';

export interface QualityCheck {
  id: number;
  grnId: number;
  grnNumber?: string;
  productId: number;
  productName?: string;
  inspectionDate: string;
  inspectedBy?: string;
  status: 'Pending' | 'InProgress' | 'Passed' | 'Failed' | 'PartiallyPassed';
  receivedQuantity: number;
  inspectedQuantity: number;
  passedQuantity: number;
  failedQuantity: number;
  remarks?: string;
  checklistItems?: QualityChecklistItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QualityChecklistItem {
  id: number;
  qualityCheckId: number;
  checkParameter: string;
  expectedValue?: string;
  actualValue?: string;
  status: 'Pass' | 'Fail' | 'NA';
  remarks?: string;
}

export interface CreateQualityCheckRequest {
  grnId: number;
  productId: number;
  inspectionDate: string;
  inspectedQuantity: number;
  remarks?: string;
  checklistItems?: {
    checkParameter: string;
    expectedValue?: string;
    actualValue?: string;
    status: 'Pass' | 'Fail' | 'NA';
    remarks?: string;
  }[];
}

export interface UpdateQualityCheckRequest {
  inspectionDate?: string;
  inspectedQuantity?: number;
  passedQuantity?: number;
  failedQuantity?: number;
  remarks?: string;
  checklistItems?: {
    id?: number;
    checkParameter: string;
    expectedValue?: string;
    actualValue?: string;
    status: 'Pass' | 'Fail' | 'NA';
    remarks?: string;
  }[];
}

export interface CompleteQualityCheckRequest {
  passedQuantity: number;
  failedQuantity: number;
  remarks?: string;
}

export const qualityCheckApi = {
  // Get all quality checks
  getAll: async (page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/QualityCheck', { params });
    return response.data;
  },

  // Get quality check by ID
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/QualityCheck/${id}`);
    return response.data;
  },

  // Get quality checks by GRN
  getByGRN: async (grnId: number) => {
    const response = await axiosInstance.get(`/api/QualityCheck/bygrn/${grnId}`);
    return response.data;
  },

  // Get quality checks by product
  getByProduct: async (productId: number, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/QualityCheck/byproduct/${productId}`, { params });
    return response.data;
  },

  // Get pending quality checks
  getPending: async () => {
    const response = await axiosInstance.get('/api/QualityCheck/pending');
    return response.data;
  },

  // Get quality checks by status
  getByStatus: async (status: string, page?: number, pageSize?: number) => {
    const params: any = { status };
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/QualityCheck/bystatus', { params });
    return response.data;
  },

  // Create quality check
  create: async (data: CreateQualityCheckRequest) => {
    const response = await axiosInstance.post('/api/QualityCheck', data);
    return response.data;
  },

  // Update quality check
  update: async (id: number, data: UpdateQualityCheckRequest) => {
    const response = await axiosInstance.put(`/api/QualityCheck/${id}`, data);
    return response.data;
  },

  // Start quality check
  start: async (id: number) => {
    const response = await axiosInstance.patch(`/api/QualityCheck/${id}/start`);
    return response.data;
  },

  // Complete quality check
  complete: async (id: number, data: CompleteQualityCheckRequest) => {
    const response = await axiosInstance.patch(`/api/QualityCheck/${id}/complete`, data);
    return response.data;
  },

  // Pass quality check
  pass: async (id: number, remarks?: string) => {
    const response = await axiosInstance.patch(`/api/QualityCheck/${id}/pass`, { remarks });
    return response.data;
  },

  // Fail quality check
  fail: async (id: number, reason: string) => {
    const response = await axiosInstance.patch(`/api/QualityCheck/${id}/fail`, { reason });
    return response.data;
  },

  // Delete quality check
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/QualityCheck/${id}`);
    return response.data;
  },

  // Get quality check statistics
  getStatistics: async (fromDate?: string, toDate?: string) => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/api/QualityCheck/statistics', { params });
    return response.data;
  }
};

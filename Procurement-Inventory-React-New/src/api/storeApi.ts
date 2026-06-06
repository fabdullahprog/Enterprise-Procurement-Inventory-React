// src/api/storeApi.ts
import axiosInstance from './axiosInstance';

export interface Store {
  id: number;
  storeCode: string;
  storeName: string;
  storeType: 'Main' | 'Branch' | 'Warehouse' | 'Transit';
  location?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacity?: number;
  isActive: boolean;
  managerId?: number;
  managerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreRequest {
  storeCode: string;
  storeName: string;
  storeType: 'Main' | 'Branch' | 'Warehouse' | 'Transit';
  location?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacity?: number;
  managerId?: number;
}

export interface UpdateStoreRequest {
  storeName?: string;
  storeType?: 'Main' | 'Branch' | 'Warehouse' | 'Transit';
  location?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacity?: number;
  managerId?: number;
  isActive?: boolean;
}

export interface StoreInventorySummary {
  storeId: number;
  storeName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export const storeApi = {
  // Get all stores
  getAll: async (includeInactive: boolean = false) => {
    const params: any = { includeInactive };
    const response = await axiosInstance.get('/api/Store', { params });
    return response.data;
  },

  // Get store by ID
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Store/${id}`);
    return response.data;
  },

  // Get store by code
  getByCode: async (storeCode: string) => {
    const response = await axiosInstance.get(`/api/Store/bycode/${storeCode}`);
    return response.data;
  },

  // Get stores by type
  getByType: async (storeType: string) => {
    const response = await axiosInstance.get(`/api/Store/bytype/${storeType}`);
    return response.data;
  },

  // Get active stores
  getActive: async () => {
    const response = await axiosInstance.get('/api/Store/active');
    return response.data;
  },

  // Create store
  create: async (data: CreateStoreRequest) => {
    const response = await axiosInstance.post('/api/Store', data);
    return response.data;
  },

  // Update store
  update: async (id: number, data: UpdateStoreRequest) => {
    const response = await axiosInstance.put(`/api/Store/${id}`, data);
    return response.data;
  },

  // Activate store
  activate: async (id: number) => {
    const response = await axiosInstance.patch(`/api/Store/${id}/activate`);
    return response.data;
  },

  // Deactivate store
  deactivate: async (id: number) => {
    const response = await axiosInstance.patch(`/api/Store/${id}/deactivate`);
    return response.data;
  },

  // Delete store
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/Store/${id}`);
    return response.data;
  },

  // Get store inventory summary
  getInventorySummary: async (id: number) => {
    const response = await axiosInstance.get(`/api/Store/${id}/inventory-summary`);
    return response.data;
  },

  // Get store inventory
  getInventory: async (id: number, page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get(`/api/Store/${id}/inventory`, { params });
    return response.data;
  },

  // Get store low stock items
  getLowStockItems: async (id: number) => {
    const response = await axiosInstance.get(`/api/Store/${id}/low-stock`);
    return response.data;
  },

  // Assign manager
  assignManager: async (id: number, managerId: number) => {
    const response = await axiosInstance.patch(`/api/Store/${id}/assign-manager`, { managerId });
    return response.data;
  },

  // Remove manager
  removeManager: async (id: number) => {
    const response = await axiosInstance.patch(`/api/Store/${id}/remove-manager`);
    return response.data;
  }
};

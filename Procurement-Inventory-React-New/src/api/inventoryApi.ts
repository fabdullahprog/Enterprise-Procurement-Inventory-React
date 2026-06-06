// src/api/inventoryApi.ts
import axiosInstance from './axiosInstance';

export interface InventoryItem {
  id: number;
  productId: number;
  productName?: string;
  productBarcode?: string;
  storeId?: number;
  storeName?: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitPrice: number;
  totalValue: number;
  lastUpdated?: string;
  isLowStock: boolean;
}

export interface StockLevel {
  productId: number;
  productName: string;
  storeId?: number;
  storeName?: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  reorderLevel: number;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
}

export interface InventoryValuation {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  byCategory?: {
    categoryName: string;
    quantity: number;
    value: number;
  }[];
}

export interface StockAdjustment {
  id: number;
  productId: number;
  productName?: string;
  storeId?: number;
  storeName?: string;
  adjustmentType: 'Addition' | 'Deduction' | 'Correction';
  quantity: number;
  reason: string;
  adjustedBy?: string;
  adjustedDate: string;
  remarks?: string;
}

export interface CreateStockAdjustmentRequest {
  productId: number;
  storeId?: number;
  adjustmentType: 'Addition' | 'Deduction' | 'Correction';
  quantity: number;
  reason: string;
  remarks?: string;
}

// Mapper function to convert backend PascalCase to frontend camelCase
const mapInventoryItem = (item: any) => {
  return {
    id: item.Id || item.id,
    productId: item.ProductId || item.productId,
    productName: item.ProductName || item.productName,
    batchId: item.BatchId || item.batchId,
    batchNumber: item.BatchNumber || item.batchNumber,
    availableQuantity: item.AvailableQuantity ?? item.availableQuantity ?? 0,
    reservedQuantity: item.ReservedQuantity ?? item.reservedQuantity ?? 0,
    minQuantity: item.MinQuantity ?? item.minQuantity,
    maxQuantity: item.MaxQuantity ?? item.maxQuantity,
    lastUpdated: item.LastUpdated || item.lastUpdated,
    // Location Details
    warehouseId: item.WarehouseId || item.warehouseId,
    warehouseName: item.WarehouseName || item.warehouseName,
    floorId: item.FloorId || item.floorId,
    floorName: item.FloorName || item.floorName,
    zoneId: item.ZoneId || item.zoneId,
    zoneName: item.ZoneName || item.zoneName,
    aisleId: item.AisleId || item.aisleId,
    aisleName: item.AisleName || item.aisleName,
    rackId: item.RackId || item.rackId,
    rackName: item.RackName || item.rackName,
    shelfId: item.ShelfId || item.shelfId,
    shelfName: item.ShelfName || item.shelfName,
    binId: item.BinId || item.binId,
    binName: item.BinName || item.binName,
    locationLevel: item.LocationLevel || item.locationLevel
  };
};

export const inventoryApi = {
  // Get all inventory items
  getAll: async (storeId?: number, page?: number, pageSize?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/Inventory', { params });
    const data = response.data || response;
    
    // Map PascalCase to camelCase
    const mappedData = Array.isArray(data) ? data.map(mapInventoryItem) : [];
    console.log('📦 Inventory API - Raw data count:', Array.isArray(data) ? data.length : 0);
    console.log('📦 Inventory API - Mapped data sample:', mappedData[0]);
    
    return mappedData;
  },

  // Get inventory by product
  getByProduct: async (productId: number, storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get(`/api/Inventory/product/${productId}`, { params });
    return response.data;
  },

  // Get stock levels
  getStockLevels: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Inventory/stock-levels', { params });
    return response.data;
  },

  // Get low stock items
  getLowStock: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Inventory/low-stock', { params });
    return response.data;
  },

  // Get out of stock items
  getOutOfStock: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Inventory/out-of-stock', { params });
    return response.data;
  },

  // Get inventory valuation
  getValuation: async (storeId?: number) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Inventory/valuation', { params });
    return response.data;
  },

  // Update reorder levels
  updateReorderLevel: async (productId: number, reorderLevel: number, reorderQuantity: number, storeId?: number) => {
    const response = await axiosInstance.put(`/api/Inventory/product/${productId}/reorder-level`, {
      reorderLevel,
      reorderQuantity,
      storeId
    });
    return response.data;
  },

  // Stock adjustments
  getAdjustments: async (productId?: number, storeId?: number, page?: number, pageSize?: number) => {
    const params: any = {};
    if (productId) params.productId = productId;
    if (storeId) params.storeId = storeId;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/Inventory/adjustments', { params });
    return response.data;
  },

  // Create stock adjustment
  createAdjustment: async (data: CreateStockAdjustmentRequest) => {
    const response = await axiosInstance.post('/api/Inventory/adjustments', data);
    return response.data;
  },

  // Get inventory history
  getHistory: async (productId: number, storeId?: number, fromDate?: string, toDate?: string) => {
    const params: any = { productId };
    if (storeId) params.storeId = storeId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/api/Inventory/history', { params });
    return response.data;
  },

  // Search inventory
  search: async (keyword: string, storeId?: number) => {
    const params: any = { keyword };
    if (storeId) params.storeId = storeId;
    const response = await axiosInstance.get('/api/Inventory/search', { params });
    return response.data;
  }
};

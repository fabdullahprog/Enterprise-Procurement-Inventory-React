// src/api/storeIssueApi.ts
// Store Issue API - Uses StoreIssueController
// Base URL: /api/store

import axiosInstance from './axiosInstance';

export interface RequisitionItem {
  itemId: number;
  itemName: string;
  /** Category label from product master (API: category / categoryName) */
  category?: string | null;
  categoryName?: string | null;
  requiredQty: number;
  /** Snapshot at requisition time; prefer liveStockCount for store decisions */
  currentStock: number;
  /** Live total available quantity from inventory (sum of AvailableQuantity) */
  liveStockCount?: number;
  remarks?: string;
}

export interface PendingRequisition {
  id: number;
  requisitionNo: string;
  status: string;
  notes?: string;
  approvedAt?: string;
  forwardedAt?: string;
  requestedBy: number;
  requestedByName?: string;
  departmentId: number;
  departmentName?: string;
  items: RequisitionItem[];
  createdDate: string;
}

export interface IssueProductRequest {
  requisitionId: number;
  issuedQty: number;
  remarks?: string | null;
  warehouseId?: number | null;
  floorId?: number | null;
  zoneId?: number | null;
  aisleId?: number | null;
  rackId?: number | null;
  shelfId?: number | null;
  binId?: number | null;
  batchId?: number | null;
  productId?: number | null;
  quantity?: number | null;
  issueType?: string | null;
}

export interface IssueProductResponse {
  success: boolean;
  message: string;
  data: {
    storeIssueId: number;
    issuedQuantity: number;
    issueType: string;
    remainingQuantity: number;
    requisitionStatus: string;
  };
}

export interface ForwardToPurchaseRequest {
  requisitionId: number;
  remarks?: string;
}

export interface ForwardToPurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchaseRequisitionId: number;
    purchaseRequisitionNumber: string;
    employeeRequisitionStatus: string;
  };
}

export interface StoreIssue {
  id: number;
  requisitionId: number;
  requisitionNo?: string;
  itemName?: string;
  requiredQty: number;
  issuedQty: number;
  issueType: string;
  issuedById: number;
  issuedByName?: string;
  status: string;
  remarks?: string;
  issuedAt: string;
}

export interface StockInfo {
  productId: number;
  productName: string;
  availableStock: number;
  inventoryDetails: Array<{
    warehouseId?: number;
    floorId?: number;
    zoneId?: number;
    aisleId?: number;
    rackId?: number;
    shelfId?: number;
    binId?: number;
    locationLevel?: string;
    availableQuantity: number;
    reservedQuantity: number;
    batchId: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
}

const BASE_URL = '/api/store';

export const storeIssueApi = {
  // GET /api/store/pending-requisitions
  // Returns: { success, data: [requisitions] }
  getPendingRequisitions: async (): Promise<{ success: boolean; data: PendingRequisition[] }> => {
    const response = await axiosInstance.get(`${BASE_URL}/pending-requisitions`);
    return response.data;
  },

  /** GET /api/store/pending-requisitions/{id} — details with live stock per line */
  getPendingRequisitionById: async (
    id: number
  ): Promise<{ success: boolean; data: PendingRequisition }> => {
    const response = await axiosInstance.get(`${BASE_URL}/pending-requisitions/${id}`);
    return response.data;
  },

  // POST /api/store/issue
  // Body: { requisitionId, issuedQty, remarks }
  // Returns: { success, message, data: { storeIssueId, issuedQuantity, issueType, remainingQuantity, requisitionStatus } }
  issueProduct: async (data: IssueProductRequest): Promise<IssueProductResponse> => {
    const response = await axiosInstance.post(`${BASE_URL}/issue`, data);
    return response.data;
  },

  // POST /api/store/forward-to-purchase
  // Body: { requisitionId, remarks }
  // Returns: { success, message, data: { purchaseRequisitionId, purchaseRequisitionNumber, employeeRequisitionStatus } }
  forwardToPurchase: async (data: ForwardToPurchaseRequest): Promise<ForwardToPurchaseResponse> => {
    const response = await axiosInstance.post(`${BASE_URL}/forward-to-purchase`, data);
    return response.data;
  },

  // GET /api/store/check-stock/{productId}
  // Returns: { success, data: { productId, productName, availableStock, inventoryDetails[] } }
  checkStock: async (productId: number): Promise<{ success: boolean; data: StockInfo }> => {
    const response = await axiosInstance.get(`${BASE_URL}/check-stock/${productId}`);
    return response.data;
  },

  // GET /api/store/issues
  getIssues: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/issues`);
    return response.data;
  },

  // GET /api/store/issues/{id}
  getIssueById: async (id: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/issues/${id}`);
    return response.data;
  },

  // Get issues by requisition
  getIssuesByRequisition: async (requisitionId: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/issues/by-requisition/${requisitionId}`);
    return response.data;
  },

  getRequisitionById: async (id: number): Promise<PendingRequisition | null> => {
    try {
      const response = await storeIssueApi.getPendingRequisitionById(id);
      return response.data ?? null;
    } catch {
      return null;
    }
  },
};

// src/api/requisitionApi.ts
import axiosInstance from './axiosInstance';
import { 
  PurchaseRequisition, 
  CreateRequisitionRequest,
  UpdateRequisitionRequest,
  ApproveRequisitionRequest,
  RejectRequisitionRequest
} from '../types';

export const requisitionApi = {
  // ---- Employee Requisition Endpoints ----
  // Backend: EmployeeRequisitionController - Route: /api/requisitions
  
  // Get my requisitions (Employee created)
  // Backend: PurchaseRequisitionController - GET /api/PurchaseRequisition
  // Returns all requisitions filtered by user role in backend
  getMyRequisitions: async (page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/PurchaseRequisition', { params });
    return response.data;
  },

  // Get single requisition
  // Backend: PurchaseRequisitionController - GET /api/PurchaseRequisition/{id}
  getRequisitionById: async (id: number) => {
    const response = await axiosInstance.get(`/api/PurchaseRequisition/${id}`);
    return response.data;
  },

  // Get requisition items
  getRequisitionItems: async (id: number) => {
    const response = await axiosInstance.get(`/api/PurchaseRequisition/${id}/items`);
    return response.data;
  },

  // Get all requisitions (filtered by role in backend)
  // Backend: PurchaseRequisitionController - GET /api/PurchaseRequisition
  getAllRequisitions: async (page?: number, pageSize?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/PurchaseRequisition', { params });
    return response.data;
  },

  // Create new requisition (Employee)
  // Backend: PurchaseRequisitionController - POST /api/PurchaseRequisition
  // Supports multiple items in one requisition
  createRequisition: async (data: CreateRequisitionRequest) => {
    const response = await axiosInstance.post('/api/PurchaseRequisition', data);
    return response.data;
  },

  // Submit requisition for approval
  submitRequisition: async (id: number) => {
    const response = await axiosInstance.patch(`/api/PurchaseRequisition/${id}/submit`);
    return response.data;
  },

  // Revise requisition (Department Head)
  reviseRequisition: async (id: number, data: {
    itemId?: number;
    itemName?: string;
    requiredQty?: number;
    remarks?: string;
  }) => {
    const response = await axiosInstance.patch(`/api/PurchaseRequisition/${id}/revise`, data);
    return response.data;
  },

  // Update requisition (Department Head - full edit with multiple items)
  updateRequisition: async (id: number, data: UpdateRequisitionRequest) => {
    const response = await axiosInstance.put(`/api/PurchaseRequisition/${id}`, data);
    return response.data;
  },

  // Approve requisition (Department Head)
  // Backend: PurchaseRequisitionController - PUT /api/PurchaseRequisition/{id}/approve
  approveRequisition: async (id: number, data?: ApproveRequisitionRequest) => {
    const response = await axiosInstance.put(`/api/PurchaseRequisition/${id}/approve`, data || {});
    return response.data;
  },

  // Reject requisition (Department Head)
  // Backend: PurchaseRequisitionController - PUT /api/PurchaseRequisition/{id}/reject
  rejectRequisition: async (id: number, data: RejectRequisitionRequest) => {
    const response = await axiosInstance.put(`/api/PurchaseRequisition/${id}/reject`, data);
    return response.data;
  },

  // Delete/Cancel requisition
  deleteRequisition: async (id: number) => {
    const response = await axiosInstance.delete(`/api/PurchaseRequisition/${id}`);
    return response.data;
  },

  // ---- Legacy/Compatibility Methods ----
  // These are kept for backward compatibility with existing pages
  
  getRequisitionsForApproval: async (page?: number, pageSize?: number) => {
    // Department heads will see pending requisitions from their department
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/PurchaseRequisition', { params });
    return response.data;
  },

  getPendingApprovals: async (page?: number, pageSize?: number) => {
    // Same as above - backend filters by department
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/PurchaseRequisition', { params });
    return response.data;
  },

  getApprovedRequisitions: async (page?: number, pageSize?: number) => {
    // Get all requisitions, filter by status='forwarded_to_store' in frontend
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response = await axiosInstance.get('/api/PurchaseRequisition', { params });
    return response.data;
  },

  // ---- RFQ Endpoints (called by Purchase Dept) ----
  
  // Create RFQ from approved requisition
  createRFQFromRequisition: async (requisitionId: number, quotationDeadline: string, notes?: string) => {
    const response = await axiosInstance.post('/api/RequestForQuotation', {
      requisitionId,
      quotationDeadline,
      notes
    });
    return response.data;
  },

  // Get all RFQs
  getAllRFQs: async () => {
    const response = await axiosInstance.get('/api/RequestForQuotation');
    return response.data;
  },

  // Get RFQ by ID
  getRFQById: async (id: number) => {
    const response = await axiosInstance.get(`/api/RequestForQuotation/${id}`);
    return response.data;
  }
};

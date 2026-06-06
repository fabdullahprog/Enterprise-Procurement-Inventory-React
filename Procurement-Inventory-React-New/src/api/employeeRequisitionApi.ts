// src/api/employeeRequisitionApi.ts
// Employee Requisition API - Uses EmployeeRequisitionController
// Base URL: /api/requisitions

import axiosInstance from './axiosInstance';

export interface CreateEmployeeRequisitionRequest {
  departmentId: number;
  requiredByDate?: string;
  notes?: string;
  items: {
    itemId: number;
    itemName: string;
    requiredQty: number;
    /** Ignored by API; server sets stock from inventory. Optional for employee create flow. */
    currentStock?: number;
    remarks?: string;
  }[];
}

export interface ReviseRequisitionItemDto {
  itemId: number;
  itemName: string;
  requiredQty: number;
  currentStock: number;
  remarks?: string;
}

export interface ReviseRequisitionRequest {
  requiredByDate?: string;
  notes?: string;
  items?: ReviseRequisitionItemDto[];
}

export interface EmployeeRequisitionItem {
  id: number;
  itemId: number;
  itemName: string;
  requiredQty: number;
  currentStock: number;
  remarks?: string;
}

export interface EmployeeRequisition {
  id: number;
  requisitionNo: string;
  requestedBy: number;
  requestedByName?: string;
  requestedByEmail?: string;
  departmentId: number;
  departmentName?: string;
  status: string;
  requiredByDate?: string;
  notes?: string;
  submittedAt?: string;
  approvedAt?: string;
  forwardedAt?: string;
  createdDate: string;
  items: EmployeeRequisitionItem[];
  canSubmit?: boolean;
  canRevise?: boolean;
  canApprove?: boolean;
  canCancel?: boolean;
}

const BASE_URL = '/api/requisitions';

export const employeeRequisitionApi = {
  // Create employee requisition
  createRequisition: async (data: CreateEmployeeRequisitionRequest) => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },

  // Get all requisitions (filtered by role in backend)
  getAllRequisitions: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  // Get my requisitions
  getMyRequisitions: async () => {
    const response = await axiosInstance.get(`${BASE_URL}/my`);
    return response.data;
  },

  // Get requisition by ID
  getRequisitionById: async (id: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Submit requisition to dept head
  submitRequisition: async (id: number) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/submit`);
    return response.data;
  },

  // Revise requisition (Dept Head)
  reviseRequisition: async (id: number, data: ReviseRequisitionRequest) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/revise`, data);
    return response.data;
  },

  // Update revised requisition (Employee)
  updateRevisedRequisition: async (id: number, data: ReviseRequisitionRequest) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/update-revised`, data);
    return response.data;
  },

  // Approve requisition (Dept Head)
  approveRequisition: async (id: number) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/approve`);
    return response.data;
  },

  // Delete requisition
  deleteRequisition: async (id: number) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

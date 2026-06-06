// src/api/rfqApi.ts
import axiosInstance from './axiosInstance';

export interface CreateRFQRequest {
  requisitionId: number;
  quotationDeadline: string;
  notes?: string;
}

export interface SendRFQRequest {
  supplierIds: number[];
}

export interface SubmitQuotationRequest {
  rfqId: number;
  supplierId: number;
  currencyId?: number;
  deliveryDays: number;
  notes?: string;
  items: {
    productId: number;
    offeredQuantity: number;
    unitPrice: number;
  }[];
}

export interface CreateCSRequest {
  rfqId: number;
  remarks?: string;
}

export interface SelectCSSuppliersRequest {
  selectedRowIds: number[];
  remarks?: string;
}

export interface CreatePOItemRequest {
  productId: number;
  orderedQuantity: number;
  supplierRate: number;
  poRate: number;
}

export interface CreatePORequest {
  comparativeStatementId: number;
  expectedDeliveryDate: string;
  deliveryAddress?: string;
  paymentTerms?: string;
  notes?: string;
  items: CreatePOItemRequest[];
}

export const rfqApi = {
  // ---- RFQ Endpoints ----
  
  // Create RFQ from approved requisition
  createRFQ: async (data: CreateRFQRequest) => {
    const response = await axiosInstance.post('/api/RequestForQuotation', data);
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
  },

  // Close RFQ
  closeRFQ: async (id: number) => {
    const response = await axiosInstance.put(`/api/RequestForQuotation/${id}/close`);
    return response.data;
  },

  // Send RFQ to suppliers
  sendRFQToSuppliers: async (id: number, supplierIds: number[]) => {
    const response = await axiosInstance.post(`/api/RequestForQuotation/${id}/send`, {
      supplierIds
    });
    return response.data;
  },

  // Print RFQ
  printRFQ: async (id: number) => {
    const response = await axiosInstance.get(`/api/RequestForQuotation/${id}/print`);
    return response.data;
  },

  // ---- Supplier Quotation Endpoints ----
  
  // Submit quotation
  submitQuotation: async (data: SubmitQuotationRequest) => {
    const response = await axiosInstance.post('/api/SupplierQuotation', data);
    return response.data;
  },

  // Get quotations for an RFQ
  getQuotationsByRFQ: async (rfqId: number) => {
    const response = await axiosInstance.get(`/api/SupplierQuotation/byrfq/${rfqId}`);
    return response.data;
  },

  // Get quotation by ID
  getQuotationById: async (id: number) => {
    const response = await axiosInstance.get(`/api/SupplierQuotation/${id}`);
    return response.data;
  },

  // Get all quotations
  getAllQuotations: async () => {
    const response = await axiosInstance.get('/api/SupplierQuotation');
    return response.data;
  },

  // Select quotation
  selectQuotation: async (id: number) => {
    const response = await axiosInstance.put(`/api/SupplierQuotation/${id}/select`);
    return response.data;
  },

  // ---- Comparative Statement Endpoints ----
  
  // Create CS from RFQ (backend auto-generates supplier rows from quotation items)
  createCS: async (data: CreateCSRequest) => {
    const response = await axiosInstance.post('/api/ComparativeStatement', data);
    return response.data;
  },

  // Select winning suppliers for a CS (per-product row selection)
  selectCSSuppliers: async (csId: number, data: SelectCSSuppliersRequest) => {
    const response = await axiosInstance.post(`/api/ComparativeStatement/${csId}/select-suppliers`, data);
    return response.data;
  },

  // Get all CSs
  getAllCS: async () => {
    const response = await axiosInstance.get('/api/ComparativeStatement');
    return response.data;
  },

  // Get CS by ID
  getCSById: async (id: number) => {
    const response = await axiosInstance.get(`/api/ComparativeStatement/${id}`);
    return response.data;
  },

  // Mark CS as reviewed
  reviewCS: async (id: number) => {
    const response = await axiosInstance.put(`/api/ComparativeStatement/${id}/review`);
    return response.data;
  },

  // Approve CS (MD/Admin)
  approveCS: async (id: number) => {
    const response = await axiosInstance.put(`/api/ComparativeStatement/${id}/approve`);
    return response.data;
  },

  // ---- Purchase Order Endpoints ----

  // Get pre-filled PO data from approved CS
  getFromCS: async (csId: number) => {
    const response = await axiosInstance.get(`/api/PurchaseOrder/FromCS/${csId}`);
    return response.data;
  },
  
  // Create PO from CS (with negotiated rates)
  createPO: async (data: CreatePORequest) => {
    const response = await axiosInstance.post('/api/PurchaseOrder', data);
    return response.data;
  },

  // Get all POs
  getAllPOs: async () => {
    const response = await axiosInstance.get('/api/PurchaseOrder');
    return response.data;
  },

  // Get PO by ID
  getPOById: async (id: number) => {
    const response = await axiosInstance.get(`/api/PurchaseOrder/${id}`);
    return response.data;
  },

  // Submit PO for approval
  submitPO: async (id: number) => {
    const response = await axiosInstance.put(`/api/PurchaseOrder/${id}/submit`);
    return response.data;
  },

  // Approve PO (MD/Admin)
  approvePO: async (id: number) => {
    const response = await axiosInstance.put(`/api/PurchaseOrder/${id}/approve`);
    return response.data;
  },

  // Send PO to supplier
  sendPO: async (id: number) => {
    const response = await axiosInstance.put(`/api/PurchaseOrder/${id}/send`);
    return response.data;
  },

  // Cancel PO
  cancelPO: async (id: number) => {
    const response = await axiosInstance.put(`/api/PurchaseOrder/${id}/cancel`);
    return response.data;
  },
  
  // Reject PO
  rejectPO: async (id: number, reason: string) => {
    const response = await axiosInstance.put(`/api/PurchaseOrder/${id}/reject`, { reason });
    return response.data;
  },
};

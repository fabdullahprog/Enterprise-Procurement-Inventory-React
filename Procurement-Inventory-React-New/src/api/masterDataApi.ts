// src/api/masterDataApi.ts
import axiosInstance from './axiosInstance';

// ============================================
// MASTER DATA API
// Matches backend controllers for master data
// ============================================

// ---- Brand API ----
export interface Brand {
  id: number;
  brandName: string;
  description?: string;
  isActive: boolean;
}

export const brandApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/Brand');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Brand/${id}`);
    return response.data;
  },
  
  create: async (data: { brandName: string; description?: string }) => {
    const response = await axiosInstance.post('/api/Brand', data);
    return response.data;
  },
  
  update: async (id: number, data: { brandName: string; description?: string }) => {
    const response = await axiosInstance.put(`/api/Brand/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/Brand/${id}`);
    return response.data;
  }
};

// ---- Currency API ----
export interface Currency {
  id: number;
  currencyCode: string;
  currencyName: string;
  symbol?: string;
  exchangeRate: number;
  isActive: boolean;
}

export const currencyApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/Currency');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Currency/${id}`);
    return response.data;
  },
  
  create: async (data: { 
    currencyCode: string; 
    currencyName: string; 
    symbol?: string;
    exchangeRate: number;
  }) => {
    const response = await axiosInstance.post('/api/Currency', data);
    return response.data;
  },
  
  update: async (id: number, data: { 
    currencyCode: string; 
    currencyName: string; 
    symbol?: string;
    exchangeRate: number;
  }) => {
    const response = await axiosInstance.put(`/api/Currency/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/Currency/${id}`);
    return response.data;
  }
};

// ---- Department API ----
export interface Department {
  id: number;
  departmentName: string;
  description?: string;
  isActive: boolean;
}

export const departmentApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/Department');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Department/${id}`);
    return response.data;
  },
  
  create: async (data: { departmentName: string; description?: string }) => {
    const response = await axiosInstance.post('/api/Department', data);
    return response.data;
  },
  
  update: async (id: number, data: { departmentName: string; description?: string }) => {
    const response = await axiosInstance.put(`/api/Department/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/Department/${id}`);
    return response.data;
  }
};

// ---- Item Category API ----
export interface ItemCategory {
  id: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export const itemCategoryApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/ItemCategory');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/ItemCategory/${id}`);
    return response.data;
  },
  
  create: async (data: { categoryName: string; description?: string }) => {
    const response = await axiosInstance.post('/api/ItemCategory', data);
    return response.data;
  },
  
  update: async (id: number, data: { categoryName: string; description?: string }) => {
    const response = await axiosInstance.put(`/api/ItemCategory/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/ItemCategory/${id}`);
    return response.data;
  }
};

// ---- Sub Category API ----
export interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId: number;
  categoryName?: string;
  description?: string;
  isActive: boolean;
}

export const subCategoryApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/SubCategory');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/SubCategory/${id}`);
    return response.data;
  },
  
  getByCategory: async (categoryId: number) => {
    const response = await axiosInstance.get(`/api/SubCategory/category/${categoryId}`);
    return response.data;
  },
  
  create: async (data: { 
    subCategoryName: string; 
    categoryId: number;
    description?: string;
  }) => {
    const response = await axiosInstance.post('/api/SubCategory', data);
    return response.data;
  },
  
  update: async (id: number, data: { 
    subCategoryName: string; 
    categoryId: number;
    description?: string;
  }) => {
    const response = await axiosInstance.put(`/api/SubCategory/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/SubCategory/${id}`);
    return response.data;
  }
};

// ---- Unit API ----
export interface Unit {
  id: number;
  nameOfUnit: string;
  abbreviation?: string;
  isActive: boolean;
}

export const unitApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/Unit');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Unit/${id}`);
    return response.data;
  },
  
  create: async (data: { nameOfUnit: string; abbreviation?: string }) => {
    const response = await axiosInstance.post('/api/Unit', data);
    return response.data;
  },
  
  update: async (id: number, data: { nameOfUnit: string; abbreviation?: string }) => {
    const response = await axiosInstance.put(`/api/Unit/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/Unit/${id}`);
    return response.data;
  }
};

// ---- Unit Set API ----
export interface UnitSet {
  id: number;
  setName: string;
  baseUnitId: number;
  baseUnitName?: string;
  conversionFactor: number;
  isActive: boolean;
}

export const unitSetApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/UnitSet');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/UnitSet/${id}`);
    return response.data;
  },
  
  create: async (data: { 
    setName: string; 
    baseUnitId: number;
    conversionFactor: number;
  }) => {
    const response = await axiosInstance.post('/api/UnitSet', data);
    return response.data;
  },
  
  update: async (id: number, data: { 
    setName: string; 
    baseUnitId: number;
    conversionFactor: number;
  }) => {
    const response = await axiosInstance.put(`/api/UnitSet/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/UnitSet/${id}`);
    return response.data;
  }
};

// ---- Supplier API ----
export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export const supplierApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/Supplier');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Supplier/${id}`);
    return response.data;
  },
  
  create: async (data: { 
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    const response = await axiosInstance.post('/api/Supplier', data);
    return response.data;
  },
  
  update: async (id: number, data: { 
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    const response = await axiosInstance.put(`/api/Supplier/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/Supplier/${id}`);
    return response.data;
  }
};

// ============================================
// LEGACY COMPATIBILITY LAYER
// For backward compatibility with old imports
// ============================================
export const masterDataApi = {
  // Departments
  getDepartments: departmentApi.getAll,
  getDepartmentById: departmentApi.getById,
  
  // Suppliers
  getSuppliers: supplierApi.getAll,
  getSupplierById: supplierApi.getById,
  
  // Currencies
  getCurrencies: currencyApi.getAll,
  getCurrencyById: currencyApi.getById,
  
  // Brands
  getBrands: brandApi.getAll,
  getBrandById: brandApi.getById,
  
  // Units
  getUnits: unitApi.getAll,
  getUnitById: unitApi.getById,
  
  // Products (redirects to productApi - should be imported separately)
  getProducts: async (page: number = 1, pageSize: number = 50) => {
    const response = await axiosInstance.get('/api/Product', {
      params: { page, pageSize }
    });
    return response.data;
  },
  
  getProductById: async (id: number) => {
    const response = await axiosInstance.get(`/api/Product/${id}`);
    return response.data;
  },
  
  searchProducts: async (keyword: string) => {
    const response = await axiosInstance.get('/api/Product', {
      params: { search: keyword }
    });
    return response.data;
  }
};

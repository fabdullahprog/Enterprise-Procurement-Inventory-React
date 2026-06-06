// src/api/productApi.ts
import axiosInstance from './axiosInstance';
import { Product, ItemCategory, SubCategory } from '../types';

type ApiItemCategory = {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  isActive: boolean;
};

type ApiSubCategory = {
  subCategoryId: number;
  subCategoryName: string;
  description?: string;
  itemCategoryId: number;
  itemCategoryName?: string;
  isActive: boolean;
};

type ApiProduct = {
  id: number;
  name: string;
  barcode: string;
  price: number;
  currentStock: number;
  isPerishable: boolean;
  description?: string;
  itemCategoryId: number;
  itemCategoryName?: string;
  subCategoryId: number;
  subCategoryName?: string;
  brandId?: number;
  brandName?: string;
  unitId?: number;
  unitName?: string;
  isActive: boolean;
};

const mapCategory = (c: any): ItemCategory => {
  // Backend DTO returns: ItemCategoryId + CategoryName (PascalCase)
  const categoryId =
    c?.categoryId ??
    c?.CategoryId ??
    c?.itemCategoryId ??
    c?.ItemCategoryId ??
    c?.id ??
    c?.Id;
  const categoryName =
    c?.categoryName ??
    c?.CategoryName ??
    c?.itemCategoryName ??
    c?.ItemCategoryName ??
    c?.name ??
    c?.Name;
  return {
    id: Number(categoryId),
    name: String(categoryName ?? ''),
    description: c?.categoryDescription ?? c?.CategoryDescription ?? c?.description ?? c?.Description,
    isActive: Boolean(c?.isActive ?? c?.IsActive ?? true),
  };
};

const mapSubCategory = (s: any): SubCategory => {
  const subCategoryId = s?.subCategoryId ?? s?.SubCategoryId ?? s?.id ?? s?.Id;
  const subCategoryName = s?.subCategoryName ?? s?.SubCategoryName ?? s?.name ?? s?.Name;
  const categoryId = s?.itemCategoryId ?? s?.ItemCategoryId ?? s?.categoryId ?? s?.CategoryId;
  return {
    id: Number(subCategoryId),
    name: String(subCategoryName ?? ''),
    categoryId: Number(categoryId),
    description: s?.description ?? s?.Description,
    isActive: Boolean(s?.isActive ?? s?.IsActive ?? true),
  };
};

const mapProduct = (p: any): Product => {
  const id = p?.id ?? p?.Id;
  const itemCategoryId = p?.itemCategoryId ?? p?.ItemCategoryId;
  const subCategoryId = p?.subCategoryId ?? p?.SubCategoryId;
  
  // Unit name can come as unitName, UnitName, nameOfUnit, or from nested unit object
  let unitName = p?.unitName ?? p?.UnitName ?? p?.nameOfUnit ?? p?.NameOfUnit;
  
  // Check if unit is a nested object
  if (!unitName && p?.unit) {
    unitName = p.unit.nameOfUnit ?? p.unit.NameOfUnit ?? p.unit.name ?? p.unit.Name;
  }
  
  // Check if Unit is a nested object (PascalCase)
  if (!unitName && p?.Unit) {
    unitName = p.Unit.nameOfUnit ?? p.Unit.NameOfUnit ?? p.Unit.name ?? p.Unit.Name;
  }
  
  console.log('Mapping product:', p?.name, 'Unit data:', { 
    unitName, 
    rawUnit: p?.unit || p?.Unit,
    rawUnitName: p?.unitName || p?.UnitName 
  });
  
  return {
    id: Number(id),
    name: String(p?.name ?? p?.Name ?? ''),
    barcode: String(p?.barcode ?? p?.Barcode ?? ''),
    price: Number(p?.price ?? p?.Price ?? 0),
    currentStock: Number(p?.currentStock ?? p?.CurrentStock ?? 0),
    isPerishable: Boolean(p?.isPerishable ?? p?.IsPerishable ?? false),
    description: p?.description ?? p?.Description,
    itemCategoryId: Number(itemCategoryId),
    subCategoryId: Number(subCategoryId),
    isActive: Boolean(p?.isActive ?? p?.IsActive ?? true),
    itemCategoryName: p?.itemCategoryName ?? p?.ItemCategoryName,
    subCategoryName: p?.subCategoryName ?? p?.SubCategoryName,
    brandName: p?.brandName ?? p?.BrandName,
    unitName: unitName || undefined,  // Use undefined instead of null for optional field
  };
};

export const productApi = {
  // Get all active products (server has no pagination)
  getAllProducts: async (page: number = 1, pageSize: number = 20) => {
    try {
      void page;
      void pageSize;
      const response = await axiosInstance.get<ApiProduct[]>('/api/Product');
      return (response.data || []).map(mapProduct);
    } catch (error) {
      throw error;
    }
  },

  // Get single product
  getProductById: async (id: number) => {
    try {
      const response = await axiosInstance.get<ApiProduct>(`/api/Product/${id}`);
      return mapProduct(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Search products (server has no search endpoint, so we filter after fetching)
  searchProducts: async (searchTerm: string, page: number = 1, pageSize: number = 20) => {
    try {
      void page;
      void pageSize;
      const all = await productApi.getAllProducts();
      const q = (searchTerm ?? '').trim().toLowerCase();
      if (!q) return all;
      return all.filter(p =>
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.barcode ?? '').toLowerCase().includes(q)
      );
    } catch (error) {
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: number, page: number = 1, pageSize: number = 20) => {
    try {
      void page;
      void pageSize;
      const response = await axiosInstance.get<ApiProduct[]>(`/api/Product/bycategory/${categoryId}`);
      console.log('Raw API response for category', categoryId, ':', response.data);
      const mappedProducts = (response.data || []).map(mapProduct);
      console.log('Mapped products:', mappedProducts);
      return mappedProducts;
    } catch (error) {
      throw error;
    }
  },

  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await axiosInstance.get<ApiItemCategory[]>('/api/ItemCategory');
      return (response.data || []).map(mapCategory).filter(c => c.id && c.name);
    } catch (error) {
      throw error;
    }
  },

  // Get all subcategories
  getAllSubCategories: async () => {
    try {
      const response = await axiosInstance.get<ApiSubCategory[]>('/api/SubCategory');
      return (response.data || []).map(mapSubCategory).filter(s => s.id && s.name);
    } catch (error) {
      throw error;
    }
  },

  // Get subcategories by category
  getSubCategoriesByCategory: async (categoryId: number) => {
    try {
      const response = await axiosInstance.get<ApiSubCategory[]>(`/api/SubCategory/bycategory/${categoryId}`);
      return (response.data || []).map(mapSubCategory);
    } catch (error) {
      throw error;
    }
  }
};

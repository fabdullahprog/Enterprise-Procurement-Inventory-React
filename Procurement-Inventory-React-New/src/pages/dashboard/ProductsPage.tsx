// src/pages/dashboard/ProductsPage.tsx
import { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { Product, ItemCategory, SubCategory } from '../../types';
import './products.css';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, subCategoriesRes] = await Promise.all([
        productApi.getAllProducts(1, 200),
        productApi.getAllCategories(),
        productApi.getAllSubCategories()
      ]);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setSubCategories(subCategoriesRes);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadInitialData();
      return;
    }
    try {
      setLoading(true);
      const response = await productApi.searchProducts(searchTerm, 1, 50);
      setProducts(response);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    try {
      setLoading(true);
      if (categoryId === null) {
        loadInitialData();
      } else {
        const response = await productApi.getProductsByCategory(categoryId, 1, 50);
        setProducts(response);
      }
    } catch (error) {
      console.error('Error filtering products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryNameById = (id: number) => {
    const fromJoin = products.find(p => p.itemCategoryId === id)?.itemCategoryName;
    if (fromJoin) return fromJoin;
    return categories.find(c => c.id === id)?.name ?? `#${id}`;
  };

  const subCategoryNameById = (id: number) => {
    const fromJoin = products.find(p => p.subCategoryId === id)?.subCategoryName;
    if (fromJoin) return fromJoin;
    return subCategories.find(s => s.id === id)?.name ?? `#${id}`;
  };

  return (
    <div className="w-full page-enter">
      <div className="products-header mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <p className="text-slate-500 text-sm">Browse products and view details</p>
      </div>

      <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="filter-group flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Search</label>
            <input
              type="text"
              placeholder="Search by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
          <div className="filter-group flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={selectedCategory ?? ''}
              onChange={(e) => handleCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            >
              <option value="">All</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-actions flex gap-3">
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              Search
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
                loadInitialData();
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading py-12 text-center text-slate-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state py-12 text-center bg-white shadow-lg rounded-xl border border-slate-200">
          <p className="text-slate-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left" style={{ width: '40%' }}>Product</th>
                  <th className="px-4 py-3 text-left" style={{ width: '28%' }}>Category</th>
                  <th className="px-4 py-3 text-right" style={{ width: '17%' }}>Price (BDT)</th>
                  <th className="px-4 py-3 text-center" style={{ width: '15%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>{p.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-left" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.itemCategoryName ?? categoryNameById(p.itemCategoryId)}>{p.itemCategoryName ?? categoryNameById(p.itemCategoryId)}</td>
                    <td className="px-4 py-3 text-slate-900 text-right font-medium whitespace-nowrap">{p.price?.toFixed?.(2) ?? p.price}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        className="text-xs px-3 py-1.5 text-teal-600 hover:text-white hover:bg-teal-600 font-semibold rounded-md transition-colors border border-teal-200 hover:border-teal-600"
                        onClick={() => setDetailsProduct(p)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailsProduct && (
        <div className="modal-overlay" onClick={() => setDetailsProduct(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Product Details</h3>
              <button className="modal-close" onClick={() => setDetailsProduct(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><span className="k">Product</span><span className="v">{detailsProduct.name}</span></div>
                <div><span className="k">Barcode</span><span className="v">{detailsProduct.barcode || '—'}</span></div>
                <div><span className="k">Category</span><span className="v">{detailsProduct.itemCategoryName ?? categoryNameById(detailsProduct.itemCategoryId)}</span></div>
                <div><span className="k">Subcategory</span><span className="v">{detailsProduct.subCategoryName ?? subCategoryNameById(detailsProduct.subCategoryId)}</span></div>
                <div><span className="k">Brand</span><span className="v">{detailsProduct.brandName ?? '—'}</span></div>
                <div><span className="k">Unit</span><span className="v">{detailsProduct.unitName ?? '—'}</span></div>
                <div><span className="k">Price</span><span className="v">{detailsProduct.price?.toFixed?.(2) ?? detailsProduct.price}</span></div>

                <div><span className="k">Perishable</span><span className="v">{detailsProduct.isPerishable ? 'Yes' : 'No'}</span></div>
                <div className="detail-wide"><span className="k">Description</span><span className="v">{detailsProduct.description ?? '—'}</span></div>
                <div><span className="k">Status</span><span className="v">{detailsProduct.isActive ? 'Active' : 'Inactive'}</span></div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setDetailsProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

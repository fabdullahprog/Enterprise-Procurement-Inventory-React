// src/pages/dashboard/StockOverviewPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../api/inventoryApi';
import {
  StatsHeader,
  FilterBar,
  FilterField,
  Badge,
  COLORS
} from '../../components/form';

interface StockItem {
  id: number;
  productId: number;
  productName: string;
  batchNumber: string;
  availableQuantity: number;
  reservedQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  lastUpdated?: string;
  warehouseName?: string;
  floorName?: string;
  zoneName?: string;
  aisleName?: string;
  rackName?: string;
  shelfName?: string;
  binName?: string;
  locationLevel?: string;
}

const StockOverviewPage = () => {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  useEffect(() => {
    loadStock();
  }, []);

  useEffect(() => {
    filterItems();
  }, [stockItems, searchTerm, stockFilter]);

  const loadStock = async () => {
    try {
      setLoading(true);
      setError(null);
      const inventories = await inventoryApi.getAll();
      console.log('📦 Stock Overview - Loaded inventories:', inventories);
      console.log('📦 Stock Overview - First inventory:', inventories[0]);
      setStockItems(inventories);
    } catch (err: any) {
      console.error('❌ Error loading stock:', err);
      setError(err.response?.data?.message || 'Failed to load stock information');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...stockItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Stock level filter - using MinQuantity as reorder level
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => 
        item.availableQuantity > 0 && item.availableQuantity <= item.minQuantity
      );
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.availableQuantity === 0);
    }

    setFilteredItems(filtered);
  };

  const getStockStatus = (available: number, minQty: number): 'success' | 'warning' | 'danger' => {
    if (available === 0) return 'danger';
    if (available <= minQty) return 'warning';
    return 'success';
  };

  const getStockLabel = (available: number, minQty: number): string => {
    if (available === 0) return 'Out of Stock';
    if (available <= minQty) return 'Low Stock';
    return 'In Stock';
  };

  const handleCreatePurchaseReq = () => {
    navigate('/dashboard/create-requisition');
  };

  const stats = {
    total: stockItems.length,
    inStock: stockItems.filter(i => i.availableQuantity > i.minQuantity).length,
    lowStock: stockItems.filter(i => i.availableQuantity > 0 && i.availableQuantity <= i.minQuantity).length,
    outOfStock: stockItems.filter(i => i.availableQuantity === 0).length
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading stock information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadStock}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <StatsHeader
        accentColor={COLORS.STORE}
        icon="📦"
        title="Stock Overview"
        subtitle="Monitor inventory levels and stock availability"
        stats={[
          { label: 'Total Products', value: stats.total },
          { label: 'In Stock', value: stats.inStock },
          { label: 'Low Stock', value: stats.lowStock },
          { label: 'Out of Stock', value: stats.outOfStock }
        ]}
        actions={
          <button
            onClick={handleCreatePurchaseReq}
            className="px-4 py-2 text-white text-sm font-medium rounded-md transition-colors"
            style={{ backgroundColor: COLORS.STORE }}
          >
            + Create Purchase Requisition
          </button>
        }
      />

      <FilterBar onSearch={filterItems} onReset={() => { setSearchTerm(''); setStockFilter('all'); }}>
        <FilterField label="Search Product">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name or batch number..."
            className="w-full px-3 py-2 border-[0.5px] border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FilterField>
        <FilterField label="Stock Level">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2 border-[0.5px] border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock Only</option>
            <option value="out">Out of Stock Only</option>
          </select>
        </FilterField>
      </FilterBar>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg border-[0.5px] border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Stock Items Found</h3>
          <p className="text-sm text-gray-600">
            {searchTerm || stockFilter !== 'all' 
              ? 'No items match your filters' 
              : 'No stock items available'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left w-12">#</th>
                  <th className="px-3 py-2.5 text-left">Product Name</th>
                  <th className="px-3 py-2.5 text-left">Batch Number</th>
                  <th className="px-3 py-2.5 text-center">Available</th>
                  <th className="px-3 py-2.5 text-center">Reserved</th>
                  <th className="px-3 py-2.5 text-center">Min / Max</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-center">Last Updated</th>
                  <th className="px-3 py-2.5 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, index) => {
                  const isLowStock = item.availableQuantity > 0 && item.availableQuantity <= item.minQuantity;
                  const isOutOfStock = item.availableQuantity === 0;
                  
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/50 transition-colors ${isLowStock ? 'bg-amber-50/30' : ''} ${isOutOfStock ? 'bg-red-50/50' : ''}`}
                    >
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900 cell-truncate" title={item.productName || 'N/A'}>
                        {item.productName || 'N/A'}
                        {isLowStock && <span className="ml-2 text-amber-500" title="Low Stock">⚠️</span>}
                        {isOutOfStock && <span className="ml-2 text-red-500" title="Out of Stock">❌</span>}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                        {item.batchNumber || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`font-semibold ${
                          isOutOfStock ? 'text-red-600' :
                          isLowStock ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {item.availableQuantity}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 text-center whitespace-nowrap">
                        {item.reservedQuantity || 0}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className="text-slate-700">
                          <span className="text-blue-600 font-medium">{item.minQuantity}</span>
                          {' / '}
                          <span className="text-slate-500">{item.maxQuantity}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <Badge variant={getStockStatus(item.availableQuantity, item.minQuantity)}>
                          {getStockLabel(item.availableQuantity, item.minQuantity)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 text-center whitespace-nowrap">
                        {item.lastUpdated 
                          ? new Date(item.lastUpdated).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-xs px-2.5 py-1.5 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between text-white">
              <div>
                <h3 className="text-base font-semibold text-white">Stock Item Details</h3>
                <p className="text-[11px] text-blue-100 mt-0.5">Product ID: {selectedItem.productId}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white font-bold text-lg focus:outline-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Product Info */}
              <div>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Product</span>
                <h4 className="text-md font-bold text-slate-800 mt-0.5">{selectedItem.productName || 'N/A'}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Batch Number */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 block font-medium">Batch Number</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedItem.batchNumber || '—'}</span>
                </div>
                {/* Last Updated */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 block font-medium">Last Updated</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedItem.lastUpdated 
                      ? new Date(selectedItem.lastUpdated).toLocaleString()
                      : '—'
                    }
                  </span>
                </div>
              </div>

              {/* Quantities */}
              <div>
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">Stock Inventory Levels</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                    <span className="text-[10px] text-emerald-700 block font-medium">Available</span>
                    <span className="text-lg font-bold text-emerald-800">{selectedItem.availableQuantity}</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                    <span className="text-[10px] text-blue-700 block font-medium">Reserved</span>
                    <span className="text-lg font-bold text-blue-800">{selectedItem.reservedQuantity}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 block font-medium">Min / Max</span>
                    <span className="text-sm font-bold text-slate-700 mt-1 block">
                      {selectedItem.minQuantity} / {selectedItem.maxQuantity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warehouse Location Info */}
              <div>
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">Warehouse Storage Location</span>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3.5">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Warehouse</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.warehouseName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Floor</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.floorName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Zone</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.zoneName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Aisle</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.aisleName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Rack</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.rackName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Shelf</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.shelfName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Bin</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.binName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium text-[10px]">Location Level</span>
                      <span className="font-semibold text-slate-800 text-[12px]">{selectedItem.locationLevel || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOverviewPage;

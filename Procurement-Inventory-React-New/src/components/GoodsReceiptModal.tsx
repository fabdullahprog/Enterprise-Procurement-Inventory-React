// src/components/GoodsReceiptModal.tsx
import React, { useState, useEffect } from 'react';
import { grnApi } from '../api/grnApi';
import { locationApi, Warehouse, Floor, Zone, Aisle, Rack, Shelf, Bin } from '../api/locationApi';

interface POItem {
  id: number;
  productId: number;
  productName: string;
  orderedQuantity: number;
  supplierRate: number;
  poRate: number;
  totalPrice: number;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierName?: string;
  items?: POItem[];
}

interface GoodsReceiptModalProps {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemQCState {
  poItemId: number;
  productId: number;
  orderedQuantity: number;
  productName: string;
  receivedQuantity: number;
  acceptedQuantity: number;
}

export const GoodsReceiptModal: React.FC<GoodsReceiptModalProps> = ({ purchaseOrder, onClose, onSuccess }) => {
  const [items, setItems] = useState<ItemQCState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Hierarchical Location States
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [aisles, setAisles] = useState<Aisle[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);

  const [warehouseId, setWarehouseId] = useState<number>(0);
  const [floorId, setFloorId] = useState<number>(0);
  const [zoneId, setZoneId] = useState<number>(0);
  const [aisleId, setAisleId] = useState<number>(0);
  const [rackId, setRackId] = useState<number>(0);
  const [shelfId, setShelfId] = useState<number>(0);
  const [binId, setBinId] = useState<number>(0);

  // Load Warehouses on mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const data = await locationApi.getWarehouses();
        setWarehouses(data);
      } catch (err) {
        console.error('Failed to load warehouses', err);
      }
    };
    loadWarehouses();
  }, []);

  // Update floors when warehouseId changes
  useEffect(() => {
    if (warehouseId > 0) {
      const loadFloors = async () => {
        try {
          const data = await locationApi.getFloorsByWarehouse(warehouseId);
          setFloors(data);
          // Reset all child states
          setFloorId(0);
          setZones([]);
          setZoneId(0);
          setAisles([]);
          setAisleId(0);
          setRacks([]);
          setRackId(0);
          setShelves([]);
          setShelfId(0);
          setBins([]);
          setBinId(0);
        } catch (err) {
          console.error(err);
        }
      };
      loadFloors();
    } else {
      setFloors([]);
      setFloorId(0);
    }
  }, [warehouseId]);

  // Update zones when floorId changes
  useEffect(() => {
    if (floorId > 0) {
      const loadZones = async () => {
        try {
          const data = await locationApi.getZonesByFloor(floorId);
          setZones(data);
          setZoneId(0);
          setAisles([]);
          setAisleId(0);
          setRacks([]);
          setRackId(0);
          setShelves([]);
          setShelfId(0);
          setBins([]);
          setBinId(0);
        } catch (err) {
          console.error(err);
        }
      };
      loadZones();
    } else {
      setZones([]);
      setZoneId(0);
    }
  }, [floorId]);

  // Update aisles when zoneId changes
  useEffect(() => {
    if (zoneId > 0) {
      const loadAisles = async () => {
        try {
          const data = await locationApi.getAislesByZone(zoneId);
          setAisles(data);
          setAisleId(0);
          setRacks([]);
          setRackId(0);
          setShelves([]);
          setShelfId(0);
          setBins([]);
          setBinId(0);
        } catch (err) {
          console.error(err);
        }
      };
      loadAisles();
    } else {
      setAisles([]);
      setAisleId(0);
    }
  }, [zoneId]);

  // Update racks when aisleId changes
  useEffect(() => {
    if (aisleId > 0) {
      const loadRacks = async () => {
        try {
          const data = await locationApi.getRacksByAisle(aisleId);
          setRacks(data);
          setRackId(0);
          setShelves([]);
          setShelfId(0);
          setBins([]);
          setBinId(0);
        } catch (err) {
          console.error(err);
        }
      };
      loadRacks();
    } else {
      setRacks([]);
      setRackId(0);
    }
  }, [aisleId]);

  // Update shelves when rackId changes
  useEffect(() => {
    if (rackId > 0) {
      const loadShelves = async () => {
        try {
          const data = await locationApi.getShelvesByRack(rackId);
          setShelves(data);
          setShelfId(0);
          setBins([]);
          setBinId(0);
        } catch (err) {
          console.error(err);
        }
      };
      loadShelves();
    } else {
      setShelves([]);
      setShelfId(0);
    }
  }, [rackId]);

  // Update bins when shelfId changes
  useEffect(() => {
    if (shelfId > 0) {
      const loadBins = async () => {
        try {
          const data = await locationApi.getBinsByShelf(shelfId);
          setBins(data);
          setBinId(0);
        } catch (err) {
          console.error(err);
        }
      };
      loadBins();
    } else {
      setBins([]);
      setBinId(0);
    }
  }, [shelfId]);

  useEffect(() => {
    if (purchaseOrder.items) {
      setItems(purchaseOrder.items.map(item => ({
        poItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: item.orderedQuantity, // Default to full receive
        acceptedQuantity: item.orderedQuantity  // Default to full accept
      })));
    }
  }, [purchaseOrder]);

  const handleReceivedChange = (poItemId: number, value: number) => {
    setItems(items.map(item => {
      if (item.poItemId === poItemId) {
        return {
          ...item,
          receivedQuantity: value,
          // Automatically clamp accepted qty if it's higher than new received qty
          acceptedQuantity: Math.min(item.acceptedQuantity, value)
        };
      }
      return item;
    }));
  };

  const handleAcceptedChange = (poItemId: number, value: number) => {
    setItems(items.map(item => {
      if (item.poItemId === poItemId) {
        return {
          ...item,
          // Prevent accepting more than received
          acceptedQuantity: Math.min(value, item.receivedQuantity)
        };
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Strict location validation
      if (!warehouseId || warehouseId === 0) {
        setError("Please select a valid Warehouse before confirming.");
        setIsSubmitting(false);
        return;
      }

      // Single Bulletproof Transaction
      const payload = {
        purchaseOrderId: purchaseOrder.id,
        warehouseId: warehouseId,
        floorId: floorId > 0 ? floorId : undefined,
        zoneId: zoneId > 0 ? zoneId : undefined,
        aisleId: aisleId > 0 ? aisleId : undefined,
        rackId: rackId > 0 ? rackId : undefined,
        shelfId: shelfId > 0 ? shelfId : undefined,
        binId: binId > 0 ? binId : undefined,
        notes: "Directly received and quality-checked from frontend.",
        items: items.map(item => ({
          poItemId: item.poItemId,
          receivedQuantity: item.receivedQuantity,
          acceptedQuantity: item.acceptedQuantity
        }))
      };
      
      await grnApi.directReceive(payload);

      // Success
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred during GRN processing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Receive Goods & Quality Check</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Purchase Order: <span className="font-mono text-teal-700 font-bold">{purchaseOrder.poNumber}</span> &bull; Supplier: {purchaseOrder.supplierName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <svg className="text-rose-500 mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>
                <h4 className="text-sm font-bold text-rose-800">Processing Failed</h4>
                <p className="text-sm text-rose-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Hierarchical Location Selector Section */}
          <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center shadow-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Target Storage Location</h4>
                <p className="text-xs text-slate-500">All accepted items will be transferred to this warehouse shelf/bin location.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Warehouse */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Warehouse *</label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(Number(e.target.value))}
                  disabled={isSubmitting}
                >
                  <option value={0}>Select Warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}</option>
                  ))}
                </select>
              </div>

              {/* Floor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Floor</label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-100 disabled:opacity-60"
                  value={floorId}
                  onChange={(e) => setFloorId(Number(e.target.value))}
                  disabled={isSubmitting || warehouseId === 0}
                >
                  <option value={0}>Select Floor...</option>
                  {floors.map(f => (
                    <option key={f.floorId} value={f.floorId}>{f.floorName}</option>
                  ))}
                </select>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Zone</label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-100 disabled:opacity-60"
                  value={zoneId}
                  onChange={(e) => setZoneId(Number(e.target.value))}
                  disabled={isSubmitting || floorId === 0}
                >
                  <option value={0}>Select Zone (Optional)...</option>
                  {zones.map(z => (
                    <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                  ))}
                </select>
              </div>

              {/* Aisle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Aisle</label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-100 disabled:opacity-60"
                  value={aisleId}
                  onChange={(e) => setAisleId(Number(e.target.value))}
                  disabled={isSubmitting || zoneId === 0}
                >
                  <option value={0}>Select Aisle (Optional)...</option>
                  {aisles.map(a => (
                    <option key={a.aisleId} value={a.aisleId}>{a.aisleName}</option>
                  ))}
                </select>
              </div>

              {/* Rack */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Rack</label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-100 disabled:opacity-60"
                  value={rackId}
                  onChange={(e) => setRackId(Number(e.target.value))}
                  disabled={isSubmitting || aisleId === 0}
                >
                  <option value={0}>Select Rack (Optional)...</option>
                  {racks.map(r => (
                    <option key={r.rackId} value={r.rackId}>{r.rackName}</option>
                  ))}
                </select>
              </div>

              {/* Shelf */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Shelf</label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-100 disabled:opacity-60"
                  value={shelfId}
                  onChange={(e) => setShelfId(Number(e.target.value))}
                  disabled={isSubmitting || rackId === 0}
                >
                  <option value={0}>Select Shelf (Optional)...</option>
                  {shelves.map(s => (
                    <option key={s.shelfId} value={s.shelfId}>{s.shelfName}</option>
                  ))}
                </select>
              </div>

              {/* Bin */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bin</label>
                <select
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-100 disabled:opacity-60"
                  value={binId}
                  onChange={(e) => setBinId(Number(e.target.value))}
                  disabled={isSubmitting || shelfId === 0}
                >
                  <option value={0}>Select Bin...</option>
                  {bins.map(b => (
                    <option key={b.binId} value={b.binId}>{b.binName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Line Items & Quality Check</h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-1/3">Product Name</th>
                    <th className="px-4 py-3 text-center">Ordered Qty</th>
                    <th className="px-4 py-3 text-center">Received Qty</th>
                    <th className="px-4 py-3 text-center">Accepted Qty (QC)</th>
                    <th className="px-4 py-3 text-center">Rejected Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.poItemId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">{item.productName}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-400">{item.orderedQuantity}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <input 
                            type="number"
                            min="0"
                            max={item.orderedQuantity}
                            value={item.receivedQuantity}
                            onChange={(e) => handleReceivedChange(item.poItemId, parseInt(e.target.value) || 0)}
                            className="w-24 text-center bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2 shadow-sm font-bold"
                            disabled={isSubmitting}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <input 
                            type="number"
                            min="0"
                            max={item.receivedQuantity}
                            value={item.acceptedQuantity}
                            onChange={(e) => handleAcceptedChange(item.poItemId, parseInt(e.target.value) || 0)}
                            className="w-24 text-center bg-white border border-teal-300 text-teal-800 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2 shadow-sm font-bold bg-teal-50/30"
                            disabled={isSubmitting}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                         <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            (item.receivedQuantity - item.acceptedQuantity) > 0 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-slate-100 text-slate-400'
                         }`}>
                           {item.receivedQuantity - item.acceptedQuantity}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">{items.length}</span> items to process
           </div>
           <div className="flex gap-3">
             <button
               onClick={onClose}
               disabled={isSubmitting}
               className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
             >
               Cancel
             </button>
             <button
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="px-8 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isSubmitting ? (
                 <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing Flow...
                 </>
               ) : (
                 <>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                   </svg>
                   Confirm Receipt & Save
                 </>
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

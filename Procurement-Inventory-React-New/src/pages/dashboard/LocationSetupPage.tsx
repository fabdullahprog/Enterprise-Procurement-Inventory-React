// src/pages/dashboard/LocationSetupPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  locationApi, 
  Warehouse, 
  Floor, 
  Zone, 
  Aisle, 
  Rack, 
  Shelf, 
  Bin, 
  LocationTreeNode, 
  LocationIndexDto 
} from '../../api/locationApi';

type ConfigTab = 'warehouse' | 'floor' | 'zone' | 'aisle' | 'rack' | 'shelf' | 'bin';

export const LocationSetupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('warehouse');
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tree / Setup Index State
  const [locationIndex, setLocationIndex] = useState<LocationIndexDto | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Dynamic dropdown lists for cascading forms
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [aisles, setAisles] = useState<Aisle[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);

  // Selection states for Parent items in forms
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);
  const [selectedFloorId, setSelectedFloorId] = useState<number>(0);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(0);
  const [selectedAisleId, setSelectedAisleId] = useState<number>(0);
  const [selectedRackId, setSelectedRackId] = useState<number>(0);
  const [selectedShelfId, setSelectedShelfId] = useState<number>(0);

  // Form Field States
  const [nameInput, setNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [remarksInput, setRemarksInput] = useState('');

  // Initial Data Fetching
  const fetchIndex = async () => {
    try {
      setTreeLoading(true);
      const indexData = await locationApi.getLocationIndex();
      setLocationIndex(indexData);
      setWarehouses(indexData.warehouses);
      
      // Auto expand warehouses by default
      const autoExpand: Record<string, boolean> = {};
      indexData.tree.forEach(node => {
        autoExpand[node.id] = true;
      });
      setExpandedNodes(prev => ({ ...autoExpand, ...prev }));
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch current location structure.');
    } finally {
      setTreeLoading(false);
    }
  };

  useEffect(() => {
    fetchIndex();
  }, []);

  // Cascading lists loaders for Form Selectors
  useEffect(() => {
    if (selectedWarehouseId > 0) {
      locationApi.getFloorsByWarehouse(selectedWarehouseId)
        .then(setFloors)
        .catch(console.error);
    } else {
      setFloors([]);
      setSelectedFloorId(0);
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (selectedFloorId > 0) {
      locationApi.getZonesByFloor(selectedFloorId)
        .then(setZones)
        .catch(console.error);
    } else {
      setZones([]);
      setSelectedZoneId(0);
    }
  }, [selectedFloorId]);

  useEffect(() => {
    if (selectedZoneId > 0) {
      locationApi.getAislesByZone(selectedZoneId)
        .then(setAisles)
        .catch(console.error);
    } else {
      setAisles([]);
      setSelectedAisleId(0);
    }
  }, [selectedZoneId]);

  useEffect(() => {
    if (selectedAisleId > 0) {
      locationApi.getRacksByAisle(selectedAisleId)
        .then(setRacks)
        .catch(console.error);
    } else {
      setRacks([]);
      setSelectedRackId(0);
    }
  }, [selectedAisleId]);

  useEffect(() => {
    if (selectedRackId > 0) {
      locationApi.getShelvesByRack(selectedRackId)
        .then(setShelves)
        .catch(console.error);
    } else {
      setShelves([]);
      setSelectedShelfId(0);
    }
  }, [selectedRackId]);

  // Handle Form Tab Change - Clear Inputs & parent selections
  const handleTabChange = (tab: ConfigTab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    setNameInput('');
    setAddressInput('');
    setRemarksInput('');
    setSelectedWarehouseId(0);
    setSelectedFloorId(0);
    setSelectedZoneId(0);
    setSelectedAisleId(0);
    setSelectedRackId(0);
    setSelectedShelfId(0);
  };

  // Node Toggle Handler
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Submit Configuration Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Please provide a name/code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      switch (activeTab) {
        case 'warehouse':
          await locationApi.createWarehouse({
            warehouseName: nameInput,
            address: addressInput || undefined,
            remarks: remarksInput || undefined
          });
          setSuccess(`Warehouse "${nameInput}" created successfully.`);
          break;

        case 'floor':
          if (selectedWarehouseId === 0) throw new Error('Warehouse is required.');
          await locationApi.createFloor({
            floorName: nameInput,
            warehouseId: selectedWarehouseId,
            remarks: remarksInput || undefined
          });
          setSuccess(`Floor "${nameInput}" created successfully.`);
          break;

        case 'zone':
          if (selectedFloorId === 0) throw new Error('Floor is required.');
          await locationApi.createZone({
            zoneName: nameInput,
            floorId: selectedFloorId,
            warehouseId: selectedWarehouseId > 0 ? selectedWarehouseId : undefined,
            remarks: remarksInput || undefined
          });
          setSuccess(`Zone "${nameInput}" created successfully.`);
          break;

        case 'aisle':
          if (selectedZoneId === 0) throw new Error('Zone is required.');
          await locationApi.createAisle({
            aisleName: nameInput,
            zoneId: selectedZoneId,
            floorId: selectedFloorId > 0 ? selectedFloorId : undefined,
            warehouseId: selectedWarehouseId > 0 ? selectedWarehouseId : undefined,
            remarks: remarksInput || undefined
          });
          setSuccess(`Aisle "${nameInput}" created successfully.`);
          break;

        case 'rack':
          if (selectedAisleId === 0) throw new Error('Aisle is required.');
          await locationApi.createRack({
            rackName: nameInput,
            aisleId: selectedAisleId,
            zoneId: selectedZoneId > 0 ? selectedZoneId : undefined,
            floorId: selectedFloorId > 0 ? selectedFloorId : undefined,
            warehouseId: selectedWarehouseId > 0 ? selectedWarehouseId : undefined,
            remarks: remarksInput || undefined
          });
          setSuccess(`Rack "${nameInput}" created successfully.`);
          break;

        case 'shelf':
          if (selectedRackId === 0) throw new Error('Rack is required.');
          await locationApi.createShelf({
            shelfName: nameInput,
            rackId: selectedRackId,
            aisleId: selectedAisleId > 0 ? selectedAisleId : undefined,
            zoneId: selectedZoneId > 0 ? selectedZoneId : undefined,
            floorId: selectedFloorId > 0 ? selectedFloorId : undefined,
            warehouseId: selectedWarehouseId > 0 ? selectedWarehouseId : undefined,
            remarks: remarksInput || undefined
          });
          setSuccess(`Shelf "${nameInput}" created successfully.`);
          break;

        case 'bin':
          if (selectedShelfId === 0) throw new Error('Shelf is required.');
          await locationApi.createBin({
            binName: nameInput,
            shelfId: selectedShelfId,
            rackId: selectedRackId > 0 ? selectedRackId : undefined,
            aisleId: selectedAisleId > 0 ? selectedAisleId : undefined,
            zoneId: selectedZoneId > 0 ? selectedZoneId : undefined,
            floorId: selectedFloorId > 0 ? selectedFloorId : undefined,
            warehouseId: selectedWarehouseId > 0 ? selectedWarehouseId : undefined,
            remarks: remarksInput || undefined
          });
          setSuccess(`Bin "${nameInput}" created successfully.`);
          break;
      }

      // Reset main fields & reload tree
      setNameInput('');
      setAddressInput('');
      setRemarksInput('');
      fetchIndex();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred during creation.');
    } finally {
      setLoading(false);
    }
  };

  // Render collapsible tree nodes recursively
  const renderTreeNode = (node: LocationTreeNode, depth: number = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none transition-all duration-150">
        <div 
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 ${
            hasChildren ? 'cursor-pointer hover:bg-slate-50' : ''
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 20)}px` }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg leading-none shrink-0">{node.icon}</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">{node.label}</span>
              {node.remarks && (
                <span className="text-[10px] text-slate-400 mt-0.5">{node.remarks}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
              node.type === 'warehouse' ? 'bg-blue-100 text-blue-700' :
              node.type === 'floor' ? 'bg-emerald-100 text-emerald-700' :
              node.type === 'zone' ? 'bg-amber-100 text-amber-700' :
              node.type === 'aisle' ? 'bg-orange-100 text-orange-700' :
              node.type === 'rack' ? 'bg-rose-100 text-rose-700' :
              node.type === 'shelf' ? 'bg-purple-100 text-purple-700' :
              'bg-pink-100 text-pink-700'
            }`}>
              {node.type}
            </span>
            {hasChildren && (
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-100 ml-[18px] pl-1.5 mt-0.5">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      {/* Upper header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            🏢 Warehouse Infrastructure Configuration
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Build and visualizer the physical warehouse storage layouts.
          </p>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SECTION - Creation Forms */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h2 className="text-md font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              🔧 Infrastructure Configurator
            </h2>

            {/* Tab switchers */}
            <div className="flex flex-wrap gap-1.5 mb-6 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              {(['warehouse', 'floor', 'zone', 'aisle', 'rack', 'shelf', 'bin'] as ConfigTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                    activeTab === tab 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-200' 
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-5 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {success}
              </div>
            )}

            {/* Config Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Warehouse selector (For floor level and up) */}
              {activeTab !== 'warehouse' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Warehouse *</label>
                  <select
                    required
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium"
                  >
                    <option value={0}>Choose Warehouse...</option>
                    {warehouses.map(w => (
                      <option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Floor selector (For zone level and up) */}
              {['zone', 'aisle', 'rack', 'shelf', 'bin'].includes(activeTab) && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Floor *</label>
                  <select
                    required
                    disabled={selectedWarehouseId === 0}
                    value={selectedFloorId}
                    onChange={(e) => setSelectedFloorId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value={0}>Choose Floor...</option>
                    {floors.map(f => (
                      <option key={f.floorId} value={f.floorId}>{f.floorName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Zone selector (For aisle level and up) */}
              {['aisle', 'rack', 'shelf', 'bin'].includes(activeTab) && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Zone *</label>
                  <select
                    required
                    disabled={selectedFloorId === 0}
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value={0}>Choose Zone...</option>
                    {zones.map(z => (
                      <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Aisle selector (For rack level and up) */}
              {['rack', 'shelf', 'bin'].includes(activeTab) && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Aisle *</label>
                  <select
                    required
                    disabled={selectedZoneId === 0}
                    value={selectedAisleId}
                    onChange={(e) => setSelectedAisleId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value={0}>Choose Aisle...</option>
                    {aisles.map(a => (
                      <option key={a.aisleId} value={a.aisleId}>{a.aisleName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rack selector (For shelf level and up) */}
              {['shelf', 'bin'].includes(activeTab) && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Rack *</label>
                  <select
                    required
                    disabled={selectedAisleId === 0}
                    value={selectedRackId}
                    onChange={(e) => setSelectedRackId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value={0}>Choose Rack...</option>
                    {racks.map(r => (
                      <option key={r.rackId} value={r.rackId}>{r.rackName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Shelf selector (For bin level only) */}
              {activeTab === 'bin' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Shelf *</label>
                  <select
                    required
                    disabled={selectedRackId === 0}
                    value={selectedShelfId}
                    onChange={(e) => setSelectedShelfId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value={0}>Choose Shelf...</option>
                    {shelves.map(s => (
                      <option key={s.shelfId} value={s.shelfId}>{s.shelfName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Primary Name Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Name / Code *
                </label>
                <input
                  required
                  type="text"
                  placeholder={`e.g. W01, Floor 2, Zone B, Rack-9`}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium"
                />
              </div>

              {/* Address Field (For Warehouse level only) */}
              {activeTab === 'warehouse' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Enter physical address..."
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium"
                  />
                </div>
              )}

              {/* Remarks Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or description..."
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2.5 shadow-sm font-medium"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Record...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Save {activeTab}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SECTION - Setup Tree & Stats */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Summary KPIs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Infrastructure Inventory Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex flex-col text-center">
                <span className="text-[20px] font-black text-blue-700 leading-none">{locationIndex?.totalWarehouses ?? 0}</span>
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Warehouses</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 flex flex-col text-center">
                <span className="text-[20px] font-black text-emerald-700 leading-none">{locationIndex?.totalFloors ?? 0}</span>
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Floors</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 flex flex-col text-center">
                <span className="text-[20px] font-black text-amber-700 leading-none">{locationIndex?.totalZones ?? 0}</span>
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Zones</span>
              </div>
              <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-3.5 flex flex-col text-center">
                <span className="text-[20px] font-black text-pink-700 leading-none">{locationIndex?.totalBins ?? 0}</span>
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Bins</span>
              </div>
            </div>
          </div>

          {/* Interactive Collapse Tree view */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[400px]">
            <h2 className="text-md font-extrabold text-slate-800 mb-5 flex items-center gap-2">
              🌴 Active Warehouse Storage Hierarchy
            </h2>

            {treeLoading && (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-2">
                <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs font-medium">Reconstructing warehouse layout tree...</span>
              </div>
            )}

            {!treeLoading && (!locationIndex || locationIndex.tree.length === 0) && (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-400 text-center">
                <span className="text-4xl">📭</span>
                <h4 className="text-sm font-bold text-slate-700 mt-3">No Location Structure Setup</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm px-6">
                  Begin adding a Warehouse in the setup form on the left to start seeding your physical storage infrastructure!
                </p>
              </div>
            )}

            {!treeLoading && locationIndex && locationIndex.tree.length > 0 && (
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[600px] pr-2">
                {locationIndex.tree.map(node => renderTreeNode(node, 0))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

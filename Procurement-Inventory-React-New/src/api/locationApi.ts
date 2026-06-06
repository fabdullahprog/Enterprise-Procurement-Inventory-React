// src/api/locationApi.ts
import axiosInstance from './axiosInstance';

export interface Warehouse {
  warehouseId: number;
  warehouseName: string;
  address?: string;
  remarks?: string;
  isActive?: boolean;
}

export interface Floor {
  floorId: number;
  floorName: string;
  warehouseId: number;
  warehouseName?: string;
  remarks?: string;
}

export interface Zone {
  zoneId: number;
  zoneName: string;
  floorId?: number;
  warehouseId?: number;
  remarks?: string;
}

export interface Aisle {
  aisleId: number;
  aisleName: string;
  zoneId?: number;
  floorId?: number;
  warehouseId?: number;
  remarks?: string;
}

export interface Rack {
  rackId: number;
  rackName: string;
  aisleId?: number;
  zoneId?: number;
  floorId?: number;
  warehouseId?: number;
  remarks?: string;
}

export interface Shelf {
  shelfId: number;
  shelfName: string;
  rackId?: number;
  aisleId?: number;
  zoneId?: number;
  floorId?: number;
  warehouseId?: number;
  remarks?: string;
}

export interface Bin {
  binId: number;
  binName: string;
  shelfId?: number;
  rackId?: number;
  aisleId?: number;
  zoneId?: number;
  floorId?: number;
  warehouseId?: number;
  remarks?: string;
}

export interface LocationTreeNode {
  id: string;
  label: string;
  type: 'warehouse' | 'floor' | 'zone' | 'aisle' | 'rack' | 'shelf' | 'bin';
  icon: string;
  colorClass: string;
  entityId: number;
  parentId?: string;
  remarks?: string;
  fullPath: string;
  children: LocationTreeNode[];
}

export interface LocationIndexDto {
  tree: LocationTreeNode[];
  totalWarehouses: number;
  totalFloors: number;
  totalZones: number;
  totalAisles: number;
  totalRacks: number;
  totalShelves: number;
  totalBins: number;
  warehouses: (Warehouse & { childCount: number })[];
  floors: (Floor & { parentName: string; path: string; childCount: number })[];
  zones: (Zone & { parentName: string; path: string; childCount: number })[];
  aisles: (Aisle & { parentName: string; path: string; childCount: number })[];
  racks: (Rack & { parentName: string; path: string; childCount: number })[];
  shelves: (Shelf & { parentName: string; path: string; childCount: number })[];
  bins: (Bin & { parentName: string; path: string })[];
}

export const locationApi = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await axiosInstance.get<Warehouse[]>('/api/location/warehouses');
    return response.data;
  },
  getFloorsByWarehouse: async (warehouseId: number): Promise<Floor[]> => {
    const response = await axiosInstance.get<Floor[]>(`/api/location/floors/by-warehouse/${warehouseId}`);
    return response.data;
  },
  getZonesByFloor: async (floorId: number): Promise<Zone[]> => {
    const response = await axiosInstance.get<Zone[]>(`/api/location/zones/by-floor/${floorId}`);
    return response.data;
  },
  getAislesByZone: async (zoneId: number): Promise<Aisle[]> => {
    const response = await axiosInstance.get<Aisle[]>(`/api/location/aisles/by-zone/${zoneId}`);
    return response.data;
  },
  getRacksByAisle: async (aisleId: number): Promise<Rack[]> => {
    const response = await axiosInstance.get<Rack[]>(`/api/location/racks/by-aisle/${aisleId}`);
    return response.data;
  },
  getShelvesByRack: async (rackId: number): Promise<Shelf[]> => {
    const response = await axiosInstance.get<Shelf[]>(`/api/location/shelfs/by-rack/${rackId}`);
    return response.data;
  },
  getBinsByShelf: async (shelfId: number): Promise<Bin[]> => {
    const response = await axiosInstance.get<Bin[]>(`/api/location/bins/by-shelf/${shelfId}`);
    return response.data;
  },
  
  // ---- Special tree/index APIs ----
  getLocationIndex: async (): Promise<LocationIndexDto> => {
    const response = await axiosInstance.get<LocationIndexDto>('/api/location/index');
    return response.data;
  },
  getLocationTree: async (): Promise<LocationTreeNode[]> => {
    const response = await axiosInstance.get<LocationTreeNode[]>('/api/location/tree');
    return response.data;
  },

  // ---- CRUD POST APIs ----
  createWarehouse: async (data: { warehouseName: string; address?: string; remarks?: string }): Promise<any> => {
    const response = await axiosInstance.post('/api/location/warehouses', data);
    return response.data;
  },
  createFloor: async (data: { floorName: string; warehouseId: number; remarks?: string }): Promise<any> => {
    const response = await axiosInstance.post('/api/location/floors', data);
    return response.data;
  },
  createZone: async (data: { zoneName: string; floorId?: number; warehouseId?: number; remarks?: string }): Promise<any> => {
    const response = await axiosInstance.post('/api/location/zones', data);
    return response.data;
  },
  createAisle: async (data: { aisleName: string; zoneId?: number; floorId?: number; warehouseId?: number; remarks?: string }): Promise<any> => {
    const response = await axiosInstance.post('/api/location/aisles', data);
    return response.data;
  },
  createRack: async (data: { rackName: string; aisleId?: number; zoneId?: number; floorId?: number; warehouseId?: number; remarks?: string }): Promise<any> => {
    const response = await axiosInstance.post('/api/location/racks', data);
    return response.data;
  },
  createShelf: async (data: { shelfName: string; rackId?: number; aisleId?: number; zoneId?: number; floorId?: number; warehouseId?: number; remarks?: string }): Promise<any> => {
    const response = await axiosInstance.post('/api/location/shelfs', data);
    return response.data;
  },
  createBin: async (data: { binName: string; shelfId?: number; rackId?: number; aisleId?: number; zoneId?: number; floorId?: number; warehouseId?: number; remarks?: string }): Promise<any> => {
    const response = await axiosInstance.post('/api/location/bins', data);
    return response.data;
  }
};

import apiClient from '../api-client';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  location: string;
  supplier: string;
  supplierContact: string;
  purchaseDate: string;
  warrantyExpiry: string;
  serialNumber: string;
  notes: string;
  imageUrl: string;
}

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const { data } = await apiClient.get('/inventory');
  return data?.inventory || data || [];
};

export const fetchInventoryItem = async (id: string): Promise<InventoryItem> => {
  const { data } = await apiClient.get(`/inventory/${id}`);
  return data;
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  const { data } = await apiClient.post('/inventory', item);
  return data;
};

export const updateInventoryItem = async (
  id: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem> => {
  const { data } = await apiClient.put(`/inventory/${id}`, updates);
  return data;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/inventory/${id}`);
};

export const checkLowStock = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter(item => item.quantity <= item.minQuantity);
};

export const getInventoryStats = (items: InventoryItem[]) => {
  const totalItems = items.length;
  const lowStockItems = checkLowStock(items).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const categories = new Set(items.map(item => item.category)).size;
  
  return {
    totalItems,
    lowStockItems,
    totalValue,
    categories
  };
};
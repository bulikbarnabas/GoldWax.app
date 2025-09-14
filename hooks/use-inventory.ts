import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Inventory } from '@/types/salon';

const INVENTORY_STORAGE_KEY = 'salon_inventory';

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const stored = await AsyncStorage.getItem(INVENTORY_STORAGE_KEY);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        setItems(parsedItems.map((item: any) => ({
          ...item,
          lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : undefined,
        })));
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveInventory = useCallback(async (updatedItems: Inventory[]) => {
    try {
      await AsyncStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }, []);

  const addItem = useCallback((item: Omit<Inventory, 'id'>) => {
    const newItem: Inventory = {
      ...item,
      id: Date.now().toString(),
    };
    const updated = [...items, newItem];
    saveInventory(updated);
    return newItem;
  }, [items, saveInventory]);

  const updateItem = useCallback((id: string, updates: Partial<Inventory>) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    saveInventory(updated);
  }, [items, saveInventory]);

  const deleteItem = useCallback((id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveInventory(updated);
  }, [items, saveInventory]);

  const restockItem = useCallback((id: string, quantity: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateItem(id, {
        quantity: item.quantity + quantity,
        lastRestocked: new Date(),
      });
    }
  }, [items, updateItem]);

  const useItem = useCallback((id: string, quantity: number) => {
    const item = items.find(i => i.id === id);
    if (item && item.quantity >= quantity) {
      updateItem(id, {
        quantity: item.quantity - quantity,
      });
      return true;
    }
    return false;
  }, [items, updateItem]);

  const getLowStockItems = useCallback(() => {
    return items.filter(item => item.quantity <= item.minQuantity);
  }, [items]);

  const getItemsByCategory = useCallback((category: Inventory['category']) => {
    return items.filter(item => item.category === category);
  }, [items]);

  const getTotalValue = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  const findItemByBarcode = useCallback((barcode: string) => {
    return items.find(item => item.barcode === barcode);
  }, [items]);

  const restockByBarcode = useCallback((barcode: string, quantity: number) => {
    const item = findItemByBarcode(barcode);
    if (item) {
      restockItem(item.id, quantity);
      return item;
    }
    return null;
  }, [findItemByBarcode, restockItem]);

  const useItemByBarcode = useCallback((barcode: string, quantity: number) => {
    const item = findItemByBarcode(barcode);
    if (item) {
      return useItem(item.id, quantity);
    }
    return false;
  }, [findItemByBarcode, useItem]);

  const searchItems = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      (item.supplier && item.supplier.toLowerCase().includes(lowerQuery)) ||
      (item.barcode && item.barcode.includes(query))
    );
  }, [items]);

  return useMemo(() => ({
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    restockItem,
    useItem,
    getLowStockItems,
    getItemsByCategory,
    getTotalValue,
    findItemByBarcode,
    restockByBarcode,
    useItemByBarcode,
    searchItems,
  }), [items, isLoading, addItem, updateItem, deleteItem, restockItem, useItem, getLowStockItems, getItemsByCategory, getTotalValue, findItemByBarcode, restockByBarcode, useItemByBarcode, searchItems]);
});
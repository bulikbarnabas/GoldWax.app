import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Inventory } from '@/types/salon';
import { Platform, AppState, AppStateStatus } from 'react-native';

const INVENTORY_STORAGE_KEY = 'salon_inventory';
const SYNC_INTERVAL = 5000; // 5 másodperc

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Készlet betöltése
  const loadInventory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(INVENTORY_STORAGE_KEY);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        const processedItems = parsedItems.map((item: any) => ({
          ...item,
          lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : undefined,
        }));
        setItems(processedItems);
        setLastSync(new Date());
        console.log('Inventory loaded:', processedItems.length, 'items');
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Automatikus szinkronizáció
  useEffect(() => {
    loadInventory();

    // Rendszeres szinkronizáció beállítása
    if (Platform.OS === 'web') {
      syncIntervalRef.current = setInterval(() => {
        loadInventory();
      }, SYNC_INTERVAL);

      // Storage esemény figyelése (más tabok változásai)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === INVENTORY_STORAGE_KEY && e.newValue) {
          try {
            const parsedItems = JSON.parse(e.newValue);
            const processedItems = parsedItems.map((item: any) => ({
              ...item,
              lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : undefined,
            }));
            setItems(processedItems);
            setLastSync(new Date());
            console.log('Inventory synced from another tab');
          } catch (error) {
            console.error('Error syncing from storage event:', error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      // Focus esemény figyelése
      const handleFocus = () => {
        loadInventory();
      };

      window.addEventListener('focus', handleFocus);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('focus', handleFocus);
      };
    } else {
      // Mobil app state változás figyelése
      const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          loadInventory();
        }
        appStateRef.current = nextAppState;
      });

      return () => {
        subscription.remove();
      };
    }
  }, [loadInventory]);



  const saveInventory = useCallback(async (updatedItems: Inventory[]) => {
    try {
      const dataToSave = JSON.stringify(updatedItems);
      await AsyncStorage.setItem(INVENTORY_STORAGE_KEY, dataToSave);
      setItems(updatedItems);
      setLastSync(new Date());
      
      // Web esetén manuálisan triggereljük a storage eseményt
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Dispatch custom event for immediate sync
        window.dispatchEvent(new StorageEvent('storage', {
          key: INVENTORY_STORAGE_KEY,
          newValue: dataToSave,
          url: window.location.href
        }));
      }
      
      console.log('Inventory saved:', updatedItems.length, 'items');
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

  // Manuális frissítés funkció
  const refreshInventory = useCallback(() => {
    loadInventory();
  }, [loadInventory]);

  return useMemo(() => ({
    items,
    isLoading,
    lastSync,
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
    refreshInventory,
  }), [items, isLoading, lastSync, addItem, updateItem, deleteItem, restockItem, useItem, getLowStockItems, getItemsByCategory, getTotalValue, findItemByBarcode, restockByBarcode, useItemByBarcode, searchItems, refreshInventory]);
});
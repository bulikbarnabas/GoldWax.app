import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { CartItem, Service, Customer, Payment } from '@/types/salon';

const useStorage = () => {
  const getItem = async (key: string): Promise<string | null> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem(key);
    } catch {
      return null;
    }
  };

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem(key, value);
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  return { getItem, setItem };
};

export const [CartProvider, useCart] = createContextHook(() => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: '' });
  const [payments, setPayments] = useState<Payment[]>([]);
  const storage = useStorage();

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);
  }, [items]);

  const totalDuration = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.service.duration * item.quantity), 0);
  }, [items]);

  const addToCart = useCallback((service: Service) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.service.id === service.id);
      if (existingItem) {
        return prev.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((serviceId: string) => {
    setItems(prev => prev.filter(item => item.service.id !== serviceId));
  }, []);

  const updateQuantity = useCallback((serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.service.id === serviceId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomer({ name: '' });
  }, []);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const storedPayments = await storage.getItem('payments');
        if (storedPayments) {
          const parsedPayments = JSON.parse(storedPayments);
          setPayments(parsedPayments.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp)
          })));
        }
      } catch (error) {
        console.error('Error loading payments:', error);
      }
    };
    loadPayments();
  }, [storage]);

  const processPayment = useCallback(async (paymentMethod: 'cash' | 'card' | 'transfer', employeeId?: string, employeeName?: string): Promise<Payment> => {
    const receiptNumber = `GYS-${Date.now().toString().slice(-6)}`;
    const payment: Payment = {
      id: Date.now().toString(),
      customer,
      items: [...items],
      total,
      paymentMethod,
      timestamp: new Date(),
      receiptNumber,
      employeeId: employeeId || 'unknown',
      employeeName: employeeName || 'Ismeretlen',
    };

    try {
      const updatedPayments = [...payments, payment];
      setPayments(updatedPayments);
      await storage.setItem('payments', JSON.stringify(updatedPayments));
    } catch (error) {
      console.error('Error saving payment:', error);
    }

    clearCart();
    return payment;
  }, [customer, items, total, storage, clearCart, payments]);

  const getTodayRevenue = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return payments
      .filter(p => {
        const paymentDate = new Date(p.timestamp);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() === today.getTime();
      })
      .reduce((sum, p) => sum + p.total, 0);
  }, [payments]);

  const getWeekRevenue = useCallback(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return payments
      .filter(p => new Date(p.timestamp) >= weekAgo)
      .reduce((sum, p) => sum + p.total, 0);
  }, [payments]);

  const getTodayTransactions = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return payments.filter(p => {
      const paymentDate = new Date(p.timestamp);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate.getTime() === today.getTime();
    }).length;
  }, [payments]);

  const getMonthlyRevenue = useCallback(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return payments
      .filter(p => {
        const paymentDate = new Date(p.timestamp);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.total, 0);
  }, [payments]);

  const contextValue = useMemo(() => ({
    items,
    customer,
    total,
    totalDuration,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomer,
    processPayment,
    payments,
    getTodayRevenue,
    getWeekRevenue,
    getTodayTransactions,
    getMonthlyRevenue,
  }), [items, customer, total, totalDuration, addToCart, removeFromCart, updateQuantity, clearCart, processPayment, payments, getTodayRevenue, getWeekRevenue, getTodayTransactions, getMonthlyRevenue]);

  return contextValue;
});
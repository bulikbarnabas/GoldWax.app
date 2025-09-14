import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@/types/salon';

const CLIENTS_STORAGE_KEY = 'salon_clients';

export const [ClientsProvider, useClients] = createContextHook(() => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const stored = await AsyncStorage.getItem(CLIENTS_STORAGE_KEY);
      if (stored) {
        const parsedClients = JSON.parse(stored);
        setClients(parsedClients.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          lastVisit: c.lastVisit ? new Date(c.lastVisit) : undefined,
          birthDate: c.birthDate ? new Date(c.birthDate) : undefined,
        })));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveClients = async (updatedClients: Client[]) => {
    try {
      await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      setClients(updatedClients);
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'totalSpent' | 'visitCount'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalSpent: 0,
      visitCount: 0,
    };
    const updated = [...clients, newClient];
    saveClients(updated);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updated = clients.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    saveClients(updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    saveClients(updated);
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id);
  };

  const searchClients = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(lowercaseQuery) ||
      c.phone.includes(query) ||
      (c.email && c.email.toLowerCase().includes(lowercaseQuery))
    );
  };

  const updateClientVisit = (clientId: string, amount: number) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      updateClient(clientId, {
        lastVisit: new Date(),
        totalSpent: client.totalSpent + amount,
        visitCount: client.visitCount + 1,
      });
    }
  };

  const getTopClients = (limit: number = 10) => {
    return [...clients]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    searchClients,
    updateClientVisit,
    getTopClients,
  };
});

export function useClientStats() {
  const { clients } = useClients();
  
  return useMemo(() => {
    const totalClients = clients.length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpentPerClient = totalClients > 0 ? totalRevenue / totalClients : 0;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newClientsThisMonth = clients.filter(c => 
      c.createdAt >= thisMonth
    ).length;
    
    return {
      totalClients,
      totalRevenue,
      avgSpentPerClient,
      newClientsThisMonth,
    };
  }, [clients]);
}
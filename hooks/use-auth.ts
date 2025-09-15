import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, AuthState } from '@/types/salon';

const STORAGE_KEY = '@salon_auth';
const USERS_KEY = '@salon_users';

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@goldwax.hu',
    role: 'admin',
    password: 'admin123'
  },
  {
    id: 'emp-1',
    name: 'Dolgozó 1',
    email: 'dolgozo1@goldwax.hu',
    role: 'employee',
    password: 'dolgozo123'
  },
  {
    id: 'emp-2',
    name: 'Dolgozó 2',
    email: 'dolgozo2@goldwax.hu',
    role: 'employee',
    password: 'dolgozo456'
  }
];

// In-memory fallback storage for when localStorage is not available
const memoryStorage: { [key: string]: string } = {};

// Enhanced web-safe storage with better cross-browser compatibility
const safeStorage = {
  // Test if storage is available and working
  isStorageAvailable(): boolean {
    if (Platform.OS !== 'web') return true;
    
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Check if localStorage is available and not blocked
      const storage = window.localStorage;
      if (!storage) {
        return false;
      }
      
      // Test storage functionality
      const testKey = '__storage_test__' + Date.now();
      storage.setItem(testKey, 'test');
      const result = storage.getItem(testKey);
      storage.removeItem(testKey);
      return result === 'test';
    } catch (e) {
      // Storage might be blocked by browser settings or incognito mode
      console.warn('Storage not available:', e);
      return false;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Try localStorage first
        if (this.isStorageAvailable()) {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) return value;
          } catch (e) {
            console.warn('localStorage getItem failed:', e);
          }
        }
        
        // Try sessionStorage as fallback
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            const value = window.sessionStorage.getItem(key);
            if (value !== null) return value;
          }
        } catch (e) {
          console.warn('sessionStorage getItem failed:', e);
        }
        
        // Use memory storage as last resort
        return memoryStorage[key] || null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Always save to memory storage first
        memoryStorage[key] = value;
        
        // Try localStorage
        if (this.isStorageAvailable()) {
          try {
            window.localStorage.setItem(key, value);
          } catch (e) {
            console.warn('localStorage setItem failed:', e);
          }
        }
        
        // Also try sessionStorage for redundancy
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(key, value);
          }
        } catch (e) {
          console.warn('sessionStorage setItem failed:', e);
        }
        
        // Dispatch storage event for cross-tab communication
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new StorageEvent('storage', {
              key,
              newValue: value,
              url: window.location.href,
              storageArea: window.localStorage
            }));
          } catch (e) {
            // Ignore event dispatch errors
          }
        }
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
      // Still save to memory storage
      if (Platform.OS === 'web') {
        memoryStorage[key] = value;
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Remove from memory storage
        delete memoryStorage[key];
        
        // Try localStorage
        if (this.isStorageAvailable()) {
          try {
            window.localStorage.removeItem(key);
          } catch (e) {
            console.warn('localStorage removeItem failed:', e);
          }
        }
        
        // Also try sessionStorage
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.removeItem(key);
          }
        } catch (e) {
          console.warn('sessionStorage removeItem failed:', e);
        }
        
        // Dispatch storage event
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new StorageEvent('storage', {
              key,
              newValue: null,
              url: window.location.href,
              storageArea: window.localStorage
            }));
          } catch (e) {
            // Ignore event dispatch errors
          }
        }
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
      // Still remove from memory storage
      if (Platform.OS === 'web') {
        delete memoryStorage[key];
      }
    }
  }
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthState = useCallback(async () => {
    try {
      const stored = await safeStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedAuth = JSON.parse(stored);
        // Validate that the user still exists in the users list
        if (parsedAuth.user) {
          const userExists = users.some(u => u.id === parsedAuth.user.id);
          if (userExists) {
            setAuthState(parsedAuth);
          } else {
            // User no longer exists, clear auth
            await safeStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      // Clear potentially corrupted auth state
      await safeStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [users]);

  const loadUsers = useCallback(async () => {
    try {
      const stored = await safeStorage.getItem(USERS_KEY);
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        // Ensure default users are always present
        const mergedUsers = [...defaultUsers];
        parsedUsers.forEach((user: User) => {
          const existingIndex = mergedUsers.findIndex(u => u.id === user.id);
          if (existingIndex >= 0) {
            mergedUsers[existingIndex] = user;
          } else {
            mergedUsers.push(user);
          }
        });
        setUsers(mergedUsers);
        await safeStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
      } else {
        setUsers(defaultUsers);
        await safeStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to default users
      setUsers(defaultUsers);
    }
  }, []);

  useEffect(() => {
    // Felhasználók listája és mentett bejelentkezés betöltése
    const initAuth = async () => {
      await loadUsers();
    };
    initAuth();
  }, [loadUsers]);

  useEffect(() => {
    if (users.length > 0) {
      loadAuthState();
    }
  }, [users, loadAuthState]);



  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt:', { email, availableUsers: users.map(u => ({ email: u.email, role: u.role })) });
      
      // Trim whitespace and normalize email
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      
      const user = users.find(u => 
        u.email.toLowerCase() === normalizedEmail && 
        u.password === normalizedPassword
      );
      
      if (user) {
        const newAuthState = {
          user,
          isAuthenticated: true
        };
        setAuthState(newAuthState);
        await safeStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
        console.log('Login successful for user:', user.email);
        
        // Force a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      }
      
      console.log('Login failed: Invalid credentials for:', normalizedEmail);
      console.log('Available users:', users.map(u => ({ email: u.email.toLowerCase(), password: u.password })));
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [users]);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out user');
      const newAuthState = {
        user: null,
        isAuthenticated: false
      };
      setAuthState(newAuthState);
      await safeStorage.removeItem(STORAGE_KEY);
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const addUser = useCallback(async (user: User): Promise<boolean> => {
    if (authState.user?.role !== 'admin') {
      return false;
    }

    const exists = users.some(u => u.email === user.email);
    if (exists) {
      return false;
    }

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    await safeStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return true;
  }, [authState.user?.role, users]);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>): Promise<boolean> => {
    if (authState.user?.role !== 'admin') {
      return false;
    }

    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    await safeStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    if (authState.user?.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) {
        const newAuthState = { ...authState, user: updatedUser };
        setAuthState(newAuthState);
        await safeStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
      }
    }
    
    return true;
  }, [authState, users]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      if (authState.user?.role !== 'admin' || userId === authState.user.id) {
        return false;
      }

      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      await safeStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      
      // Force a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }, [authState.user?.role, authState.user?.id, users]);

  const contextValue = useMemo(() => ({
    ...authState,
    users,
    isLoading,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser
  }), [authState, users, isLoading, login, logout, addUser, updateUser, deleteUser]);

  return contextValue;
});
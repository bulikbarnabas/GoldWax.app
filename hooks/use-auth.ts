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

// Enhanced web-safe storage with better cross-browser compatibility
const safeStorage = {
  // Test if storage is available and working
  isStorageAvailable(): boolean {
    if (Platform.OS !== 'web') return true;
    
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      
      // Test storage functionality
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      const result = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      return result === 'test';
    } catch (e) {
      console.warn('Storage not available:', e);
      return false;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (!this.isStorageAvailable()) {
          // Fallback to sessionStorage or memory storage
          try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
              return window.sessionStorage.getItem(key);
            }
          } catch (e) {
            console.warn('SessionStorage also not available:', e);
          }
          return null;
        }
        
        try {
          return window.localStorage.getItem(key);
        } catch (e) {
          console.warn('localStorage getItem failed:', e);
          // Try sessionStorage as fallback
          try {
            if (window.sessionStorage) {
              return window.sessionStorage.getItem(key);
            }
          } catch (sessionError) {
            console.warn('SessionStorage getItem also failed:', sessionError);
          }
          return null;
        }
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (!this.isStorageAvailable()) {
          // Fallback to sessionStorage
          try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
              window.sessionStorage.setItem(key, value);
            }
          } catch (e) {
            console.warn('SessionStorage setItem failed:', e);
          }
          return;
        }
        
        try {
          window.localStorage.setItem(key, value);
          // Dispatch custom event for better cross-browser compatibility
          if (typeof window !== 'undefined') {
            try {
              window.dispatchEvent(new CustomEvent('storage-change', {
                detail: { key, newValue: value }
              }));
            } catch (e) {
              // Fallback for older browsers
              console.warn('Custom event dispatch failed:', e);
            }
          }
        } catch (e) {
          console.warn('localStorage setItem failed:', e);
          // Try sessionStorage as fallback
          try {
            if (window.sessionStorage) {
              window.sessionStorage.setItem(key, value);
            }
          } catch (sessionError) {
            console.warn('SessionStorage setItem also failed:', sessionError);
          }
        }
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (!this.isStorageAvailable()) {
          // Fallback to sessionStorage
          try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
              window.sessionStorage.removeItem(key);
            }
          } catch (e) {
            console.warn('SessionStorage removeItem failed:', e);
          }
          return;
        }
        
        try {
          window.localStorage.removeItem(key);
          // Dispatch custom event for better cross-browser compatibility
          if (typeof window !== 'undefined') {
            try {
              window.dispatchEvent(new CustomEvent('storage-change', {
                detail: { key, newValue: null }
              }));
            } catch (e) {
              // Fallback for older browsers
              console.warn('Custom event dispatch failed:', e);
            }
          }
        } catch (e) {
          console.warn('localStorage removeItem failed:', e);
          // Try sessionStorage as fallback
          try {
            if (window.sessionStorage) {
              window.sessionStorage.removeItem(key);
            }
          } catch (sessionError) {
            console.warn('SessionStorage removeItem also failed:', sessionError);
          }
        }
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
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